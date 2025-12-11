/**
 * 数据类型定义
 * 对应Python版本的数据结构
 */

/**
 * CSV原始数据行
 * 对应Python DataFrame的一行
 */
export interface RawDataRow {
  // 组织维度
  third_level_organization: string // 三级机构
  second_level_organization?: string // 二级机构
  province?: string // 省份

  // 客户维度
  customer_category: string // 客户类别（大客户、个人、其他）

  // 业务维度
  business_type_category: string // 业务类型类别
  business_type?: string // 业务类型（原始）

  // 保费数据（单位：元）
  signed_premium_yuan: number // 签单保费
  matured_premium_yuan: number // 满期保费

  // 赔付数据（单位：元）
  reported_claim_payment_yuan: number // 已报案赔付支出
  ibnr_yuan: number // 未决赔款准备金（IBNR）

  // 费用数据（单位：元）
  acquisition_cost_yuan: number // 获客成本（手续费+佣金）
  operating_expense_yuan: number // 营运费用

  // 年度计划（单位：元）
  year_plan_premium?: number // 年度保费计划

  // 可选字段
  [key: string]: string | number | undefined
}

/**
 * 聚合维度
 */
export type GroupDimension =
  | 'third_level_organization' // 三级机构
  | 'customer_category' // 客户类别
  | 'business_type_category' // 业务类型

/**
 * 聚合后的数据组
 */
export interface GroupedData {
  name: string // 组名（机构名/类别名）
  data: RawDataRow[] // 该组的原始数据
}

/**
 * 数据验证错误
 */
export interface ValidationError {
  type: 'missing_column' | 'invalid_value' | 'empty_data'
  message: string
  details?: string[]
}

/**
 * CSV解析配置
 */
export interface ParseConfig {
  dynamicTyping: boolean // 自动类型转换
  header: boolean // 首行为表头
  skipEmptyLines: boolean // 跳过空行
  encoding?: string // 编码格式
}

/**
 * 数据加载结果
 */
export interface DataLoadResult {
  success: boolean
  data?: RawDataRow[]
  errors?: ValidationError[]
  rowCount?: number
  columnCount?: number
}

/**
 * 必需字段列表
 */
export const REQUIRED_COLUMNS: (keyof RawDataRow)[] = [
  'third_level_organization',
  'business_type_category',
  'signed_premium_yuan',
  'matured_premium_yuan',
  'reported_claim_payment_yuan',
  'ibnr_yuan',
  'acquisition_cost_yuan',
  'operating_expense_yuan',
]

/**
 * 数值字段列表
 */
export const NUMERIC_COLUMNS: (keyof RawDataRow)[] = [
  'signed_premium_yuan',
  'matured_premium_yuan',
  'reported_claim_payment_yuan',
  'ibnr_yuan',
  'acquisition_cost_yuan',
  'operating_expense_yuan',
  'year_plan_premium',
]
