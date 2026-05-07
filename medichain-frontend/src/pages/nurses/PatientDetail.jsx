// src/pages/nurse/PatientDetail.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  CalendarDays,
  Activity,
} from 'lucide-react'

import { getNursePatientDetail } from '../../api/nurse'

export default function PatientDetail() {
  const navigate = useNavigate()

  const { id } = useParams()

  const [patient, setPatient] = useState(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true)
        setError('')

        const data =
          await getNursePatientDetail(id)

        setPatient(data)

      } catch (err) {
        console.error(err)

        setError('Failed to load patient')

      } finally {
        setLoading(false)
      }
    }

    loadPatient()
  }, [id])

  if (loading) {
    return (
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
        Loading patient...
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  return (
    <div className="space-y-6">

      <button
        onClick={() => navigate(-1)}
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          text-gray-500
          hover:text-gray-900
        "
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* HERO */}
      <div className="
        bg-white
        border
        border-gray-200
        rounded-3xl
        p-6
      ">

        <div className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-6
        ">

          <div className="
            flex
            items-center
            gap-5
          ">

            <div className="
              w-20
              h-20
              rounded-3xl
              bg-blue-100
              text-blue-700
              flex
              items-center
              justify-center
              text-2xl
              font-semibold
            ">
              {patient?.full_name?.[0] || 'P'}
            </div>

            <div>
              <h1 className="
                text-2xl
                font-semibold
                text-gray-900
              ">
                {patient?.full_name}
              </h1>

              <p className="
                text-sm
                text-gray-400
                mt-1
              ">
                Patient ID #{patient?.id}
              </p>

              <div className="
                mt-4
                flex
                flex-wrap
                gap-2
              ">
                <span className="
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-semibold
                  bg-green-100
                  text-green-700
                ">
                  Active
                </span>

                <span className="
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-semibold
                  bg-blue-100
                  text-blue-700
                ">
                  Under Observation
                </span>
              </div>
            </div>
          </div>

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-3
          ">

            <div className="
              bg-gray-50
              rounded-2xl
              p-4
              min-w-[220px]
            ">
              <div className="
                flex
                items-center
                gap-2
                text-gray-400
                text-sm
              ">
                <Phone className="w-4 h-4" />
                Phone
              </div>

              <p className="
                mt-2
                text-sm
                font-medium
                text-gray-900
              ">
                {patient?.phone || 'Not available'}
              </p>
            </div>

            <div className="
              bg-gray-50
              rounded-2xl
              p-4
              min-w-[220px]
            ">
              <div className="
                flex
                items-center
                gap-2
                text-gray-400
                text-sm
              ">
                <Mail className="w-4 h-4" />
                Email
              </div>

              <p className="
                mt-2
                text-sm
                font-medium
                text-gray-900
                break-all
              ">
                {patient?.email || 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="
        grid
        grid-cols-1
        xl:grid-cols-3
        gap-5
      ">

        <div className="
          xl:col-span-2
          bg-white
          border
          border-gray-200
          rounded-3xl
          p-6
        ">
          <h2 className="
            font-semibold
            text-gray-900
          ">
            Medical Overview
          </h2>

          <div className="
            mt-6
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
          ">

            <InfoCard
              icon={Shield}
              label="Gender"
              value={patient?.gender || '—'}
            />

            <InfoCard
              icon={CalendarDays}
              label="Age"
              value={patient?.age || '—'}
            />

            <InfoCard
              icon={Activity}
              label="Blood Group"
              value={patient?.blood_group || '—'}
            />

            <InfoCard
              icon={Activity}
              label="Condition"
              value={
                patient?.condition ||
                'General Monitoring'
              }
            />
          </div>
        </div>

        <div className="
          bg-white
          border
          border-gray-200
          rounded-3xl
          p-6
        ">
          <h2 className="
            font-semibold
            text-gray-900
          ">
            Nurse Notes
          </h2>

          <div className="
            mt-4
            rounded-2xl
            bg-gray-50
            p-4
          ">
            <p className="
              text-sm
              leading-relaxed
              text-gray-600
            ">
              {patient?.notes ||
                'No nursing notes available for this patient yet.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="
      bg-gray-50
      rounded-2xl
      p-4
    ">
      <div className="
        flex
        items-center
        gap-2
        text-gray-400
        text-sm
      ">
        <Icon className="w-4 h-4" />
        {label}
      </div>

      <p className="
        mt-2
        font-medium
        text-gray-900
      ">
        {value}
      </p>
    </div>
  )
}