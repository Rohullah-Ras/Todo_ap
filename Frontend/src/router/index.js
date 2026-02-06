import {createRouter, createWebHistory} from 'vue-router'
import LoginView from '../pages/auth/LoginView.vue'
import RegisterView from '../pages/auth/RegisterView.vue'
import DashBoard from '../pages/DashBoard.vue'
import BoardView from '../pages/BoardView.vue'
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
    component: () => import('@/pages/settings/SettingsView.vue'),
    meta: {requiresAuth: true}
  }


  // {
  //   path: '/settings',
  //   component: SettingsView,
  //   meta: {requiresAuth: true},
  //   redirect: '/settings/general',
  //   children: [
  //     {path: 'general', name: 'SettingsGeneral', component: SettingsGeneral},
  //     {path: 'user', name: 'SettingsUser', component: SettingsUser},
  //     {path: 'items', name: 'SettingsItems', component: SettingsItems},     // “Items and Lists”
  //     {path: 'workspace', name: 'SettingsWorkspace', component: SettingsWorkspace} // “Work Space”
  //   ],
  // },
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
