import {createRouter, createWebHistory} from 'vue-router'

import LoginView from '../pages/LoginView.vue'
import RegisterView from '../pages/RegisterView.vue'
import DashBoard from '../pages/DashBoard.vue'
import BoardView from '../pages/BoardView.vue'

const routes = [
  {path: '/', redirect: '/login'},

  {path: '/login', name: 'Login', component: LoginView},
  {path: '/register', name: 'Register', component: RegisterView},

  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashBoard,
    meta: {requiresAuth: true},
  },

  {
    path: '/board/:spaceId',
    name: 'Board',
    component: BoardView,
    meta: {requiresAuth: true},
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')

  if (to.meta.requiresAuth && !token) return next('/login')

  if ((to.path === '/login' || to.path === '/register') && token) {
    return next('/dashboard')
  }

  next()
})

export default router
