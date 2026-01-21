import {api} from './http'

export async function register(email: string, password: string, fullName?: string) {
  const res = await api.post('/auth/register', {email, password, fullName})
  localStorage.setItem('access_token', res.data.access_token)
  return res.data
}

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', {email, password})
  localStorage.setItem('access_token', res.data.access_token)
  return res.data
}

export function logout() {
  localStorage.removeItem('access_token')
}

export function isLoggedIn() {
  return !!localStorage.getItem('access_token')
}
