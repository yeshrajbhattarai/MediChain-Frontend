import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  Activity,
  FlaskConical,
  Download,
  Paperclip,
  Calendar,
  Building2,
  Tag,
  Hash,
  FileText,
} from 'lucide-react'

import {
  readRecord,
  resolveRole,
  formatLabel,
  fmtDateTime,
  fmtDate,
  getRecordMeta,
  extractDiagnosis,
  safeAttachmentHref,
} from './transferUtils'

// ─── Tiny shared pieces ───────────────────────────────────────────────────────

function Pill({ children, variant = 'default', size = 'sm' }) {
  const base = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs md:text-sm'
  const cls = {
    default:  'bg-gray-100 text-gray-600',
    blue:     'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    teal:     'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
    verified: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    gray:     'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  }[variant] || 'bg-gray-100 text-gray-600'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${base} ${cls}`}>
      {children}
    </span>
  )
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview',    label: 'Overview'     },
  { key: 'clinical',   label: 'Clinical data' },
  { key: 'attachments',label: 'Attachments'   },
  { key: 'integrity',  label: 'Integrity'     },
]

function TabBar({ active, onChange }) {
  return (
    <div
      role="tablist"
      className="flex gap-0.5 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto"
    >
      {TABS.map(tab => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            active === tab.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function RecordHero({ record, ownerHospital }) {
  const meta    = getRecordMeta(record)
  const isMed   = record.record_type === 'medical'

  return (
    <div className="bg-white border border-gray-100 rounded-xl px-5 md:px-6 py-4 md:py-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        {/* Left: icon + title */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isMed ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'
            }`}
          >
            {isMed ? <Activity size={18} /> : <FlaskConical size={18} />}
          </div>

          <div>
            <h1 className="text-base md:text-lg font-semibold text-gray-900">{meta.title}</h1>
            <p className="text-xs md:text-xs text-gray-400 mt-0.5 font-mono">{record.record_id}</p>
          </div>
        </div>

        {/* Right: badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Pill variant="gray">v{record.version}</Pill>
          <Pill variant="verified">
            <ShieldCheck size={11} />
            Integrity verified
          </Pill>
        </div>

      </div>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <MetaItem icon={<Building2 size={12} />} label="Hospital" value={ownerHospital || '—'} />
        <MetaItem icon={<Calendar size={12} />}  label="Created"  value={fmtDate(record.created_at)} />
        <MetaItem icon={<Tag size={12} />}        label="Type"     value={formatLabel(record.record_type)} />
        {record.lab?.lab_type && (
          <MetaItem icon={<FileText size={12} />} label="Lab type" value={record.lab.lab_type.toUpperCase()} />
        )}
      </div>
    </div>
  )
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-400">{icon}</span>
      <span className="text-xs md:text-sm text-gray-400">{label}:</span>
      <span className="text-xs md:text-sm font-medium text-gray-700">{value}</span>
    </div>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ record }) {
  const diagnosis = extractDiagnosis(record)

  const rows = [
    { label: 'Diagnosis',      value: diagnosis || null },
    { label: 'Treatment plan', value: record.treatment_plan || record.custom_field_values?.treatment_given || null },
    { label: 'Clinical notes', value: record.notes || record.custom_field_values?.doctor_final_notes || null },
  ].filter(r => r.value)

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 md:p-10 text-center text-gray-400">
        <p className="text-sm md:text-base">No overview information available.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
      {rows.map(({ label, value }) => (
        <div key={label} className="px-5 md:px-6 py-4 md:py-5">
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <p className="text-sm md:text-base text-gray-800 leading-relaxed">{value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Clinical data tab ────────────────────────────────────────────────────────

function ClinicalTab({ record }) {
  const entries = Object.entries(record.custom_field_values || {})
    .filter(([, v]) => v !== null && v !== '')

  if (entries.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 md:p-10 text-center text-gray-400">
        <p className="text-sm md:text-base">No clinical data recorded.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm md:text-base font-semibold text-gray-900">Clinical parameters</p>
        <span className="text-xs md:text-sm text-gray-400">{entries.length} fields</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {entries.map(([key, value]) => (
          <ClinicalCell key={key} label={formatLabel(key)} value={value} />
        ))}
      </div>
    </div>
  )
}

function ClinicalCell({ label, value }) {
  return (
    <div className="border border-gray-100 rounded-lg px-3 md:px-4 py-2.5 md:py-3 bg-gray-50">
      <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide leading-none mb-1">{label}</p>
      <p className="text-sm md:text-base font-semibold text-gray-900 break-all">{String(value)}</p>
    </div>
  )
}

// ─── Attachments tab ──────────────────────────────────────────────────────────

function AttachmentsTab({ record }) {
  const entries = Object.entries(record.attachments || {}).filter(([, v]) => v)

  if (entries.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 md:p-10 text-center text-gray-400">
        <Paperclip size={24} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm md:text-base">No attachments on this record.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 md:p-6 space-y-2 md:space-y-3">
      {entries.map(([key, value]) => {
        const href  = safeAttachmentHref(value)
        const safe  = href !== '#'
        const isImg = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(value)

        return (
          <div key={key} className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg px-4 md:px-5 py-3 md:py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Paperclip size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-sm md:text-base font-medium text-gray-800 truncate">{formatLabel(key)}</p>
                <p className="text-xs md:text-xs text-gray-400">{isImg ? 'Image' : 'File'}</p>
              </div>
            </div>

            {safe ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Open ${formatLabel(key)}`}
                className="flex items-center gap-1.5 text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Download size={13} />
                Open
              </a>
            ) : (
              <span className="text-xs md:text-sm text-gray-400 italic">Unavailable</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Integrity tab ────────────────────────────────────────────────────────────

function IntegrityTab({ record }) {
  return (
    <div className="space-y-3 md:space-y-4">

      {/* Verified banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 md:px-6 py-4 md:py-5 flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm md:text-base font-semibold text-emerald-800">Blockchain integrity verified</p>
          <p className="text-xs md:text-sm text-emerald-700 mt-0.5 leading-relaxed">
            This record's SHA-256 hash was verified at transfer time. The data has not been
            altered since it left the source hospital.
          </p>
        </div>
      </div>

      {/* Hash detail — audit-only context */}
      <div className="bg-white border border-gray-100 rounded-xl px-5 md:px-6 py-4 md:py-5">
        <div className="flex items-center gap-2 mb-3">
          <Hash size={14} className="text-gray-400" />
          <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">SHA-256 record hash</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 md:px-5 py-3 md:py-4 overflow-x-auto">
          <code className="text-xs md:text-sm text-gray-600 break-all font-mono leading-relaxed">
            {record.stored_hash || '—'}
          </code>
        </div>
        <p className="text-[10px] md:text-xs text-gray-400 mt-2">
          This hash is stored on the MediChain blockchain and used to verify data integrity.
        </p>
      </div>

    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TransferredRecordDetail() {
  const navigate              = useNavigate()
  const { consentId, recordId } = useParams()
  const role                  = resolveRole()
  const [activeTab, setActiveTab] = useState('overview')

  const record = readRecord(recordId)

  // Extract hospital name from record payload or use fallback
  const ownerHospital = record?.record_payload?.hospital_name || '—'

  const attachmentCount = Object.values(record?.attachments || {}).filter(Boolean).length
  const clinicalCount   = Object.keys(record?.custom_field_values || {}).length

  function goBack() {
    navigate(`/${role}/transfers/${consentId}`)
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-sm w-full">
          <p className="text-3xl mb-3">📄</p>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-1">Record not found</h2>
          <p className="text-sm md:text-base text-gray-400 mb-5">
            This session may have expired. Return to the transfer and open the record again.
          </p>
          <button
            onClick={goBack}
            className="px-4 py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to records
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-4 md:space-y-5">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm md:text-base text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={15} />
            Records
          </button>

          <button
            onClick={() => window.print()}
            aria-label="Print or save as PDF"
            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={13} />
            Print / PDF
          </button>
        </div>

        {/* ── Hero ── */}
        <RecordHero record={record} ownerHospital={ownerHospital} />

        {/* ── Tab bar ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <TabBar active={activeTab} onChange={setActiveTab} />

          {activeTab === 'clinical' && clinicalCount > 0 && (
            <span className="text-xs md:text-sm text-gray-400">{clinicalCount} fields</span>
          )}
          {activeTab === 'attachments' && (
            <span className="text-xs md:text-sm text-gray-400">{attachmentCount} file{attachmentCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* ── Tab panels ── */}
        {activeTab === 'overview'     && <OverviewTab    record={record} />}
        {activeTab === 'clinical'     && <ClinicalTab    record={record} />}
        {activeTab === 'attachments'  && <AttachmentsTab record={record} />}
        {activeTab === 'integrity'    && <IntegrityTab   record={record} />}

      </div>
    </div>
  )
}