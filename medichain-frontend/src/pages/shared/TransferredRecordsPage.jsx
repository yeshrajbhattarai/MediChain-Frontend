import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Activity, FlaskConical, Eye, Search } from 'lucide-react'

import {
  readTransfer,
  writeRecord,
  resolveRole,
  formatLabel,
  fmtDate,
  getRecordMeta,
  extractDiagnosis,
} from './transferUtils'

// ─── Tiny shared components ───────────────────────────────────────────────────

function Pill({ children, variant = 'default' }) {
  const cls = {
    default:  'bg-gray-100 text-gray-600',
    blue:     'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    teal:     'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
    verified: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  }[variant] || 'bg-gray-100 text-gray-600'

  return (
    <span className={`inline-flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium ${cls}`}>
      {children}
    </span>
  )
}

function FilterTab({ value, active, onClick, children }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Record card ──────────────────────────────────────────────────────────────

function RecordCard({ record, ownerHospital, onView }) {
  const meta      = getRecordMeta(record)
  const diagnosis = extractDiagnosis(record)

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 hover:border-blue-200 hover:shadow-sm transition-all duration-150">

      {/* Top row: icon + title + version badge */}
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              meta.color === 'blue'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-teal-50 text-teal-600'
            }`}
          >
            {meta.color === 'blue'
              ? <Activity size={16} />
              : <FlaskConical size={16} />
            }
          </div>

          <div className="min-w-0">
            <p className="text-sm md:text-base font-semibold text-gray-900 truncate">{meta.title}</p>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">{ownerHospital}</p>
          </div>
        </div>

        <Pill variant={meta.color === 'blue' ? 'blue' : 'teal'}>
          v{record.version}
        </Pill>

      </div>

      {/* Middle row: date + diagnosis snippet */}
      <div className="mt-3 md:mt-4 space-y-1">
        <p className="text-xs md:text-sm text-gray-400">
          {fmtDate(record.created_at)}
          {record.lab?.lab_type && (
            <span className="ml-2 text-gray-300">·</span>
          )}
          {record.lab?.lab_type && (
            <span className="ml-2 text-gray-500 uppercase tracking-wide" style={{ fontSize: '10px' }}>
              {record.lab.lab_type}
            </span>
          )}
        </p>
        {diagnosis && (
          <p className="text-xs md:text-sm text-gray-500 truncate">
            <span className="text-gray-400">Diagnosis:</span> {diagnosis}
          </p>
        )}
      </div>

      {/* Bottom row: integrity badge + view button */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
        <Pill variant="verified">
          <ShieldCheck size={11} />
          Integrity verified
        </Pill>

        <button
          onClick={onView}
          className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Eye size={12} />
          View report
        </button>
      </div>

    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransferredRecordsPage() {
  const navigate    = useNavigate()
  const { consentId } = useParams()
  const role        = resolveRole()

  const transferData = readTransfer(consentId)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const records = transferData?.records || []

  // Extract hospital name from transfer data (same for all records)
  const ownerHospital = transferData?.owner_hospital || '—'

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase()
    return records.filter(r => {
      const okType = filter === 'all' || r.record_type === filter
      if (!okType) return false
      if (!q) return true

      const diagnosis = extractDiagnosis(r) || ''
      const labName   = r.lab?.lab_name || ''
      const labType   = r.lab?.lab_type || ''
      const recType   = r.record_type   || ''
      return (
        diagnosis.toLowerCase().includes(q) ||
        labName.toLowerCase().includes(q)   ||
        labType.toLowerCase().includes(q)   ||
        recType.toLowerCase().includes(q)
      )
    })
  }, [records, filter, search])

  function openRecord(record) {
    writeRecord(record.record_id, record)
    navigate(`/${role}/transfers/${consentId}/record/${record.record_id}`)
  }

  if (!transferData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-sm w-full">
          <p className="text-3xl mb-3">📭</p>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-1">Transfer not found</h2>
          <p className="text-sm md:text-base text-gray-400 mb-5">
            This session may have expired. Return to consent and try again.
          </p>
          <button
            onClick={() => navigate(`/${role}/consent`)}
            className="px-4 py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to consent
          </button>
        </div>
      </div>
    )
  }

  const labCount     = records.filter(r => r.record_type === 'lab').length
  const medicalCount = records.filter(r => r.record_type === 'medical').length

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-5 md:space-y-6">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/${role}/consent`)}
            className="flex items-center gap-1.5 text-sm md:text-base text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={15} />
            Consent
          </button>
        </div>

        {/* ── Page header card ── */}
        <div className="bg-white border border-gray-100 rounded-xl px-5 md:px-6 py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">

            <div>
              <h1 className="text-base md:text-lg font-semibold text-gray-900">Transferred records</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-gray-500">
                <span>
                  Patient: <span className="font-medium text-gray-700">{transferData.patient_name || '—'}</span>
                </span>
                <span className="text-gray-300">·</span>
                <span>
                  From: <span className="font-medium text-gray-700">{ownerHospital}</span>
                </span>
                <span className="text-gray-300">·</span>
                <span>
                  {transferData.total_records} record{transferData.total_records !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <Pill variant="verified">
              <ShieldCheck size={12} />
              Bundle integrity verified
            </Pill>

          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">

          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-2 md:py-2.5 text-sm md:text-base border border-gray-200 rounded-lg outline-none
                         focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white transition-colors"
              placeholder="Search records…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5 flex-shrink-0 overflow-x-auto">
            <FilterTab value="all"     active={filter === 'all'}     onClick={setFilter}>
              All ({records.length})
            </FilterTab>
            <FilterTab value="medical" active={filter === 'medical'} onClick={setFilter}>
              Medical ({medicalCount})
            </FilterTab>
            <FilterTab value="lab"     active={filter === 'lab'}     onClick={setFilter}>
              Lab ({labCount})
            </FilterTab>
          </div>

        </div>

        {/* ── Cards ── */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 md:py-20 text-gray-400">
            <p className="text-3xl md:text-4xl mb-3">🔍</p>
            <p className="text-sm md:text-base font-medium text-gray-600">
              {search || filter !== 'all' ? 'No records match your filters.' : 'No records in this transfer.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {filteredRecords.map(record => (
              <RecordCard
                key={record.record_id}
                record={record}
                ownerHospital={ownerHospital}
                onView={() => openRecord(record)}
              />
            ))}
          </div>
        )}

        {filteredRecords.length > 0 && (
          <p className="text-xs md:text-sm text-gray-400 text-right">
            Showing {filteredRecords.length} of {records.length} records
          </p>
        )}

      </div>
    </div>
  )
}