// src/api/doctor.js

import { getAccessToken } from '../auth_store/authStore'

const BASE = 'http://localhost:8000/api/v1'

const api = (url, opts = {}) =>
  fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken() || ''}`,
      ...opts.headers,
    },
  })

// ── Doctor Dashboard ─────────────────────────────────────────────────────────

export const getDoctorDashboard = () =>
  api('/staff/doctor/dashboard/').then(r => r.json())

// ── Patients ────────────────────────────────────────────────────────────────

export const getDoctorPatients = () =>
  api('/staff/doctor/patients/').then(r => r.json())

export const getDoctorPatientDetail = (patientId) =>
  api(`/staff/doctor/patients/${patientId}/`).then(r => r.json())

// ── Records ─────────────────────────────────────────────────────────────────

export const getDoctorRecords = () =>
  api('/staff/records/').then(r => r.json())

export const getDoctorRecordDetail = (recordId) =>
  api(`/staff/records/${recordId}/`).then(r => r.json())

// ── Nurse Assignment ────────────────────────────────────────────────────────

export const assignNurse = (patientId, nurse_id) =>
  api(`/staff/doctor/patients/${patientId}/assign-nurse/`, {
    method: 'POST',
    body: JSON.stringify({ nurse_id }),
  }).then(r => r.json())

// ── Send To Lab ─────────────────────────────────────────────────────────────

export const sendPatientToLab = (body) =>
  api('/staff/lab-requests/create/', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(r => r.json())