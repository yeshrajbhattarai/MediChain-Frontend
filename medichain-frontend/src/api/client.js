import { clearTokens } from '../auth_store/authStore'
import { clearProfile } from '../auth_store/profileStore'

const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000').replace(/\/$/, '')

const JSON_HEADERS = {
  'Content-Type': 'application/json',
}

const toUrl = (path) => {
  if (/^https?:\/\//i.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

const hasJsonContentType = (response) =>
  response.headers.get('content-type')?.toLowerCase().includes('application/json')

const parseResponseBody = async (response) => {
  if (hasJsonContentType(response)) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  try {
    const text = await response.text()
    return text || null
  } catch {
    return null
  }
}

let refreshPromise = null

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise

  const refresh = localStorage.getItem('refresh')
  if (!refresh) return null

  refreshPromise = (async () => {
    try {
      const response = await fetch(toUrl('/api/token/refresh/'), {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ refresh }),
      })

      const payload = await parseResponseBody(response)
      if (!response.ok || !payload?.access) return null

      localStorage.setItem('access', payload.access)
      if (payload.refresh) localStorage.setItem('refresh', payload.refresh)
      return payload.access
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

const forceLogout = () => {
  clearTokens()
  clearProfile()
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

const makeError = (response, payload, fallbackMessage) => {
  const error = new Error(
    payload?.error ||
      payload?.detail ||
      payload?.message ||
      fallbackMessage ||
      'Request failed'
  )

  error.status = response.status
  error.data = payload
  return error
}

export const request = async (
  path,
  {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    retryOn401 = true,
    signal,
    rawBody = false,
  } = {}
) => {
  const finalHeaders = { ...headers }
  if (!rawBody && body !== undefined && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json'
  }

  if (auth) {
    const access = localStorage.getItem('access')
    if (access) finalHeaders.Authorization = `Bearer ${access}`
  }

  const response = await fetch(toUrl(path), {
    method,
    headers: finalHeaders,
    body: rawBody ? body : body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  const payload = await parseResponseBody(response)

  if (response.status === 401 && auth && retryOn401) {
    const refreshedAccess = await refreshAccessToken()
    if (!refreshedAccess) {
      forceLogout()
      throw makeError(response, payload, 'Session expired')
    }

    return request(path, { method, body, headers, auth, retryOn401: false, signal, rawBody })
  }

  if (!response.ok) {
    throw makeError(response, payload, `Request failed with status ${response.status}`)
  }

  return payload
}

export const fetchWithAuth = async (
  path,
  {
    method = 'GET',
    headers = {},
    body,
    auth = true,
    retryOn401 = true,
    signal,
  } = {}
) => {
  const finalHeaders = { ...headers }

  if (auth) {
    const access = localStorage.getItem('access')
    if (access) finalHeaders.Authorization = `Bearer ${access}`
  }

  const response = await fetch(toUrl(path), {
    method,
    headers: finalHeaders,
    body,
    signal,
  })

  if (response.status === 401 && auth && retryOn401) {
    const refreshedAccess = await refreshAccessToken()
    if (!refreshedAccess) {
      forceLogout()
      return response
    }

    return fetchWithAuth(path, { method, headers, body, auth, retryOn401: false, signal })
  }

  return response
}

export const get = (path, options) => request(path, { ...options, method: 'GET' })
export const post = (path, body, options) => request(path, { ...options, method: 'POST', body })
export const patch = (path, body, options) => request(path, { ...options, method: 'PATCH', body })
export const del = (path, options) => request(path, { ...options, method: 'DELETE' })

export const postForm = (path, formData, options = {}) =>
  request(path, {
    ...options,
    method: 'POST',
    body: formData,
    rawBody: true,
  })
