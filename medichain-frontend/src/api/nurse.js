// src/api/nurse.js
// Centralized nurse API service

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

export const getNurseDashboard = () =>
  api('/staff/nurse/dashboard/').then(r => r.json())

// ── Patient Queue ─────────────────────────────────────────────────────────────

export const getNursePatients = () =>
  api('/staff/nurse/patients/').then(r => r.json())

export const getNursePatient = (patientId) =>
  api(`/staff/nurse/patients/${patientId}/`).then(r => r.json())

// ── Medical Records ───────────────────────────────────────────────────────────

export const getNurseRecords = () =>
  api('/staff/nurse/records/').then(r => r.json())

// ── Profile ───────────────────────────────────────────────────────────────────

export const getNurseProfile = () =>
  api('/staff/profile/').then(r => r.json())

export const updateNurseProfile = (body) =>
  api('/staff/profile/update/', { method: 'PATCH', body: JSON.stringify(body) })

export const updateNursePassword = (body) =>
  api('/staff/profile/update-password/', { method: 'PATCH', body: JSON.stringify(body) })
