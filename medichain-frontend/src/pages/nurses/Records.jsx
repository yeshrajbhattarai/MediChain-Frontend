// src/pages/nurse/Records.jsx

import { useEffect, useMemo, useState } from 'react'

import {
  Search,
  ClipboardCheck,
  CalendarDays,
  Eye,
} from 'lucide-react'

import {
  getNurseRecords,
} from '../../api/nurse'

export default function Records() {
  const [records, setRecords] = useState([])

  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)

  const [selectedRecord, setSelectedRecord] =
    useState(null)

  useEffect(() => {
    async function loadRecords() {
      try {
        setLoading(true)

        const data = await getNurseRecords()

        setRecords(Array.isArray(data) ? data : [])

      } catch (err) {
        console.error(err)

      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [])

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const query = search.toLowerCase()

      const patient =
        record?.patient?.full_name
          ?.toLowerCase() || ''

      const diagnosis =
        record?.diagnosis?.toLowerCase() || ''

      return (
        patient.includes(query) ||
        diagnosis.includes(query)
      )
    })
  }, [records, search])

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Records
        </h1>

        <p className="text-sm text-gray-400 mt-0.5">
          Completed nursing records and reports
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          placeholder="Search records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          "
        />
      </div>

      {/* LIST */}
      <div className="
        grid
        grid-cols-1
        gap-4
      ">

        {loading && (
          <div className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            p-10
            text-center
            text-sm
            text-gray-500
          ">
            Loading records...
          </div>
        )}

        {!loading &&
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className="
                bg-white
                border
                border-gray-200
                rounded-2xl
                p-5
              "
            >

              <div className="
                flex
                items-start
                justify-between
                gap-4
              ">

                <div className="flex-1">

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
                      {record?.patient?.full_name ||
                        'Unknown Patient'}
                    </h3>

                    <span className="
                      px-2.5
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      bg-green-100
                      text-green-700
                    ">
                      Completed
                    </span>
                  </div>

                  <p className="
                    mt-2
                    text-sm
                    text-gray-600
                  ">
                    {record?.diagnosis ||
                      'No diagnosis'}
                  </p>

                  <div className="
                    mt-4
                    flex
                    items-center
                    gap-2
                    text-xs
                    text-gray-400
                  ">
                    <CalendarDays className="w-4 h-4" />

                    <span>
                      {record?.created_at
                        ? new Date(
                            record.created_at
                          ).toLocaleString('en-IN')
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="
                  flex
                  flex-col
                  items-end
                  gap-3
                ">

                  <div className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-teal-50
                    flex
                    items-center
                    justify-center
                  ">
                    <ClipboardCheck className="
                      w-5
                      h-5
                      text-teal-600
                    " />
                  </div>

                  <button
                    onClick={() =>
                      setSelectedRecord(record)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-xl
                      bg-blue-600
                      text-white
                      text-sm
                      font-medium
                      hover:bg-blue-700
                    "
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL */}
      {selectedRecord && (
        <div className="
          fixed
          inset-0
          z-50
          bg-black/40
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            w-full
            max-w-2xl
            bg-white
            rounded-3xl
            border
            border-gray-200
            p-6
          ">

            <div className="
              flex
              items-start
              justify-between
              gap-4
            ">

              <div>
                <h2 className="
                  text-lg
                  font-semibold
                  text-gray-900
                ">
                  Nursing Record
                </h2>

                <p className="
                  text-sm
                  text-gray-400
                  mt-1
                ">
                  Patient healthcare summary
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedRecord(null)
                }
                className="
                  text-gray-400
                  hover:text-gray-700
                  text-xl
                "
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-5">

              <div>
                <p className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-gray-400
                ">
                  Patient
                </p>

                <p className="
                  mt-1
                  text-sm
                  font-medium
                  text-gray-900
                ">
                  {
                    selectedRecord?.patient
                      ?.full_name
                  }
                </p>
              </div>

              <div>
                <p className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-gray-400
                ">
                  Diagnosis
                </p>

                <p className="
                  mt-1
                  text-sm
                  text-gray-700
                  leading-relaxed
                ">
                  {selectedRecord?.diagnosis ||
                    'No diagnosis'}
                </p>
              </div>

              <div>
                <p className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-gray-400
                ">
                  Notes
                </p>

                <div className="
                  mt-2
                  rounded-2xl
                  bg-gray-50
                  p-4
                ">
                  <p className="
                    text-sm
                    leading-relaxed
                    text-gray-700
                  ">
                    {selectedRecord?.notes ||
                      'No notes available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}