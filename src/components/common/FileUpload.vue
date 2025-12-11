<template>
  <div class="upload-container">
    <el-upload
      class="upload-area"
      drag
      action="#"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
      accept=".csv"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将 CSV 文件拖到此处，或 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          只能上传 csv 文件，且包含必需的字段列
        </div>
      </template>
    </el-upload>

    <!-- 加载状态 -->
    <div v-if="dataStore.loading" class="loading-overlay">
      <el-result
        icon="info"
        title="正在处理数据"
        sub-title="请稍候，正在解析CSV并计算KPI..."
      >
        <template #extra>
          <el-progress
            type="circle"
            :percentage="100"
            status="success"
            :indeterminate="true"
            :duration="2"
          />
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

// 处理文件变更（选择或拖拽）
const handleFileChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) {
    ElMessage.error('无法获取文件内容')
    return
  }

  const file = uploadFile.raw
  
  // 简单验证文件类型
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    ElMessage.error('请上传 CSV 格式的文件')
    return
  }

  try {
    await dataStore.loadFile(file)
    ElMessage.success(`成功加载文件: ${file.name}，共 ${dataStore.statistics.totalRows} 行数据`)
  } catch (error) {
    console.error('文件加载失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '文件加载失败')
  }
}
</script>

<style scoped>
.upload-container {
  width: 100%;
  position: relative;
}

.upload-area {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
}
</style>
