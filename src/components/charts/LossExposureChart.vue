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
  // Data format: [Loss Ratio, Cost Ratio, Premium, Name, Combined Ratio]
  const seriesData = props.data.map(item => {
    return [
      item.kpi.满期赔付率,
      item.kpi.变动成本率,
      item.kpi.满期保费,
      item.name,
      item.kpi.综合成本率
    ]
  })

  return {
    title: {
      text: props.title || '损失暴露矩阵',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        const data = params.data
        return `
          <div style="font-weight:bold">${data[3]}</div>
          满期保费: ${data[2]} 万元<br/>
          满期赔付率: ${data[0]}%<br/>
          变动成本率: ${data[1]}%<br/>
          综合成本率: ${data[4]}%
        `
      }
    },
    grid: {
      left: '5%',
      right: '10%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '满期赔付率 (%)',
      scale: true,
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '变动成本率 (%)',
      scale: true,
      splitLine: { show: false }
    },
    series: [
      {
        name: '机构分布',
        type: 'scatter',
        symbolSize: function (data: any) {
          // Scale size based on premium, min 10, max 60
          // Simple log scaling for better visualization
          return Math.max(10, Math.min(60, Math.log(data[2] + 1) * 5))
        },
        data: seriesData,
        itemStyle: {
          color: function (params: any) {
            // Red if cost ratio > 93 or loss ratio > 70
            const data = params.data as number[]
            if (Array.isArray(data) && data.length > 1) {
              const lossRatio = data[0]
              const costRatio = data[1]
              if ((lossRatio !== undefined && lossRatio > 70) || (costRatio !== undefined && costRatio > 93)) {
                 return '#F56C6C' // Red
              }
            }
            return '#409EFF' // Blue
          },
          opacity: 0.7,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        },
        markLine: {
          lineStyle: { type: 'dashed', color: '#909399' },
          data: [
            { xAxis: 65, name: '赔付率警戒线' },
            { yAxis: 93, name: '成本率警戒线' }
          ]
        }
      }
    ]
  }
})
</script>

<style scoped>
.chart-wrapper {
  height: 450px;
  width: 100%;
}
</style>
