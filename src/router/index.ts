import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'autoweKPI - 经营分析周报'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫：设置页面标题
router.beforeEach((to, _from, next) => {
  const title = (to.meta.title as string) || 'autoweKPI'
  document.title = title
  next()
})

export default router
