<template>
  <div class="kpi-dashboard" v-if="kpiData">
    <!-- 悬浮上传按钮 (模拟) -->
    <a href="#" class="float-btn" title="导入新数据" @click.prevent="$emit('import')">
      <svg viewBox="0 0 24 24">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
      </svg>
    </a>

    <!-- 主标签页 -->
    <div class="tabs">
      <div 
        class="tab" 
        :class="{ active: activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        经营概览
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'premium' }"
        @click="activeTab = 'premium'"
      >
        保费进度
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'cost' }"
        @click="activeTab = 'cost'"
      >
        变动成本
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'loss' }"
        @click="activeTab = 'loss'"
      >
        损失暴露
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'expense' }"
        @click="activeTab = 'expense'"
      >
        费用支出
      </div>
    </div>

    <div class="content">
      <!-- 经营概览 -->
      <div v-show="activeTab === 'overview'" class="tab-content active">
        <!-- 维度切换 -->
        <div class="dimension-switch">
          <button 
            class="dimension-btn" 
            :class="{ active: activeDimension === 'kpi' }"
            @click="activeDimension = 'kpi'"
          >
            关键数据
          </button>
          <button 
            class="dimension-btn" 
            :class="{ active: activeDimension === 'org' }"
            @click="activeDimension = 'org'"
          >
            三级机构
          </button>
          <button 
            class="dimension-btn" 
            :class="{ active: activeDimension === 'category' }"
            @click="activeDimension = 'category'"
          >
            客户类别
          </button>
          <button 
            class="dimension-btn" 
            :class="{ active: activeDimension === 'businessType' }"
            @click="activeDimension = 'businessType'"
          >
            业务类型
          </button>
        </div>

        <div v-if="activeDimension === 'kpi'">
          <!-- 关键指标卡片 -->
          <div class="metric-cards">
            <KPICard
              title="保费时间进度达成率"
              :value="kpiData.年计划达成率"
              unit="%"
              :precision="1"
              :color="getKPIColor(kpiData.年计划达成率, 'high')"
            />
            <KPICard
              title="变动成本率"
              :value="kpiData.变动成本率"
              unit="%"
              :precision="1"
              :color="getKPIColor(kpiData.变动成本率, 'low')"
            />
            <KPICard
              title="满期赔付率"
              :value="kpiData.满期赔付率"
              unit="%"
              :precision="1"
              :color="getKPIColor(kpiData.满期赔付率, 'low')"
            />
            <KPICard
              title="费用率"
              :value="kpiData.费用率"
              unit="%"
              :precision="1"
            />
            <KPICard
              title="签单保费"
              :value="kpiData.签单保费"
              unit="万元"
              :precision="2"
            />
            <KPICard
              title="满期保费"
              :value="kpiData.满期保费"
              unit="万元"
              :precision="2"
            />
            <KPICard
              title="满期赔付额"
              :value="kpiData.已报案赔付"
              unit="万元"
              :precision="2"
            />
            <KPICard
              title="费用额"
              :value="kpiData.费用额"
              unit="万元"
              :precision="2"
            />
          </div>

          <!-- 图表区域 -->
          <div class="chart-container">
            <div class="chart-title">核心指标趋势 (演示数据)</div>
            <div ref="chartRef" style="height: 400px; width: 100%;"></div>
          </div>
        </div>

        <div v-else>
          <div class="problem-list">
            <h3><el-icon><InfoFilled /></el-icon> 提示</h3>
            <p>更多维度数据分析功能正在开发中...</p>
          </div>
        </div>
      </div>

      <!-- 其他标签页占位 -->
      <div v-show="activeTab !== 'overview'" class="tab-content active">
         <div class="problem-list">
            <h3><el-icon><InfoFilled /></el-icon> 提示</h3>
            <p>{{ activeTabName }} 模块正在开发中...</p>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { KPIResult } from '@/types/kpi'
import KPICard from '@/components/common/KPICard.vue'
import { InfoFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  kpiData: KPIResult
}>()

defineEmits(['import'])

