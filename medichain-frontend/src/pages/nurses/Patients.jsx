// src/pages/nurse/Patients.jsx

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Search,
  UserRound,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

import { getNursePatients } from '../../api/nurse'

export default function Patients() {
  const navigate = useNavigate()

  const [patients, setPatients] = useState([])

  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true)
        setError('')

        const data = await getNursePatients()

        setPatients(Array.isArray(data) ? data : [])

      } catch (err) {
        console.error(err)

        setError('Failed to load patients')
        setPatients([])

      } finally {
        setLoading(false)
      }
    }

    loadPatients()
  }, [])

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const query = search.toLowerCase()

      const name =
        patient?.full_name?.toLowerCase() || ''

      const email =
        patient?.email?.toLowerCase() || ''

      const phone =
        patient?.phone?.toLowerCase() || ''

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      )
    })
  }, [patients, search])

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Patients
        </h1>

        <p className="text-sm text-gray-400 mt-0.5">
          View assigned and monitored patients
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          placeholder="Search patients..."
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

      {/* LOADING */}
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
          Loading patients...
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredPatients.length === 0 && (
        <div className="
          bg-white
          border
          border-gray-200
          rounded-2xl
          p-10
          text-center
        ">
          <p className="text-sm text-gray-500">
            No patients found
          </p>
        </div>
      )}

      {/* GRID */}
      {!loading && filteredPatients.length > 0 && (
        <div className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-4
        ">

          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() =>
                navigate(`/nurse/patients/${patient.id}`)
              }
              className="
                bg-white
                border
                border-gray-200
                rounded-2xl
                p-5
                text-left
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

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-blue-100
                      text-blue-700
                      flex
                      items-center
                      justify-center
                      font-semibold
                    ">
                      {patient?.full_name?.[0] || 'P'}
                    </div>

                    <div>
                      <h3 className="
                        font-semibold
                        text-gray-900
                      ">
                        {patient?.full_name || 'Unknown'}
                      </h3>

                      <p className="
                        text-sm
                        text-gray-400
                        mt-0.5
                      ">
                        Patient ID #{patient?.id}
                      </p>
                    </div>
                  </div>

                  <div className="
                    mt-5
                    space-y-3
                  ">

                    <div className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-gray-600
                    ">
                      <Phone className="w-4 h-4 text-gray-400" />

                      <span>
                        {patient?.phone || 'No phone'}
                      </span>
                    </div>

                    <div className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-gray-600
                    ">
                      <UserRound className="w-4 h-4 text-gray-400" />

                      <span>
                        {patient?.email || 'No email'}
                      </span>
                    </div>
                  </div>

                  <div className="
                    mt-5
                    flex
                    items-center
                    justify-between
                  ">

                    <span className="
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      bg-teal-100
                      text-teal-700
                    ">
                      Active Monitoring
                    </span>

                    <ArrowRight className="
                      w-4
                      h-4
                      text-gray-400
                    " />
                  </div>
                </div>

                {/* RIGHT */}
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
                  <ShieldCheck className="
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
  )
}