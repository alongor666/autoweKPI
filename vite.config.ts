import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  // GitHub Pages 部署配置
  base: process.env.NODE_ENV === 'production' ? '/autoweKPI/' : '/',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          'charts': ['echarts'],
          'utils': ['lodash-es', 'papaparse', 'dayjs']
        }
      }
    },
    // 性能优化
    chunkSizeWarningLimit: 1000
  },

  server: {
    port: 5173,
    host: true,
    open: true
  },

  preview: {
    port: 4173,
    host: true
  }
})
