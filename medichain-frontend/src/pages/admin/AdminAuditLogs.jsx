import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Search,
  ChevronDown,
  ChevronUp,
  Clock3,
  User2,
  FileWarning,
} from 'lucide-react'

import { getAuditLogs } from '../../api/hospital'

const severityStyles = {

  CRITICAL: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    card: 'border-red-100 bg-red-50/50',
    icon: 'text-red-600',
  },

  WARNING: {
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    card: 'border-yellow-100 bg-yellow-50/50',
    icon: 'text-yellow-600',
  },

  INFO: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    card: 'border-blue-100 bg-blue-50/50',
    icon: 'text-blue-600',
  },

}

export default function AdminAuditLogs() {

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    loadLogs()
  }, [])

const loadLogs = async () => {

  try {

    setLoading(true)

    const res = await getAuditLogs()

    setLogs(Array.isArray(res) ? res : [])

  } catch (err) {

    console.error('Failed to load audit logs:', err)
    setLogs([])

  } finally {

    setLoading(false)

  }
}

  const filteredLogs = useMemo(() => {

    return logs.filter(log => {

      const matchesSeverity =
        severityFilter === 'ALL'
          ? true
          : log.severity === severityFilter

      const q = search.toLowerCase()

      const matchesSearch = [
        log.action,
        log.performed_by,
        log.consent_id,
        log.extra_info,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)

      return matchesSeverity && matchesSearch

    })

  }, [logs, severityFilter, search])

const stats = {
  total: logs.length,
  critical: logs.filter(l => l.severity === 'CRITICAL').length,
  warning: logs.filter(l => l.severity === 'WARNING').length,
  info: logs.filter(l => l.severity === 'INFO').length,
}

  if (loading) {

    return (
      <div className="space-y-6">

        <div>
          <div className="h-10 w-72 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded mt-3 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-36 bg-white rounded-3xl border border-slate-200 animate-pulse"
            />
          ))}

        </div>

      </div>
    )
  }

  return (

    <div className="space-y-5">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Activity size={24} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Audit Center
              </h1>

              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                Monitor hospital actions, consent approvals and critical activities.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <button
          onClick={() => setSeverityFilter('ALL')}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:shadow-md transition"
        >

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Logs
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-slate-900">
                {stats.total}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Activity size={24} />
            </div>

          </div>

        </button>

        <button
          onClick={() => setSeverityFilter('CRITICAL')}
          className="bg-red-50 border border-red-100 rounded-2xl p-5 text-left hover:shadow-md transition"
        >

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-red-600">
                CRITICAL Severity
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-red-700">
                {stats.critical}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert size={24} />
            </div>

          </div>

        </button>

        <button
          onClick={() => setSeverityFilter('WARNING')}
          className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 text-left hover:shadow-md transition"
        >

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-yellow-700">
                WARNING Severity
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-yellow-800">
                {stats.warning}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-700">
              <AlertTriangle size={24} />
            </div>

          </div>

        </button>

        <button
          onClick={() => setSeverityFilter('INFO')}
          className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left hover:shadow-md transition"
        >

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-blue-700">
                INFO Severity
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-blue-800">
               {stats.info}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
              <ShieldCheck size={24} />
            </div>

          </div>

        </button>

      </div>

      {/* Filters */}

      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 space-y-4">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search action, performer, consent id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>

        <div className="flex flex-wrap gap-2">

          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(level => (

            <button
              key={level}
              onClick={() => setSeverityFilter(level)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium border transition ${
                severityFilter === level
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {level}
            </button>

          ))}

        </div>

      </div>

      {/* Feed */}

      <div className="space-y-4">

        {filteredLogs.map((log) => {

          const style =
            severityStyles[log.severity] ||
            severityStyles.INFO

          const isExpanded =
            expanded === log.log_id

          return (

            <div
              key={log.log_id}
              className={`rounded-2xl border p-4 sm:p-5 transition ${style.card}`}
            >

              <div className="flex flex-col gap-5">

                {/* Top */}

                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">

                  <div className="space-y-3 flex-1">

                    <div className="flex flex-wrap items-center gap-3">

                      <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${style.badge}`}>
                        {log.severity}
                      </span>

                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        {log.action}
                      </h2>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                      <div>

                        <p className="text-xs uppercase text-slate-400">
                          Performed By
                        </p>

                        <div className="flex items-center gap-2 mt-2">

                          <User2 size={16} className="text-slate-400" />

                          <p className="font-medium text-slate-800">
                            {log.performed_by}
                          </p>

                        </div>

                      </div>

                      <div>

                        <p className="text-xs uppercase text-slate-400">
                          Consent ID
                        </p>

                        <div className="flex items-center gap-2 mt-2">

                          <FileWarning size={16} className="text-slate-400" />

                          <p className="font-medium text-slate-800 break-all">
                            {log.consent_id || '-'}
                          </p>

                        </div>

                      </div>

                      <div>

                        <p className="text-xs uppercase text-slate-400">
                          Timestamp
                        </p>

                        <div className="flex items-center gap-2 mt-2">

                          <Clock3 size={16} className="text-slate-400" />

                          <p className="font-medium text-slate-800">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : log.log_id)
                    }
                    className="self-start px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center gap-2 text-sm font-medium"
                  >

                    Details

                    {isExpanded
                      ? <ChevronUp size={16} />
                      : <ChevronDown size={16} />
                    }

                  </button>

                </div>

                {/* Expanded */}

                {isExpanded && (

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">

                    <div>

                      <p className="text-xs uppercase text-slate-400 mb-2">
                        Extra Information
                      </p>

                      <pre className="text-sm text-slate-700 whitespace-pre-wrap overflow-x-auto">
                        {log.extra_info || 'No additional metadata available'}
                      </pre>

                    </div>

                  </div>

                )}

              </div>

            </div>

          )
        })}

        {!filteredLogs.length && (

          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Activity size={28} />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              No Audit Logs Found
            </h2>

            <p className="text-slate-500 mt-2">
              No logs matched the selected filters.
            </p>

          </div>

        )}

      </div>

    </div>
  )
}