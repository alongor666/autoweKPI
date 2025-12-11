/**
 * 数据状态管理
 * 管理CSV数据、KPI计算结果、报告生成
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RawDataRow, ReportSummary, GroupKPIResult } from '@/types'
import { dataLoader } from '@/services/data-loader'
import { kpiCalculator } from '@/services/kpi-calculator'
import { dataAggregator } from '@/services/aggregator'
import { businessMapper } from '@/services/mapper'
import { getWeekSaturday, getCurrentWeek, getCurrentYear } from '@/utils/date'

export const useDataStore = defineStore('data', () => {
  // ========== 状态 ==========

  // 原始数据
  const rawData = ref<RawDataRow[]>([])

  // 加载状态
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 文件信息
  const fileName = ref<string>('')
  const fileSize = ref<number>(0)
  const uploadTime = ref<string>('')

  // 报告配置
  const year = ref(getCurrentYear())
  const week = ref(getCurrentWeek())

  // ========== 计算属性 ==========

  // 是否有数据
  const hasData = computed(() => rawData.value.length > 0)

  // 数据统计
  const statistics = computed(() => {
    if (!hasData.value) {
      return {
        totalRows: 0,
        totalPremium: 0,
        uniqueOrganizations: 0,
        uniqueBusinessTypes: 0,
      }
    }
    return dataLoader.getStatistics(rawData.value)
  })

  // 单机构模式
  const isSingleOrgMode = computed(() => {
    if (!hasData.value) return false
    return dataAggregator.isSingleOrgMode(rawData.value)
  })

  // 机构名称
  const organizationName = computed(() => {
    if (!hasData.value) return ''
    return dataAggregator.getOrganizationName(rawData.value)
  })

  // 数据截止日期
  const dataDate = computed(() => {
    return getWeekSaturday(year.value, week.value)
  })

  // 总体KPI
  const summaryKPI = computed(() => {
    if (!hasData.value) return null
    return kpiCalculator.calculateKPIs(rawData.value)
  })

  // 按机构分组的KPI
  const kpiByOrganization = computed(() => {
    if (!hasData.value) return []
    return dataAggregator.calculateGroupedKPIs(rawData.value, 'third_level_organization')
  })

  // 按客户类别分组的KPI
  const kpiByCustomerCategory = computed(() => {
    if (!hasData.value) return []
    return dataAggregator.calculateGroupedKPIs(rawData.value, 'customer_category')
  })

  // 按业务类型分组的KPI
  const kpiByBusinessType = computed(() => {
    if (!hasData.value) return []
    return dataAggregator.calculateGroupedKPIs(rawData.value, 'business_type_category')
  })

  // 问题机构
  const problemOrganizations = computed(() => {
    if (!hasData.value) return []
    return businessMapper.identifyProblemOrganizations(kpiByOrganization.value)
  })

  // 完整报告摘要
  const reportSummary = computed((): ReportSummary | null => {
    if (!hasData.value || !summaryKPI.value) return null

    return {
      isSingleOrgMode: isSingleOrgMode.value,
      organizationName: organizationName.value,
      summary: summaryKPI.value,
      byOrganization: kpiByOrganization.value,
      byCustomerCategory: kpiByCustomerCategory.value,
      byBusinessType: kpiByBusinessType.value,
      weekNumber: week.value,
      year: year.value,
      dataDate: dataDate.value,
      totalRows: statistics.value.totalRows,
      generatedAt: new Date().toISOString(),
    }
  })

  // ========== 操作方法 ==========

  /**
   * 加载CSV文件
   */
  async function loadFile(file: File) {
    loading.value = true
    error.value = null

    try {
      // 记录文件信息
      fileName.value = file.name
      fileSize.value = file.size
      uploadTime.value = new Date().toISOString()

      // 加载数据
      const result = await dataLoader.loadFromFile(file)

      if (!result.success || !result.data) {
        const errorMsg = result.errors?.map(e => e.message).join('; ') || '数据加载失败'
        throw new Error(errorMsg)
      }

      // 保存数据
      rawData.value = result.data

    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 设置报告配置
   */
  function setReportConfig(newYear: number, newWeek: number) {
    year.value = newYear
    week.value = newWeek
  }

  /**
   * 清除数据
   */
  function clearData() {
    rawData.value = []
    fileName.value = ''
    fileSize.value = 0
    uploadTime.value = ''
    error.value = null
  }

  /**
   * 获取指定维度的KPI数据
   */
  function getKPIByDimension(dimension: 'organization' | 'customer' | 'business'): GroupKPIResult[] {
    switch (dimension) {
      case 'organization':
        return kpiByOrganization.value
      case 'customer':
        return kpiByCustomerCategory.value
      case 'business':
        return kpiByBusinessType.value
      default:
        return []
    }
  }

  return {
    // 状态
    rawData,
    loading,
    error,
    fileName,
    fileSize,
    uploadTime,
    year,
    week,

    // 计算属性
    hasData,
    statistics,
    isSingleOrgMode,
    organizationName,
    dataDate,
    summaryKPI,
    kpiByOrganization,
    kpiByCustomerCategory,
    kpiByBusinessType,
    problemOrganizations,
    reportSummary,

    // 方法
    loadFile,
    setReportConfig,
    clearData,
    getKPIByDimension,
  }
})
