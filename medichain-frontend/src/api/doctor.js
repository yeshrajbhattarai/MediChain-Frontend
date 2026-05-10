import { get, post } from './client'

export const getDoctorDashboard = () =>
  get('/api/v1/staff/doctor/dashboard/')

export const getDoctorPatients = () =>
  get('/api/v1/staff/doctor/patients/')

export const getDoctorPatientDetail = (patientId) =>
  get(`/api/v1/staff/doctor/patients/${patientId}/`)

export const assignNurse = (patientId, nurse_id) =>
  post(`/api/v1/staff/doctor/patients/${patientId}/assign-nurse/`, { nurse_id })

export const assignTechnician = (patientId, tech_id) =>
  post(`/api/v1/staff/doctor/patients/${patientId}/assign-technician/`, { tech_id })

export const sendPatientToLab = (patientId, body) =>
  post(`/api/v1/staff/doctor/patients/${patientId}/send-to-lab/`, body)

export const createDoctorMedicalRecord = (patientId, body) =>
  post(`/api/v1/staff/doctor/patients/${patientId}/create-medical-record/`, body)

export const getDoctorRecords = () =>
  get('/api/v1/staff/doctor/records/')

export const getDoctorRecordDetail = (recordId) =>
  get(`/api/v1/staff/records/${recordId}/`)

export const getDoctorMedicalRecords = () =>
  get('/api/v1/staff/doctor/medical-records/')

export const getMedicalRecordIntegrity = (recordId, version = null) => {
  const query = version ? `?v=${encodeURIComponent(version)}` : ''
  return get(`/api/v1/staff/doctor/medical-records/${recordId}/integrity/${query}`)
}

export const getDoctorApprovalQueue = () =>
  get('/api/v1/staff/doctor/approval-queue/')

export const getDoctorApprovalQueueItem = (itemId) =>
  get(`/api/v1/staff/doctor/approval-queue/${itemId}/`)

export const finalizeApprovalQueueItem = (itemId, body) =>
  post(`/api/v1/staff/doctor/approval-queue/${itemId}/`, body)

export const approveApprovalQueueItem = (itemId, body) =>
  post(`/api/v1/staff/doctor/approval-queue/${itemId}/approve/`, body)

export const rejectApprovalQueueItem = (itemId, reason) =>
  post(`/api/v1/staff/doctor/approval-queue/${itemId}/reject/`, { reason })

export const requestCkdPrediction = (patient_id, record_id) =>
  post('/api/ml/predict/ckd/', { patient_id, record_id })

