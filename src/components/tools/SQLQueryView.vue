<template>
  <div class="sql-query-view">
    <el-card shadow="hover" class="query-card">
      <template #header>
        <div class="card-header">
          <span class="title">SQL 高级查询 (DuckDB)</span>
          <div class="actions">
            <el-select v-model="selectedExample" placeholder="选择示例查询" @change="applyExample" style="width: 200px">
              <el-option
                v-for="item in examples"
                :key="item.label"
                :label="item.label"
                :value="item.sql"
              />
            </el-select>
            <el-button type="primary" :loading="loading" @click="executeQuery">
              <el-icon><VideoPlay /></el-icon> 运行查询
            </el-button>
          </div>
        </div>
      </template>

      <div class="editor-container">
        <el-input
          v-model="sqlQuery"
          type="textarea"
          :rows="6"
          placeholder="请输入 SQL 查询语句，例如: SELECT * FROM raw_data LIMIT 10"
          resize="none"
          class="sql-editor"
        />
      </div>

      <div v-if="error" class="error-message">
        <el-alert :title="error" type="error" show-icon :closable="false" />
      </div>

      <div v-if="result && result.length > 0" class="result-container">
        <div class="result-meta">
          查询返回 {{ result.length }} 行数据，耗时 {{ duration }}ms
        </div>
        <el-table :data="result" border stripe height="400" style="width: 100%">
          <el-table-column
            v-for="col in columns"
            :key="col"
            :prop="col"
            :label="col"
            min-width="120"
            show-overflow-tooltip
          />
        </el-table>
      </div>
      
      <el-empty v-else-if="executed && !loading" description="查询结果为空" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import { duckDBService } from '@/services/duckdb-loader'

const sqlQuery = ref('SELECT * FROM raw_data LIMIT 10')
const result = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const executed = ref(false)
const duration = ref(0)
const selectedExample = ref('')

const columns = computed(() => {
  if (result.value.length === 0) return []
  return Object.keys(result.value[0])
})

const examples = [
  {
    label: '前10行数据',
    sql: 'SELECT * FROM raw_data LIMIT 10'
  },
  {
    label: '按机构统计保费',
    sql: `SELECT 
  third_level_organization as 机构, 
  SUM(signed_premium_yuan)/10000 as 签单保费_万元,
  COUNT(*) as 单量
FROM raw_data 
GROUP BY 1 
ORDER BY 2 DESC`
  },
  {
    label: '按业务类型分析成本',
    sql: `SELECT 
  business_type_category as 业务类型,
  AVG(variable_cost_rate) as 平均变动成本率,
  SUM(matured_premium_yuan)/10000 as 满期保费_万元
FROM raw_data
GROUP BY 1
ORDER BY 3 DESC`
  }
]

const applyExample = (sql: string) => {
  sqlQuery.value = sql
}

const executeQuery = async () => {
  if (!sqlQuery.value.trim()) return
  
  loading.value = true
  error.value = ''
  executed.value = false
  result.value = []
  
  const startTime = performance.now()
  
  try {
    const data = await duckDBService.query(sqlQuery.value)
    result.value = data
    executed.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
    duration.value = Math.round(performance.now() - startTime)
  }
}
</script>

<style scoped>
.sql-query-view {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 12px;
}

.editor-container {
  margin-bottom: 20px;
}

:deep(.sql-editor textarea) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: #f8f9fa;
}

.error-message {
  margin-bottom: 20px;
}

.result-meta {
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