const activeTab = ref('overview')
const activeDimension = ref('kpi')
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const activeTabName = computed(() => {
  const names: Record<string, string> = {
    overview: '经营概览',
    premium: '保费进度',
    cost: '变动成本',
    loss: '损失暴露',
    expense: '费用支出'
  }
  return names[activeTab.value] || activeTab.value
})

const getKPIColor = (value: number | undefined, type: 'high' | 'low') => {
  if (value === undefined || value === null) return undefined
  
  if (type === 'high') {
    // 越高越好 (如达成率)
    if (value >= 100) return 'var(--success-green)'
    if (value >= 90) return 'var(--warning-yellow)'
    return 'var(--danger-red)'
  } else {
    // 越低越好 (如赔付率)
    if (value <= 60) return 'var(--success-green)'
    if (value <= 70) return 'var(--warning-yellow)'
    return 'var(--danger-red)'
  }
}

// 图表初始化
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
    window.addEventListener('resize', handleResize)
  }
}

const handleResize = () => {
  chartInstance?.resize()
}

const updateChart = () => {
  if (!chartInstance) return
  
  // 这里使用演示数据，实际应从 store 或 props 获取历史趋势数据
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['W43', 'W44', 'W45', 'W46', 'W47', 'W48', 'W49']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '签单保费',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#a02724'
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(160, 39, 36, 0.2)'
            },
            {
              offset: 1,
              color: 'rgba(160, 39, 36, 0.01)'
            }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: [1200, 1320, 1010, 1340, 900, 2300, props.kpiData.签单保费 || 2100]
      }
    ]
  }
  chartInstance.setOption(option)
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

watch(() => props.kpiData, () => {
  updateChart()
})

// 监听 tab 切换，重新调整图表大小（因为 v-show 可能导致尺寸计算问题）
watch(activeTab, () => {
  nextTick(() => {
    handleResize()
  })
})
</script>

<style scoped>
.kpi-dashboard {
  width: 100%;
}

.tabs {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: var(--blur-backdrop);
  -webkit-backdrop-filter: var(--blur-backdrop);
  padding: 0 48px;
  display: flex;
  gap: 4px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  position: sticky;
  top: 76px;
  z-index: 99;
}

.tab {
  padding: 14px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: var(--transition);
  font-size: 15px;
  color: var(--gray-medium);
  font-weight: 600;
  border-radius: 6px 6px 0 0;
  position: relative;
}

.tab:hover {
  background: rgba(160, 39, 36, 0.05);
  color: var(--gray-dark);
}

.tab.active {
  color: var(--primary-red);
  border-bottom-color: var(--primary-red);
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
}

.content {
  max-width: 1400px;
  margin: 30px auto;
  padding: 0 40px;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.dimension-switch {
  display: inline-flex;
  gap: 0;
  margin-bottom: 20px;
  background: rgba(160, 39, 36, 0.08);
  border-radius: 10px;
  padding: 3px;
}

.dimension-btn {
  padding: 10px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: var(--transition);
  font-size: 14px;
  color: var(--gray-dark);
  font-weight: 500;
}

.dimension-btn:hover {
  background: rgba(160, 39, 36, 0.12);
}

.dimension-btn.active {
  background: white;
  color: var(--primary-red);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.chart-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 32px;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  margin-bottom: 24px;
  border: 1px solid rgba(0,0,0,0.04);
  transition: var(--transition);
}

.chart-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-red);
  margin: 6px 0 12px 0;
  text-align: left;
}

.float-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background-color: var(--primary-red);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(160, 39, 36, 0.4);
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  border: none;
}

.float-btn:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 20px rgba(160, 39, 36, 0.6);
  background-color: #b92b27;
}

.float-btn svg {
  width: 28px;
  height: 28px;
  fill: currentColor;
}

.problem-list {
  background: linear-gradient(135deg, rgba(255, 192, 0, 0.08) 0%, rgba(255, 192, 0, 0.12) 100%);
  border-left: 3px solid var(--warning-yellow);
  padding: 20px 24px;
  margin-bottom: 24px;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(255, 192, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.problem-list h3 {
  font-size: 15px;
  color: var(--gray-dark);
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .metric-cards {
    grid-template-columns: 1fr;
  }

  .tabs {
    overflow-x: auto;
    padding-left: 20px;
    padding-right: 20px;
  }

  .content {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
