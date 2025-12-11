/**
 * KPI计算引擎
 * 对应Python的kpi_calculator.py
 * 实现所有15个KPI指标的计算
 */

import type { RawDataRow, KPIResult, KPICalculateOptions } from '@/types'
import { safeDivide, yuanToWan, round } from '@/utils/math'
import { sumBy } from 'lodash-es'

export class KPICalculator {
  /**
   * 计算单组数据的KPI
   *
   * @param data - 该组的原始数据
   * @param options - 计算选项
   * @returns KPI计算结果
   */
  calculateKPIs(data: RawDataRow[], options: KPICalculateOptions = {}): KPIResult {
    const { yearPlan, enableRounding = true } = options

    // 1. 聚合基础数据（单位：元）
    const signedPremium = sumBy(data, 'signed_premium_yuan')
    const maturedPremium = sumBy(data, 'matured_premium_yuan')
    const reportedClaim = sumBy(data, 'reported_claim_payment_yuan')
    const expenseAmount = sumBy(data, 'expense_amount_yuan')
    const policyCount = sumBy(data, 'policy_count')
    const claimCaseCount = sumBy(data, 'claim_case_count')
    
    // 从数据中获取年度计划（如果有）
    const planFromData = sumBy(data, 'premium_plan_yuan') // Updated field name
    const effectivePlan = yearPlan || (planFromData > 0 ? planFromData : undefined)

    // 2. 转换为万元 (用于UI显示)
    const 签单保费 = yuanToWan(signedPremium)
    const 满期保费 = yuanToWan(maturedPremium)
    const 已报案赔付 = yuanToWan(reportedClaim)
    const 费用额 = yuanToWan(expenseAmount)

    // 3. 计算已赚保费
    // 已赚保费 = 满期保费（简化版）
    const 已赚保费 = 满期保费

    // 4. 计算比率指标（单位：%）
    // 满期赔付率 = 已报案赔付 / 满期保费 * 100
    // 注意：使用元计算以保持精度，或者万元也可以（比率一样）
    const 满期赔付率 = safeDivide(reportedClaim, maturedPremium) * 100

    // 费用率 = 费用额 / 签单保费 * 100
    // 注意：Python代码是用 expense / signed_premium
    const 费用率 = safeDivide(expenseAmount, signedPremium) * 100

    // 变动成本率 = 满期赔付率 + 费用率
    const 变动成本率 = 满期赔付率 + 费用率
    
    // 综合成本率 = 变动成本率 (如果没有固定成本)
    const 综合成本率 = 变动成本率

    // 贡献率 = 100 - 变动成本率
    const 贡献率 = 100 - 变动成本率

    // 5. 计算边际指标
    // 满期边际贡献额 = 满期保费 * 贡献率 / 100
    // Result in Wan
    const 满期边际贡献额 = 满期保费 * (贡献率 / 100)

    // 6. 计算进度指标
    // 满期率 = 满期保费 / 签单保费 * 100
    const 满期率 = safeDivide(maturedPremium, signedPremium) * 100

    // 保费达成率 = 签单保费 / 年度计划 * 100
    const 保费达成率 = effectivePlan ? safeDivide(signedPremium, effectivePlan) * 100 : undefined

    // 年计划达成率 = 保费达成率 / 时间进度 * 100
    // 时间进度计算：
    // 2025年第49周截止日是 12月6日，第340天
    // 动态计算天数: 340 + (week - 49) * 7
    // Default to week 49 if not found
    let weekNumber = 49
    if (data.length > 0 && data[0].week_number) {
        weekNumber = Number(data[0].week_number)
    }
    
    const rawDays = 340 + (weekNumber - 49) * 7
    const daysPassed = Math.max(1, Math.min(365, rawDays))
    const timeProgress = daysPassed / 365
    
    const 年计划达成率 = 保费达成率 !== undefined 
        ? safeDivide(保费达成率, timeProgress * 100) * 100 // Python: premium_rate / time_progress * 100. Wait.
        // Python: safe_divide(premium_achievement_rate, self.time_progress) * 100
        // premium_achievement_rate is e.g. 0.5 (50%)? No, Python safe_divide returns ratio.
        // My safeDivide returns ratio. 
        // So `保费达成率` here is percentage (e.g. 50).
        // Python `premium_achievement_rate` = signed / plan. Ratio.
        // My `保费达成率` = signed / plan * 100. Percentage.
        // Python: (Ratio / TimeRatio) * 100 = Percentage.
        // My: (Percentage / TimeRatio).
        // So: safeDivide(保费达成率, timeProgress)
        : undefined

    // 7. 均值指标 (元)
    // 案均赔款 = 已报案赔付 / 赔案件数
    const 案均赔款 = safeDivide(reportedClaim, claimCaseCount)
    
    // 出险率 = 赔案件数 / 保单件数 * 100
    const 出险率 = safeDivide(claimCaseCount, policyCount) * 100

    // 8. 构建结果对象
    const result: KPIResult = {
      // 基础指标（万元）
      签单保费,
      满期保费,
      已赚保费,
      已报案赔付,
      费用额,
      
      // 数量
      保单件数: policyCount,
      赔案件数: claimCaseCount,

      // 比率指标（%）
      满期赔付率,
      变动成本率,
      综合成本率,
      费用率,
      贡献率,
      满期边际贡献率: 贡献率,
      
      出险率,
      满期率,

      // 均值指标
      案均赔款,

      // 边际指标（万元）
      满期边际贡献额,

      // 进度指标（%）
      保费达成率,
      年计划达成率: 年计划达成率 ? 年计划达成率 : undefined,

      // 年度计划（万元）
      年度保费计划: effectivePlan ? yuanToWan(effectivePlan) : undefined,
    }

    // 9. 四舍五入（如果启用）
    if (enableRounding) {
      return this.roundKPIResult(result)
    }

    return result
  }

