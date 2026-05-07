import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  FileText,
  Calendar,
  X,
  ShieldCheck,
  Activity,
} from 'lucide-react'

import {
  getDoctorRecords,
  getDoctorRecordDetail,
} from '../../api/doctor'

// ─── Preview Modal ────────────────────────────────────────────────────────────

function MedicalRecordPreviewModal({ record, open, onClose }) {
  if (!open || !record) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

          <div>
            <div className="flex items-center gap-3 flex-wrap">

              <h2 className="text-xl font-semibold text-gray-900">
                {record.lab_name || 'Medical Record'}
              </h2>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                v{record.version || 1}
              </span>
            </div>

            <p className="text-sm text-gray-400 mt-1">
              Record ID: {record.record_id}
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

          </div>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* TOP INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Patient
              </p>

              <p className="font-semibold text-gray-900">
                {record.patient_name || '—'}
              </p>
            </div>

            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Recorded By
              </p>

              <p className="font-semibold text-gray-900">
                {record.recorded_by_name || '—'}
              </p>
            </div>

          </div>

          {/* DIAGNOSIS */}
          <div className="border border-gray-100 rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-teal-600" />

              <h3 className="font-semibold text-gray-900">
                Diagnosis
              </h3>
            </div>

            <p className="text-gray-700 leading-relaxed">
              {record.diagnosis || 'No diagnosis available.'}
            </p>

          </div>

          {/* TREATMENT */}
          <div className="border border-gray-100 rounded-2xl p-5">

            <h3 className="font-semibold text-gray-900 mb-4">
              Treatment Plan
            </h3>

            <p className="text-gray-700 leading-relaxed">
              {record.treatment_plan || 'No treatment plan available.'}
            </p>

          </div>

          {/* CLINICAL VALUES */}
          <div className="border border-gray-100 rounded-2xl p-5">

            <h3 className="font-semibold text-gray-900 mb-4">
              Clinical Values
            </h3>

            <div className="space-y-3">

              {record.custom_field_values &&
              Object.keys(record.custom_field_values).length > 0 ? (

                Object.entries(record.custom_field_values).map(([key, value]) => (

                  <div
                    key={key}
                    className="flex items-center justify-between border-b border-gray-100 pb-3"
                  >
                    <span className="text-sm text-gray-500 capitalize">
                      {key.replaceAll('_', ' ')}
                    </span>

                    <span className="font-semibold text-gray-900">
                      {String(value)}
                    </span>
                  </div>
                ))

              ) : (

                <p className="text-sm text-gray-400">
                  No clinical values available.
                </p>

              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DoctorMedicalRecords() {
  const [records, setRecords] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadRecords() {
      try {
        const data = await getDoctorRecords()

        if (!mounted) return

        const rows = Array.isArray(data?.records)
          ? data.records
          : []

        setRecords(rows)

      } catch (err) {
        console.error(err)
        setRecords([])

      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadRecords()

    return () => {
      mounted = false
    }
  }, [])

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const text = `
        ${r.patient_name || ''}
        ${r.record_id || ''}
        ${r.lab_name || ''}
      `.toLowerCase()

      return text.includes(query.toLowerCase())
    })
  }, [records, query])

  const openRecord = async (recordId) => {
    try {
      const data = await getDoctorRecordDetail(recordId)
      setSelected(data)

    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Medical Records
        </h1>

        <p className="text-sm text-gray-400 mt-0.5">
          View and verify all patient medical records
        </p>
      </div>

      {/* STATS */}
      <div className="flex gap-3 flex-wrap">

        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
          {records.length} total
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          {filteredRecords.length} visible
        </div>

      </div>

      {/* SEARCH */}
      <div className="relative">

        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </span>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patient, record ID or lab..."
          className="
            w-full
            pl-10
            pr-3
            py-2.5
            text-sm
            border
            border-gray-200
            rounded-xl
            outline-none
            focus:border-blue-400
            focus:ring-1
            focus:ring-blue-100
            transition-colors
          "
        />
      </div>

      {/* RECORDS */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Available Records
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            {filteredRecords.length} record
            {filteredRecords.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (

          <div className="p-10 text-center text-sm text-gray-500">
            Loading records...
          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="p-10 text-center text-gray-400">

            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />

            <p className="font-medium text-gray-600">
              No records found.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-gray-100">

            {filteredRecords.map((record) => (

              <button
                key={record.record_id}
                onClick={() => openRecord(record.record_id)}
                className="
                  w-full
                  text-left
                  p-5
                  hover:bg-blue-50/40
                  transition-all
                  group
                "
              >
                <div className="flex items-start justify-between gap-4">

                  {/* LEFT */}
                  <div className="min-w-0 flex-1">

                    {/* PATIENT + VERSION */}
                    <div className="flex items-center gap-2 flex-wrap">

                      <p className="font-semibold text-gray-900 truncate text-base">
                        {record.patient_name || 'Unknown Patient'}
                      </p>

                      <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-700">
                        v{record.version || 1}
                      </span>

                    </div>

                    {/* LAB */}
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                      {record.lab_name || 'Medical Record'}
                    </p>

                    {/* DATE */}
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">

                      <Calendar className="w-4 h-4" />

                      <span>
                        {record.created_at
                          ? new Date(record.created_at).toLocaleString('en-IN')
                          : '—'}
                      </span>

                    </div>

                  </div>

                  {/* ICON */}
                  <div className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-teal-50
                    flex
                    items-center
                    justify-center
                    shrink-0
                    group-hover:bg-teal-100
                    transition-colors
                  ">
                    <FileText className="w-5 h-5 text-teal-600" />
                  </div>

                </div>
              </button>
            ))}

          </div>
        )}

      </div>

      {!loading && filteredRecords.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filteredRecords.length} of {records.length} records
        </p>
      )}

      {/* MODAL */}
      <MedicalRecordPreviewModal
        record={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />

    </div>
  )
}