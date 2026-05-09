// src/pages/nurse/Records.jsx
// FIXED: Breadcrumbs, better UX, improved modal, error handling

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  FileText,
  AlertCircle,
  Loader,
  X,
  ArrowUpRight,
  CalendarDays,
  Activity,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { getNurseMedicalRecords } from '../../api/nurse'

export default function Records() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    loadRecords()
  }, [])

  async function loadRecords() {
    try {
      setLoading(true)
      setError('')
      const data = await getNurseMedicalRecords()
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load records')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const q = search.toLowerCase()
      return (
        record?.patient?.full_name?.toLowerCase().includes(q) ||
        record?.primary_diagnosis?.toLowerCase().includes(q) ||
        record?.title?.toLowerCase().includes(q)
      )
    })
  }, [records, search])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Finalized Records"
        subtitle="View completed nursing assessments and patient summaries"
        breadcrumbs={[
          { label: 'Nurse Portal', href: '/nurse/dashboard' },
          { label: 'Records' },
        ]}
      />

      {/* ERROR STATE */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
            <button
              onClick={loadRecords}
              className="text-xs text-red-600 hover:text-red-700 font-medium mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient, diagnosis or record title..."
          className="
            w-full
            h-11
            pl-11
            pr-4
            rounded-xl
            border
            border-gray-200
            bg-white
            text-sm
            outline-none
            focus:ring-2
            focus:ring-blue-100
            focus:border-blue-400
          "
        />
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading records...</p>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredRecords.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">
            {search ? 'No records found' : 'No finalized records yet'}
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            {search
              ? 'Try searching with different keywords'
              : 'Your completed nursing records will appear here'}
          </p>
        </div>
      )}

      {/* RECORDS GRID */}
      {!loading && filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRecords.map((record) => (
            <button
              key={record.id}
              onClick={() => setSelectedRecord(record)}
              className="
                text-left
                bg-white
                border
                border-gray-200
                rounded-2xl
                p-6
                hover:border-blue-300
                hover:shadow-lg
                transition-all
                group
              "
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {record?.patient?.full_name || 'Unknown Patient'}
                    </h3>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      Completed
                    </span>
                    {record?.doctor_finalized && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        Finalized
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-800">
                    {record?.title || 'Medical Record'}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {record?.primary_diagnosis || 'No diagnosis'}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    {record?.created_at
                      ? new Date(record.created_at).toLocaleString('en-IN')
                      : '—'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                  View
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* HEADER */}
            <div className="px-6 sm:px-8 py-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedRecord?.title || 'Medical Record'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Patient: {selectedRecord?.patient?.full_name || 'Unknown'}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="
                  w-10
                  h-10
                  rounded-xl
                  hover:bg-gray-100
                  flex
                  items-center
                  justify-center
                  transition-all
                "
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-7 space-y-6">
              {/* DIAGNOSIS */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Diagnosis
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedRecord?.primary_diagnosis || 'No diagnosis available'}
                </p>
              </div>

              {/* VITALS */}
              {selectedRecord?.blood_pressure && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    Patient Vitals
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      ['Blood Pressure', selectedRecord.blood_pressure],
                      ['Pulse Rate', selectedRecord.pulse_rate ? `${selectedRecord.pulse_rate} bpm` : '—'],
                      ['Temperature', selectedRecord.temperature_c ? `${selectedRecord.temperature_c}°C` : '—'],
                      ['SpO2', selectedRecord.spo2_percent ? `${selectedRecord.spo2_percent}%` : '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
                        <p className="text-sm font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NOTES */}
              {[
                ['Observation', selectedRecord?.nurse_observation],
                ['Treatment', selectedRecord?.treatment_given],
                ['Medications', selectedRecord?.medications_administered],
                ['Follow-up', selectedRecord?.follow_up_notes],
              ].map(
                ([title, value]) =>
                  value && (
                    <div key={title}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        {title}
                      </p>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
                      </div>
                    </div>
                  )
              )}

              {/* FINALIZED STATUS */}
              {selectedRecord?.doctor_finalized && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">Doctor Finalized</h4>
                      <p className="text-sm text-emerald-700 mt-1">
                        This record has been reviewed and approved by the doctor.
                      </p>
                      <p className="text-xs text-emerald-600 mt-3">
                        Finalized: {selectedRecord?.doctor_finalized_at
                          ? new Date(selectedRecord.doctor_finalized_at).toLocaleString('en-IN')
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-100 px-6 sm:px-8 py-4 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-gray-100
                  hover:bg-gray-200
                  text-sm
                  font-medium
                  text-gray-900
                  transition-all
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}