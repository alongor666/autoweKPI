<template>
  <div class="home-container">
    <el-container>
      <el-header v-if="!dataStore.hasData">
        <h1>
          <el-icon><DataAnalysis /></el-icon>
          autoweKPI - 经营分析周报
        </h1>
      </el-header>

      <el-main :class="{ 'no-padding': dataStore.hasData }">
        <!-- 未加载数据时显示欢迎页和上传 -->
        <div v-if="!dataStore.hasData" class="welcome-section">
          <el-card class="welcome-card">
            <template #header>
              <div class="card-header">
                <span>欢迎使用 autoweKPI</span>
                <el-tag type="success">v0.1.0</el-tag>
              </div>
            </template>

            <el-space direction="vertical" :size="20" style="width: 100%">
              <el-alert
                title="准备开始"
                type="info"
                description="请上传包含经营数据的CSV文件以生成周报"
                show-icon
                :closable="false"
              />

              <FileUpload />
              
              <el-divider content-position="center">或查看开发进度</el-divider>

              <el-descriptions title="技术栈" :column="2" border>
                <el-descriptions-item label="前端框架">Vue 3.5</el-descriptions-item>
                <el-descriptions-item label="状态管理">Pinia 2.2</el-descriptions-item>
                <el-descriptions-item label="UI组件库">Element Plus 2.9</el-descriptions-item>
                <el-descriptions-item label="图表库">ECharts 5.5</el-descriptions-item>
                <el-descriptions-item label="构建工具">Vite 6.0</el-descriptions-item>
                <el-descriptions-item label="类型系统">TypeScript 5.7</el-descriptions-item>
              </el-descriptions>
            </el-space>
          </el-card>
        </div>

        <!-- 加载数据后显示完整报告 -->
        <div v-else class="report-container">
          <ReportView />
          
          <el-backtop :right="30" :bottom="100" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { DataAnalysis } from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/data'
import FileUpload from '@/components/common/FileUpload.vue'
import ReportView from '@/components/report/ReportView.vue'

const dataStore = useDataStore()
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--background); /* Use global variable */
}

.el-header {
  display: flex;
  align-items: center;
  background-color: white;
  border-bottom: 1px solid var(--el-border-color-light);
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.el-header h1 {
  margin: 0;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.el-main {
  padding: 20px;
}

.el-main.no-padding {
  padding: 0;
}

.welcome-section {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.welcome-card {
  width: 100%;
  max-width: 800px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-container {
  width: 100%;
}
</style>
