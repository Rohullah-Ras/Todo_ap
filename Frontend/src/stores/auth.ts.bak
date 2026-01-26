import {defineStore} from 'pinia';
import {http} from '@/api/http';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') as string | null,
    user: null as any,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async register(payload: {
      email: string;
      password: string;
      fullName?: string;
    }) {
      const res = await http.post('/auth/register', payload);
      this.token = res.data.access_token;
      localStorage.setItem('access_token', this.token);
    },

    async login(payload: { email: string; password: string }) {
      const res = await http.post('/auth/login', payload);
      this.token = res.data.access_token;
      localStorage.setItem('access_token', this.token);
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('access_token');
    },
  },
});
