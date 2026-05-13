// src/pages/nurse/Records.jsx

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  FileText,
  AlertCircle,
  Loader,
  X,
  ArrowUpRight,
  CalendarDays,
  Printer,
  Activity,
  Thermometer,
  Heart,
  Wind,
  ChevronRight,
  Building2,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { getNurseMedicalRecords } from '../../api/nurse'

// ── Vital card ─────────────────────────────────────────────────────────────────
function VitalCard({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
      <div className="flex items-center gap-1.5 text-gray-400">
        <Icon size={13} />
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-base font-semibold text-gray-800">{value || '—'}</p>
    </div>
  )
}

// ── Field block ────────────────────────────────────────────────────────────────
function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
        {value || '—'}
      </p>
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function Badge({ children, variant = 'green' }) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    teal:  'bg-teal-50 text-teal-700 border-teal-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Records() {
  const [records, setRecords]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => { loadRecords() }, [])

  async function loadRecords() {
    try {
      setLoading(true)
      setError('')
      const data = await getNurseMedicalRecords()
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load records')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return records.filter(r =>
      r?.patient?.full_name?.toLowerCase().includes(q) ||
      r?.primary_diagnosis?.toLowerCase().includes(q) ||
      r?.title?.toLowerCase().includes(q)
    )
  }, [records, search])

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <PageHeader
        title="Finalized records"
        subtitle="View completed nursing assessments and patient summaries"
        breadcrumbs={[
          { label: 'Nurse portal', href: '/nurse/dashboard' },
          { label: 'Records' },
        ]}
      />

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={loadRecords}
              className="text-xs text-red-600 hover:text-red-700 font-medium mt-1.5"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Search ── */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient, diagnosis or record title…"
          className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 placeholder:text-gray-400 transition"
        />
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader size={22} className="text-emerald-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading records…</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white border border-gray-100 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <FileText size={20} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {search ? 'No records found' : 'No finalized records yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'Try different keywords' : 'Completed records will appear here'}
            </p>
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(record => (
            <button
              key={record.id}
              onClick={() => setSelectedRecord(record)}
              className="
                group text-left bg-white border border-gray-200
                rounded-2xl p-5 hover:border-gray-300
                hover:shadow-sm transition-all duration-150
              "
            >
              {/* top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {record?.patient?.full_name || 'Unknown patient'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {record?.title || 'Medical record'}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <FileText size={16} className="text-emerald-600" />
                </div>
              </div>

              {/* diagnosis */}
              <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                {record?.primary_diagnosis || 'No diagnosis recorded'}
              </p>

              {/* footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="green">Completed</Badge>
                  {record?.doctor_finalized && <Badge variant="blue">Finalized</Badge>}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-emerald-600 transition-colors">
                  <CalendarDays size={12} />
                  <span>
                    {record?.created_at
                      ? new Date(record.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >

            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant="green">Completed</Badge>
                  {selectedRecord?.doctor_finalized && <Badge variant="blue">Finalized</Badge>}
                </div>
                <h2 className="text-base font-semibold text-gray-900 truncate">
                  {selectedRecord?.title || 'Medical record'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedRecord?.patient?.full_name || 'Unknown patient'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                >
                  <Printer size={13} />
                  Print
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
                >
                  <X size={15} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

              {/* Vitals */}
              <div className="grid grid-cols-4 gap-2">
                <VitalCard icon={Activity}     label="BP"    value={selectedRecord?.blood_pressure} />
                <VitalCard icon={Heart}        label="Pulse" value={selectedRecord?.pulse_rate ? `${selectedRecord.pulse_rate} bpm` : null} />
                <VitalCard icon={Thermometer}  label="Temp"  value={selectedRecord?.temperature_c ? `${selectedRecord.temperature_c}°C` : null} />
                <VitalCard icon={Wind}         label="SpO2"  value={selectedRecord?.spo2_percent ? `${selectedRecord.spo2_percent}%` : null} />
              </div>

              {/* Clinical summary */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Clinical summary</p>
                  <p className="text-xs text-gray-400 mt-0.5">Nursing observations and treatment overview</p>
                </div>
                <div className="px-5 py-4 flex flex-col gap-4">
                  <Field label="Diagnosis"        value={selectedRecord?.primary_diagnosis} />
                  <Field label="Nurse observation" value={selectedRecord?.nurse_observation} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Treatment given" value={selectedRecord?.treatment_given} />
                    <Field label="Medications"     value={selectedRecord?.medications_administered} />
                  </div>
                  <Field label="Follow-up notes"  value={selectedRecord?.follow_up_notes} />
                </div>
              </div>

              {/* Timestamp */}
              <p className="text-[11px] text-gray-400 text-right">
                {selectedRecord?.created_at
                  ? `Record created: ${new Date(selectedRecord.created_at).toLocaleString('en-IN')}`
                  : ''}
              </p>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}