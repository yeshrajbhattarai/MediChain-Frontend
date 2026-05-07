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

// ── Dashboard ─────────────────────────────

export const getTechnicianDashboard = () =>
  api('/staff/technician/dashboard/').then(r => r.json())

// ── Lab Queue ─────────────────────────────

export const getTechnicianLabQueue = () =>
  api('/staff/technician/lab-queue/').then(r => r.json())

// ── Lab Request Detail ────────────────────

export const getLabRequestDetail = (requestId) =>
  api(`/staff/technician/lab-requests/${requestId}/`).then(r => r.json())

// ── Create Record ─────────────────────────

export const createTechnicianRecord = (body) =>
  api('/staff/technician/records/create/', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(r => r.json())

// ── Records ───────────────────────────────

export const getTechnicianRecords = () =>
  api('/staff/technician/records/').then(r => r.json())

// ── Edit Record ───────────────────────────

export const editTechnicianRecord = (recordId, body) =>
  api(`/staff/technician/records/${recordId}/edit/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }).then(r => r.json())