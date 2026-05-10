import { get, patch, post } from './client'

export const getPatientDashboard = () =>
  get('/api/v1/patient/dashboard/')

export const getPatientProfile = () =>
  get('/api/v1/patient/profile/')

export const completePatientProfile = (body) =>
  post('/api/v1/patient/complete-profile/', body)

export const updatePatientProfile = (body) =>
  patch('/api/v1/patient/profile/', body)

export const updatePatientPassword = (body) =>
  patch('/api/v1/patient/profile/update-password/', body)

export const getPatientRecords = () =>
  get('/api/v1/patient/records/')

export const getPatientRecord = (recordId, version = null) => {
  const query = version ? `?v=${encodeURIComponent(version)}` : ''
  return get(`/api/v1/patient/records/${recordId}/${query}`)
}

export const getPatientRecordDetail = (recordId, version = null) =>
  getPatientRecord(recordId, version)

export const getPatientRecordHistory = (recordId) =>
  get(`/api/v1/patient/records/${recordId}/history/`)

export const getPatientConsents = () =>
  get('/api/consent/patient/consents/')

export const submitPatientDecision = (consentId, patient_choice) =>
  patch(`/api/consent/${consentId}/patient-decision/`, { patient_choice })
