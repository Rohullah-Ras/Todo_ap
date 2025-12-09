// src/router/index.js
import {createRouter, createWebHistory} from 'vue-router'

import LoginView from '../pages/LoginView.vue'
import RegisterView from '../pages/RegisterView.vue'
import BoardView from '../pages/BoardView.vue'
import ValidationPlayground from '../pages/ValidationPlayground.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },
  {
    path: '/board',
    name: 'Board',
    component: BoardView,
    meta: {requiresAuth: true},
  },
  {
    path: '/validation',
    name: 'Validation',
    component: ValidationPlayground,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Simple auth guard using fakeToken
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('fakeToken')
    if (!token) return next('/login')
  }
  next()
})

// Optional: Vuetify dynamic import workaround
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