  /**
   * 对KPI结果进行四舍五入
   *
   * @param kpi - KPI结果
   * @returns 四舍五入后的KPI结果
   */
  private roundKPIResult(kpi: KPIResult): KPIResult {
    return {
      ...kpi,
      // 金额保留2位小数
      签单保费: round(kpi.签单保费, 2),
      满期保费: round(kpi.满期保费, 2),
      已赚保费: kpi.已赚保费 ? round(kpi.已赚保费, 2) : undefined,
      已报案赔付: round(kpi.已报案赔付, 2),
      费用额: round(kpi.费用额, 2),
      满期边际贡献额: round(kpi.满期边际贡献额, 2),
      年度保费计划: kpi.年度保费计划 ? round(kpi.年度保费计划, 2) : undefined,
      
      // 均值保留2位小数
      案均赔款: round(kpi.案均赔款, 2),

      // 比率保留1位小数
      满期赔付率: round(kpi.满期赔付率, 1),
      变动成本率: round(kpi.变动成本率, 1),
      综合成本率: round(kpi.综合成本率, 1),
      费用率: round(kpi.费用率, 1),
      贡献率: round(kpi.贡献率, 1),
      满期边际贡献率: kpi.满期边际贡献率 ? round(kpi.满期边际贡献率, 1) : undefined,
      满期率: round(kpi.满期率, 1),
      出险率: round(kpi.出险率, 2), // Template uses 2 decimals for frequency often? No, template showed 17.16... Let's use 2.
      保费达成率: kpi.保费达成率 ? round(kpi.保费达成率, 1) : undefined,
      年计划达成率: kpi.年计划达成率 ? round(kpi.年计划达成率, 1) : undefined,
    }
  }

  /**
   * 批量计算多组KPI
   *
   * @param groups - 分组数据
   * @param options - 计算选项
   * @returns 多组KPI结果
   */
  calculateGroupKPIs(
    groups: Array<{ name: string; data: RawDataRow[] }>,
    options: KPICalculateOptions = {}
  ) {
    return groups.map(group => ({
      name: group.name,
      kpi: this.calculateKPIs(group.data, options),
      rowCount: group.data.length,
      hasYearPlan: group.data.some(row => (row.premium_plan_yuan || 0) > 0),
    }))
  }
}

// 导出单例
export const kpiCalculator = new KPICalculator()
