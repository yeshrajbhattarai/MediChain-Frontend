// src/pages/nurse/QueueDetail.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  HeartPulse,
  Activity,
  Stethoscope,
  Pill,
  FileText,
  CheckCircle2,
} from 'lucide-react'

import {
  getNurseQueueItem,
  completeNurseQueueItem,
} from '../../api/nurse'

export default function QueueDetail() {
  const navigate = useNavigate()

  const { id } = useParams()

  const [queueItem, setQueueItem] = useState(null)

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')

  const [form, setForm] = useState({
    blood_pressure: '',
    pulse_rate: '',
    spo2: '',
    temperature: '',
    nurse_notes: '',
    medications_given: '',
    recommendations: '',
  })

  useEffect(() => {
    async function loadQueueItem() {
      try {
        setLoading(true)
        setError('')

        const data =
          await getNurseQueueItem(id)

        console.log('Queue Detail:', data)

        setQueueItem(data)

      } catch (err) {
        console.error(err)

        setError('Failed to load queue item')

      } finally {
        setLoading(false)
      }
    }

    loadQueueItem()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setSaving(true)

      await completeNurseQueueItem(id, form)

      alert('Queue item completed successfully')

      navigate('/nurse/queue')

    } catch (err) {
      console.error(err)

      alert('Failed to complete queue item')

    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="
        bg-white
        border
        border-gray-200
        rounded-3xl
        p-10
        text-center
        text-sm
        text-gray-500
      ">
        Loading task...
      </div>
    )
  }

  if (error) {
    return (
      <div className="
        bg-red-50
        border
        border-red-200
        rounded-2xl
        p-4
        text-sm
        text-red-700
      ">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          text-gray-500
          hover:text-gray-900
        "
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Queue
      </button>

      {/* HERO */}
      <div className="
        bg-white
        border
        border-gray-200
        rounded-3xl
        p-6
      ">

        <div className="
          flex
          flex-col
          lg:flex-row
          lg:items-start
          lg:justify-between
          gap-6
        ">

          {/* LEFT */}
          <div className="flex-1">

            <div className="
              flex
              items-center
              gap-3
              flex-wrap
            ">

              <h1 className="
                text-2xl
                font-semibold
                text-gray-900
              ">
                {queueItem?.patient?.full_name ||
                  'Unknown Patient'}
              </h1>

              <span className="
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                bg-amber-100
                text-amber-700
              ">
                {queueItem?.status || 'Pending'}
              </span>
            </div>

            <p className="
              mt-4
              text-sm
              text-gray-600
              leading-relaxed
              max-w-3xl
            ">
              {queueItem?.primary_diagnosis ||
                'No diagnosis available'}
            </p>

            <div className="
              mt-5
              flex
              flex-wrap
              items-center
              gap-4
              text-sm
              text-gray-400
            ">

              <div className="
                flex
                items-center
                gap-2
              ">
                <CalendarDays className="w-4 h-4" />

                <span>
                  {queueItem?.created_at
                    ? new Date(
                        queueItem.created_at
                      ).toLocaleString('en-IN')
                    : '—'}
                </span>
              </div>

              <div className="
                flex
                items-center
                gap-2
              ">
                <Stethoscope className="w-4 h-4" />

                <span>
                  Assigned Clinical Task
                </span>
              </div>
            </div>
          </div>

          {/* ICON */}
          <div className="
            w-16
            h-16
            rounded-3xl
            bg-teal-50
            flex
            items-center
            justify-center
            shrink-0
          ">
            <ClipboardCheck className="
              w-7
              h-7
              text-teal-600
            " />
          </div>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* VITALS */}
        <div className="
          bg-white
          border
          border-gray-200
          rounded-3xl
          p-6
        ">

          <div className="
            flex
            items-center
            gap-3
          ">
            <div className="
              w-11
              h-11
              rounded-2xl
              bg-blue-50
              flex
              items-center
              justify-center
            ">
              <HeartPulse className="
                w-5
                h-5
                text-blue-600
              " />
            </div>

            <div>
              <h2 className="
                font-semibold
                text-gray-900
              ">
                Vital Signs
              </h2>

              <p className="
                text-sm
                text-gray-400
                mt-0.5
              ">
                Record patient vitals
              </p>
            </div>
          </div>

          <div className="
            mt-6
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          ">

            <Input
              label="Blood Pressure"
              value={form.blood_pressure}
              onChange={(e) =>
                setForm({
                  ...form,
                  blood_pressure:
                    e.target.value,
                })
              }
              placeholder="120/80"
            />

            <Input
              label="Pulse Rate"
              value={form.pulse_rate}
              onChange={(e) =>
                setForm({
                  ...form,
                  pulse_rate:
                    e.target.value,
                })
              }
              placeholder="72 bpm"
            />

            <Input
              label="SPO2"
              value={form.spo2}
              onChange={(e) =>
                setForm({
                  ...form,
                  spo2: e.target.value,
                })
              }
              placeholder="98%"
            />

            <Input
              label="Temperature"
              value={form.temperature}
              onChange={(e) =>
                setForm({
                  ...form,
                  temperature:
                    e.target.value,
                })
              }
              placeholder="98.6°F"
            />
          </div>
        </div>

        {/* OBSERVATION */}
        <SectionCard
          title="Observation Notes"
          subtitle="Clinical observations and monitoring"
          icon={Activity}
        >
          <textarea
            rows={5}
            placeholder="Enter nurse observations..."
            value={form.nurse_notes}
            onChange={(e) =>
              setForm({
                ...form,
                nurse_notes:
                  e.target.value,
              })
            }
            className="
              w-full
              px-3
              py-2.5
              text-sm
              border
              border-gray-200
              rounded-xl
              outline-none
              resize-none
              focus:border-blue-400
              focus:ring-1
              focus:ring-blue-100
            "
          />
        </SectionCard>

        {/* MEDICATION */}
        <SectionCard
          title="Treatment & Medication"
          subtitle="Medication administration details"
          icon={Pill}
        >
          <textarea
            rows={4}
            placeholder="Enter medications provided..."
            value={form.medications_given}
            onChange={(e) =>
              setForm({
                ...form,
                medications_given:
                  e.target.value,
              })
            }
            className="
              w-full
              px-3
              py-2.5
              text-sm
              border
              border-gray-200
              rounded-xl
              outline-none
              resize-none
              focus:border-blue-400
              focus:ring-1
              focus:ring-blue-100
            "
          />
        </SectionCard>

        {/* FOLLOWUP */}
        <SectionCard
          title="Follow-up Recommendation"
          subtitle="Post treatment recommendation"
          icon={FileText}
        >
          <textarea
            rows={4}
            placeholder="Enter recommendations..."
            value={form.recommendations}
            onChange={(e) =>
              setForm({
                ...form,
                recommendations:
                  e.target.value,
              })
            }
            className="
              w-full
              px-3
              py-2.5
              text-sm
              border
              border-gray-200
              rounded-xl
              outline-none
              resize-none
              focus:border-blue-400
              focus:ring-1
              focus:ring-blue-100
            "
          />
        </SectionCard>

        {/* ACTIONS */}
        <div className="
          sticky
          bottom-4
          z-20
        ">

          <div className="
            bg-white/90
            backdrop-blur
            border
            border-gray-200
            rounded-2xl
            p-4
            flex
            items-center
            justify-between
            gap-4
          ">

            <div>
              <p className="
                text-sm
                font-medium
                text-gray-900
              ">
                Ready to complete task
              </p>

              <p className="
                text-xs
                text-gray-400
                mt-1
              ">
                Save patient observations securely
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-3
                rounded-2xl
                bg-teal-600
                hover:bg-teal-700
                text-white
                text-sm
                font-medium
                transition-all
                disabled:opacity-60
              "
            >
              <CheckCircle2 className="w-4 h-4" />

              {saving
                ? 'Completing...'
                : 'Complete Task'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
}) {
  return (
    <div className="
      bg-white
      border
      border-gray-200
      rounded-3xl
      p-6
    ">

      <div className="
        flex
        items-center
        gap-3
      ">
        <div className="
          w-11
          h-11
          rounded-2xl
          bg-teal-50
          flex
          items-center
          justify-center
        ">
          <Icon className="
            w-5
            h-5
            text-teal-600
          " />
        </div>

        <div>
          <h2 className="
            font-semibold
            text-gray-900
          ">
            {title}
          </h2>

          <p className="
            text-sm
            text-gray-400
            mt-0.5
          ">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </div>
  )
}

function Input({
  label,
  ...props
}) {
  return (
    <div>
      <label className="
        text-sm
        font-medium
        text-gray-700
        mb-2
        block
      ">
        {label}
      </label>

      <input
        {...props}
        className="
          w-full
          px-3
          py-2.5
          text-sm
          border
          border-gray-200
          rounded-xl
          outline-none
          focus:border-blue-400
          focus:ring-1
          focus:ring-blue-100
        "
      />
    </div>
  )
}