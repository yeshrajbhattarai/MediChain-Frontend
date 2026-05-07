// src/pages/nurses/Queue.jsx

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Search,
  CalendarDays,
  ClipboardCheck,
  UserRound,
} from 'lucide-react'

import { getNurseQueue } from '../../api/nurse'

export default function Queue() {
  const navigate = useNavigate()

  const [queue, setQueue] = useState([])

  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    async function loadQueue() {
      try {
        setLoading(true)
        setError('')

        const data = await getNurseQueue()

        console.log('Nurse Queue:', data)

        setQueue(Array.isArray(data) ? data : [])

      } catch (err) {
        console.error(err)

        setError('Failed to load queue')
        setQueue([])

      } finally {
        setLoading(false)
      }
    }

    loadQueue()
  }, [])

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const patientName =
        item?.patient?.full_name?.toLowerCase() || ''

      const diagnosis =
        item?.primary_diagnosis?.toLowerCase() || ''

      const title =
        item?.title?.toLowerCase() || ''

      const query = search.toLowerCase()

      return (
        patientName.includes(query) ||
        diagnosis.includes(query) ||
        title.includes(query)
      )
    })
  }, [queue, search])

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Nurse Queue
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          View and complete assigned patient healthcare tasks
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative">

        <Search className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          w-4
          h-4
          text-gray-400
        " />

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
            text-sm
            bg-white
            border
            border-gray-200
            rounded-2xl
            outline-none
            focus:border-blue-400
            focus:ring-2
            focus:ring-blue-100
          "
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="
          bg-red-50
          border
          border-red-200
          rounded-2xl
          p-4
          text-sm
          text-red-700
        ">
          {error}
        </div>
      )}

      {/* LIST */}
      <div className="
        bg-white
        border
        border-gray-200
        rounded-2xl
        overflow-hidden
        shadow-sm
      ">

        {/* TOP */}
        <div className="
          px-6
          py-5
          border-b
          border-gray-100
        ">
          <h2 className="font-semibold text-gray-900">
            Assigned Queue
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            {filteredQueue.length} task
            {filteredQueue.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="
            p-10
            text-center
            text-sm
            text-gray-500
          ">
            Loading queue...
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredQueue.length === 0 && (
          <div className="
            p-10
            text-center
          ">
            <p className="text-gray-500 text-sm">
              No queue items found
            </p>
          </div>
        )}

        {/* ITEMS */}
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
                "
              >

                <div className="
                  flex
                  items-start
                  justify-between
                  gap-4
                ">

                  {/* LEFT */}
                  <div className="flex-1 min-w-0">

                    {/* NAME + STATUS */}
                    <div className="
                      flex
                      items-center
                      gap-2
                      flex-wrap
                    ">

                      <h3 className="
                        font-semibold
                        text-gray-900
                      ">
                        {item?.patient?.full_name ||
                          'Unknown Patient'}
                      </h3>

                      <span className="
                        px-2.5
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        bg-amber-100
                        text-amber-700
                      ">
                        {item?.status || 'Pending'}
                      </span>
                    </div>

                    {/* TITLE */}
                    <p className="
                      mt-2
                      text-sm
                      font-medium
                      text-gray-700
                    ">
                      {item?.title || 'General Task'}
                    </p>

                    {/* DIAGNOSIS */}
                    <p className="
                      mt-1
                      text-sm
                      text-gray-500
                      line-clamp-2
                    ">
                      {item?.primary_diagnosis ||
                        'No diagnosis available'}
                    </p>

                    {/* META */}
                    <div className="
                      mt-4
                      flex
                      flex-wrap
                      items-center
                      gap-4
                      text-xs
                      text-gray-400
                    ">

                      <div className="
                        flex
                        items-center
                        gap-1.5
                      ">
                        <UserRound className="w-4 h-4" />

                        <span>
                          Doctor Assigned
                        </span>
                      </div>

                      <div className="
                        flex
                        items-center
                        gap-1.5
                      ">
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
                  ">
                    <ClipboardCheck className="
                      w-5
                      h-5
                      text-teal-600
                    " />
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