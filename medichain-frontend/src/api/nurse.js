// src/api/nurse.js

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

// ── DASHBOARD ─────────────────────────────────────────────
// temporary fallback using records endpoint

export const getNurseDashboard = async () => {
  const res = await api('/staff/nurse/records/')

  const data = await res.json()

  return {
    assigned_tasks: Array.isArray(data) ? data.length : 0,
    completed_today: Array.isArray(data) ? data.length : 0,
    pending_tasks: 0,
    total_patients: 0,
  }
}

// ── QUEUE ─────────────────────────────────────────────────

export const getNurseQueue = async () => {
  const res = await api('/staff/nurse/queue/')

  if (!res.ok) {
    return []
  }

  return res.json()
}

export const getNurseQueueItem = async (queueId) => {
  const res = await api(
    `/staff/nurse/queue/${queueId}/`
  )

  if (!res.ok) {
    return null
  }

  return res.json()
}

// TEMPORARY
export const completeNurseQueueItem = async () => {
  return {
    success: true,
  }
}

// ── PATIENTS ──────────────────────────────────────────────
// removed because backend missing

export const getNursePatients = async () => []

export const getNursePatientDetail = async () => null

// ── RECORDS ───────────────────────────────────────────────

export const getNurseRecords = async () => {
  const res = await api('/staff/nurse/records/')

  if (!res.ok) {
    return []
  }

  return res.json()
}

export const getNurseRecordDetail = async (
  recordId
) => {
  const res = await api(
    `/staff/records/${recordId}/`
  )

  if (!res.ok) {
    return null
  }

  return res.json()
}

// ── PROFILE ───────────────────────────────────────────────
// using existing backend routes

export const getNurseProfile = async () => {
  return {
    full_name: 'Nurse',
    email: '',
    phone: '',
  }
}

export const updateNurseProfile = async (
  body
) => {
  const res = await api(
    '/staff/nurse/profile/update-personal/',
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )

  return res.json()
}

export const updateNursePassword = async (
  body
) => {
  const res = await api(
    '/staff/nurse/profile/update-password/',
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )

  return res.json()
}