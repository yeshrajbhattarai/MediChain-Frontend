import { useEffect, useState } from 'react'

import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import {
  ArrowLeft,
  ShieldCheck,
  Download,
  Activity,
  Clock3,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react'

import {
  getPatientMedicalRecord,
  getPatientMedicalRecordHistory,
} from '../../api/patient'

export default function PatientMedicalRecordDetail() {

  const navigate = useNavigate()

  const { recordId } = useParams()

  const [searchParams] = useSearchParams()

  const printMode =
    searchParams.get('print') === 'true'

  const [loading, setLoading] = useState(true)

  const [record, setRecord] = useState(null)

  const [error, setError] = useState('')

  const [activeTab, setActiveTab] =
    useState('overview')

  useEffect(() => {
    fetchRecord()
  }, [recordId])

  useEffect(() => {

    if (printMode && record) {
      setTimeout(() => {
        window.print()
      }, 500)
    }

  }, [printMode, record])

  const fetchRecord = async () => {

    try {

      setLoading(true)

      setError('')

      const detailData = await getPatientMedicalRecord(recordId)

      setRecord(detailData)

    } catch (err) {

      console.error(err)

      setError(err?.error || 'Failed to load record')

    } finally {

      setLoading(false)

    }

  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">

          <div className="h-56 rounded-3xl bg-slate-200" />

          <div className="h-96 rounded-3xl bg-slate-200" />

        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">

        <div className="bg-white border border-red-200 rounded-3xl p-10 text-center print:rounded-none print:border-0">

          <h2 className="text-2xl font-bold text-red-600">
            Failed to Load Record
          </h2>

          <p className="text-gray-600 mt-3">
            {error || 'The requested record could not be found.'}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>

        </div>

      </div>
    )
  }

  const medicalRecord = record?.medical_record || {}
  const detail = record?.detail || {}
  const integrity = record?.integrity || {}
  const timeline = record?.timeline || []
  const patient = record?.patient || {}

  // Extract first timeline entry for audit info
  const firstTimelineEntry = timeline?.[0] || {}

  const hasVitals = medicalRecord.blood_pressure || medicalRecord.pulse_rate || medicalRecord.temperature_c || medicalRecord.spo2_percent

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 print:bg-white">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP BAR */}
        {!printMode && (
          <div className="flex items-center justify-between print:hidden">

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >

              <ArrowLeft size={18} />

              Back

            </button>

            <button
              onClick={() => window.print()}
              className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >

              <Download size={18} />

              Download PDF

            </button>

          </div>
        )}

        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-slate-800 shadow-2xl print:shadow-none print:border-0 print:rounded-none print:bg-white">

          <div className="p-6 md:p-8 relative">

            <div className="flex flex-col xl:flex-row justify-between gap-6">

              {/* LEFT */}
              <div className="flex gap-5">

                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">

                  <Activity
                    className="text-blue-300"
                    size={30}
                  />

                </div>

                <div>

                  <h1 className="text-3xl md:text-4xl font-bold text-white print:text-slate-900">

                    Medical Record

                  </h1>

                  <p className="mt-2 text-slate-300 print:text-slate-600 break-all">
                    Record ID: {medicalRecord.id || recordId}
                  </p>

                </div>

              </div>

              {/* RIGHT */}
              <div className="flex flex-wrap items-start gap-3">

                <span className="px-4 py-2 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-100 text-sm font-semibold print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                  Version {medicalRecord.version || 1}
                </span>

                <span className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-sm font-semibold flex items-center gap-2 print:bg-slate-100 print:text-slate-800 print:border-slate-300">

                  <ShieldCheck size={16} />

                  Verified

                </span>

              </div>

            </div>

            {/* META GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">

              <MetaCard
                label="Hospital"
                value={medicalRecord.patient?.registered_by_name || '—'}
              />

              <MetaCard
                label="Doctor"
                value={medicalRecord.doctor?.full_name || medicalRecord.doctor_name || '—'}
              />

              <MetaCard
                label="Created"
                value={
                  medicalRecord.created_at
                    ? new Date(medicalRecord.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                    : '—'
                }
              />

              <MetaCard
                label="Status"
                value={medicalRecord.status || 'Completed'}
              />

            </div>

          </div>

        </div>

        {/* STICKY TAB BAR */}
        <div className="sticky top-4 z-20 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-2 flex flex-wrap gap-2 print:hidden shadow-lg">

          {
            [
              ['overview', 'Overview'],
              ['clinical', 'Clinical Data'],
              ['timeline', 'Timeline'],
            ].map(([key, label]) => (

              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  px-5 py-3 rounded-2xl font-medium transition-all
                  ${
                    activeTab === key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }
                `}
              >
                {label}
              </button>

            ))
          }

        </div>

        {/* OVERVIEW */}
        {(activeTab === 'overview' || printMode) && (
          <div className="space-y-6">

            {/* Patient & Doctor Info */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 print:rounded-none print:border-0 print:shadow-none">

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Patient & Medical Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <InfoCard
                  icon={<User size={18} />}
                  label="Patient Name"
                  value={patient?.full_name || patient?.patient_name || '—'}
                />

                <InfoCard
                  icon={<User size={18} />}
                  label="Doctor"
                  value={medicalRecord.doctor?.full_name || medicalRecord.doctor_name || '—'}
                />

                <InfoCard
                  icon={<Building2 size={18} />}
                  label="Hospital"
                  value={medicalRecord.patient?.registered_by_name || '—'}
                />

                <InfoCard
                  icon={<Calendar size={18} />}
                  label="Record Type"
                  value="Medical Record"
                />

              </div>

            </div>

            {/* Clinical Summary */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 print:rounded-none print:border-0 print:shadow-none">

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Clinical Summary
              </h2>

              <div className="space-y-6">

                <InfoBlock
                  label="Primary Diagnosis"
                  value={medicalRecord.primary_diagnosis}
                />

                <InfoBlock
                  label="Key Instruction"
                  value={medicalRecord.key_instruction}
                />

                <InfoBlock
                  label="Doctor Notes"
                  value={medicalRecord.doctor_note}
                />

                <InfoBlock
                  label="Nurse Observation"
                  value={medicalRecord.nurse_observation}
                />

                <InfoBlock
                  label="Treatment Given"
                  value={medicalRecord.treatment_given}
                />

                <InfoBlock
                  label="Medications Administered"
                  value={medicalRecord.medications_administered}
                />

                <InfoBlock
                  label="Follow Up Notes"
                  value={medicalRecord.follow_up_notes}
                />

              </div>

            </div>

            {/* Audit & Integrity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-white border border-slate-200 rounded-3xl p-6 print:rounded-none print:border-0 print:shadow-none">

                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  Integrity Verification
                </h3>

                <div className="space-y-3">

                  <AuditField
                    label="Verified"
                    value={integrity?.verified ? 'Yes' : 'No'}
                  />

                  <AuditField
                    label="Computed"
                    value={integrity?.computed ? 'Yes' : 'No'}
                  />

                  <AuditField
                    label="Local Verified"
                    value={integrity?.local_verified ? 'Yes' : 'No'}
                  />

                  <AuditField
                    label="MediChain Verified"
                    value={integrity?.medichain_verified ? 'Yes' : 'No'}
                  />

                </div>

              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 print:rounded-none print:border-0 print:shadow-none">

                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-blue-600" />
                  Audit Information
                </h3>

                <div className="space-y-3">

                  <AuditField
                    label="Created By"
                    value={firstTimelineEntry?.changed_by_name || '—'}
                  />

                  <AuditField
                    label="Role"
                    value={firstTimelineEntry?.changed_by_role || '—'}
                  />

                  <AuditField
                    label="Created At"
                    value={
                      firstTimelineEntry?.changed_at
                        ? new Date(firstTimelineEntry.changed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                        : '—'
                    }
                  />

                  <AuditField
                    label="Version"
                    value={`v${firstTimelineEntry?.version_number || medicalRecord.version || 1}`}
                  />

                </div>

              </div>

            </div>

          </div>
        )}

        {/* CLINICAL DATA - VITALS */}
        {activeTab === 'clinical' && !printMode && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 print:rounded-none print:border-0 print:shadow-none">

            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Vital Signs & Measurements
            </h2>

            {hasVitals ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {medicalRecord.blood_pressure && (
                  <MeasurementCard
                    label="Blood Pressure"
                    value={medicalRecord.blood_pressure}
                    unit="mmHg"
                  />
                )}

                {medicalRecord.pulse_rate && (
                  <MeasurementCard
                    label="Pulse Rate"
                    value={medicalRecord.pulse_rate}
                    unit="bpm"
                  />
                )}

                {medicalRecord.temperature_c && (
                  <MeasurementCard
                    label="Temperature"
                    value={medicalRecord.temperature_c}
                    unit="°C"
                  />
                )}

                {medicalRecord.spo2_percent && (
                  <MeasurementCard
                    label="SPO2"
                    value={medicalRecord.spo2_percent}
                    unit="%"
                  />
                )}

              </div>
            ) : (
              <p className="text-center text-slate-500 italic py-12">
                No vital signs recorded for this record.
              </p>
            )}

          </div>
        )}

        {/* TIMELINE */}
        {activeTab === 'timeline' && !printMode && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 print:rounded-none print:border-0 print:shadow-none">

            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Record Timeline
            </h2>

            {timeline.length === 0 ? (
              <p className="text-center text-slate-500 italic py-12">
                No timeline history available for this record.
              </p>
            ) : (
              <div className="relative pl-6">

                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />

                <div className="space-y-4">

                  {
                    timeline.map((item, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white relative"
                      >

                        <div className="absolute -left-8 top-6 w-5 h-5 rounded-full bg-white border-2 border-blue-500" />

                        <div className="flex gap-4">

                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">

                            <Clock3 size={18} />

                          </div>

                          <div className="flex-1">

                            <div className="flex items-center justify-between mb-2">

                              <h3 className="font-semibold text-slate-900">
                                {item.event_type || 'Record Updated'}
                              </h3>

                              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">
                                v{item.version_number || 1}
                              </span>

                            </div>

                            <p className="text-sm text-slate-600 mb-2">
                              Modified by <span className="font-medium">{item.changed_by_name || 'Unknown'}</span>
                              {item.changed_by_role && ` (${item.changed_by_role})`}
                            </p>

                            <p className="text-xs text-slate-400">

                              {
                                item.changed_at
                                  ? new Date(item.changed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                                  : '—'
                              }

                            </p>

                          </div>

                        </div>

                      </div>
                    ))
                  }

                </div>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  )
}

function MetaCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-4 py-4 print:bg-slate-100 print:border-slate-300">

      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 print:text-slate-600">
        {label}
      </p>

      <p className="text-white print:text-slate-900 font-semibold mt-2 break-words text-sm">
        {value}
      </p>

    </div>
  )
}

function InfoBlock({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-3">
        {label}
      </p>

      <p className={`text-slate-900 leading-relaxed whitespace-pre-wrap ${!value ? 'text-slate-500 italic' : ''}`}>
        {value || 'No information available'}
      </p>

    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:shadow-md transition-shadow">

      <div className="flex items-center gap-2 text-slate-500 mb-2">
        {icon}
        <p className="text-xs uppercase tracking-wide font-semibold">
          {label}
        </p>
      </div>

      <p className="text-sm font-semibold text-slate-900 break-words">
        {value}
      </p>

    </div>
  )
}

function MeasurementCard({
  label,
  value,
  unit,
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-4 bg-gradient-to-b from-white to-slate-50 hover:shadow-md transition-shadow">

      <p className="text-xs text-slate-500 font-medium mb-2">
        {label}
      </p>

      <div className="flex items-end gap-2">

        <p className="text-2xl font-bold text-slate-900">
          {value}
        </p>

        {unit && (
          <p className="text-xs text-slate-500 font-medium mb-1">
            {unit}
          </p>
        )}

      </div>

    </div>
  )
}

function AuditField({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-xs text-slate-500 font-medium mb-1">
        {label}
      </p>

      <p className="text-sm text-slate-900 break-all">
        {value}
      </p>

    </div>
  )
}