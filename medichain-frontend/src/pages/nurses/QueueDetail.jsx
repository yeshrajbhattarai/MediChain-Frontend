// src/pages/nurse/QueueDetail.jsx
// FIXED: Back button, breadcrumbs, better UX, sticky actions

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Thermometer,
  HeartPulse,
  Droplets,
  AlertCircle,
  Loader,
  CheckCircle2,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { getNurseQueueItem, completeNurseQueueItem } from '../../api/nurse'

export default function QueueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [queue, setQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [form, setForm] = useState({
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
  })

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
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load task')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.blood_pressure.trim()) newErrors.blood_pressure = 'Required'
    if (!form.pulse_rate) newErrors.pulse_rate = 'Required'
    else if (isNaN(form.pulse_rate)) newErrors.pulse_rate = 'Must be a number'

    if (!form.temperature_c) newErrors.temperature_c = 'Required'
    else if (isNaN(form.temperature_c)) newErrors.temperature_c = 'Must be a number'

    if (!form.spo2_percent) newErrors.spo2_percent = 'Required'
    else if (isNaN(form.spo2_percent)) newErrors.spo2_percent = 'Must be a number'

    if (!form.nurse_tests_performed.trim()) newErrors.nurse_tests_performed = 'Required'
    if (!form.nurse_observation.trim()) newErrors.nurse_observation = 'Required'
    if (!form.treatment_given.trim()) newErrors.treatment_given = 'Required'
    if (!form.medications_administered.trim()) newErrors.medications_administered = 'Required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      setToast('Please fill all required fields correctly')
      setTimeout(() => setToast(''), 3000)
      return
    }

    try {
      setSaving(true)
      await completeNurseQueueItem(id, form)
      setToast('Task completed successfully!')
      setTimeout(() => {
        navigate('/nurse/queue')
      }, 2000)
    } catch (err) {
      console.error(err)
      setToast(err.message || 'Failed to complete task')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading task...</p>
        </div>
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
              Go back to queue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-transparent pb-32">
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
          className={`
            mb-6
            flex
            items-center
            gap-3
            px-5
            py-3
            rounded-xl
            text-sm
            font-medium
            animate-in
            fade-in
            ${
              toast.includes('successfully')
                ? 'bg-emerald-600 text-white'
                : 'bg-red-500 text-white'
            }
          `}
        >
          {toast.includes('successfully') ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PATIENT CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {queue?.title || 'Healthcare Task'}
          </h2>
          <p className="text-sm text-gray-600">
            {queue?.primary_diagnosis || 'No diagnosis available'}
          </p>
          {queue?.doctor_note && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Doctor's Note</p>
              <p className="text-sm text-gray-700">{queue.doctor_note}</p>
            </div>
          )}
        </div>

        {/* VITALS SECTION */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-5">Patient Vitals</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Blood Pressure */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                Blood Pressure *
              </label>
              <div className="relative">
                <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="blood_pressure"
                  value={form.blood_pressure}
                  onChange={(e) => setForm({ ...form, blood_pressure: e.target.value })}
                  placeholder="120/80"
                  className={`
                    w-full
                    pl-10
                    pr-4
                    py-2.5
                    rounded-lg
                    text-sm
                    border
                    ${errors.blood_pressure ? 'border-red-400 bg-red-50' : 'border-gray-200'}
                    outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-400
                  `}
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
                name="pulse_rate"
                value={form.pulse_rate}
                onChange={(e) => setForm({ ...form, pulse_rate: e.target.value })}
                placeholder="72"
                className={`
                  w-full
                  px-4
                  py-2.5
                  rounded-lg
                  text-sm
                  border
                  ${errors.pulse_rate ? 'border-red-400 bg-red-50' : 'border-gray-200'}
                  outline-none
                  focus:ring-2
                  focus:ring-blue-100
                  focus:border-blue-400
                `}
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
                  step="0.1"
                  name="temperature_c"
                  value={form.temperature_c}
                  onChange={(e) => setForm({ ...form, temperature_c: e.target.value })}
                  placeholder="36.5"
                  className={`
                    w-full
                    pl-10
                    pr-4
                    py-2.5
                    rounded-lg
                    text-sm
                    border
                    ${errors.temperature_c ? 'border-red-400 bg-red-50' : 'border-gray-200'}
                    outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-400
                  `}
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
                  name="spo2_percent"
                  value={form.spo2_percent}
                  onChange={(e) => setForm({ ...form, spo2_percent: e.target.value })}
                  placeholder="98"
                  className={`
                    w-full
                    pl-10
                    pr-4
                    py-2.5
                    rounded-lg
                    text-sm
                    border
                    ${errors.spo2_percent ? 'border-red-400 bg-red-50' : 'border-gray-200'}
                    outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-400
                  `}
                />
              </div>
              {errors.spo2_percent && (
                <p className="text-xs text-red-600 mt-1">{errors.spo2_percent}</p>
              )}
            </div>
          </div>
        </div>

        {/* ASSESSMENT SECTION */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-5">Nursing Assessment</h3>

          <div className="space-y-4">
            {[
              {
                name: 'random_blood_sugar',
                label: 'Random Blood Sugar (Optional)',
                required: false,
              },
              {
                name: 'nurse_tests_performed',
                label: 'Tests Performed *',
                required: true,
              },
              {
                name: 'nurse_observation',
                label: 'Observation *',
                required: true,
              },
              {
                name: 'treatment_given',
                label: 'Treatment Given *',
                required: true,
              },
              {
                name: 'medications_administered',
                label: 'Medications *',
                required: true,
              },
              {
                name: 'follow_up_notes',
                label: 'Follow-up Notes (Optional)',
                required: false,
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  {field.label}
                </label>
                <textarea
                  rows={3}
                  name={field.name}
                  value={form[field.name]}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  className={`
                    w-full
                    px-4
                    py-2.5
                    rounded-lg
                    text-sm
                    border
                    resize-none
                    ${errors[field.name] ? 'border-red-400 bg-red-50' : 'border-gray-200'}
                    outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-400
                  `}
                />
                {errors[field.name] && (
                  <p className="text-xs text-red-600 mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-end gap-3">
          <button
            onClick={() => navigate('/nurse/queue')}
            className="
              px-5
              py-2.5
              rounded-lg
              border
              border-gray-200
              bg-white
              text-sm
              font-medium
              text-gray-700
              hover:bg-gray-50
              transition-all
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="
              flex
              items-center
              gap-2
              px-6
              py-2.5
              rounded-lg
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-sm
              font-medium
              transition-all
              disabled:opacity-60
            "
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}