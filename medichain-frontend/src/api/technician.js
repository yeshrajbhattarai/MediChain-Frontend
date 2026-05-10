import { get, patch, post } from './client'

export const getTechnicianDashboard = () =>
  get('/api/v1/staff/technician/dashboard/')

export const getTechnicianProfile = () =>
  get('/api/v1/staff/technician/profile/')

export const updateTechnicianProfile = (body) =>
  patch('/api/v1/staff/technician/profile/update-personal/', body)

export const updateTechnicianPassword = (body) =>
  patch('/api/v1/staff/technician/profile/update-password/', body)

export const getTechnicianPatients = () =>
  get('/api/v1/staff/technician/patients/')

export const getTechnicianPatientDetail = (patientId) =>
  get(`/api/v1/staff/technician/patients/${patientId}/`)

export const getTechnicianLabQueue = () =>
  get('/api/v1/staff/technician/lab-queue/')

export const getLabRequestDetail = (requestId) =>
  get(`/api/v1/staff/technician/lab-requests/${requestId}/`)

export const createTechnicianRecord = (body) =>
  post('/api/v1/staff/technician/records/create/', body)

export const getTechnicianRecords = () =>
  get('/api/v1/staff/technician/records/')

export const editTechnicianRecord = (recordId, body) =>
  patch(`/api/v1/staff/technician/records/${recordId}/edit/`, body)

