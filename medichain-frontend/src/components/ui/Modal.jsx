// Modal — popup wrapper for forms (add doctor, add patient, etc.)
// Usage:
//   <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Doctor">
//     <YourFormHere />
//   </Modal>
//
// Clicking the backdrop or the X button calls onClose
// isOpen controls visibility — you manage this with a useState in the parent

import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const SIZE_MAP = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    // Backdrop — semi-transparent overlay behind the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}   // clicking outside closes it
    >
      {/* Modal box — stop click from bubbling to backdrop */}
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${SIZE_MAP[size]} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content area — your form goes here */}
        <div className="px-6 py-5">
          {children}
        </div>

      </div>
    </div>
  )
}