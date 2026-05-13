// src/pages/nurse/Queue.jsx
// Fixed: status filter uses comma-separated string per API docs,
// rejection banner for previously-rejected items, picked_by awareness

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Clock3,
  ClipboardCheck,
  AlertCircle,
  Loader,
  ArrowRight,
  AlertTriangle,
  UserCheck,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { getNurseQueue } from '../../api/nurse'

// Read logged-in nurse's staff_id from JWT payload in localStorage
function getMyStaffId() {
  try {
    const token = localStorage.getItem('access')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload?.staff_id || null
  } catch {
    return null
  }
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
]

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
}

export default function NurseQueue() {
  const navigate = useNavigate()
  const myStaffId = getMyStaffId()

  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  // statusFilter drives which API call to make — empty = all, single value = one status
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadQueue()
  }, [statusFilter])

  async function loadQueue() {
    try {
      setLoading(true)
      setError('')
      // API accepts comma-separated values; no filter = all items
      const statuses = statusFilter || 'pending,in_progress'
const data = await getNurseQueue(statuses)
      setQueue(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load queue')
      setQueue([])
    } finally {
      setLoading(false)
    }
  }

  const filteredQueue = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return queue
    return queue.filter(
      (item) =>
        item?.patient?.full_name?.toLowerCase().includes(q) ||
        item?.primary_diagnosis?.toLowerCase().includes(q) ||
        item?.title?.toLowerCase().includes(q)
    )
  }, [queue, search])

  // Split into rejected-first ordering so rejections always sit at top
  const sortedQueue = useMemo(() => {
    return [...filteredQueue].sort((a, b) => {
      const aRej = a?.doctor_rejection_reason ? 1 : 0
      const bRej = b?.doctor_rejection_reason ? 1 : 0
      return bRej - aRej
    })
  }, [filteredQueue])

  const rejectedCount = queue.filter((i) => i?.doctor_rejection_reason).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assigned Queue"
        subtitle="Manage your patient care workflow and complete tasks"
        breadcrumbs={[
          { label: 'Nurse Portal', href: '/nurse/dashboard' },
          { label: 'Queue' },
        ]}
      />

      {/* REJECTION ALERT BANNER — shown when any item was rejected by doctor */}
      {!loading && rejectedCount > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">
              {rejectedCount} item{rejectedCount !== 1 ? 's' : ''} returned by doctor
            </p>
            <p className="text-xs text-red-600 mt-1">
              Review the rejection reason and re-complete the task.
            </p>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
            <button
              onClick={loadQueue}
              className="text-xs text-red-600 hover:text-red-700 font-medium mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient, diagnosis or task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 cursor-pointer"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* QUEUE LIST */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Queue Items</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {sortedQueue.length} item{sortedQueue.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {loading && (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading queue...</p>
          </div>
        )}

        {!loading && sortedQueue.length === 0 && (
          <div className="p-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-700">
              {search || statusFilter ? 'No matching items' : 'No queue items'}
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              {search || statusFilter
                ? 'Try changing your filters or search'
                : 'Check back later for new assignments'}
            </p>
          </div>
        )}

        {!loading && sortedQueue.length > 0 && (
          <div className="divide-y divide-gray-100">
            {sortedQueue.map((item) => {
              const isRejected = Boolean(item?.doctor_rejection_reason)
              // Item is being handled by another nurse
              const takenByOther =
                item?.picked_by && item.picked_by?.id !== myStaffId && item.status === 'in_progress'

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/nurse/queue/${item.id}`)}
                  className={`w-full text-left p-5 transition-all group ${
                    isRejected
                      ? 'bg-red-50 hover:bg-red-100/70 border-l-4 border-l-red-400'
                      : 'hover:bg-blue-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* LEFT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {item?.patient?.full_name || 'Unknown'}
                        </h3>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            STATUS_COLORS[item?.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {(item?.status || 'pending').replace('_', ' ').toUpperCase()}
                        </span>

                        {/* Rejection badge */}
                        {isRejected && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3" />
                            REJECTED
                          </span>
                        )}

                        {/* Taken by another nurse */}
                        {takenByOther && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
                            <UserCheck className="w-3 h-3" />
                            {item.picked_by?.full_name || 'Another nurse'}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-gray-700 mt-2">
                        {item?.title || 'Healthcare Task'}
                      </p>

                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {item?.primary_diagnosis || 'No diagnosis'}
                      </p>

                      {/* Rejection reason preview */}
                      {isRejected && (
                        <p className="text-xs text-red-600 mt-2 font-medium line-clamp-1">
                          Doctor: "{item.doctor_rejection_reason}"
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                        <span>
                          {item?.created_at
                            ? new Date(item.created_at).toLocaleString('en-IN')
                            : '—'}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isRejected ? 'bg-red-100' : 'bg-teal-50'
                        }`}
                      >
                        <Clock3
                          className={`w-5 h-5 ${isRejected ? 'text-red-500' : 'text-teal-600'}`}
                        />
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}