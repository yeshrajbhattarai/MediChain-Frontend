// src/api/nurse.js
// Nurse portal API endpoints
// All endpoints require JWT authentication

import { getAccessToken, clearTokens } from '../auth_store/authStore'

const BASE = 'http://localhost:8000/api/v1'

const api = (url, opts = {}) =>
  fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
      ...opts.headers,
    },
  }).then(async (r) => {
    // Handle 401 (token expired)
    if (r.status === 401) {
      clearTokens()
      window.location.href = '/login'
    }
    return r
  })

// ─── Dashboard ────────────────────────────────────────────────────────────────
// Get nurse dashboard stats (aggregated from queue items)
export const getNurseDashboard = async () => {
  // Since there's no dedicated dashboard API, we'll aggregate from queue items
  const queue = await getNurseQueue()
  
  const assigned_tasks = queue.length
  const pending_tasks = queue.filter(
    (item) => item.status === 'pending'
  ).length
  const completed_today = queue.filter(
    (item) => item.status === 'completed'
  ).length
  
  // Extract unique patients
  const patientIds = new Set()
  queue.forEach((item) => {
    if (item.patient?.id) patientIds.add(item.patient.id)
  })
  const total_patients = patientIds.size

  return {
    assigned_tasks,
    pending_tasks,
    completed_today,
    total_patients,
    recent_tasks: queue.slice(0, 5),
  }
}

// ─── Queue Management ─────────────────────────────────────────────────────────

// Get all nurse queue items (with optional status filter)
export const getNurseQueue = async (status = null) => {
  let url = '/staff/nurse/queue/'
  
  if (status) {
    const statusParam = Array.isArray(status)
      ? status.join(',')
      : status
    url += `?status=${statusParam}`
  }

  const r = await api(url)
  
  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.error || 'Failed to load queue')
  }

  return await r.json()
}

// Get single queue item detail
export const getNurseQueueItem = async (itemId) => {
  const r = await api(`/staff/nurse/queue/${itemId}/`)
  
  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.error || 'Failed to load queue item')
  }

  return await r.json()
}

// Complete a nurse queue item (record vitals and observations)
export const completeNurseQueueItem = async (itemId, data) => {
  const r = await api(`/staff/nurse/queue/${itemId}/`, {
    method: 'POST',
    body: JSON.stringify({
      blood_pressure: data.blood_pressure,
      pulse_rate: parseInt(data.pulse_rate),
      temperature_c: parseFloat(data.temperature_c),
      spo2_percent: parseInt(data.spo2_percent),
      random_blood_sugar: data.random_blood_sugar || '',
      nurse_tests_performed: data.nurse_tests_performed,
      nurse_observation: data.nurse_observation,
      treatment_given: data.treatment_given,
      medications_administered: data.medications_administered,
      follow_up_notes: data.follow_up_notes || '',
    }),
  })

  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.error || 'Failed to complete queue item')
  }

  return await r.json()
}

// ─── Profile Management ───────────────────────────────────────────────────────

// Get nurse's own profile
export const getNurseProfile = async () => {
  const r = await api('/staff/nurse/profile/')
  
  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.error || 'Failed to load profile')
  }

  return await r.json()
}

// Update nurse personal details
export const updateNurseProfile = async (data) => {
  const r = await api('/staff/nurse/profile/update-personal/', {
    method: 'PATCH',
    body: JSON.stringify({
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || '',
      years_experience: data.years_experience || null,
      license_number: data.license_number || '',
      home_address: data.home_address || '',
      bio: data.bio || '',
    }),
  })

  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.error || 'Failed to update profile')
  }

  return await r.json()
}

// Change nurse password
export const updateNursePassword = async (data) => {
  const r = await api('/staff/nurse/profile/update-password/', {
    method: 'PATCH',
    body: JSON.stringify({
      current_password: data.old_password || data.current_password,
      new_password: data.new_password,
      confirm_new_password: data.new_password,
    }),
  })

  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.error || 'Failed to update password')
  }

  return await r.json()
}

// ─── Medical Records ──────────────────────────────────────────────────────────

// Get all finalized medical records for the nurse
export const getNurseMedicalRecords = async (filters = {}) => {
  let url = '/staff/nurse/records/'
  
  const params = new URLSearchParams()
  if (filters.gov_id_type) params.append('gov_id_type', filters.gov_id_type)
  if (filters.gov_id_number) params.append('gov_id_number', filters.gov_id_number)
  
  if (params.toString()) {
    url += `?${params.toString()}`
  }

  const r = await api(url)
  
  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.error || 'Failed to load records')
  }

  return await r.json()
}

// Get detailed medical record with version history
export const getNurseMedicalRecordDetail = async (recordId, versionNumber = null) => {
  let url = `/staff/nurse/records/${recordId}/`
  
  if (versionNumber) {
    url += `?v=${versionNumber}`
  }

  const r = await api(url)
  
  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.error || 'Failed to load record detail')
  }

  return await r.json()
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logoutNurse = async (refreshToken) => {
  const r = await api('/logout/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  })

  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.error || 'Logout failed')
  }

  return await r.json()
}