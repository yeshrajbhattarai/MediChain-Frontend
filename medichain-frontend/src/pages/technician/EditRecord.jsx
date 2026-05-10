
// src/pages/technician/RecordHistory.jsx

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../../api/client'

const api = (url, opts = {}) =>
  fetchWithAuth(`/api${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  })

export default function RecordHistory() {
  const { recordId } = useParams()
  const navigate = useNavigate()

  const [history, setHistory] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    const res = await api(`/v1/staff/records/${recordId}/history/`)
    const data = await res.json()

    if (res.ok) {
      setHistory(data)
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-semibold">
          Record History
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Version Timeline</h2>
            <p className="text-sm text-gray-400 mt-1">
              Immutable snapshots of all record updates.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs border border-gray-200">
            {history.length} versions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Version', 'Event', 'Changed At', 'Changed By', 'Reason'].map(h => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs uppercase tracking-widest text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {history.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">

                  <td className="px-6 py-5 font-semibold">
                    v{item.version_number}
                  </td>

                  <td className="px-6 py-5 capitalize">
                    {item.event_type}
                  </td>

                  <td className="px-6 py-5">
                    {item.changed_at}
                  </td>

                  <td className="px-6 py-5">
                    {item.changed_by_name}
                  </td>

                  <td className="px-6 py-5">
                    {item.change_reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => navigate(`/technician/records/${recordId}`)}
        className="px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
      >
        Back To Record
      </button>
    </div>
  )
}
