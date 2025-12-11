<template>
  <div class="dimension-switch">
    <el-radio-group v-model="currentDimension" @change="handleChange">
      <el-radio-button value="organization">按机构</el-radio-button>
      <el-radio-button value="customer">按客户类别</el-radio-button>
      <el-radio-button value="business">按业务类型</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'change', value: 'organization' | 'customer' | 'business'): void
}>()

const currentDimension = ref<'organization' | 'customer' | 'business'>('organization')

const handleChange = (val: string | number | boolean | undefined) => {
    if (typeof val === 'string' && (val === 'organization' || val === 'customer' || val === 'business')) {
        emit('change', val)
    }
}
</script>

<style scoped>
.dimension-switch {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}
</style>
