/**
 * 数据聚合服务
 * 对应Python的report_generator.py中的聚合逻辑
 * 使用Lodash实现groupBy等聚合操作
 */

import { groupBy, orderBy } from 'lodash-es'
import type { RawDataRow, GroupDimension, GroupedData, GroupKPIResult } from '@/types'
import { kpiCalculator } from './kpi-calculator'

export class DataAggregator {
  /**
   * 按指定维度分组数据
   *
   * @param data - 原始数据
   * @param dimension - 分组维度
   * @returns 分组后的数据
   */
  groupByDimension(data: RawDataRow[], dimension: GroupDimension): GroupedData[] {
    // 使用lodash的groupBy进行分组
    const groups = groupBy(data, dimension)

    // 转换为数组格式
    return Object.entries(groups).map(([name, groupData]) => ({
      name,
      data: groupData,
    }))
  }

  /**
   * 计算分组KPI并排序
   *
   * @param data - 原始数据
   * @param dimension - 分组维度
   * @param sortBy - 排序字段（默认按保费降序）
   * @param limit - 限制返回数量
   * @returns 排序后的分组KPI结果
   */
  calculateGroupedKPIs(
    data: RawDataRow[],
    dimension: GroupDimension,
    sortBy: keyof GroupKPIResult['kpi'] = '签单保费',
    limit?: number
  ): GroupKPIResult[] {
    // 分组
    const groups = this.groupByDimension(data, dimension)

    // 计算每组的KPI
    const results = kpiCalculator.calculateGroupKPIs(groups)

    // 排序（默认降序）
    const sorted = orderBy(results, [result => result.kpi[sortBy]], ['desc'])

    // 限制数量
    return limit ? sorted.slice(0, limit) : sorted
  }

  /**
   * 过滤掉"本部"机构
   *
   * @param data - 原始数据
   * @returns 过滤后的数据
   */
  filterOutHeadquarters(data: RawDataRow[]): RawDataRow[] {
    return data.filter(row => {
      const org = row.third_level_organization.toLowerCase()
      return !org.includes('本部') && !org.includes('总部')
    })
  }

  /**
   * 检测是否为单机构模式
   * 规则：唯一机构数量 = 1
   *
   * @param data - 原始数据
   * @returns 是否为单机构模式
   */
  isSingleOrgMode(data: RawDataRow[]): boolean {
    const uniqueOrgs = new Set(data.map(row => row.third_level_organization))
    return uniqueOrgs.size === 1
  }

  /**
   * 检测是否为多机构模式
   * 规则：唯一机构数量 >= 12
   *
   * @param data - 原始数据
   * @returns 是否为多机构模式
   */
  isMultiOrgMode(data: RawDataRow[]): boolean {
    const uniqueOrgs = new Set(data.map(row => row.third_level_organization))
    return uniqueOrgs.size >= 12
  }

  /**
   * 获取机构名称
   * 单机构模式：返回唯一机构名
   * 多机构模式：返回二级机构名（如果有）
   *
   * @param data - 原始数据
   * @returns 机构名称
   */
  getOrganizationName(data: RawDataRow[]): string {
    if (data.length === 0) {
      return '未知机构'
    }

    const uniqueOrgs = [...new Set(data.map(row => row.third_level_organization))]

    // 单机构模式
    if (uniqueOrgs.length === 1) {
      return uniqueOrgs[0] || '未知机构'
    }

    // 多机构模式：尝试获取二级机构名
    const secondLevelOrg = data[0]?.second_level_organization
    if (secondLevelOrg) {
      return secondLevelOrg
    }

    // 默认
    return '分公司'
  }

  /**
   * 按保费进度排序（用于保费进度图表）
   * 规则：
   * - 有计划：按达成率升序（未达标的排前面）
   * - 无计划：按保费升序（保费低的排前面）
   *
   * @param results - 分组KPI结果
   * @returns 排序后的结果
   */
  sortByPremiumProgress(results: GroupKPIResult[]): GroupKPIResult[] {
    // 检查是否有年度计划
    const hasPlans = results.some(r => r.hasYearPlan)

    if (hasPlans) {
      // 有计划：按达成率升序
      return orderBy(
        results,
        [result => result.kpi.保费达成率 || 0],
        ['asc']
      )
    } else {
      // 无计划：按保费升序
      return orderBy(
        results,
        [result => result.kpi.签单保费],
        ['asc']
      )
    }
  }

  /**
   * 获取Top N结果
   *
   * @param results - 分组KPI结果
   * @param n - 数量限制
   * @returns Top N结果
   */
  getTopN(results: GroupKPIResult[], n: number): GroupKPIResult[] {
    return results.slice(0, n)
  }

  /**
   * 获取保费进度数据（用于图表）
   * 最多返回12个机构
   *
   * @param data - 原始数据
   * @returns 保费进度数据
   */
  getPremiumProgressData(data: RawDataRow[]) {
    // 按机构分组并计算KPI
    let results = this.calculateGroupedKPIs(data, 'third_level_organization')

    // 过滤本部
    results = results.filter(r => {
      const name = r.name.toLowerCase()
      return !name.includes('本部') && !name.includes('总部')
    })

    // 按进度排序
    results = this.sortByPremiumProgress(results)

    // 限制12个
    results = this.getTopN(results, 12)

    return {
      organizations: results.map(r => r.name),
      actual: results.map(r => r.kpi.签单保费),
      target: results.map(r => r.kpi.年度保费计划 || 0),
      achievementRate: results.map(r => r.kpi.保费达成率 || 0),
      hasPlans: results.some(r => r.hasYearPlan),
    }
  }
}

// 导出单例
export const dataAggregator = new DataAggregator()
