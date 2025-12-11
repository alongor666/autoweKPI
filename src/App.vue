<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('autoweKPI - 经营分析周报自动生成工具')
  console.log('Version: 0.1.0')
})
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
  background-color: var(--el-bg-color);
}
</style>
