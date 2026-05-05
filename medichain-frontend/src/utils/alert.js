// src/utils/alert.js
// Centralized SweetAlert2 helpers — use these everywhere instead of raw Swal calls

import Swal from 'sweetalert2'

// ── Toast (top-right, auto-dismisses) ────────────────────────────────────────
export const toast = (icon, title) =>
  Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon,
    title,
  })

export const successToast = (title) => toast('success', title)
export const errorToast   = (title) => toast('error',   title)
export const infoToast    = (title) => toast('info',    title)
export const warnToast    = (title) => toast('warning', title)

// ── Confirm dialog (returns true if user clicks confirm) ─────────────────────
export const confirmDialog = async (title, text, confirmText = 'Yes, proceed', danger = true) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: danger ? '#dc2626' : '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
  })
  return result.isConfirmed
}

// ── Success alert (full modal, not toast) ─────────────────────────────────────
export const successAlert = (title, text) =>
  Swal.fire({ title, text, icon: 'success', confirmButtonColor: '#2563eb' })

// ── Error alert ───────────────────────────────────────────────────────────────
export const errorAlert = (title, text) =>
  Swal.fire({ title, text, icon: 'error', confirmButtonColor: '#dc2626' })