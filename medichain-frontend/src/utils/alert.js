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
export const errorToast = (title) => toast('error', title)
export const infoToast = (title) => toast('info', title)
export const warnToast = (title) => toast('warning', title)

// ── Confirm dialog (returns true if user clicks confirm) ─────────────────────
export const confirmDialog = async (
  title,
  text,
  confirmText = 'Yes, proceed',
  danger = true
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: danger ? '#dc2626' : '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Stay',
    focusCancel: true,
    backdrop: 'rgba(15, 23, 42, 0.35)',
    buttonsStyling: true,
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-lg font-semibold text-gray-900',
      htmlContainer: 'text-sm text-gray-600',
      confirmButton: 'px-4 py-2 rounded-lg font-medium transition-all',
      cancelButton: 'px-4 py-2 rounded-lg font-medium transition-all',
      actions: 'gap-3',
    },
    didOpen: (modal) => {
      const confirmBtn = modal.querySelector('.swal2-confirm')
      const cancelBtn = modal.querySelector('.swal2-cancel')
      if (confirmBtn) {
        confirmBtn.classList.add('hover:shadow-md', 'active:scale-95')
      }
      if (cancelBtn) {
        cancelBtn.classList.add('hover:bg-gray-100', 'active:scale-95')
      }
    },
  })
  return result.isConfirmed
}

// ── Success alert (full modal, not toast) ─────────────────────────────────────
export const successAlert = (title, text) =>
  Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#2563eb',
    backdrop: 'rgba(15, 23, 42, 0.35)',
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-lg font-semibold text-gray-900',
      htmlContainer: 'text-sm text-gray-600',
      confirmButton: 'px-4 py-2 rounded-lg font-medium transition-all',
    },
  })

// ── Error alert ───────────────────────────────────────────────────────────────
export const errorAlert = (title, text) =>
  Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#dc2626',
    backdrop: 'rgba(15, 23, 42, 0.35)',
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-lg font-semibold text-gray-900',
      htmlContainer: 'text-sm text-gray-600',
      confirmButton: 'px-4 py-2 rounded-lg font-medium transition-all',
    },
  })