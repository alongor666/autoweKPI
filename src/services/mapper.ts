/**
 * 业务映射服务
 * 对应Python的mapper.py
 * 负责业务类型映射和异常检测
 */

import type {
  RawDataRow,
  GroupKPIResult,
  ProblemOrganization,
  ThresholdConfig,
  BusinessTypeMapping,
} from '@/types'
import { DEFAULT_THRESHOLDS } from '@/types/kpi'

export class BusinessMapper {
  private businessTypeMap: BusinessTypeMapping = {}
  private thresholds: ThresholdConfig = DEFAULT_THRESHOLDS

  /**
   * 设置业务类型映射
   *
   * @param mapping - 业务类型映射表
   */
  setBusinessTypeMapping(mapping: BusinessTypeMapping) {
    this.businessTypeMap = mapping
  }

  /**
   * 设置阈值配置
   *
   * @param thresholds - 阈值配置
   */
  setThresholds(thresholds: Partial<ThresholdConfig>) {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }

  /**
   * 应用业务类型映射
   * 将原始业务类型映射为标准类型
   *
   * @param data - 原始数据
   * @returns 映射后的数据
   */
  applyBusinessTypeMapping(data: RawDataRow[]): RawDataRow[] {
    if (Object.keys(this.businessTypeMap).length === 0) {
      return data // 没有映射表，直接返回
    }

    return data.map(row => ({
      ...row,
      business_type_category:
        this.businessTypeMap[row.business_type_category] || row.business_type_category,
    }))
  }

  /**
   * 识别问题机构
   * 规则：
   * 1. 综合成本率 > 93%
   * 2. 保费达成率 < 95%（如果有计划）
   * 3. 费用率 > 18%
   *
   * @param results - 分组KPI结果
   * @returns 问题机构列表（最多5个）
   */
  identifyProblemOrganizations(results: GroupKPIResult[]): ProblemOrganization[] {
    const problems: ProblemOrganization[] = []

    for (const result of results) {
      const issues: string[] = []
      const { kpi } = result

      // 检查成本率
      if (kpi.综合成本率 > this.thresholds.costRate) {
        issues.push(`综合成本率过高 (${kpi.综合成本率.toFixed(1)}%)`)
      }

      // 检查达成率（如果有计划）
      if (kpi.保费达成率 !== undefined && kpi.保费达成率 < this.thresholds.targetRate) {
        issues.push(`保费未达标 (${kpi.保费达成率.toFixed(1)}%)`)
      }

      // 检查费用率
      if (kpi.费用率 > this.thresholds.expenseRate) {
        issues.push(`费用率过高 (${kpi.费用率.toFixed(1)}%)`)
      }

      // 如果有问题，加入列表
      if (issues.length > 0) {
        problems.push({
          name: result.name,
          issues,
          kpi,
        })
      }
    }

    // 返回前N个问题机构
    return problems.slice(0, this.thresholds.maxProblems)
  }

  /**
   * 获取业务类型统计
   *
   * @param data - 原始数据
   * @returns 业务类型统计
   */
  getBusinessTypeStatistics(data: RawDataRow[]) {
    const typeCount = new Map<string, number>()
    const typePremium = new Map<string, number>()

    data.forEach(row => {
      const type = row.business_type_category
      typeCount.set(type, (typeCount.get(type) || 0) + 1)
      typePremium.set(type, (typePremium.get(type) || 0) + row.signed_premium_yuan)
    })

    return {
      typeCount: Object.fromEntries(typeCount),
      typePremium: Object.fromEntries(typePremium),
      totalTypes: typeCount.size,
    }
  }

  /**
   * 获取客户类别统计
   *
   * @param data - 原始数据
   * @returns 客户类别统计
   */
  getCustomerCategoryStatistics(data: RawDataRow[]) {
    const categoryCount = new Map<string, number>()
    const categoryPremium = new Map<string, number>()

    data.forEach(row => {
      const category = row.customer_category
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1)
      categoryPremium.set(category, (categoryPremium.get(category) || 0) + row.signed_premium_yuan)
    })

    return {
      categoryCount: Object.fromEntries(categoryCount),
      categoryPremium: Object.fromEntries(categoryPremium),
      totalCategories: categoryCount.size,
    }
  }
}

// 导出单例
export const businessMapper = new BusinessMapper()
