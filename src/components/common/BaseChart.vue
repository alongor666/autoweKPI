<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

// Props
const props = defineProps<{
  options: EChartsOption
  theme?: string | object
}>()

// Refs
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// Initialize chart
const initChart = () => {
  if (!chartRef.value) return
  
  // Dispose existing instance if any
  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(props.options)
}

// Watch options change
watch(() => props.options, (newOptions) => {
  if (chartInstance) {
    chartInstance.setOption(newOptions, true) // true for not merging
  }
}, { deep: true })

// Handle resize
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// Use ResizeObserver for container resize
const resizeObserver = new ResizeObserver(() => {
  handleResize()
})

onMounted(() => {
  nextTick(() => {
    initChart()
    if (chartRef.value) {
      resizeObserver.observe(chartRef.value)
    }
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  if (chartRef.value) {
    resizeObserver.unobserve(chartRef.value)
  }
  window.removeEventListener('resize', handleResize)
  resizeObserver.disconnect()
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
