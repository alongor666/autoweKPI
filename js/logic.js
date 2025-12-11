import { THRESHOLDS, YEAR_PLANS, BUSINESS_TYPE_MAPPING } from './constants.js';

export class Mapper {
    constructor() {
        this.mappingData = BUSINESS_TYPE_MAPPING;
        this.canonicalMap = this._buildCanonicalMap();
        this.compatibilityMap = this._buildCompatibilityMap();
    }

    _buildCanonicalMap() {
        const mapping = {};
        this.mappingData.business_types.forEach(item => {
            mapping[item.csv_raw_value] = item;
            mapping[item.ui_full_name] = item;
        });
        return mapping;
    }

    _buildCompatibilityMap() {
        const mapping = {};
        this.mappingData.compatibility_mappings.forEach(item => {
            mapping[item.csv_raw_value] = item.maps_to;
        });
        return mapping;
    }

    mapBusinessType(rawValue) {
        if (!rawValue) return null;

        // 1. Check compatibility
        if (this.compatibilityMap[rawValue]) {
            const targetName = this.compatibilityMap[rawValue];
            if (this.canonicalMap[targetName]) {
                return this.canonicalMap[targetName];
            }
        }

        // 2. Check canonical
        if (this.canonicalMap[rawValue]) {
            return this.canonicalMap[rawValue];
        }

        // 3. Fallback
        return {
            ui_full_name: rawValue,
            ui_short_label: rawValue,
            category: '未知',
            business_type_category: rawValue
        };
    }
}

export class KPICalculator {
    constructor(currentDate = null, week = 49) {
        this.currentDate = currentDate;
        // 2025 Week 49 ends Dec 6, Day 340.
        const rawDays = 340 + (week - 49) * 7;
        this.daysPassed = Math.max(1, Math.min(365, rawDays));
        this.totalDays = 365;
        this.timeProgress = this.daysPassed / this.totalDays;
    }

    safeDivide(numerator, denominator) {
        if (!denominator || denominator === 0 || isNaN(denominator)) {
            return 0.0;
        }
        return numerator / denominator;
    }

    calculateKPIs(data, manualPlan = null) {
        // Data is an array of objects (rows)
        // Summation
        const sum = (field) => data.reduce((acc, row) => acc + (parseFloat(row[field]) || 0), 0);

        const sumSignedPremium = sum('signed_premium_yuan');
        const sumMaturedPremium = sum('matured_premium_yuan');
        const sumPolicyCount = sum('policy_count');
        const sumClaimCaseCount = sum('claim_case_count');
        const sumReportedClaim = sum('reported_claim_payment_yuan');
        const sumExpense = sum('expense_amount_yuan');
        const sumAnnualPlan = manualPlan !== null ? manualPlan : sum('premium_plan_yuan');

        // Rates (%)
        const claimRate = this.safeDivide(sumReportedClaim, sumMaturedPremium) * 100;
        const expenseRate = this.safeDivide(sumExpense, sumSignedPremium) * 100;
        const costRate = claimRate + expenseRate;
        const marginRate = 100.0 - costRate;

        // Progress
        let timeProgressAchievement = null;
        if (sumAnnualPlan > 0) {
            const premiumAchievementRate = this.safeDivide(sumSignedPremium, sumAnnualPlan);
            timeProgressAchievement = this.safeDivide(premiumAchievementRate, this.timeProgress) * 100;
        }

        // Averages
        const perClaimPaid = this.safeDivide(sumReportedClaim, sumClaimCaseCount);
        // Claim Frequency (Claims / Policies) * 100
        const claimFrequency = this.safeDivide(sumClaimCaseCount, sumPolicyCount) * 100;

        return {
            "签单保费": sumSignedPremium,
            "满期保费": sumMaturedPremium,
            "已报告赔款": sumReportedClaim,
            "费用额": sumExpense,
            "保单件数": sumPolicyCount,
            "赔案件数": sumClaimCaseCount,
            "满期赔付率": claimRate,
            "费用率": expenseRate,
            "变动成本率": costRate,
            "出险率": claimFrequency,
            "案均赔款": perClaimPaid,
            "年计划达成率": sumAnnualPlan > 0 ? (sumSignedPremium / sumAnnualPlan * 100) : 0,
            "时间进度达成率": timeProgressAchievement,
            "满期边际贡献率": marginRate,
            "计划保费": sumAnnualPlan
        };
    }
}

