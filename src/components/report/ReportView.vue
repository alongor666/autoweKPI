<template>
  <div class="report-view" v-if="summaryKPI">
    <ReportHeader />
    <KPIDashboard :kpi-data="summaryKPI" @import="handleImport" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'
import ReportHeader from './ReportHeader.vue'
import KPIDashboard from './KPIDashboard.vue'

const dataStore = useDataStore()

const summaryKPI = computed(() => dataStore.summaryKPI)

const handleImport = () => {
  dataStore.clearData()
}
</script>

<style scoped>
.report-view {
  width: 100%;
  background: transparent;
}
</style>
