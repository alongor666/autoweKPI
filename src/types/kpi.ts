/**
 * KPI类型定义
 * 对应Python版本的KPI计算结果
 */

/**
 * KPI计算结果
 * 对应Python的kpi_calculator.py
 */
export interface KPIResult {
  // 基础指标（单位：万元）
  签单保费: number // signed_premium_yuan
  满期保费: number // matured_premium_yuan
  已赚保费: number // matured_premium - (ibnr的变化)

  // 成本指标（单位：万元）
  已报案赔付: number // reported_claim_payment_yuan
  未决赔款准备金: number // ibnr_yuan
  获客成本: number // acquisition_cost_yuan
  营运费用: number // operating_expense_yuan

  // 比率指标（单位：%）
  满期赔付率: number // 已报案赔付 / 满期保费 * 100
  变动成本率: number // (已报案赔付 + 未决 + 获客成本) / 满期保费 * 100
  综合成本率: number // (已报案赔付 + 未决 + 获客成本 + 营运费用) / 满期保费 * 100
  费用率: number // 营运费用 / 满期保费 * 100
  贡献率: number // 100 - 变动成本率

  // 边际指标（单位：万元）
  满期边际贡献额: number // 满期保费 * 贡献率 / 100

  // 进度指标
  满期率: number // 满期保费 / 签单保费 * 100
  保费达成率?: number // 签单保费 / 年度计划 * 100（如果有年度计划）

  // 辅助字段
  年度保费计划?: number // year_plan_premium（如果有）
}

/**
 * 分组KPI结果
 * 包含组名和KPI
 */
export interface GroupKPIResult {
  name: string // 组名（机构名/类别名）
  kpi: KPIResult // KPI结果
  rowCount: number // 该组的数据行数
  hasYearPlan: boolean // 是否有年度计划
}

/**
 * 报告汇总数据
 * 用于生成完整报告
 */
export interface ReportSummary {
  // 模式标识
  isSingleOrgMode: boolean // 单机构模式
  organizationName: string // 机构名称
  secondLevelOrg?: string // 二级机构名称

  // 总体KPI
  summary: KPIResult

  // 分组KPI
  byOrganization?: GroupKPIResult[] // 按机构分组
  byCustomerCategory?: GroupKPIResult[] // 按客户类别分组
  byBusinessType?: GroupKPIResult[] // 按业务类型分组

  // 元数据
  weekNumber: number // 周次
  year: number // 年份
  dataDate: string // 数据截止日期（ISO周六）
  totalRows: number // 总数据行数
  generatedAt: string // 报告生成时间
}

/**
 * 异常机构识别结果
 */
export interface ProblemOrganization {
  name: string // 机构名
  issues: string[] // 问题列表
  kpi: KPIResult // KPI数据
}

/**
 * 阈值配置
 * 用于异常检测
 */
export interface ThresholdConfig {
  costRate: number // 成本率上限（默认93）
  targetRate: number // 达成率下限（默认95）
  expenseRate: number // 费用率上限（默认18）
  maxProblems: number // 最多显示问题数（默认5）
}

/**
 * 业务类型映射
 */
export interface BusinessTypeMapping {
  [originalType: string]: string // 原始类型 -> 标准类型
}

/**
 * 年度计划配置
 */
export interface YearPlanConfig {
  year: number
  plans: {
    [organization: string]: number // 机构 -> 年度保费计划（万元）
  }
}

/**
 * KPI计算选项
 */
export interface KPICalculateOptions {
  yearPlan?: number // 手动指定年度计划
  enableRounding?: boolean // 是否启用四舍五入（默认true，保留2位小数）
}

/**
 * 默认阈值配置
 */
export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  costRate: 93,
  targetRate: 95,
  expenseRate: 18,
  maxProblems: 5,
}
