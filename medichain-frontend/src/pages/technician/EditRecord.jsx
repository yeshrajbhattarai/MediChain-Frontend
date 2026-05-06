// src/pages/technician/EditRecord.jsx

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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

export default function EditRecord() {
  const { recordId } = useParams()
  const navigate = useNavigate()

  const [record, setRecord] = useState(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadRecord()
  }, [])

  async function loadRecord() {
    const res = await api(`/v1/staff/records/${recordId}/`)
    const data = await res.json()

    if (res.ok) {
      setRecord(data)
    }
  }

  async function saveVersion() {
    setSubmitting(true)

    try {
      await api(`/v1/staff/records/${recordId}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          custom_field_values: record.custom_field_values,
          age: record.age,
          gender: record.gender,
          reason,
        }),
      })

      navigate(`/technician/records/${recordId}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!record) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6 pb-10">

      <div>
        <h1 className="text-3xl font-semibold">
          Edit Record
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          A new version will be created and older versions remain immutable.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">

        <div className="grid md:grid-cols-2 gap-5">

          <div>
            <label className="text-sm font-medium text-gray-700">
              Age
            </label>

            <input
              value={record.age || ''}
              onChange={e => setRecord({ ...record, age: e.target.value })}
              className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Gender
            </label>

            <input
              value={record.gender || ''}
              onChange={e => setRecord({ ...record, gender: e.target.value })}
              className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {Object.entries(record.custom_field_values || {}).map(([key, value]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700 capitalize">
                {key.replaceAll('_', ' ')}
              </label>

              <input
                value={value}
                onChange={e =>
                  setRecord({
                    ...record,
                    custom_field_values: {
                      ...record.custom_field_values,
                      [key]: e.target.value,
                    },
                  })
                }
                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Change Reason
          </label>

          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="What changed and why"
            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 min-h-[120px]"
          />
        </div>

        <div className="flex gap-3">

          <button
            onClick={saveVersion}
            disabled={submitting}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {submitting ? 'Saving...' : 'Save New Version'}
          </button>

          <button
            onClick={() => navigate(`/technician/records/${recordId}`)}
            className="px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}