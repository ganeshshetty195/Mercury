const API_BASE = '/api'

function getHeaders(extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  }

  const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiZ2FuZXNoQGdtYWlsLmNvbSIsImlhdCI6MTc3Njc1NTM1NiwiZXhwIjozNjE3NzY3NTUzNTZ9.t4mWk_s7hbbjw7zvbVYK-4FwUCK-xulQD2fMll1esaU`
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: getHeaders(options.headers),
    body:
      options.body && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed: ${response.status}`)
  }

  return data
}