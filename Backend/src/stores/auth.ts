import { defineStore } from 'pinia';
import { http } from '@/api/http';

type User = {
  id: number;
  username: string;
  email: string;
  fullName?: string;
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
  }),
  getters: {
    isAuthed: (s) => !!s.user,
  },
  actions: {
    async me() {
      this.loading = true;
      try {
        const res = await http.get('/auth/me');
        this.user = res.data;
      } catch {
        this.user = null;
      } finally {
        this.loading = false;
      }
    },

    async signIn(payload: { email: string; password: string }) {
      // Backend zet cookie (access/refresh) httpOnly
      await http.post('/auth/sign-in', payload);
      await this.me();
    },

    async signUp(payload: {
      fullName: string;
      username: string;
      email: string;
      password: string;
    }) {
      await http.post('/auth/sign-up', payload);
      await this.me();
    },

    async logout() {
      try {
        await http.post('/auth/logout');
      } finally {
        this.user = null;
      }
    },
  },
});