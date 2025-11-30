import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/article/:slug',
      name: 'article',
      component: () => import('../views/ArticleView.vue')
    },
    {
      path: '/create-article',
      name: 'create-article',
      component: () => import('../views/CreateArticleView.vue'),
      meta: { requiresAuth: true, requiresEditor: true }
    },
    {
      path: '/edit-article/:slug',
      name: 'edit-article',
      component: () => import('../views/EditArticleView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  if (to.meta.requiresEditor && (authStore.user?.role?.name !== 'Editor' && authStore.user?.role?.name !== 'Authenticated')) {
    next('/')
    return
  }
  
  next()
})
export default router