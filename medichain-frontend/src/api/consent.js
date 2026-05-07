// src/api/consent.js
// Centralized consent management API service

import { getAccessToken } from '../auth_store/authStore'

const BASE = 'http://localhost:8000/api'

const api = (url, opts = {}) =>
  fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken() || ''}`,
      ...opts.headers,
    },
  })

// ── Hospital consent endpoints ────────────────────────────────────────────────

// GET /consent/sent/ — requests sent by my hospital
export const getSentConsents = () =>
  api('/consent/sent/').then(r => r.json())

// GET /consent/received/ — requests received by my hospital
export const getReceivedConsents = () =>
  api('/consent/received/').then(r => r.json())

// GET /consent/<id>/ — single consent detail
export const getConsentDetail = (consentId) =>
  api(`/consent/${consentId}/`).then(r => r.json())

// POST /consent/request/ — create a new consent request
export const createConsentRequest = (body) =>
  api('/consent/request/', { method: 'POST', body: JSON.stringify(body) })

// DELETE /consent/<id>/ — withdraw a consent request
export const withdrawConsent = (consentId) =>
  api(`/consent/${consentId}/`, { method: 'DELETE' })

// PATCH /consent/<id>/hospital-decision/ — approve or reject as owning hospital
export const submitHospitalDecision = (consentId, hospital_choice) =>
  api(`/consent/${consentId}/hospital-decision/`, {
    method: 'PATCH',
    body: JSON.stringify({ hospital_choice }),
  })

// PATCH /consent/<id>/patient-decision/ — approve or reject as patient
export const submitPatientDecision = (consentId, patient_choice) =>
  api(`/consent/${consentId}/patient-decision/`, {
    method: 'PATCH',
    body: JSON.stringify({ patient_choice }),
  })

// GET /consent/<id>/fetch-record/ — fetch approved record data
export const fetchApprovedRecord = (consentId) =>
  api(`/consent/${consentId}/fetch-record/`).then(r => {
    if (!r.ok) return r.json().then(d => Promise.reject(d))
    return r.json()
  })

// ── Discovery endpoints ───────────────────────────────────────────────────────

// GET /consent/hospitals/ — list other active hospitals
export const listHospitals = () =>
  api('/consent/hospitals/').then(r => r.json())

// GET /consent/patients/search/?phone=<phone> — search patient by phone
export const searchPatientByPhone = (phone) =>
  api(`/consent/patients/search/?phone=${phone}`).then(r => {
    if (!r.ok) return r.json().then(d => Promise.reject(d))
    return r.json()
  })


// GET /api/consent/patient/consents/
export const getPatientConsents = () =>
  api('/consent/patient/consents/').then(r => r.json())