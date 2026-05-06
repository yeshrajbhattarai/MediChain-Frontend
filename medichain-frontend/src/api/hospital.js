// src/api/hospital.js
// Centralized hospital management API service

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

// GET /dashboard/ — hospital admin dashboard stats
export const getHospitalDashboard = () =>
  api('/dashboard/').then(r => r.json())

// ── Profile ───────────────────────────────────────────────────────────────────

// GET /profile/ — current hospital profile
export const getHospitalProfile = () =>
  api('/profile/').then(r => r.json())

// PUT /profile/update-name/ — update hospital name
export const updateHospitalName = (hospital_name) =>
  api('/profile/update-name/', {
    method: 'PUT',
    body: JSON.stringify({ hospital_name }),
  })

// PUT /profile/update-license/ — update / lock license number
export const updateLicense = (license_number) =>
  api('/profile/update-license/', {
    method: 'PATCH',
    body: JSON.stringify({ license_number }),
  })

// PUT /profile/update-address/ — update address fields
export const updateAddress = (body) =>
  api('/profile/update-address/', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

// PUT /profile/update-password/ — change hospital account password
export const updateHospitalPassword = (body) =>
  api('/profile/update-password/', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

// ── Staff — Patient management ────────────────────────────────────────────────

// GET /staff/patients/ — list all patients registered at this hospital
export const getHospitalPatients = () =>
  api('/staff/patients/').then(r => r.json())

// GET /staff/patients/<id>/ — single patient detail
export const getHospitalPatient = (patientId) =>
  api(`/staff/patients/${patientId}/`).then(r => r.json())
