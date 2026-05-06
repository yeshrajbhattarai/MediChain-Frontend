// src/api/doctor.js
// Centralized doctor API service

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

export const getDoctorDashboard = () =>
  api('/staff/doctor/dashboard/').then(r => r.json())

// ── Patient Management ────────────────────────────────────────────────────────

export const getDoctorPatients = () =>
  api('/staff/doctor/patients/').then(r => r.json())

export const addDoctorPatient = (body) =>
  api('/staff/doctor/patients/add/', { method: 'POST', body: JSON.stringify(body) })

export const getDoctorPatient = (patientId) =>
  api(`/staff/doctor/patients/${patientId}/`).then(r => r.json())

export const assignNurse = (patientId, nurseId) =>
  api(`/staff/doctor/patients/${patientId}/assign-nurse/`, {
    method: 'POST',
    body: JSON.stringify({ nurse_id: nurseId }),
  })

export const removeAssignment = (patientId, staffId) =>
  api(`/staff/doctor/patients/${patientId}/remove-assignment/${staffId}/`, {
    method: 'DELETE',
  })

export const sendToLab = (patientId, body) =>
  api(`/staff/doctor/patients/${patientId}/send-to-lab/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

// ── Labs ──────────────────────────────────────────────────────────────────────

export const getDoctorLabs = () =>
  api('/staff/doctor/labs/').then(r => r.json())

export const getDoctorLabDetail = (labId) =>
  api(`/staff/doctor/labs/${labId}/`).then(r => r.json())

// ── Lab Queue ─────────────────────────────────────────────────────────────────

export const getDoctorLabQueue = () =>
  api('/staff/doctor/lab-queue/').then(r => r.json())

export const getDoctorLabRequest = (requestId) =>
  api(`/staff/doctor/lab-requests/${requestId}/`).then(r => r.json())

// ── Medical Records ───────────────────────────────────────────────────────────

export const getDoctorRecords = () =>
  api('/staff/doctor/records/').then(r => r.json())

export const getRecord = (recordId) =>
  api(`/staff/records/${recordId}/`).then(r => r.json())

export const getRecordHistory = (recordId) =>
  api(`/staff/records/${recordId}/history/`).then(r => r.json())

export const reassessRecord = (recordId, body) =>
  api(`/staff/doctor/records/${recordId}/reassess/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

// ── Approval Queue ────────────────────────────────────────────────────────────

export const getApprovalQueue = () =>
  api('/staff/doctor/approval-queue/').then(r => r.json())

export const getApprovalDetail = (approvalId) =>
  api(`/staff/doctor/approval/${approvalId}/`).then(r => r.json())

export const submitApproval = (approvalId, body) =>
  api(`/staff/doctor/approval/${approvalId}/submit/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

// ── Nurses (for assignment) ───────────────────────────────────────────────────

export const getNurses = () =>
  api('/staff/nurses/').then(r => r.json())
