import axios from 'axios'

function getBackendBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').trim()
  const trimmed = raw.replace(/\/+$/, '')

  // Historically this repo used NEXT_PUBLIC_API_URL=http://host:port/api
  // but many backend routes are mounted at the root (e.g. /blocks, /accounts).
  // If the env var ends with /api, strip it to get the backend root.
  return trimmed.replace(/\/api$/, '')
}

export const api = axios.create({
  baseURL: getBackendBaseUrl(),
})

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config

  const token = window.localStorage.getItem('token')
  if (!token) return config

  const headers = config.headers as any
  if (!headers?.Authorization && !headers?.authorization) {
    config.headers = {
      ...(headers ?? {}),
      Authorization: `Bearer ${token}`,
    } as any
  }

  return config
})
