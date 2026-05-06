// src/api/patient.js
// Centralized patient portal API service

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

// ── Dashboard ─────────────────────────────────────────────────────────────────

// GET /patient/dashboard/
export const getPatientDashboard = () =>
  api('/patient/dashboard/').then(r => r.json())

// ── Profile ───────────────────────────────────────────────────────────────────

// GET /patient/profile/
export const getPatientProfile = () =>
  api('/patient/profile/').then(r => r.json())

// PATCH /patient/profile/ — update personal info
export const updatePatientProfile = (body) =>
  api('/patient/profile/', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

// PATCH /patient/profile/update-password/
export const updatePatientPassword = (body) =>
  api('/patient/profile/update-password/', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

// ── Records ───────────────────────────────────────────────────────────────────

// GET /patient/records/
export const getPatientRecords = () =>
  api('/patient/records/').then(r => r.json())

// GET /patient/records/<id>/
export const getPatientRecord = (recordId) =>
  api(`/patient/records/${recordId}/`).then(r => r.json())

// GET /patient/records/<id>/history/
export const getPatientRecordHistory = (recordId) =>
  api(`/patient/records/${recordId}/history/`).then(r => r.json())

// ── Consents ──────────────────────────────────────────────────────────────────

// GET /patient/consents/ — all consent requests for this patient
export const getPatientConsents = () =>
  api('/patient/consents/').then(r => r.json())

// PATCH /consent/<id>/patient-decision/ — patient approves or rejects
export const submitPatientDecision = (consentId, patient_choice) =>
  api(`/consent/${consentId}/patient-decision/`, {
    method: 'PATCH',
    body: JSON.stringify({ patient_choice }),
  })
