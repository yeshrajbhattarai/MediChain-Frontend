import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FlaskConical,
  Search,
  Calendar,
  X,
} from 'lucide-react'

import { getDoctorRecords } from '../../api/doctor'
// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DoctorLabReports() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [labFilter, setLabFilter] = useState('all')
  const [labs, setLabs] = useState([])
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const data = await getDoctorRecords()

        if (!mounted) return

        const rows = Array.isArray(data?.records)
          ? data.records
          : []

        setRecords(rows)
        setLabs(Array.isArray(data?.labs) ? data.labs : [])

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
    return records.filter((r) => {
      const text =
        `${r.patient_name || ''} ${r.lab_name || ''} ${r.record_id || ''}`.toLowerCase()

      const matchesQuery = text.includes(query.toLowerCase())
      const matchesLab = labFilter === 'all' ? true : r.lab_name === labFilter
      return matchesQuery && matchesLab
    })
  }, [records, query, labFilter])

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Lab Reports
        </h1>

        <p className="text-sm text-gray-400 mt-0.5">
          View completed laboratory reports and patient submissions
        </p>
      </div>

      {/* STATS */}
      <div className="flex gap-3 flex-wrap">

        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
          {records.length} total
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          {filtered.length} visible
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, lab or record ID..."
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

        <select
          value={labFilter}
          onChange={(e) => setLabFilter(e.target.value)}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-100"
        >
          <option value="all">All labs</option>
          {labs.map((lab) => (
            <option key={lab.id} value={lab.name}>
              {lab.name}
            </option>
          ))}
        </select>
      </div>

      {/* REPORT LIST */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Available Reports
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            {filtered.length} report{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (

          <div className="p-10 text-center text-sm text-gray-500">
            Loading reports...
          </div>

        ) : filtered.length === 0 ? (

          <div className="p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">🧪</p>

            <p className="font-medium text-gray-600">
              No reports found.
            </p>
          </div>

        ) : (

          <div className="divide-y divide-gray-100">

            {filtered.map((r) => (

              <button
                key={r.record_id}
                  onClick={() =>
                    navigate(
                      `/doctor/reports/lab/${r.record_id}`
                    )
                  }
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
                        {r.patient_name || 'Unknown Patient'}
                      </p>

                      <span className="
                        px-2.5
                        py-1
                        text-[11px]
                        font-semibold
                        rounded-full
                        bg-blue-100
                        text-blue-700
                      ">
                        v{r.version || 1}
                      </span>
                    </div>

                    {/* LAB NAME */}
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                      {r.lab_name || 'Lab Report'}
                    </p>

                    {/* DATE */}
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">

                      <Calendar className="w-4 h-4" />

                      <span>
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString('en-IN')
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
                    <FlaskConical className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {records.length} reports
        </p>
      )}

    </div>
  )
}
