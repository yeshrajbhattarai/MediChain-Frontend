const BASE = 'http://localhost:8000/api/v1'

// ── helpers ──────────────────────────────────────────────────────────────────
const post = async (url, body) => {
  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw data   // caller catches { errors: {...} }
  return data
}

// ── auth calls ───────────────────────────────────────────────────────────────

// POST /register/ = { success, hospital_id }
export const registerHospital = (form) =>
  post('/register/', {
    hospital_name:    form.hospital_name,
    email:            form.email,
    contact_number:   form.contact_number,
    password:         form.password,
    confirm_password: form.confirm_password,
  })

// POST /verify-otp/ ={ success, message }
export const verifyOTP = (hospital_id, otp) =>
  post('/verify-otp/', { hospital_id, otp })

// POST /resend-otp/ = { success, message }
export const resendOTP = (hospital_id) =>
  post('/resend-otp/', { hospital_id })

// POST /login/ = { success, role, tokens, hospital | staff }
export const login = (email, password) =>
  post('/login/', { email, password })

// POST /logout/ = blacklists refresh token
export const logout = () => {
  const refresh = localStorage.getItem('refresh')
  return post('/logout/', { refresh })
}