export class ReportGenerator {
    constructor() {
        this.mapper = new Mapper();
        this.calculator = new KPICalculator(); // Default Week 49
    }

    processData(csvData, week = 49) {
        this.calculator = new KPICalculator(null, week);
        
        // 1. Map Data
        const mappedData = csvData.map(row => {
            const mapping = this.mapper.mapBusinessType(row.business_type_category);
            return {
                ...row,
                ...mapping,
                // Ensure numeric fields
                signed_premium_yuan: parseFloat(row.signed_premium_yuan) || 0,
                matured_premium_yuan: parseFloat(row.matured_premium_yuan) || 0,
                policy_count: parseFloat(row.policy_count) || 0,
                claim_case_count: parseFloat(row.claim_case_count) || 0,
                reported_claim_payment_yuan: parseFloat(row.reported_claim_payment_yuan) || 0,
                expense_amount_yuan: parseFloat(row.expense_amount_yuan) || 0,
                premium_plan_yuan: parseFloat(row.premium_plan_yuan) || 0
            };
        });

        // 2. Aggregate Global
        const summary = this.calculator.calculateKPIs(mappedData, YEAR_PLANS["年度保费计划"]["四川分公司"]);

        // 3. Aggregate by Org
        // Group by organization_name
        const orgs = {};
        mappedData.forEach(row => {
            const org = row.organization_name || '未知';
            if (!orgs[org]) orgs[org] = [];
            orgs[org].push(row);
        });

        const dataByOrg = Object.keys(orgs).map(org => {
            // Get Plan for Org
            // Map Org Name to Plan Key if needed (e.g. "成都-天府" -> "天府")
            // Assuming strict match or partial match
            let plan = 0;
            const planKey = Object.keys(YEAR_PLANS["年度保费计划"]).find(k => org.includes(k));
            if (planKey) plan = YEAR_PLANS["年度保费计划"][planKey];
            
            const kpis = this.calculator.calculateKPIs(orgs[org], plan);
            return {
                organization: org,
                "机构": org,
                ...kpis,
                // Add Shares
                "保费占比": (kpis["签单保费"] / summary["签单保费"]) * 100,
                "已报告赔款占比": (kpis["已报告赔款"] / summary["已报告赔款"]) * 100
            };
        });

        // Sort by Premium desc
        dataByOrg.sort((a, b) => b["签单保费"] - a["签单保费"]);

        // 4. Aggregate by Category
        const cats = {};
        mappedData.forEach(row => {
            const cat = row.category || '其他';
            if (!cats[cat]) cats[cat] = [];
            cats[cat].push(row);
        });

        const dataByCategory = Object.keys(cats).map(cat => {
            const kpis = this.calculator.calculateKPIs(cats[cat]);
            return {
                category: cat,
                "客户类别": cat,
                ...kpis,
                "保费占比": (kpis["签单保费"] / summary["签单保费"]) * 100,
                "已报告赔款占比": (kpis["已报告赔款"] / summary["已报告赔款"]) * 100
            };
        });
        
        // Sort by Premium desc
        dataByCategory.sort((a, b) => b["签单保费"] - a["签单保费"]);

        // 5. Aggregate by Business Type (Detailed)
        const types = {};
        mappedData.forEach(row => {
            const type = row.ui_full_name || row.business_type_category || '未知';
            if (!types[type]) types[type] = [];
            types[type].push(row);
        });

        const dataByBusinessType = Object.keys(types).map(type => {
            const kpis = this.calculator.calculateKPIs(types[type]);
            return {
                businessType: type,
                "业务类型简称": type,
                ...kpis,
                "保费占比": (kpis["签单保费"] / summary["签单保费"]) * 100,
                "已报告赔款占比": (kpis["已报告赔款"] / summary["已报告赔款"]) * 100
            };
        });
        
        dataByBusinessType.sort((a, b) => b["签单保费"] - a["签单保费"]);

        return {
            "organization": "四川",
            "week": week,
            "summary": summary,
            "thresholds": THRESHOLDS,
            "dataByOrg": dataByOrg,
            "dataByCategory": dataByCategory,
            "dataByBusinessType": dataByBusinessType,
            "isSingleOrgMode": false,
            // Extra fields just in case
            "dateRange": "2024.12.01-2024.12.06"
        };
    }
}
