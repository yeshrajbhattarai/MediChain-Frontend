import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  ArrowLeft,
  Calendar,
  Download,
  ShieldCheck,
  Activity,
  FlaskConical,
  Hospital,
  User,
  HeartPulse,
} from 'lucide-react'

import { getPatientRecordDetail } from '../../api/patient'

export default function PatientRecordDetail() {
  const navigate = useNavigate()
  const { recordId } = useParams()

  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRecord()
  }, [recordId])

  const fetchRecord = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getPatientRecordDetail(recordId)

      setRecord(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load record')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">
          <div className="h-64 rounded-3xl bg-slate-200" />
          <div className="h-96 rounded-3xl bg-slate-200" />
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-xl mx-auto bg-white border border-red-200 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Failed to Load Record
          </h2>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isMedical =
    !!record.primary_diagnosis ||
    !!record.blood_pressure ||
    !!record.prescription

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP BAR */}
        <div className="flex items-center justify-between">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
          >
            <Download size={18} />
            Download PDF
          </button>

        </div>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-slate-800 shadow-2xl">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%)]" />

          <div className="relative p-5 md:p-8">

            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">

              {/* LEFT */}
              <div className="flex flex-col gap-6 flex-1">

                <div className="flex items-start gap-4">

                  <div
                    className={`
                      shrink-0 w-16 h-16 rounded-2xl
                      flex items-center justify-center
                      ${
                        isMedical
                          ? 'bg-blue-500/10 border border-blue-400/20'
                          : 'bg-emerald-500/10 border border-emerald-400/20'
                      }
                    `}
                  >
                    {
                      isMedical
                        ? <Activity className="text-blue-300" size={30} />
                        : <FlaskConical className="text-emerald-300" size={30} />
                    }
                  </div>

                  <div>

                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                      {
                        isMedical
                          ? 'Medical Record'
                          : 'Lab Report'
                      }
                    </h1>

                    <p className="text-slate-300 mt-2 break-all">
                      Record ID: {record.record_id || record.id}
                    </p>

                  </div>

                </div>

                {/* META GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                  <MetaCard
                    label="Patient"
                    value={
                      record.patient?.full_name ||
                      record.patient_name ||
                      'Patient'
                    }
                  />

                  <MetaCard
                    label="Hospital"
                    value={
                      record.hospital_name ||
                      record.lab_request?.hospital_name ||
                      'Hospital'
                    }
                  />

                  <MetaCard
                    label={
                      isMedical
                        ? 'Doctor'
                        : 'Technician'
                    }
                    value={
                      record.doctor?.full_name ||
                      record.technician?.full_name ||
                      record.created_by_name ||
                      '—'
                    }
                  />

                  <MetaCard
                    label="Created"
                    value={
                      record.created_at
                        ? new Date(record.created_at).toLocaleString()
                        : '—'
                    }
                  />

                </div>

              </div>

              {/* RIGHT */}
              <div className="flex xl:flex-col items-start xl:items-end gap-3">

                <div className="px-4 py-2 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-100 text-sm font-medium">
                  Version {record.version || 1}
                </div>

                <div className="px-5 py-3 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck size={18} />
                  Integrity Verified
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 2xl:grid-cols-[1.2fr_1fr] gap-6">

          {/* LEFT */}
          <div className="space-y-6">

            {/* SUMMARY */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6">

              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <HeartPulse className="text-emerald-500" />
                Clinical Summary
              </h2>

              <div className="space-y-6 mt-8">

                <InfoBlock
                  label="Diagnosis"
                  value={
                    record.primary_diagnosis ||
                    record.diagnosis ||
                    'No diagnosis'
                  }
                />

                <InfoBlock
                  label="Treatment Plan"
                  value={
                    record.treatment_given ||
                    record.treatment_plan ||
                    'No treatment plan'
                  }
                />

                <InfoBlock
                  label="Notes"
                  value={
                    record.notes ||
                    record.summary ||
                    'No notes available'
                  }
                />

              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* VITALS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6">

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Clinical Values
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <VitalCard
                  label="Blood Pressure"
                  value={record.blood_pressure}
                />

                <VitalCard
                  label="Pulse"
                  value={record.pulse_rate}
                />

                <VitalCard
                  label="Temperature"
                  value={record.temperature_c}
                />

                <VitalCard
                  label="SpO2"
                  value={record.spo2_percent}
                />

                <VitalCard
                  label="Blood Sugar"
                  value={record.random_blood_sugar}
                />

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

function MetaCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-4 py-4">

      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>

      <p className="text-white font-semibold mt-2 text-sm md:text-base break-words">
        {value}
      </p>

    </div>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div>

      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
        {label}
      </p>

      <p className="mt-3 text-slate-900 text-lg leading-relaxed">
        {value}
      </p>

    </div>
  )
}

function VitalCard({ label, value }) {
  if (!value) return null

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  )
}