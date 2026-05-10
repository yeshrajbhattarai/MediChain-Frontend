import { del, get, patch, post } from './client'

const normalizeDecision = (value) => {
  if (!value) return value
  const upper = String(value).toUpperCase()
  if (upper === 'APPROVED') return 'APPROVED'
  if (upper === 'REJECTED') return 'REJECTED'
  return value
}

export const getSentConsents = () =>
  get('/api/consent/sent/')

export const getReceivedConsents = () =>
  get('/api/consent/received/')

export const getConsentDetail = (consentId) =>
  get(`/api/consent/${consentId}/`)

export const createConsentRequest = (body) =>
  post('/api/consent/request/', body)

export const withdrawConsent = (consentId) =>
  del(`/api/consent/${consentId}/`)

export const submitHospitalDecision = (consentId, hospital_choice) =>
  patch(`/api/consent/${consentId}/hospital-decision/`, {
    hospital_choice: normalizeDecision(hospital_choice),
  })

export const submitPatientDecision = (consentId, patient_choice) =>
  patch(`/api/consent/${consentId}/patient-decision/`, {
    patient_choice: normalizeDecision(patient_choice),
  })

export const fetchApprovedRecord = (consentId) =>
  get(`/api/consent/${consentId}/fetch-record/`)

export const verifyFetchedRecordHash = (consentId, body) =>
  post(`/api/consent/${consentId}/verify-hash/`, body)

export const listHospitals = () =>
  get('/api/consent/hospitals/')

export const searchPatientByPhone = (phone) =>
  get(`/api/consent/patients/search/?phone=${encodeURIComponent(phone)}`)

export const getPatientConsents = () =>
  get('/api/consent/patient/consents/')

