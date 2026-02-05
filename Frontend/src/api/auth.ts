// src/api/auth.ts
import {defineStore} from 'pinia'
import {api} from '@/api/http'

type SignInPayload = { email: string; password: string }
type SignUpPayload = {
  fullName?: string
  username?: string
  email: string
  password: string
}

function parseJwt(token: string) {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,

    userEmail: (state) => {
      if (!state.token) return null
      return parseJwt(state.token)?.email ?? null
    },

    userId: (state) => {
      if (!state.token) return null
      return parseJwt(state.token)?.sub ?? null
    },

    userInitials(): string {
      const email = this.userEmail
      if (!email) return '?'
      return email.slice(0, 2).toUpperCase()
    },
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
      const res = await api.post('/auth/register', {
        email: payload.email,
        password: payload.password,
        fullName: payload.fullName,
        username: payload.username,
      })

      // als jouw backend token teruggeeft bij register:
      const token =
        res.data?.access_token ||
        res.data?.accessToken ||
        res.data?.token

      if (token) {
        this.token = token
        localStorage.setItem('access_token', token)
      }
    },

    logout() {
      this.token = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('token')
    },
  },
})
