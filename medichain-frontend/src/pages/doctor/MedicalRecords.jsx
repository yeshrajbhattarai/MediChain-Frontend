// src/pages/doctor/MedicalRecords.jsx

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  FileText,
  Calendar,
  User,
  ShieldCheck,
  Activity,
} from 'lucide-react'

import {
  getDoctorRecords,
  getDoctorRecordDetail,
} from '../../api/doctor'

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

        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Medical Records
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          View and verify all patient medical records
        </p>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-gray-400" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, record ID or lab..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* LEFT */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Available Records
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                {filteredRecords.length} record
                {filteredRecords.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-500">
              Loading records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              No records found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">

              {filteredRecords.map((record) => (
                <button
                  key={record.record_id}
                  onClick={() => openRecord(record.record_id)}
                  className={`w-full text-left p-5 transition-colors ${
                    selected?.record_id === record.record_id
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {record.lab_name || 'Medical Record'}
                        </h3>

                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          v{record.version || 1}
                        </span>
                      </div>

                      <div className="space-y-2 mt-3 text-sm text-gray-500">

                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            {record.patient_name || 'Unknown Patient'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {record.created_at
                              ? new Date(record.created_at).toLocaleString('en-IN')
                              : '—'}
                          </span>
                        </div>

                      </div>

                    </div>

                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>

                  </div>
                </button>
              ))}

            </div>
          )}

        </div>

        {/* RIGHT */}
        <div className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl overflow-hidden">

          {!selected ? (
            <div className="p-12 text-center">

              <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />

              <h3 className="text-lg font-semibold text-gray-700">
                No medical record selected
              </h3>

              <p className="text-sm text-gray-400 mt-2">
                Select a record from the left panel
              </p>

            </div>
          ) : (
            <>
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selected.lab_name || 'Medical Record'}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Record ID: {selected.record_id}
                  </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Verified
                </div>

              </div>

              <div className="p-6 space-y-6">

                {/* Patient Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="border border-gray-100 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">
                      Patient Name
                    </p>

                    <p className="font-semibold text-gray-900">
                      {selected.patient_name || '—'}
                    </p>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">
                      Recorded By
                    </p>

                    <p className="font-semibold text-gray-900">
                      {selected.recorded_by_name || '—'}
                    </p>
                  </div>

                </div>

                {/* Diagnosis */}
                <div className="border border-gray-100 rounded-xl p-5">

                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-teal-600" />

                    <h3 className="font-semibold text-gray-900">
                      Diagnosis
                    </h3>
                  </div>

                  <p className="text-gray-700">
                    {selected.diagnosis || 'No diagnosis available.'}
                  </p>

                </div>

                {/* Treatment */}
                <div className="border border-gray-100 rounded-xl p-5">

                  <h3 className="font-semibold text-gray-900 mb-4">
                    Treatment Plan
                  </h3>

                  <p className="text-gray-700">
                    {selected.treatment_plan || 'No treatment plan available.'}
                  </p>

                </div>

                {/* Clinical Values */}
                <div className="border border-gray-100 rounded-xl p-5">

                  <h3 className="font-semibold text-gray-900 mb-4">
                    Clinical Values
                  </h3>

                  <div className="space-y-3">

                    {selected.custom_field_values &&
                    Object.keys(selected.custom_field_values).length > 0 ? (
                      Object.entries(selected.custom_field_values).map(
                        ([key, value]) => (
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
                        )
                      )
                    ) : (
                      <p className="text-sm text-gray-400">
                        No clinical values available.
                      </p>
                    )}

                  </div>

                </div>

              </div>
            </>
          )}

        </div>

      </div>

    </div>
  )
}