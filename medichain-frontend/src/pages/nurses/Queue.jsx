// src/pages/nurse/Queue.jsx
// FIXED: Breadcrumbs, better UX, consistent error handling

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Clock3,
  ClipboardCheck,
  AlertCircle,
  Loader,
  ArrowRight,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { getNurseQueue } from '../../api/nurse'

export default function NurseQueue() {
  const navigate = useNavigate()

  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadQueue()
  }, [statusFilter])

  async function loadQueue() {
    try {
      setLoading(true)
      setError('')
      const data = await getNurseQueue(statusFilter || null)
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
    return queue.filter((item) => {
      const q = search.toLowerCase()
      return (
        item?.patient?.full_name?.toLowerCase().includes(q) ||
        item?.primary_diagnosis?.toLowerCase().includes(q) ||
        item?.title?.toLowerCase().includes(q)
      )
    })
  }, [queue, search])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700'
      case 'pending':
        return 'bg-amber-100 text-amber-700'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-transparent">
      <PageHeader
        title="Assigned Queue"
        subtitle="Manage your patient care workflow and complete tasks"
        breadcrumbs={[
          { label: 'Nurse Portal', href: '/nurse/dashboard' },
          { label: 'Queue' },
        ]}
      />

      {/* ERROR STATE */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
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
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        {/* SEARCH */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient, diagnosis or task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              pl-11
              pr-4
              py-3
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

        {/* STATUS FILTER */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="
            px-4
            py-3
            rounded-xl
            border
            border-gray-200
            bg-white
            text-sm
            outline-none
            focus:ring-2
            focus:ring-blue-100
            focus:border-blue-400
            cursor-pointer
          "
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* QUEUE LIST */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Queue Items</h2>
            <p className="text-xs text-gray-500 mt-1">
              {filteredQueue.length} item{filteredQueue.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading queue...</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredQueue.length === 0 && (
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

        {/* LIST */}
        {!loading && filteredQueue.length > 0 && (
          <div className="divide-y divide-gray-100">
            {filteredQueue.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/nurse/queue/${item.id}`)}
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {item?.patient?.full_name || 'Unknown'}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(item?.status)}`}>
                        {(item?.status || 'pending').replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-700 mt-2">
                      {item?.title || 'Healthcare Task'}
                    </p>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {item?.primary_diagnosis || 'No diagnosis'}
                    </p>

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
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <Clock3 className="w-5 h-5 text-teal-600" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}