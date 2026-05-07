// ── Token Storage ─────────────────────────────────────────────────────────────

export const saveTokens = (access, refresh) => {
  localStorage.setItem('access', access)
  localStorage.setItem('refresh', refresh)
}

export const clearTokens = () => {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user')
}

export const getAccessToken = () => localStorage.getItem('access')

// ── JWT Payload ───────────────────────────────────────────────────────────────

export const getPayload = () => {
  const token = localStorage.getItem('access')
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

// ── Role Helpers ──────────────────────────────────────────────────────────────
// user_type: 'hospital_admin' | 'staff'
// staff_role: 'doctor' | 'nurse' | 'technician'  (only when user_type === 'staff')

export const getUserType = () => getPayload()?.user_type ?? null

export const getStaffRole = () => getPayload()?.staff_role ?? null

// Returns the dashboard route for the logged-in user
export const getDashboardRoute = () => {
  const type = getUserType()
  if (type === 'hospital_admin') return '/admin/dashboard'
  if (type === 'patient')        return '/patient/dashboard'
  const role = getStaffRole()
  if (role === 'doctor')      return '/doctor/dashboard'
  if (role === 'technician')  return '/technician/dashboard'
  if (role === 'nurse') return '/nurse/dashboard'
  return '/login'
}

export const isLoggedIn = () => {
  const payload = getPayload()
  if (!payload) return false
  // check token not expired
  return payload.exp * 1000 > Date.now()
}