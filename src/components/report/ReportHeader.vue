<template>
  <div class="header" v-if="reportSummary">
    <h1>{{ reportTitle }}</h1>
    <div class="header-info">
      数据截止日期：{{ reportSummary.dataDate }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

const reportSummary = computed(() => dataStore.reportSummary)

const reportTitle = computed(() => {
  if (!reportSummary.value) return ''
  const { organizationName, weekNumber, isSingleOrgMode } = reportSummary.value
  
  const orgPart = isSingleOrgMode ? organizationName : `${organizationName}分公司`
  return `${orgPart}车险第${weekNumber}周经营分析`
})
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: var(--blur-backdrop);
  -webkit-backdrop-filter: var(--blur-backdrop);
  padding: 24px 48px;
  border-bottom: 1px solid rgba(160, 39, 36, 0.1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-red);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.header-info {
  font-size: 13px;
  color: var(--gray-medium);
  font-weight: 600;
}

@media (max-width: 768px) {
  .header {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
