/**
 * 图表类型定义
 * 用于ECharts配置
 */

import type { EChartsOption } from 'echarts'

/**
 * 图表类型
 */
export type ChartType =
  | 'overview' // 经营概览（多指标雷达图/柱状图）
  | 'premium_progress' // 保费进度（条形图）
  | 'cost' // 变动成本（堆叠柱状图）
  | 'loss_exposure' // 损失暴露（气泡图）
  | 'expense' // 费用支出（柱状图）

/**
 * 图表维度
 */
export type ChartDimension = 'organization' | 'customer' | 'business'

/**
 * 图表数据点（用于条形图/柱状图）
 */
export interface ChartDataPoint {
  name: string // 分类名（机构名/类别名）
  value: number | number[] // 数值（单值或多值）
  itemStyle?: {
    color?: string // 自定义颜色
  }
}

/**
 * 气泡图数据点
 */
export interface BubbleChartDataPoint {
  name: string // 分类名
  value: [number, number, number] // [x轴, y轴, 气泡大小]
  itemStyle?: {
    color?: string
  }
}

/**
 * 图表配置选项
 */
export interface ChartOptions {
  title?: string // 图表标题
  dimension: ChartDimension // 数据维度
  data: ChartDataPoint[] | BubbleChartDataPoint[] // 图表数据
  customOption?: Partial<EChartsOption> // 自定义ECharts配置
}

/**
 * 保费进度图表数据
 */
export interface PremiumProgressChartData {
  organizations: string[] // 机构列表
  actual: number[] // 实际保费
  target?: number[] // 目标保费（如果有计划）
  achievementRate?: number[] // 达成率
}

/**
 * 成本结构图表数据
 */
export interface CostStructureChartData {
  categories: string[] // 分类（机构/类别）
  claims: number[] // 已报案赔付
  ibnr: number[] // 未决赔款
  acquisition: number[] // 获客成本
  operating: number[] // 营运费用
}

/**
 * 损失暴露图表数据
 */
export interface LossExposureChartData {
  dataPoints: BubbleChartDataPoint[] // 气泡数据
  xAxisLabel: string // x轴标签
  yAxisLabel: string // y轴标签
  sizeLabel: string // 气泡大小标签
}

/**
 * 图表主题颜色
 */
export const CHART_COLORS = {
  primary: '#409EFF', // 主色（蓝色）
  success: '#67C23A', // 成功（绿色）
  warning: '#E6A23C', // 警告（橙色）
  danger: '#F56C6C', // 危险（红色）
  info: '#909399', // 信息（灰色）

  // 多色系列（用于分类）
  series: [
    '#5470C6',
    '#91CC75',
    '#FAC858',
    '#EE6666',
    '#73C0DE',
    '#3BA272',
    '#FC8452',
    '#9A60B4',
    '#EA7CCC',
  ],
}

/**
 * 图表默认配置
 */
export const DEFAULT_CHART_CONFIG: Partial<EChartsOption> = {
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ccc',
    borderWidth: 1,
    textStyle: {
      color: '#333',
    },
  },
}
