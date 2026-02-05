// src/api/auth.ts
import {defineStore} from 'pinia'
import {api} from '@/api/http'

type SignInPayload = { email: string; password: string }
type SignUpPayload = { fullName: string; username: string; email: string; password: string }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async signIn(payload: SignInPayload) {
      const res = await api.post('/auth/login', payload)

      const token =
        res.data?.access_token ||
        res.data?.accessToken ||
        res.data?.token

      if (!token) throw new Error('No access token returned from backend')

      this.token = token
      localStorage.setItem('access_token', token)
    },

    async signUp(payload: SignUpPayload) {
      // pas endpoint aan als jouw backend anders heet
      await api.post('/auth/register', payload)
    },

    logout() {
      this.token = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('token')
    },
  },
})
