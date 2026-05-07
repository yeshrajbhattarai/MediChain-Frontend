// src/pages/nurses/Records.jsx

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  CalendarDays,
  ClipboardCheck,
  Activity,
  UserRound,
  X,
  ArrowUpRight,
} from 'lucide-react'

import { getNurseMedicalRecords } from '../../api/nurse'

export default function Records() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    async function loadRecords() {
      try {
        const data = await getNurseMedicalRecords()

        console.log('Nurse Records:', data)

        setRecords(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setRecords([])
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [])

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const q = search.toLowerCase()

      return (
        record?.patient?.full_name?.toLowerCase()?.includes(q) ||
        record?.primary_diagnosis?.toLowerCase()?.includes(q) ||
        record?.title?.toLowerCase()?.includes(q)
      )
    })
  }, [records, search])

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Finalized Records
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          Completed nursing records and finalized patient summaries
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient, diagnosis or record..."
          className="
            w-full
            h-12
            pl-11
            pr-4
            rounded-2xl
            border
            border-gray-200
            bg-white
            text-sm
            outline-none
            focus:ring-4
            focus:ring-blue-50
            focus:border-blue-400
          "
        />
      </div>

      {/* RECORDS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {!loading && filteredRecords.map((record) => (
          <button
            key={record.id}
            onClick={() => setSelectedRecord(record)}
            className="
              text-left
              bg-white
              border
              border-gray-200
              rounded-3xl
              p-6
              hover:border-blue-200
              hover:shadow-lg
              transition-all
              duration-200
              group
            "
          >

            {/* TOP */}
            <div className="flex items-start justify-between gap-4">

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2 flex-wrap">

                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {record?.patient?.full_name || 'Unknown Patient'}
                  </h3>

                  <span className="
                    px-2.5
                    py-1
                    rounded-full
                    text-xs
                    font-semibold
                    bg-emerald-100
                    text-emerald-700
                  ">
                    Completed
                  </span>

                  {record?.doctor_finalized && (
                    <span className="
                      px-2.5
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      bg-blue-100
                      text-blue-700
                    ">
                      Finalized
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xl font-semibold text-gray-800">
                  {record?.title || 'Medical Record'}
                </p>

                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {record?.primary_diagnosis || 'No diagnosis available'}
                </p>
              </div>

              <div className="
                w-14
                h-14
                rounded-2xl
                bg-blue-50
                flex
                items-center
                justify-center
                shrink-0
                group-hover:scale-105
                transition-transform
              ">
                <ClipboardCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            {/* BOTTOM */}
            <div className="mt-6 flex items-center justify-between">

              <div className="flex items-center gap-4 text-xs text-gray-400">

                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    {record?.created_at
                      ? new Date(record.created_at).toLocaleString('en-IN')
                      : '—'}
                  </span>
                </div>
              </div>

              <div className="
                flex
                items-center
                gap-1
                text-blue-600
                text-sm
                font-medium
              ">
                Open
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        ))}

      </div>

      {/* EMPTY */}
      {!loading && filteredRecords.length === 0 && (
        <div className="
          bg-white
          border
          border-gray-200
          rounded-3xl
          p-14
          text-center
        ">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />

          <h3 className="text-lg font-semibold text-gray-800">
            No records found
          </h3>

          <p className="text-sm text-gray-400 mt-1">
            Try searching with another keyword
          </p>
        </div>
      )}

      {/* MODAL */}
      {selectedRecord && (
        <div className="
          fixed
          inset-0
          z-50
          bg-black/40
          backdrop-blur-sm
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            w-full
            max-w-5xl
            bg-white
            rounded-[32px]
            shadow-2xl
            border
            border-gray-100
            overflow-hidden
            max-h-[92vh]
            flex
            flex-col
          ">

            {/* HEADER */}
            <div className="
              px-8
              py-6
              border-b
              border-gray-100
              flex
              items-start
              justify-between
            ">

              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Medical Record Detail
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Patient healthcare summary and nursing observations
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
            <div className="overflow-y-auto px-8 py-7">

              {/* PATIENT */}
              <div className="grid md:grid-cols-2 gap-5">

                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Patient
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="
                      w-11
                      h-11
                      rounded-xl
                      bg-blue-100
                      flex
                      items-center
                      justify-center
                    ">
                      <UserRound className="w-5 h-5 text-blue-600" />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedRecord?.patient?.full_name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {selectedRecord?.patient?.gender || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Doctor
                  </p>

                  <p className="mt-3 font-semibold text-gray-900">
                    {selectedRecord?.doctor?.full_name}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedRecord?.doctor?.employee_id}
                  </p>
                </div>
              </div>

              {/* RECORD */}
              <div className="mt-7">

                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedRecord?.title}
                </h3>

                <p className="mt-2 text-gray-600 leading-relaxed">
                  {selectedRecord?.primary_diagnosis}
                </p>
              </div>

              {/* VITALS */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                  Patient Vitals
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                  {[
                    ['Blood Pressure', selectedRecord?.blood_pressure],
                    ['Pulse Rate', selectedRecord?.pulse_rate],
                    ['Temperature', selectedRecord?.temperature_c],
                    ['SpO2', selectedRecord?.spo2_percent],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="bg-gray-50 rounded-2xl p-5"
                    >
                      <p className="text-xs text-gray-400 font-semibold uppercase">
                        {label}
                      </p>

                      <p className="mt-3 text-xl font-semibold text-gray-900">
                        {value || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* NOTES */}
              <div className="mt-8 grid md:grid-cols-2 gap-5">

                {[
                  ['Observation', selectedRecord?.nurse_observation],
                  ['Treatment Given', selectedRecord?.treatment_given],
                  ['Medications', selectedRecord?.medications_administered],
                  ['Follow-up Notes', selectedRecord?.follow_up_notes],
                ].map(([title, value]) => (
                  <div
                    key={title}
                    className="bg-gray-50 rounded-2xl p-5"
                  >
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      {title}
                    </p>

                    <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {value || 'No information available'}
                    </p>
                  </div>
                ))}
              </div>

              {/* FINALIZED */}
              {selectedRecord?.doctor_finalized && (
                <div className="
                  mt-8
                  rounded-3xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  p-6
                ">
                  <div className="flex items-center gap-3">

                    <div className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-emerald-100
                      flex
                      items-center
                      justify-center
                    ">
                      <Activity className="w-6 h-6 text-emerald-600" />
                    </div>

                    <div>
                      <h4 className="font-semibold text-emerald-800">
                        Doctor Finalized Record
                      </h4>

                      <p className="text-sm text-emerald-700 mt-1">
                        This report has been reviewed and finalized by the doctor.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid md:grid-cols-2 gap-5">

                    <div>
                      <p className="text-xs font-semibold uppercase text-emerald-700">
                        Finalized Record ID
                      </p>

                      <p className="mt-2 text-sm text-emerald-900 break-all">
                        {selectedRecord?.finalized_record_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-emerald-700">
                        Finalized At
                      </p>

                      <p className="mt-2 text-sm text-emerald-900">
                        {selectedRecord?.doctor_finalized_at
                          ? new Date(selectedRecord.doctor_finalized_at).toLocaleString('en-IN')
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* FOOTER */}
            <div className="
              border-t
              border-gray-100
              px-8
              py-5
              flex
              justify-end
            ">
              <button
                onClick={() => setSelectedRecord(null)}
                className="
                  px-5
                  py-2.5
                  rounded-2xl
                  bg-gray-100
                  hover:bg-gray-200
                  text-sm
                  font-medium
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