// src/pages/nurse/QueueDetail.jsx
// Fixed: rejection reason banner, key_instruction, handwritten_file display,
// doctor_note, POST to /nurse/queue/<id>/ per API docs

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Thermometer,
  HeartPulse,
  Droplets,
  AlertCircle,
  Loader,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ClipboardList,
  ExternalLink,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { getNurseQueueItem, completeNurseQueueItem } from '../../api/nurse'

const EMPTY_FORM = {
  blood_pressure: '',
  pulse_rate: '',
  temperature_c: '',
  spo2_percent: '',
  random_blood_sugar: '',
  nurse_tests_performed: '',
  nurse_observation: '',
  treatment_given: '',
  medications_administered: '',
  follow_up_notes: '',
}

export default function QueueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [queue, setQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', text }

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadQueueDetail()
  }, [id])

  async function loadQueueDetail() {
    try {
      setLoading(true)
      setError('')
      const data = await getNurseQueueItem(id)
      setQueue(data)
      // Pre-fill form if item was previously rejected and had values
      if (data?.blood_pressure) {
        setForm({
          blood_pressure: data.blood_pressure || '',
          pulse_rate: data.pulse_rate ?? '',
          temperature_c: data.temperature_c || '',
          spo2_percent: data.spo2_percent ?? '',
          random_blood_sugar: data.random_blood_sugar || '',
          nurse_tests_performed: data.nurse_tests_performed || '',
          nurse_observation: data.nurse_observation || '',
          treatment_given: data.treatment_given || '',
          medications_administered: data.medications_administered || '',
          follow_up_notes: data.follow_up_notes || '',
        })
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load task')
    } finally {
      setLoading(false)
    }
  }

  function showToast(type, text) {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3500)
  }

  function validate() {
    const e = {}
    if (!form.blood_pressure.trim()) e.blood_pressure = 'Required'
    if (!String(form.pulse_rate).trim()) e.pulse_rate = 'Required'
    else if (isNaN(form.pulse_rate)) e.pulse_rate = 'Must be a number'
    if (!String(form.temperature_c).trim()) e.temperature_c = 'Required'
    else if (isNaN(form.temperature_c)) e.temperature_c = 'Must be a number'
    if (!String(form.spo2_percent).trim()) e.spo2_percent = 'Required'
    else if (isNaN(form.spo2_percent)) e.spo2_percent = 'Must be a number'
    if (!form.nurse_tests_performed.trim()) e.nurse_tests_performed = 'Required'
    if (!form.nurse_observation.trim()) e.nurse_observation = 'Required'
    if (!form.treatment_given.trim()) e.treatment_given = 'Required'
    if (!form.medications_administered.trim()) e.medications_administered = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (!validate()) {
      showToast('error', 'Please fill all required fields correctly')
      return
    }
    try {
      setSaving(true)
      await completeNurseQueueItem(id, {
        ...form,
        pulse_rate: Number(form.pulse_rate),
        spo2_percent: Number(form.spo2_percent),
      })
      showToast('success', 'Task completed and sent to doctor for review.')
      setTimeout(() => navigate('/nurse/queue'), 2200)
    } catch (err) {
      console.error(err)
      showToast('error', err.message || 'Failed to complete task')
    } finally {
      setSaving(false)
    }
  }

  // Shared field change handler — stable reference avoids focus loss
  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 ml-3">Loading task...</p>
      </div>
    )
  }

  if (error || !queue) {
    return (
      <div>
        <PageHeader
          title="Queue Item"
          subtitle="Complete assigned nursing task"
          breadcrumbs={[
            { label: 'Nurse Portal', href: '/nurse/dashboard' },
            { label: 'Queue', href: '/nurse/queue' },
            { label: 'Task Detail' },
          ]}
          showBack
        />
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-6">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">{error || 'Task not found'}</p>
            <button
              onClick={() => navigate('/nurse/queue')}
              className="text-xs text-red-600 hover:text-red-700 font-medium mt-3"
            >
              ← Back to queue
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isRejected = Boolean(queue?.doctor_rejection_reason)
  const isFinalized = queue?.doctor_finalized === true
  const isCompleted = queue?.status === 'completed'
  const readOnly = isCompleted || isFinalized

  return (
    <div className="flex flex-col gap-6 pb-32">
      <PageHeader
        title="Complete Task"
        subtitle={`Patient: ${queue?.patient?.full_name || 'Unknown'}`}
        breadcrumbs={[
          { label: 'Nurse Portal', href: '/nurse/dashboard' },
          { label: 'Queue', href: '/nurse/queue' },
          { label: 'Task Detail' },
        ]}
        showBack
      />

      {/* TOAST */}
      {toast && (
        <div
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toast.text}
        </div>
      )}

      {/* DOCTOR REJECTION BANNER — most prominent element when present */}
      {isRejected && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 text-sm">Returned by Doctor</h4>
              <p className="text-sm text-red-700 mt-1 leading-relaxed">
                {queue.doctor_rejection_reason}
              </p>
              <p className="text-xs text-red-500 mt-2">
                Please review the reason above, correct your assessment, and re-submit.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TASK SUMMARY CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            {isFinalized && (
              <div className="mb-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white">
                <p className="text-xs uppercase tracking-wider opacity-80">
                  Finalized Medical Record
                </p>

                <h3 className="text-xl font-bold mt-1">
                  Doctor Approved & Locked
                </h3>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="opacity-70">Status</p>
                    <p className="font-medium">
                      {queue?.status || 'Completed'}
                    </p>
                  </div>

                  <div>
                    <p className="opacity-70">Finalized At</p>
                    <p className="font-medium">
                      {queue?.doctor_finalized_at
                        ? new Date(queue.doctor_finalized_at).toLocaleString('en-IN')
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {queue?.title || 'Healthcare Task'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {queue?.primary_diagnosis || 'No diagnosis available'}
              </p>
            </div>
          </div>

          {/* Key instruction from doctor — required field in creation */}
          {queue?.key_instruction && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Key Instruction
              </p>
              <p className="text-sm text-gray-700 leading-relaxed bg-blue-50 rounded-xl px-4 py-3">
                {queue.key_instruction}
              </p>
            </div>
          )}

          {/* Optional doctor note */}
          {queue?.doctor_note && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Doctor's Note
              </p>
              <p className="text-sm text-gray-700">{queue.doctor_note}</p>
            </div>
          )}

          {/* Handwritten file attachment from doctor */}
          {queue?.handwritten_file && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Attached File
              </p>
              <a
                href={
                  queue.handwritten_file?.startsWith('http')
                    ? queue.handwritten_file
                    : `http://localhost:8000${queue.handwritten_file}` //! needs attention
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <FileText className="w-4 h-4" />
                View Attachment
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* VITALS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-5">Patient Vitals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Blood Pressure */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                Blood Pressure *
              </label>
              <div className="relative">
                <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  disabled={readOnly}
                  value={form.blood_pressure}
                  onChange={handleChange('blood_pressure')}
                  placeholder="120/80"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors.blood_pressure ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                />
              </div>
              {errors.blood_pressure && (
                <p className="text-xs text-red-600 mt-1">{errors.blood_pressure}</p>
              )}
            </div>

            {/* Pulse Rate */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                Pulse Rate (bpm) *
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.pulse_rate}
                onChange={handleChange('pulse_rate')}
                placeholder="72"
                className={`w-full px-4 py-2.5 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors.pulse_rate ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
              />
              {errors.pulse_rate && (
                <p className="text-xs text-red-600 mt-1">{errors.pulse_rate}</p>
              )}
            </div>

            {/* Temperature */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                Temperature °C *
              </label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  disabled={readOnly}
                  step="0.1"
                  value={form.temperature_c}
                  onChange={handleChange('temperature_c')}
                  placeholder="36.5"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors.temperature_c ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                />
              </div>
              {errors.temperature_c && (
                <p className="text-xs text-red-600 mt-1">{errors.temperature_c}</p>
              )}
            </div>

            {/* SpO2 */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                SpO2 (%) *
              </label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  disabled={readOnly}
                  value={form.spo2_percent}
                  onChange={handleChange('spo2_percent')}
                  placeholder="98"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors.spo2_percent ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                />
              </div>
              {errors.spo2_percent && (
                <p className="text-xs text-red-600 mt-1">{errors.spo2_percent}</p>
              )}
            </div>
          </div>
        </div>

        {/* ASSESSMENT */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-5">Nursing Assessment</h3>
          <div className="space-y-4">
            {[
              { name: 'random_blood_sugar', label: 'Random Blood Sugar (Optional)', required: false },
              { name: 'nurse_tests_performed', label: 'Tests Performed *', required: true },
              { name: 'nurse_observation', label: 'Observation *', required: true },
              { name: 'treatment_given', label: 'Treatment Given *', required: true },
              { name: 'medications_administered', label: 'Medications *', required: true },
              { name: 'follow_up_notes', label: 'Follow-up Notes (Optional)', required: false },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  {field.label}
                </label>
                <textarea
                  rows={3}
                  disabled={readOnly}
                  value={form[field.name]}
                  onChange={handleChange(field.name)}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm border resize-none outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors[field.name] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                />
                {errors[field.name] && (
                  <p className="text-xs text-red-600 mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/nurse/queue')}
            className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          {!readOnly ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {isRejected ? 'Re-submit Task' : 'Complete Task'}
                </>
              )}
            </button>
          ) : (
            <div className="px-5 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
              Record Finalized
            </div>
          )}
        </div>
      </div>
    </div>
  )
}