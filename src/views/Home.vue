<template>
  <div class="home-container">
    <el-container>
      <el-header>
        <h1>
          <el-icon><DataAnalysis /></el-icon>
          autoweKPI - 经营分析周报
        </h1>
      </el-header>

      <el-main>
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <span>欢迎使用 autoweKPI</span>
              <el-tag type="success">v0.1.0</el-tag>
            </div>
          </template>

          <el-space direction="vertical" :size="20" style="width: 100%">
            <el-alert
              title="项目初始化成功"
              type="success"
              description="Vite + Vue 3 + TypeScript 项目骨架已创建"
              show-icon
              :closable="false"
            />

            <el-descriptions title="技术栈" :column="2" border>
              <el-descriptions-item label="前端框架">Vue 3.5</el-descriptions-item>
              <el-descriptions-item label="状态管理">Pinia 2.2</el-descriptions-item>
              <el-descriptions-item label="UI组件库">Element Plus 2.9</el-descriptions-item>
              <el-descriptions-item label="图表库">ECharts 5.5</el-descriptions-item>
              <el-descriptions-item label="构建工具">Vite 6.0</el-descriptions-item>
              <el-descriptions-item label="类型系统">TypeScript 5.7</el-descriptions-item>
            </el-descriptions>

            <el-divider />

            <div class="next-steps">
              <h3>下一步计划：</h3>
              <el-steps :active="0" direction="vertical">
                <el-step title="Phase 1: 项目初始化" description="创建项目骨架（进行中）" />
                <el-step title="Phase 2: 核心功能迁移" description="数据处理和KPI计算" />
                <el-step title="Phase 3: UI组件开发" description="上传、图表、报告组件" />
                <el-step title="Phase 4: 扩展功能" description="DuckDB和趋势分析" />
                <el-step title="Phase 5: 部署和优化" description="GitHub Pages发布" />
              </el-steps>
            </div>
          </el-space>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { DataAnalysis } from '@element-plus/icons-vue'
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
}

.el-header {
  display: flex;
  align-items: center;
  background-color: var(--el-color-primary);
  color: white;
}

.el-header h1 {
  margin: 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.el-main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.next-steps {
  margin-top: 20px;
}

.next-steps h3 {
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}
</style>
