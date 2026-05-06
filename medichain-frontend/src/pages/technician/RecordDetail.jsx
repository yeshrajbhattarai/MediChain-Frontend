// src/pages/technician/RecordDetail.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'

const BASE = 'http://localhost:8000/api'

const api = (url, opts = {}) =>
  fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access') || ''}`,
      ...opts.headers,
    },
  })

export default function RecordDetail() {
  const { recordId } = useParams()
  const navigate = useNavigate()

  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecord()
  }, [recordId])

  async function loadRecord() {
    try {
      const res = await api(`/v1/staff/records/${recordId}/`)
      const data = await res.json()

      if (res.ok) {
        setRecord(data)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  const req = record?.lab_request || {}
  const audit = record?.audit || {}
  const values = record?.custom_field_values || {}

  return (
    <div className="space-y-6 pb-10">

      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Record Detail
        </h1>

        <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
          <Link to={`/technician/records/${recordId}/history`} className="hover:text-blue-600">
            HISTORY
          </Link>

          <span>/</span>

          <span>VERSION {record?.version}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-2xl font-semibold">Doctor Inputs</h2>
            <p className="text-sm text-gray-400 mt-1">
              Original clinical context from requester.
            </p>
          </div>

          <div className="p-5 space-y-5">
            <Field label="Diagnosis" value={req?.diagnosis} />
            <Field label="Treatment Plan" value={req?.treatment_plan} />
            <Field label="Notes" value={req?.notes} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-2xl font-semibold">Latest Measurements</h2>
            <p className="text-sm text-gray-400 mt-1">
              Technician-submitted values relevant to this lab.
            </p>
          </div>

          <div className="p-5 space-y-5">

            <Field label="Age" value={record?.age} />
            <Field label="Gender" value={record?.gender} />

            {Object.entries(values).map(([key, value]) => (
              <Field
                key={key}
                label={key.replaceAll('_', ' ')}
                value={String(value)}
              />
            ))}

            <Field
              label="Version"
              value={`v${record?.version} (Latest)`}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-2xl font-semibold">Record Audit Summary</h2>
          <p className="text-sm text-gray-400 mt-1">
            Clear trail of who created and updated this record.
          </p>
        </div>

        <div className="p-5 grid md:grid-cols-2 gap-5">
          <Field label="Requested by Doctor" value={req?.doctor_name} />
          <Field label="Created by" value={audit?.created_by_name} />
          <Field label="Created At" value={audit?.created_at} />
          <Field label="Latest Updated By" value={audit?.latest_updated_by_name} />
          <Field label="Latest Updated At" value={audit?.latest_updated_at} />
          <Field label="Current Version Reason" value={audit?.change_reason} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-2xl font-semibold">Version Roadmap</h2>
          <p className="text-sm text-gray-400 mt-1">
            Open any version to inspect who changed what and why.
          </p>
        </div>

        <div className="p-5">
          <div className="border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-start gap-5">
              <span className="text-sm font-semibold">
                v{record?.version}
              </span>

              <div>
                <p className="font-semibold text-lg">
                  Created by {audit?.created_by_name}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  {audit?.created_at}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Reason: {audit?.change_reason}
                </p>
              </div>
            </div>

            <span className="px-4 py-1 text-sm rounded-full border border-orange-200 text-orange-500 bg-orange-50">
              Viewing
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/technician/records/${recordId}/edit`)}
          className="px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
        >
          Edit Record
        </button>

        <button
          onClick={() => navigate(`/technician/records/${recordId}/history`)}
          className="px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
        >
          View History
        </button>

        <button
          onClick={() => navigate('/technician/lab-queue')}
          className="px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
        >
          Back To Lab Queue
        </button>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
        {label}
      </p>

      <p className="text-lg text-gray-900">
        {value || '—'}
      </p>
    </div>
  )
}