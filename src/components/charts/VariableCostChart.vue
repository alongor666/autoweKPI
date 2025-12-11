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
  // Sort by Variable Cost Ratio descending (worst first)
  const sortedData = [...props.data].sort((a, b) => b.kpi.变动成本率 - a.kpi.变动成本率)
  
  const names = sortedData.map(item => item.name)
  const costRates = sortedData.map(item => item.kpi.变动成本率)
  const combinedRates = sortedData.map(item => item.kpi.综合成本率)

  return {
    title: {
      text: props.title || '成本率分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        let res = params[0].name + '<br/>'
        params.forEach((item: any) => {
          res += item.marker + item.seriesName + ': ' + item.value + '%<br/>'
        })
        return res
      }
    },
    legend: {
      data: ['变动成本率', '综合成本率'],
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
    yAxis: {
      type: 'value',
      name: '百分比 (%)',
      axisLabel: {
        formatter: '{value} %'
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '变动成本率',
        type: 'bar',
        data: costRates,
        itemStyle: { 
          color: (params: any) => {
            return params.value > 93 ? '#F56C6C' : '#409EFF'
          }
        },
        markLine: {
          data: [{ yAxis: 93, name: '阈值' }],
          lineStyle: { color: '#F56C6C', type: 'dashed' }
        }
      },
      {
        name: '综合成本率',
        type: 'line',
        data: combinedRates,
        itemStyle: { color: '#E6A23C' }
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
