// src/pages/doctor/DoctorReportViewer.jsx
// Route: /doctor/patients/:patientId/reports/:reportId
// Dedicated page for viewing and analyzing both medical records and lab reports

import { useState, useEffect } from 'react'
import CKDPredictionModal from './CKDPredictionModal'
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  FlaskConical,
  CalendarDays,
  User,
  Microscope,
  BrainCircuit,
  ChevronLeft,
  Clock3,
  FileText,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  FileClock,
} from 'lucide-react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchWithAuth } from '../../api/client'
import { requestCkdPrediction } from '../../api/doctor'

const api = (url, opts = {}) => fetchWithAuth(`/api/v1${url}`, {
  ...opts,
  headers: { 'Content-Type': 'application/json', ...opts.headers },
})

function getValueStatus(value) {
  const num = parseFloat(value)

  if (isNaN(num)) {
    return {
      label: 'Unavailable',
      color: 'bg-gray-100 text-gray-500 border-gray-200',
    }
  }

  if (num < 50) {
    return {
      label: 'Low',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    }
  }

  if (num > 140) {
    return {
      label: 'High',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    }
  }

  return {
    label: 'Normal',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
}

const S = {
  normal:  { badge: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',    label: 'Normal' },
  low:     { badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',    label: 'Low'    },
  high:    { badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',    label: 'High'   },
  unknown: { badge: 'bg-gray-100 text-gray-400',                        label: '—'      },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function MedicalRecordViewer({
  record,
  integrity,
}) {
const navigate = useNavigate()
const { patientId } = useParams()

  return (
    <div className="space-y-6">



      {/* HERO */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-slate-800 shadow-2xl">

          {/* subtle glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_35%)]" />

          <div className="relative p-5 md:p-8">

            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">

              {/* LEFT */}
              <div className="flex flex-col gap-6 flex-1">

                {/* title row */}
                <div className="flex items-start gap-4">

                  <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <ClipboardList className="text-emerald-300" size={28} />
                  </div>

                  <div className="min-w-0">

                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                      Medical Record
                    </h1>

                    <p className="text-sm md:text-base text-slate-300 mt-2 break-all">
                      Record ID: {record.finalized_record_id || record.id}
                    </p>

                  </div>

                </div>

                {/* patient metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                  {[
                    ['Patient', record.patient?.full_name],
                    ['Doctor', record.doctor?.full_name || '—'],
                    ['Nurse', record.picked_by?.full_name || '—'],
                    [
                      'Finalized',
                      record.created_at
                        ? new Date(record.created_at).toLocaleString()
                        : '—',
                    ],
                  ].map(([label, value]) => (

                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-4 py-4"
                    >

                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        {label}
                      </p>

                      <p className="text-white font-semibold mt-2 text-sm md:text-base break-words">
                        {value}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

              {/* RIGHT */}
              <div className="flex xl:flex-col items-start xl:items-end gap-3">

                <div className="px-4 py-2 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-100 text-sm font-medium">
                  Version {record.version || 1}
                </div>

                <div
                  className={`px-5 py-3 rounded-full border text-sm font-semibold flex items-center gap-2 ${
                    record?.integrity?.verified
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-300 border-red-500/20'
                  }`}
                >
                  {
                    record?.integrity?.verified
                      ? <ShieldCheck size={18} />
                      : <ShieldAlert size={18} />
                  }

                  {
                    record?.integrity?.verified
                      ? 'Integrity Verified'
                      : 'Integrity Unverified'
                  }
                </div>

              </div>

            </div>

          </div>

        </div>

      {/* CLINICAL OVERVIEW */}
      <div className="grid grid-cols-1 2xl:grid-cols-[1.2fr_1fr] gap-6">

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-emerald-600" />
            <h2 className="text-xl md:text-xl md:text-2xl font-bold text-gray-900">
              Clinical Summary
            </h2>
          </div>

          <div className="space-y-6">

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                Diagnosis
              </p>

              <p className="text-gray-900 leading-relaxed">
                {record.primary_diagnosis || 'No diagnosis'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                Treatment Plan
              </p>

              <p className="text-gray-900 leading-relaxed">
                {record.treatment_given || 'No treatment plan'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                Nurse Observation
              </p>

              <p className="text-gray-900 leading-relaxed">
                {record.nurse_observation || 'No observations'}
              </p>
            </div>

          </div>
        </div>

        {/* VITALS */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-6">
            <HeartPulse className="text-rose-500" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Vitals
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">

            {[
              ['Blood Pressure', record.blood_pressure],
              ['Pulse', record.pulse_rate],
              ['Temperature', record.temperature_c],
              ['SpO2', record.spo2_percent],
              ['Blood Sugar', record.random_blood_sugar],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-slate-50 p-5"
              >
                <p className="text-sm text-gray-500">
                  {label}
                </p>

                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
                  {value || '—'}
                </p>
              </div>
            ))}

          </div>
        </div>

      </div>

      {/* TIMELINE */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

        <div className="flex items-center gap-3 mb-6">
          <FileClock className="text-violet-600" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Workflow Timeline
          </h2>
        </div>

        <div className="relative space-y-6 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-20px)] before:w-px before:bg-gray-200">

          <div className="flex gap-4">
            <div className="relative z-10 relative z-10 w-3 h-3 rounded-full ring-4 ring-white ring-4 ring-white bg-blue-500 mt-2" />
            <div>
              <p className="font-semibold text-gray-900">
                Doctor created medical workflow
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative z-10 w-3 h-3 rounded-full ring-4 ring-white bg-amber-500 mt-2" />
            <div>
              <p className="font-semibold text-gray-900">
                Nurse completed assessment
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative z-10 w-3 h-3 rounded-full ring-4 ring-white bg-emerald-500 mt-2" />
            <div>
              <p className="font-semibold text-gray-900">
                Doctor finalized record
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative z-10 w-3 h-3 rounded-full ring-4 ring-white bg-violet-500 mt-2" />
            <div>
              <p className="font-semibold text-gray-900">
                Blockchain integrity verified
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

// ── LAB REPORT VIEWER ─────────────────────────────────────────────────────────

function LabReportViewer({ record, onPredict }) {
  if (!record) return null

  const [tab, setTab] = useState('overview')
  const audit = record.audit || {}
  const schema = record?.lab_request?.lab?.custom_field_schema || []

  const integrityVerified =
  record?.integrity?.verified ||
  false
  
return (
  <div className="space-y-6">

    {/* HERO */}
    <div className="rounded-3xl overflow-hidden border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">

      <div className="p-7">

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          <div className="space-y-4">

            <div className="flex items-center gap-3 flex-wrap">

              <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                <FlaskConical className="w-7 h-7 text-teal-300" />
              </div>

              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-white">
                  {record.lab_name || 'Lab Report'}
                </h1>

                <p className="text-slate-400 text-sm mt-1">
                  Record ID: {record.record_id}
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Patient
                </p>
                <p className="text-white font-medium">
                  {record.lab_request?.patient_name || '—'}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Technician
                </p>
                <p className="text-white font-medium">
                  {record.audit?.created_by_name || '—'}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Recorded
                </p>
                <p className="text-white font-medium">
                  {
                    record.audit?.created_at
                      ? new Date(record.audit?.created_at).toLocaleString('en-IN')
                      : '—'
                  }
                </p>
              </div>

            </div>

          </div>

          <div className="flex flex-col gap-3 items-start lg:items-end">

            <div className="px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs font-medium">
              Version {record.version || 1}
            </div>

            <div className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${
              integrityVerified
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}>
              {
                integrityVerified
                  ? <ShieldCheck className="w-4 h-4" />
                  : <ShieldAlert className="w-4 h-4" />
              }

              {
                integrityVerified
                  ? 'Integrity Verified'
                  : 'Integrity Unverified'
              }
            </div>

          </div>

        </div>

      </div>

    </div>

    {/* TABS */}

    <div className="flex flex-wrap gap-2">

      {[
        ['overview', 'Overview'],
        ['clinical', 'Clinical Data'],
        ['audit', 'Audit Timeline'],
        ['integrity', 'Integrity'],
      ].map(([key, label]) => (

        <button
          key={key}
          onClick={() => setTab(key)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === key
              ? 'bg-teal-600 text-white shadow-lg'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {label}
        </button>

      ))}

    </div>

    {/* OVERVIEW */}

    {tab === 'overview' && (

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-slate-900">
              Diagnosis & Notes
            </h3>
          </div>

          <div className="relative space-y-6 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-20px)] before:w-px before:bg-gray-200">

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Diagnosis
              </p>
              <p className="text-sm text-slate-800">
                {record.lab_request?.diagnosis || 'No diagnosis available'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Treatment Plan
              </p>
              <p className="text-sm text-slate-800">
                {record.lab_request?.treatment_plan || 'No treatment plan'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Notes
              </p>
              <p className="text-sm text-slate-800">
                {record.lab_request?.notes || 'No notes'}
              </p>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-slate-900">
              Report Metadata
            </h3>
          </div>

          <div className="relative space-y-6 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-20px)] before:w-px before:bg-gray-200">

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">
                Requested By
              </span>

              <span className="font-medium text-slate-800 text-sm">
                {record.lab_request?.doctor_name || '—'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">
                Technician
              </span>

              <span className="font-medium text-slate-800 text-sm">
                {record.audit?.created_by_name || '—'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">
                Updated At
              </span>

              <span className="font-medium text-slate-800 text-sm">
                {
                  record.audit?.latest_updated_at || record.audit?.created_at
                    ? new Date(record.audit?.latest_updated_at || record.audit?.created_at).toLocaleString('en-IN')
                    : '—'
                }
              </span>
            </div>

          </div>

        </div>

      </div>

    )}

    {/* CLINICAL */}

    {tab === 'clinical' && (

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {schema.map(field => {

      const timelines = [...(record.timeline || [])]
        .sort((a, b) => a.version_number - b.version_number)

      let value = null

      for (const versionItem of timelines) {

        if (versionItem.version_number > record.version) {
          break
        }

        const snapshot = versionItem.data_snapshot || []

        const matched = snapshot.find(
          item =>
            item.label?.toLowerCase() === field.label?.toLowerCase()
        )

        if (matched) {

          if (matched.current_value !== undefined && matched.current_value !== null) {
            value = matched.current_value
          }

          else if (matched.value !== undefined && matched.value !== null) {
            value = matched.value
          }
        }
      }

          const status = getValueStatus(value)

          return (

            <div
              key={field.key}
              className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
            >

              <div className="flex items-start justify-between mb-5">

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                    {field.type || 'Clinical Field'}
                  </p>

                  <h3 className="font-semibold text-slate-900">
                    {field.label}
                  </h3>
                </div>

                <div className={`px-2 py-1 rounded-full border text-xs font-medium ${status.color}`}>
                  {status.label}
                </div>

              </div>

              <div className="flex items-end justify-between">

                <div className="text-3xl font-bold text-slate-900">
                  {value || '—'}
                </div>

                <div className="text-sm text-gray-400">
                  {field.unit || ''}
                </div>

              </div>

            </div>

          )
        })}

      </div>

    )}

    {/* AUDIT */}

    {tab === 'audit' && (

      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

        <h3 className="text-lg font-semibold text-slate-900 mb-8">
          Audit Timeline
        </h3>

        <div className="space-y-8">

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-blue-600" />
            </div>

            <div>
              <h4 className="font-medium text-slate-900">
                Record Created
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                {
                  record.audit?.created_at
                    ? new Date(record.audit?.created_at).toLocaleString('en-IN')
                    : '—'
                }
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-violet-600" />
            </div>

            <div>
              <h4 className="font-medium text-slate-900">
                Last Updated
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                {
                  record.updated_at
                    ? new Date(record.updated_at).toLocaleString('en-IN')
                    : '—'
                }
              </p>
            </div>
          </div>

        </div>

      </div>

    )}

    {/* INTEGRITY */}

    {tab === 'integrity' && (

      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

        <div className="flex items-center gap-3 mb-6">

          {
            integrityVerified
              ? <ShieldCheck className="w-7 h-7 text-emerald-600" />
              : <ShieldAlert className="w-7 h-7 text-rose-600" />
          }

          <div>
            <h3 className="font-semibold text-slate-900">
              Blockchain Integrity Verification
            </h3>

            <p className="text-sm text-gray-500">
              SHA-256 decentralized verification
            </p>
          </div>

        </div>

        <div className="rounded-2xl bg-slate-900 p-5 border border-slate-700">

          <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
            SHA-256 Hash
          </p>

          <code className="text-emerald-300 text-xs break-all font-mono">
            {record?.integrity?.computed || 'Hash unavailable'}
          </code>

        </div>

      </div>

    )}

    {/* AI PANEL */}

    <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-6 shadow-2xl">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <div className="flex items-center gap-3 mb-3">
            <BrainCircuit className="w-7 h-7 text-violet-200" />

            <h3 className="text-xl font-semibold text-white">
              CKD AI Prediction
            </h3>
          </div>

          <p className="text-violet-100 text-sm max-w-xl">
            Run machine learning analysis using this laboratory dataset
            to evaluate chronic kidney disease probability and severity.
          </p>

        </div>

        <button
          onClick={onPredict}
          className="px-6 py-3 rounded-2xl bg-white text-violet-700 font-semibold hover:bg-violet-50 transition-all shadow-xl"
        >
          Run AI Analysis
        </button>

      </div>

    </div>

  </div>
)
}


// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function DoctorReportViewer() {
  const { patientId, reportId, type } = useParams()
  const navigate = useNavigate()

  const [record, setRecord] = useState(null)
  const [recordType, setRecordType] = useState(null) // 'medical' | 'lab'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [integrity, setIntegrity] = useState(null)
  const [integrityLoading, setIntegrityLoading] = useState(false)

  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)

  useEffect(() => {
    loadRecord()
  }, [reportId])

  async function loadRecord() {
  setLoading(true)
  setError('')
  setRecord(null)

  try {
    // ========================
// MEDICAL RECORD
// ========================

if (type === 'medical') {

  const res = await api(`/staff/doctor/medical-records/`)

  if (!res.ok) {
    setError('Medical record not found')
    return
  }

  const data = await res.json()

  const records = data.records || data

  const found = records.find(
  r =>
    r.finalized_record_id === reportId ||
    r.id === reportId
)

  if (!found) {
    setError('Medical record not found')
    return
  }


setRecord({
  ...found,
  integrity: {
    verified: found.doctor_finalized || false,
  },
})

setRecordType('medical')
}

    // ========================
    // LAB REPORT
    // ========================

    if (type === 'lab') {

      const res = await api(`/staff/records/${reportId}/`)

      if (!res.ok) {
        setError('Lab report not found')
        return
      }

      const data = await res.json()

      setRecord(data)
      setRecordType('lab')
      try {
        const integrityRes = await api(`/staff/records/${reportId}/integrity/`)

        if (integrityRes.ok) {
          const integrityData = await integrityRes.json()

          setRecord(prev => ({
            ...prev,
            integrity: integrityData.integrity || integrityData,
          }))
        }
      } catch (e) {
        console.error('Lab integrity failed', e)
}
    }

  } catch (e) {
    setError(e.message || 'Failed to load report')
  } finally {
    setLoading(false)
  }
}

  async function loadIntegrity(finalized_id) {
    setIntegrityLoading(true)
    try {
      const data = await getMedicalRecordIntegrity(finalized_id)
      setIntegrity(data)
    } catch (e) {
      console.error('Integrity check failed:', e)
    } finally {
      setIntegrityLoading(false)
    }
  }

  async function runPrediction() {
    if (!record?.record_id) return
    setPredicting(true)
    try {
      const data = await requestCkdPrediction(patientId, record.record_id)
      setPrediction(data)
    } catch (e) {
      setError(e.message || 'Prediction failed')
    } finally {
      setPredicting(false)
    }
  }

  if (loading) return <Spinner />

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold text-gray-900 mb-2">Error</p>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate(`/doctor/patients/${patientId}`)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Back to Patient
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb and back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <button onClick={() => navigate('/doctor/patients')} className="hover:text-teal-600">My Patients</button>
          <span>/</span>
          <button onClick={() => navigate(`/doctor/patients/${patientId}`)} className="hover:text-teal-600">
            {
              record?.patient?.full_name ||
              record?.lab_request?.patient_name ||
              'Patient'
            }
          </button>
          <span>/</span>
          <span className="text-gray-700 font-medium">Report</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Report content */}
      {recordType === 'medical' && (
        <MedicalRecordViewer
          record={record}
          integrity={integrity}
          integrityLoading={integrityLoading}
          onPredict={runPrediction}
        />
      )}

      {recordType === 'lab' && (
        <LabReportViewer
          record={record}
          onPredict={runPrediction}
        />
      )}

      {/* Prediction Modal */}
    <CKDPredictionModal
      prediction={prediction}
      isLoading={predicting}
      onClose={() => setPrediction(null)}
    />
    </div>
  )
}