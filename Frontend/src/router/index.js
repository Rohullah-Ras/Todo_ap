import {createRouter, createWebHistory} from 'vue-router'
import LoginView from '../pages/LoginView.vue'
import RegisterView from '../pages/RegisterView.vue'
import DashBoard from '../pages/DashBoard.vue'
import BoardView from '../pages/BoardView.vue'
import Setting from '../pages/Setting.vue'
import {useAuthStore} from "@/api/auth";

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

  {
    path: '/settings',
    name: 'Setting',
    component: Setting,
    meta: {requiresAuth: true},
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})


router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  const hasToken =
    auth.token || localStorage.getItem('access_token')

  if ((to.path === '/login' || to.path === '/register') && hasToken) {
    return next('/dashboard')
  }

  if (to.meta.requiresAuth && !hasToken) {
    return next('/login')
  }

  next()
})


export default router
