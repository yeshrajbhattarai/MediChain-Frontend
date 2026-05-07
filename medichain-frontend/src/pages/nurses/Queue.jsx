// src/pages/nurses/Queue.jsx

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Search,
  CalendarDays,
  ClipboardCheck,
  UserRound,
  AlertCircle,
  ClipboardList,
  Activity,
  ArrowRight,
  Building2,
} from 'lucide-react'

import Spinner from '../../components/ui/Spinner'

import { getNurseQueue } from '../../api/nurse'

import {
  errorToast,
} from '../../utils/alert'

export default function NurseQueue() {
  const navigate = useNavigate()

  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadQueue()
  }, [statusFilter])

  async function loadQueue() {
    try {
      setLoading(true)

      const data = await getNurseQueue(statusFilter || null)

      console.log('Nurse Queue:', data)

      setQueue(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)

      errorToast('Failed to load queue')

      setQueue([])
    } finally {
      setLoading(false)
    }
  }

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const patient =
        item?.patient?.full_name?.toLowerCase() || ''

      const diagnosis =
        item?.primary_diagnosis?.toLowerCase() || ''

      const title =
        item?.title?.toLowerCase() || ''

      const query = search.toLowerCase()

      return (
        patient.includes(query) ||
        diagnosis.includes(query) ||
        title.includes(query)
      )
    })
  }, [queue, search])

  function getStatusStyles(status) {
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
    <div className="flex flex-col gap-6">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Building2 size={14} />

        <span>/</span>

        <span className="text-gray-700 font-medium">
          Queue
        </span>
      </div>

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Nurse Queue
        </h1>

        <p className="text-sm text-gray-400 mt-0.5">
          Manage assigned patient care workflow and healthcare tasks.
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col lg:flex-row gap-3">
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

        {/* FILTER */}
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

          <option value="pending">
            Pending
          </option>

          <option value="in_progress">
            In Progress
          </option>

          <option value="completed">
            Completed
          </option>
        </select>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* CARD HEADER */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Assigned Tasks
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              {filteredQueue.length} active queue item
              {filteredQueue.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="p-10">
            <Spinner />
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredQueue.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="w-7 h-7 text-gray-400" />
            </div>

            <h3 className="text-sm font-medium text-gray-700">
              No queue items found
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              Try changing filters or search keywords
            </p>
          </div>
        )}

        {/* LIST */}
        {!loading && filteredQueue.length > 0 && (
          <div className="divide-y divide-gray-100">
            {filteredQueue.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  navigate(`/nurse/queue/${item.id}`)
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
                  <div className="flex-1 min-w-0">
                    {/* TOP */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {item?.patient?.full_name ||
                          'Unknown Patient'}
                      </h3>

                      <span
                        className={`
                          px-2.5
                          py-1
                          rounded-full
                          text-[11px]
                          font-semibold
                          ${getStatusStyles(item?.status)}
                        `}
                      >
                        {(item?.status || 'pending')
                          .replace('_', ' ')
                          .toUpperCase()}
                      </span>
                    </div>

                    {/* TASK TITLE */}
                    <p className="text-sm font-medium text-gray-700 mt-3">
                      {item?.title || 'Healthcare Task'}
                    </p>

                    {/* DIAGNOSIS */}
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item?.primary_diagnosis ||
                        'No diagnosis available'}
                    </p>

                    {/* META */}
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <UserRound className="w-4 h-4" />

                        <span>
                          {item?.doctor?.full_name ||
                            'Doctor'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" />

                        <span>
                          {item?.created_at
                            ? new Date(
                                item.created_at
                              ).toLocaleString('en-IN')
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-teal-600" />
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