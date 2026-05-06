import { useEffect, useMemo, useState } from 'react'
import { FlaskConical, Search, FileText, Calendar, User } from 'lucide-react'
import { getDoctorRecords } from '../../api/doctor'

export default function DoctorLabReports() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let mounted = true

    async function load() {
    try {
        const data = await getDoctorRecords()

        if (!mounted) return

        const rows = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : []

        setRecords(rows)
    } catch {
        setRecords([])
    } finally {
        if (mounted) setLoading(false)
    }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    return records.filter(r => {
      const text =
        `${r.patient_name || ''} ${r.lab_name || ''} ${r.record_id || ''}`.toLowerCase()

      return text.includes(query.toLowerCase())
    })
  }, [records, query])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Lab Reports
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          View completed laboratory reports and patient submissions
        </p>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-gray-400" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, lab or record ID..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Available Reports
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                {filtered.length} report{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-500">
              Loading reports...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              No reports found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <button
                  key={r.record_id}
                  onClick={() => setSelected(r)}
                  className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 truncate">
                          {r.lab_name || 'Lab Report'}
                        </p>

                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          v{r.version || 1}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />

                          <span>
                            {r.patient_name || 'Unknown Patient'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />

                          <span>
                            {r.created_at
                              ? new Date(r.created_at).toLocaleString('en-IN')
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Report Preview
            </h2>
          </div>

          {!selected ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />

              <h3 className="text-lg font-semibold text-gray-700">
                No report selected
              </h3>

              <p className="text-sm text-gray-400 mt-2">
                Select a report from the left panel to preview details
              </p>
            </div>
          ) : (
            <div className="p-5 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selected.lab_name || 'Lab Report'}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Record ID: {selected.record_id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-gray-400 mb-1">Patient</p>

                  <p className="font-medium text-gray-800">
                    {selected.patient_name || '—'}
                  </p>
                </div>

                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-gray-400 mb-1">Recorded By</p>

                  <p className="font-medium text-gray-800">
                    {selected.recorded_by_name || '—'}
                  </p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Clinical Values
                </p>

                <div className="space-y-3">
                  {selected.custom_field_values &&
                  Object.keys(selected.custom_field_values).length > 0 ? (
                    Object.entries(selected.custom_field_values).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between border-b border-gray-100 pb-2"
                        >
                          <span className="text-sm text-gray-500 capitalize">
                            {key.replaceAll('_', ' ')}
                          </span>

                          <span className="text-sm font-medium text-gray-900">
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
          )}
        </div>
      </div>
    </div>
  )
}