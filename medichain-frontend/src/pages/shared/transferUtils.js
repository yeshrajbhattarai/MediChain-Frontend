// src/pages/shared/transferUtils.js
// Shared constants, helpers, and mini-components for the transfer record system.
// Keep all transfer-related shared logic here so the three pages stay thin.

// ─── sessionStorage keys ──────────────────────────────────────────────────────
// Centralised so a typo in one file doesn't silently lose data.

export const transferKey = (consentId) => `mc_transfer_${consentId}`
export const recordKey   = (recordId)  => `mc_record_${recordId}`

// ─── Write / read helpers (with try-catch so SSR/private-mode never crashes) ──

export function writeTransfer(consentId, data) {
  try {
    sessionStorage.setItem(transferKey(consentId), JSON.stringify(data))
  } catch { /* quota exceeded – silent */ }
}

export function readTransfer(consentId) {
  try {
    const raw = sessionStorage.getItem(transferKey(consentId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function writeRecord(recordId, data) {
  try {
    sessionStorage.setItem(recordKey(recordId), JSON.stringify(data))
  } catch { /* quota exceeded – silent */ }
}

export function readRecord(recordId) {
  try {
    const raw = sessionStorage.getItem(recordKey(recordId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// ─── Role resolution (unchanged from existing pattern) ───────────────────────

import { getUserType, getStaffRole } from '../../auth_store/authStore'

export function resolveRole() {
  const userType  = getUserType()
  const staffRole = getStaffRole()
  return userType === 'hospital_admin' ? 'admin' : staffRole
}

// ─── Label formatter ──────────────────────────────────────────────────────────
// Converts snake_case keys → Title Case display labels.

export function formatLabel(key = '') {
  return key.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// ─── Date formatter ───────────────────────────────────────────────────────────

export function fmtDate(iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-IN', opts) } catch { return '—' }
}

export function fmtDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '—' }
}

// ─── Record type meta ─────────────────────────────────────────────────────────

export const RECORD_TYPE_META = {
  medical: { label: 'Medical Record', color: 'blue'  },
  lab:     { label: 'Lab Report',     color: 'teal'  },
}

export function getRecordMeta(record) {
  const base = RECORD_TYPE_META[record?.record_type] || { label: 'Record', color: 'gray' }
  const title = record?.record_type === 'lab'
    ? (record.lab?.lab_name || 'Lab Report')
    : base.label
  return { ...base, title }
}

// ─── Attachment URL safety ────────────────────────────────────────────────────
// Only allow relative paths or same-origin URLs.
// This prevents open-redirect XSS via crafted attachment URLs.

export function safeAttachmentHref(raw = '') {
  if (!raw) return '#'
  try {
    // Relative path — safe
    if (raw.startsWith('/')) return raw
    // Same origin — safe
    const url = new URL(raw, window.location.origin)
    if (url.origin === window.location.origin) return url.pathname + url.search
    // External — block
    return '#'
  } catch { return '#' }
}

// ─── Diagnosis extraction ─────────────────────────────────────────────────────
// Records do not have a consistent diagnosis field; check multiple sources.

export function extractDiagnosis(record) {
  return (
    record?.diagnosis ||
    record?.custom_field_values?.primary_diagnosis ||
    record?.custom_field_values?.diagnosis ||
    null
  )
}