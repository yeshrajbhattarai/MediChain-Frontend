// src/pages/doctor/ApprovalQueue.jsx
// Doctor approval workflow for nurse-completed records

import { useState, useEffect } from 'react'
import { successToast, errorToast } from '../../utils/alert'

const BASE = 'http://localhost:8000/api/v1'

const api = (url, opts = {}) =>
  fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access') || ''}`,
      ...opts.headers,
    },
  })

// ─── Helpers ──────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function StatCard({ label, value, icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-green-50 text-green-700',
  }
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Approval Modal ───────────────────────────────────────────────────────

function ApprovalModal({ item, open, onClose, onApproved }) {
  const [step, setStep] = useState('review') // 'review' | 'approve' | 'reject' | 'request'
  const [finalNotes, setFinalNotes] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [changeRequest, setChangeRequest] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  async function handleApprove() {
    if (!appointmentDate) {
      errorToast('Please set next appointment date')
      return
    }

    setSubmitting(true)
    try {
      const res = await api(`/staff/doctor/approval-queue/${item.id}/approve/`, {
        method: 'POST',
        body: JSON.stringify({
          next_appointment_date: appointmentDate,
          final_notes: finalNotes,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        errorToast(data.error || 'Approval failed')
        return
      }

      successToast('Record approved and finalized')
      onApproved()
      onClose()
    } catch {
      errorToast('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      errorToast('Please provide rejection reason')
      return
    }

    setSubmitting(true)
    try {
      const res = await api(`/staff/doctor/approval-queue/${item.id}/reject/`, {
        method: 'POST',
        body: JSON.stringify({
          reason: rejectionReason,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        errorToast(data.error || 'Rejection failed')
        return
      }

      successToast('Record rejected and returned to technician')
      onApproved()
      onClose()
    } catch {
      errorToast('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRequestChanges() {
    if (!changeRequest.trim()) {
      errorToast('Please specify what changes are needed')
      return
    }

    setSubmitting(true)
    try {
      const res = await api(
        `/staff/doctor/approval-queue/${item.id}/request-changes/`,
        {
          method: 'POST',
          body: JSON.stringify({
            requested_changes: changeRequest,
          }),
        }
      )

      const data = await res.json()
      if (!res.ok) {
        errorToast(data.error || 'Request failed')
        return
      }

      successToast('Change request sent to technician')
      onApproved()
      onClose()
    } catch {
      errorToast('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {step === 'review' ? 'Review Record' : 'Confirm Action'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 'review' && (
            <>
              {/* Patient Info */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                  {item.patient_name?.[0] || 'P'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.patient_name}</p>
                  <p className="text-sm text-blue-600">{item.lab_name}</p>
                </div>
              </div>

              {/* Clinical Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Submitted By
                  </p>
                  <p className="font-semibold text-gray-900">{item.nurse_name || '—'}</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Submitted At
                  </p>
                  <p className="font-semibold text-gray-900">
                    {item.submitted_at
                      ? new Date(item.submitted_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="border border-gray-100 rounded-xl p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                  Diagnosis
                </p>
                <p className="text-gray-800">{item.diagnosis || 'No diagnosis provided'}</p>
              </div>

              {/* Clinical Values */}
              <div className="border border-gray-100 rounded-xl p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                  Clinical Measurements
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Blood Pressure</p>
                    <p className="font-semibold text-gray-900">{item.blood_pressure || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pulse Rate</p>
                    <p className="font-semibold text-gray-900">{item.pulse_rate || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Temperature</p>
                    <p className="font-semibold text-gray-900">{item.temperature || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">SpO2</p>
                    <p className="font-semibold text-gray-900">{item.spo2 || '—'}%</p>
                  </div>
                </div>
              </div>

              {/* Nurse Notes */}
              <div className="border border-gray-100 rounded-xl p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                  Nurse Notes
                </p>
                <p className="text-gray-700">{item.notes || 'No additional notes'}</p>
              </div>
            </>
          )}

          {step === 'approve' && (
            <>
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="font-semibold text-green-900 mb-2">Approve Record</p>
                <p className="text-sm text-green-700">
                  Once approved, this record will be finalized and linked to the patient. It cannot be
                  modified without creating a new version.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                    Next Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none
                               focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                    Final Doctor Notes
                  </label>
                  <textarea
                    rows={4}
                    value={finalNotes}
                    onChange={e => setFinalNotes(e.target.value)}
                    placeholder="Any additional notes for the patient record..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none
                               focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                  />
                </div>
              </div>
            </>
          )}

          {step === 'reject' && (
            <>
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="font-semibold text-red-900 mb-2">Reject Record</p>
                <p className="text-sm text-red-700">
                  The record will be returned to the technician for corrections. Provide a detailed
                  reason so they know what to fix.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  rows={5}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Explain what needs to be corrected..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none
                             focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                />
              </div>
            </>
          )}

          {step === 'request' && (
            <>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="font-semibold text-amber-900 mb-2">Request Changes</p>
                <p className="text-sm text-amber-700">
                  The technician will receive your requested changes without full rejection. They can
                  make targeted updates and resubmit.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  What Changes Are Needed? *
                </label>
                <textarea
                  rows={5}
                  value={changeRequest}
                  onChange={e => setChangeRequest(e.target.value)}
                  placeholder="Describe the specific changes or updates needed..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none
                             focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-gray-100 bg-white flex gap-3">
          {step === 'review' ? (
            <>
              <button
                onClick={() => setStep('approve')}
                className="flex-1 py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => setStep('request')}
                className="flex-1 py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
              >
                Request Changes
              </button>
              <button
                onClick={() => setStep('reject')}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Reject
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('review')}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={
                  step === 'approve'
                    ? handleApprove
                    : step === 'reject'
                    ? handleReject
                    : handleRequestChanges
                }
                disabled={submitting}
                className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors"
              >
                {submitting ? 'Processing...' : 'Confirm'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function ApprovalQueue() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadQueue()
  }, [])

  async function loadQueue() {
    setLoading(true)
    setError('')
    try {
      const res = await api('/staff/doctor/approval-queue/')
      const data = await res.json()

      if (res.ok && data.results) {
        setQueue(data.results)
      } else {
        setError('Failed to load approval queue')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  function openRecord(item) {
    setSelected(item)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setTimeout(() => setSelected(null), 300)
  }

  const stats = {
    pending: queue.length,
    approved: 0, // Would come from metrics
    needsReview: 0, // Would come from metrics
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve records submitted by technicians and nurses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Pending Review" value={stats.pending} icon="⏳" color="amber" />
        <StatCard label="Approved Today" value={stats.approved} icon="✓" color="green" />
        <StatCard label="Needs Attention" value={stats.needsReview} icon="!" color="blue" />
      </div>

      {/* Queue List */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Submitted Records</h2>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={loadQueue}
              className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-2xl mb-3">✓</p>
            <p className="text-gray-600 font-medium">No records awaiting approval</p>
            <p className="text-sm text-gray-400 mt-1">All records have been reviewed</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {queue.map(item => (
              <button
                key={item.id}
                onClick={() => openRecord(item)}
                className="w-full text-left p-5 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-gray-900">{item.patient_name}</h3>
                      <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                        Pending
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>{item.lab_name}</p>
                      <p>Submitted by {item.nurse_name}</p>
                      <p>
                        {item.submitted_at
                          ? new Date(item.submitted_at).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📋</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ApprovalModal
        item={selected}
        open={showModal}
        onClose={closeModal}
        onApproved={loadQueue}
      />
    </div>
  )
}