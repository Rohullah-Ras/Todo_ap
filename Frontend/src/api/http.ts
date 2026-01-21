import axios from 'axios'

// Backend draait op http://localhost:3005 en heeft globalPrefix = 'api'
export const api = axios.create({
  baseURL: 'http://localhost:3005/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
