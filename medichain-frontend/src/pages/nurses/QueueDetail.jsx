// src/pages/nurses/QueueDetail.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  ArrowLeft,
  Activity,
  User,
  ClipboardList,
  Stethoscope,
  Thermometer,
  HeartPulse,
  Droplets,
  Save,
} from 'lucide-react'

import {
  getNurseQueueItem,
  completeNurseQueueItem,
} from '../../api/nurse'

import Spinner from '../../components/ui/Spinner'

import {
  successToast,
  errorToast,
  confirmDialog,
} from '../../utils/alert'

export default function QueueDetail() {
  const { id } = useParams()

  const navigate = useNavigate()

  const [queue, setQueue] = useState(null)

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

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
  const isCompleted = queue?.status === 'completed'

  useEffect(() => {
    loadQueueDetail()
  }, [id])

  async function loadQueueDetail() {
    try {
      setLoading(true)

      const data = await getNurseQueueItem(id)

      console.log('Queue Detail:', data)

      setQueue(data)
    } catch (err) {
      console.error(err)

      errorToast('Failed to load queue detail')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const confirmed = await confirmDialog(
      'Complete Queue Task',
      'Are you sure you want to submit this healthcare record?',
      'Submit Record',
      false
    )

    if (!confirmed) return

    try {
      setSaving(true)

      await completeNurseQueueItem(id, form)

      successToast('Queue item completed successfully')

      navigate('/nurse/queue')
    } catch (err) {
      console.error(err)

      errorToast(
        err?.message ||
          'Failed to complete queue item'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Spinner fullPage />
  }

  if (!queue) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <p className="text-sm text-gray-500">
          Queue item not found
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/nurse/queue')}
            className="
              w-10
              h-10
              rounded-xl
              border
              border-gray-200
              bg-white
              hover:bg-gray-50
              flex
              items-center
              justify-center
              transition
            "
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Queue Detail
            </h1>

            <p className="text-sm text-gray-400 mt-0.5">
              Complete assigned patient healthcare task
            </p>
          </div>
        </div>

        <span
          className="
            px-3
            py-1.5
            rounded-full
            text-xs
            font-semibold
            bg-amber-100
            text-amber-700
          "
        >
          {(queue?.status || 'pending')
            .replace('_', ' ')
            .toUpperCase()}
        </span>
      </div>

      {/* PATIENT CARD */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-5 flex-wrap">
          {/* LEFT */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />

              <h2 className="text-lg font-semibold text-gray-900">
                {queue?.patient?.full_name ||
                  'Unknown Patient'}
              </h2>
            </div>

            <p className="text-sm text-gray-500 mt-3">
              {queue?.primary_diagnosis ||
                'No diagnosis available'}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-gray-400" />

                <span>
                  {queue?.title || 'Healthcare Task'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-gray-400" />

                <span>
                  {queue?.doctor?.full_name || 'Doctor'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-teal-600" />
          </div>
        </div>

        {/* DOCTOR NOTE */}
        {queue?.doctor_note && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Doctor Note
            </p>

            <p className="text-sm leading-relaxed text-gray-700">
              {queue.doctor_note}
            </p>
          </div>
        )}
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        {/* VITALS */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">
            Patient Vitals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* BP */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Blood Pressure
              </label>

              <div className="relative">
                <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  name="blood_pressure"
                  value={form.blood_pressure}
                  onChange={handleChange}
                  placeholder="120/80"
                  className="
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-400
                  "
                />
              </div>
            </div>

            {/* Pulse */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Pulse Rate
              </label>

              <input
                type="number"
                name="pulse_rate"
                value={form.pulse_rate}
                onChange={handleChange}
                placeholder="72"
                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  border
                  border-gray-200
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-blue-100
                  focus:border-blue-400
                "
              />
            </div>

            {/* Temp */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Temperature °C
              </label>

              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="number"
                  step="0.1"
                  name="temperature_c"
                  value={form.temperature_c}
                  onChange={handleChange}
                  placeholder="36.5"
                  className="
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-400
                  "
                />
              </div>
            </div>

            {/* SPO2 */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                SPO2 %
              </label>

              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="number"
                  name="spo2_percent"
                  value={form.spo2_percent}
                  onChange={handleChange}
                  placeholder="98"
                  className="
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-400
                  "
                />
              </div>
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">
            Nurse Assessment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                name: 'random_blood_sugar',
                label: 'Random Blood Sugar',
              },
              {
                name: 'nurse_tests_performed',
                label: 'Tests Performed',
              },
              {
                name: 'nurse_observation',
                label: 'Nurse Observation',
              },
              {
                name: 'treatment_given',
                label: 'Treatment Given',
              },
              {
                name: 'medications_administered',
                label: 'Medications Administered',
              },
              {
                name: 'follow_up_notes',
                label: 'Follow Up Notes',
              },
            ].map((field) => (
              <div
                key={field.name}
                className={
                  field.name === 'follow_up_notes'
                    ? 'md:col-span-2'
                    : ''
                }
              >
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  {field.label}
                </label>

                <textarea
                  rows={4}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    text-sm
                    outline-none
                    resize-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-400
                  "
                />
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="sticky bottom-0 bg-gray-50 pb-2">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-end gap-3 shadow-sm">
            <button
              type="button"
              onClick={() => navigate('/nurse/queue')}
              className="
                px-5
                py-2.5
                rounded-xl
                border
                border-gray-200
                bg-white
                text-sm
                font-medium
                text-gray-700
                hover:bg-gray-50
                transition
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-sm
                font-medium
                transition
                disabled:opacity-60
              "
            >
              <Save className="w-4 h-4" />

              {saving
                ? 'Submitting...'
                : 'Complete Task'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}