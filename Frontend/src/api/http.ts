import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3005/api',
})

api.interceptors.request.use((config) => {
  const isAuthRoute =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/register')

  if (isAuthRoute) {
    // 🚫 NO Authorization header on login/register
    return config
  }

  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
