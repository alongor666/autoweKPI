<template>
  <div class="chart-wrapper">
    <BaseChart :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import type { GroupKPIResult } from '@/types/kpi'
import BaseChart from '@/components/common/BaseChart.vue'

const props = defineProps<{
  data: GroupKPIResult[]
  title?: string
}>()

const chartOptions = computed<EChartsOption>(() => {
  // Sort data by Signed Premium descending
  const sortedData = [...props.data].sort((a, b) => b.kpi.签单保费 - a.kpi.签单保费)
  
  const names = sortedData.map(item => item.name)
  const signedPremiums = sortedData.map(item => item.kpi.签单保费)
  const maturedPremiums = sortedData.map(item => item.kpi.满期保费)
  const growthRates = sortedData.map(item => item.kpi.满期率)

  return {
    title: {
      text: props.title || '保费规模概览',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['签单保费', '满期保费', '满期率'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        interval: 0,
        rotate: names.length > 5 ? 30 : 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '保费 (万元)',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '满期率 (%)',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value} %'
        }
      }
    ],
    series: [
      {
        name: '签单保费',
        type: 'bar',
        data: signedPremiums,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '满期保费',
        type: 'bar',
        data: maturedPremiums,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '满期率',
        type: 'line',
        yAxisIndex: 1,
        data: growthRates,
        itemStyle: { color: '#E6A23C' },
        tooltip: {
          valueFormatter: (value) => value + ' %'
        }
      }
    ]
  }
})
</script>

<style scoped>
.chart-wrapper {
  height: 400px;
  width: 100%;
}
</style>
