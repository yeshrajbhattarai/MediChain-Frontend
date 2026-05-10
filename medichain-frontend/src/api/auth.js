import { post } from './client'

// POST /api/v1/register/
export const registerHospital = (form) =>
  post(
    '/api/v1/register/',
    {
      hospital_name: form.hospital_name,
      email: form.email,
      contact_number: form.contact_number,
      password: form.password,
      confirm_password: form.confirm_password,
    },
    { auth: false }
  )

// POST /api/v1/verify-otp/
export const verifyOTP = (hospital_id, otp) =>
  post('/api/v1/verify-otp/', { hospital_id, otp }, { auth: false })

// POST /api/v1/resend-otp/
export const resendOTP = (hospital_id) =>
  post('/api/v1/resend-otp/', { hospital_id }, { auth: false })

// POST /api/v1/login/
export const login = (email, password) =>
  post('/api/v1/login/', { email, password }, { auth: false })

// POST /api/v1/patient/login/
export const patientLogin = (email, password) =>
  post('/api/v1/patient/login/', { email, password }, { auth: false })

// POST /api/v1/logout/
export const logout = () => {
  const refresh = localStorage.getItem('refresh')
  return post('/api/v1/logout/', { refresh })
}
