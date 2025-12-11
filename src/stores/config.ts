/**
 * 配置状态管理
 * 管理应用配置、UI状态、用户偏好
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppConfig, SessionState, GroupDimension } from '@/types'
import { DEFAULT_APP_CONFIG } from '@/types/config'

export const useConfigStore = defineStore('config', () => {
  // ========== 状态 ==========

  // 应用配置
  const appConfig = ref<AppConfig>({ ...DEFAULT_APP_CONFIG })

  // 当前激活的Tab
  const activeTab = ref<string>('overview')

  // 当前激活的维度
  const activeDimension = ref<GroupDimension>('third_level_organization')

  // 会话状态（用于恢复上次的选择）
  const sessionState = ref<SessionState>({})

  // ========== 计算属性 ==========

  // 是否启用DuckDB
  const isDuckDBEnabled = computed(() => appConfig.value.enableDuckDB)

  // 是否启用趋势分析
  const isTrendEnabled = computed(() => appConfig.value.enableTrend)

  // 是否启用导出功能
  const isExportEnabled = computed(() => appConfig.value.enableExport)

  // 当前主题
  const currentTheme = computed(() => appConfig.value.theme)

  // 当前语言
  const currentLocale = computed(() => appConfig.value.locale)

  // ========== 操作方法 ==========

  /**
   * 设置激活的Tab
   */
  function setActiveTab(tab: string) {
    activeTab.value = tab
    saveSessionState()
  }

  /**
   * 设置激活的维度
   */
  function setActiveDimension(dimension: GroupDimension) {
    activeDimension.value = dimension
    saveSessionState()
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    appConfig.value.theme = appConfig.value.theme === 'light' ? 'dark' : 'light'
    applyTheme()
  }

  /**
   * 设置语言
   */
  function setLocale(locale: 'zh-CN' | 'en-US') {
    appConfig.value.locale = locale
  }

  /**
   * 启用/禁用DuckDB
   */
  function toggleDuckDB(enabled?: boolean) {
    appConfig.value.enableDuckDB = enabled ?? !appConfig.value.enableDuckDB
  }

  /**
   * 启用/禁用趋势分析
   */
  function toggleTrend(enabled?: boolean) {
    appConfig.value.enableTrend = enabled ?? !appConfig.value.enableTrend
  }

  /**
   * 保存会话状态到localStorage
   */
  function saveSessionState() {
    const state: SessionState = {
      activeTab: activeTab.value,
      activeDimension: activeDimension.value,
    }

    try {
      localStorage.setItem('autoweKPI_session', JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to save session state', e)
    }
  }

  /**
   * 从localStorage恢复会话状态
   */
  function loadSessionState() {
    try {
      const saved = localStorage.getItem('autoweKPI_session')
      if (saved) {
        const state: SessionState = JSON.parse(saved)
        sessionState.value = state

        // 恢复状态
        if (state.activeTab) {
          activeTab.value = state.activeTab
        }
        if (state.activeDimension) {
          activeDimension.value = state.activeDimension
        }
      }
    } catch (e) {
      console.warn('Failed to load session state', e)
    }
  }

  /**
   * 应用主题
   */
  function applyTheme() {
    const html = document.documentElement
    if (appConfig.value.theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  /**
   * 初始化配置
   */
  function initialize() {
    loadSessionState()
    applyTheme()
  }

  return {
    // 状态
    appConfig,
    activeTab,
    activeDimension,
    sessionState,

    // 计算属性
    isDuckDBEnabled,
    isTrendEnabled,
    isExportEnabled,
    currentTheme,
    currentLocale,

    // 方法
    setActiveTab,
    setActiveDimension,
    toggleTheme,
    setLocale,
    toggleDuckDB,
    toggleTrend,
    saveSessionState,
    loadSessionState,
    initialize,
  }
})
