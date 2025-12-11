<template>
  <div class="metric-card">
    <div class="metric-label">
      {{ title }}
      <el-tooltip
        v-if="description"
        :content="description"
        placement="top"
      >
        <el-icon class="info-icon"><InfoFilled /></el-icon>
      </el-tooltip>
    </div>
    <div class="metric-value" :style="{ color: color }">
      {{ formattedValue }}<span class="metric-unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

interface Props {
  title: string
  value: number
  unit?: string
  precision?: number
  description?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  precision: 2,
  description: '',
  color: ''
})

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return '--'
  return props.value.toFixed(props.precision)
})
</script>

<style scoped>
.metric-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 28px 24px;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  transition: var(--transition);
  border: 1px solid rgba(0,0,0,0.04);
  height: 100%;
}

.metric-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.metric-label {
  font-size: 13px;
  color: var(--gray-medium);
  margin-bottom: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-value {
  font-size: 48px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif;
  letter-spacing: -1.5px;
  line-height: 1.1;
  color: var(--gray-dark);
}

.metric-unit {
  font-size: 18px;
  color: var(--gray-medium);
  margin-left: 6px;
  font-weight: 600;
}

.info-icon {
  cursor: help;
  font-size: 12px;
  color: var(--gray-medium);
}
</style>
