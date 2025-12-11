/**
 * 配置类型定义
 */

import type { GroupDimension } from './data'

/**
 * 应用配置
 */
export interface AppConfig {
  // 版本信息
  version: string
  buildDate: string

  // 默认配置
  defaultYear: number // 默认年份
  defaultWeek: number // 默认周次
  defaultDimension: GroupDimension // 默认分组维度

  // UI配置
  theme: 'light' | 'dark' // 主题
  locale: 'zh-CN' | 'en-US' // 语言

  // 数据配置
  maxFileSize: number // 最大上传文件大小（MB）
  maxRows: number // 最大处理行数

  // 功能开关
  enableDuckDB: boolean // 启用DuckDB
  enableTrend: boolean // 启用趋势分析
  enableExport: boolean // 启用导出功能
}

/**
 * 报告配置
 */
export interface ReportConfig {
  year: number // 年份
  week: number // 周次
  organizationName?: string // 机构名称（单机构模式）
  includeCharts: boolean // 是否包含图表
  chartDimension: GroupDimension // 图表维度
}

/**
 * 存储的会话状态
 */
export interface SessionState {
  // 最近使用的配置
  lastYear?: number
  lastWeek?: number
  lastDimension?: GroupDimension

  // 最近上传的文件信息
  lastFileName?: string
  lastFileSize?: number
  lastUploadTime?: string

  // UI状态
  activeTab?: string
  activeDimension?: GroupDimension
}

/**
 * 默认应用配置
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  version: '0.1.0',
  buildDate: new Date().toISOString(),

  defaultYear: new Date().getFullYear(),
  defaultWeek: 1,
  defaultDimension: 'third_level_organization',

  theme: 'light',
  locale: 'zh-CN',

  maxFileSize: 50, // 50MB
  maxRows: 1000000, // 100万行

  enableDuckDB: false, // 默认关闭，后续开启
  enableTrend: false, // 默认关闭，后续开启
  enableExport: true, // 启用导出
}

/**
 * 默认报告配置
 */
export const DEFAULT_REPORT_CONFIG: ReportConfig = {
  year: new Date().getFullYear(),
  week: 1,
  includeCharts: true,
  chartDimension: 'third_level_organization',
}
