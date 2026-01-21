import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import AuthLayout from '@/layouts/AuthLayout.vue';
import AppLayout from '@/layouts/AppLayout.vue';

import SignIn from '@/pages/auth/SignIn.vue';
import SignUp from '@/pages/auth/SignUp.vue';
import Board from '@/pages/Board.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        { path: 'sign-in', component: SignIn },
        { path: 'sign-up', component: SignUp },
      ],
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/board' },
        { path: 'board', component: Board },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/board' },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // Zorg dat we user status kennen voordat we beschermen
  if (auth.user === null && to.meta.requiresAuth) {
    await auth.me();
  }

  if (to.meta.requiresAuth && !auth.isAuthed) {
    return '/auth/sign-in';
  }

  if (to.path.startsWith('/auth') && auth.isAuthed) {
    return '/board';
  }
});

export default router;