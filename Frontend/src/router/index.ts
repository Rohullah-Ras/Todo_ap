import {createRouter, createWebHistory} from 'vue-router';
import {useAuthStore} from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/pages/LoginView.vue'),
      meta: {guest: true},
    },
    {
      path: '/register',
      component: () => import('@/pages/RegisterView.vue'),
      meta: {guest: true},
    },
    {
      path: '/dashboard',
      component: () => import('@/pages/DashBoard.vue'),
      meta: {requiresAuth: true},
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login';
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return '/dashboard';
  }
});

export default router;
