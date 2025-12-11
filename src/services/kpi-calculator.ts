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
    const ibnr = sumBy(data, 'ibnr_yuan')
    const acquisitionCost = sumBy(data, 'acquisition_cost_yuan')
    const operatingExpense = sumBy(data, 'operating_expense_yuan')

    // 从数据中获取年度计划（如果有）
    const planFromData = sumBy(data, 'year_plan_premium')
    const effectivePlan = yearPlan || (planFromData > 0 ? planFromData : undefined)

    // 2. 转换为万元
    const 签单保费 = yuanToWan(signedPremium)
    const 满期保费 = yuanToWan(maturedPremium)
    const 已报案赔付 = yuanToWan(reportedClaim)
    const 未决赔款准备金 = yuanToWan(ibnr)
    const 获客成本 = yuanToWan(acquisitionCost)
    const 营运费用 = yuanToWan(operatingExpense)

    // 3. 计算已赚保费
    // 已赚保费 = 满期保费（简化版，不考虑IBNR变化）
    const 已赚保费 = 满期保费

    // 4. 计算比率指标（单位：%）
    // 满期赔付率 = 已报案赔付 / 满期保费 * 100
    const 满期赔付率 = safeDivide(已报案赔付, 满期保费) * 100

    // 变动成本率 = (已报案赔付 + 未决 + 获客成本) / 满期保费 * 100
    const 变动成本 = 已报案赔付 + 未决赔款准备金 + 获客成本
    const 变动成本率 = safeDivide(变动成本, 满期保费) * 100

    // 综合成本率 = (已报案赔付 + 未决 + 获客成本 + 营运费用) / 满期保费 * 100
    const 综合成本 = 变动成本 + 营运费用
    const 综合成本率 = safeDivide(综合成本, 满期保费) * 100

    // 费用率 = 营运费用 / 满期保费 * 100
    const 费用率 = safeDivide(营运费用, 满期保费) * 100

    // 贡献率 = 100 - 变动成本率
    const 贡献率 = 100 - 变动成本率

    // 5. 计算边际指标
    // 满期边际贡献额 = 满期保费 * 贡献率 / 100
    const 满期边际贡献额 = 满期保费 * (贡献率 / 100)

    // 6. 计算进度指标
    // 满期率 = 满期保费 / 签单保费 * 100
    const 满期率 = safeDivide(满期保费, 签单保费) * 100

    // 保费达成率 = 签单保费 / 年度计划 * 100（如果有年度计划）
    const 保费达成率 = effectivePlan ? safeDivide(签单保费, yuanToWan(effectivePlan)) * 100 : undefined

    // 7. 构建结果对象
    const result: KPIResult = {
      // 基础指标（万元）
      签单保费,
      满期保费,
      已赚保费,
      已报案赔付,
      未决赔款准备金,
      获客成本,
      营运费用,

      // 比率指标（%）
      满期赔付率,
      变动成本率,
      综合成本率,
      费用率,
      贡献率,

      // 边际指标（万元）
      满期边际贡献额,

      // 进度指标（%）
      满期率,
      保费达成率,

      // 年度计划（万元）
      年度保费计划: effectivePlan ? yuanToWan(effectivePlan) : undefined,
    }

    // 8. 四舍五入（如果启用）
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
      // 金额保留2位小数
      签单保费: round(kpi.签单保费, 2),
      满期保费: round(kpi.满期保费, 2),
      已赚保费: round(kpi.已赚保费, 2),
      已报案赔付: round(kpi.已报案赔付, 2),
      未决赔款准备金: round(kpi.未决赔款准备金, 2),
      获客成本: round(kpi.获客成本, 2),
      营运费用: round(kpi.营运费用, 2),
      满期边际贡献额: round(kpi.满期边际贡献额, 2),
      年度保费计划: kpi.年度保费计划 ? round(kpi.年度保费计划, 2) : undefined,

      // 比率保留1位小数
      满期赔付率: round(kpi.满期赔付率, 1),
      变动成本率: round(kpi.变动成本率, 1),
      综合成本率: round(kpi.综合成本率, 1),
      费用率: round(kpi.费用率, 1),
      贡献率: round(kpi.贡献率, 1),
      满期率: round(kpi.满期率, 1),
      保费达成率: kpi.保费达成率 ? round(kpi.保费达成率, 1) : undefined,
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
      hasYearPlan: group.data.some(row => (row.year_plan_premium || 0) > 0),
    }))
  }
}

// 导出单例
export const kpiCalculator = new KPICalculator()
