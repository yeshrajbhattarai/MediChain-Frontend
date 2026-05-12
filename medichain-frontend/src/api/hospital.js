import { get, patch } from './client'

export const getHospitalDashboard = () =>
  get('/api/v1/dashboard/')

export const getHospitalProfile = () =>
  get('/api/v1/profile/')

export const updateHospitalName = (hospital_name) =>
  patch('/api/v1/profile/update-name/', { hospital_name })

export const updateLicense = (license_number) =>
  patch('/api/v1/profile/update-license/', { license_number })

export const updateAddress = (body) =>
  patch('/api/v1/profile/update-address/', body)

export const updateHospitalPassword = (body) =>
  patch('/api/v1/profile/update-password/', body)

export const getHospitalPatients = () =>
  get('/api/v1/staff/patients/')

export const getHospitalPatient = (patientId) =>
  get(`/api/v1/staff/patients/${patientId}/`)

export const getAuditLogs = (params = {}) => {
  if (typeof params === 'string') {
    return get(`/api/logs/${params}`)
  }

  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value)
  ).toString()

  return get(`/api/logs/${query ? `?${query}` : ''}`)
}
