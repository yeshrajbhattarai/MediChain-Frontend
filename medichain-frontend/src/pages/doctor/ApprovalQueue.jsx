// src/pages/doctor/ApprovalQueue.jsx

import { useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileText,
  FlaskConical,
  User,
} from 'lucide-react'

const MOCK_QUEUE = [
  {
    id: 'REC-1001',
    patient: 'Samarpan Dahal',
    lab: 'CKD',
    nurse: 'Anjali Sharma',
    submitted_at: '6 May 2026, 10:42 AM',
    status: 'Pending Review',
    diagnosis: 'Possible CKD Stage 2',
    notes: 'Creatinine elevated. BP slightly high.',
  },
  {
    id: 'REC-1002',
    patient: 'Yashraj',
    lab: 'Cardiology',
    nurse: 'Ashis Kumar',
    submitted_at: '6 May 2026, 09:10 AM',
    status: 'Needs Attention',
    diagnosis: 'Irregular ECG pattern',
    notes: 'Recommend doctor review before approval.',
  },
]

export default function DoctorApprovalQueue() {
  const [selected, setSelected] = useState(MOCK_QUEUE[0])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Approval Queue
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Final doctor verification for nurse and lab completed records
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Pending Reviews
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                2
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Approved Today
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                12
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Needs Attention
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                1
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Left Panel */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Submitted Reports
            </h2>
          </div>

          <div className="divide-y divide-gray-100">

            {MOCK_QUEUE.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`w-full text-left p-5 transition-colors ${
                  selected?.id === item.id
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.patient}
                      </h3>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'Pending Review'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-gray-500">

                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4" />
                        <span>{item.lab}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{item.nurse}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4" />
                        <span>{item.submitted_at}</span>
                      </div>

                    </div>

                  </div>

                </div>
              </button>
            ))}

          </div>

        </div>

        {/* Right Panel */}
        <div className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl overflow-hidden">

          {!selected ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />

              <h3 className="text-lg font-semibold text-gray-700">
                No report selected
              </h3>
            </div>
          ) : (
            <>
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between gap-4">

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selected.patient}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Record ID: {selected.id}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                    Pending Review
                  </span>

                </div>
              </div>

              <div className="p-6 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="border border-gray-100 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">
                      Lab Department
                    </p>

                    <p className="font-semibold text-gray-900">
                      {selected.lab}
                    </p>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">
                      Submitted By Nurse
                    </p>

                    <p className="font-semibold text-gray-900">
                      {selected.nurse}
                    </p>
                  </div>

                </div>

                <div className="border border-gray-100 rounded-xl p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Preliminary Diagnosis
                  </p>

                  <p className="text-gray-800">
                    {selected.diagnosis}
                  </p>
                </div>

                <div className="border border-gray-100 rounded-xl p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Nurse / Lab Notes
                  </p>

                  <p className="text-gray-700">
                    {selected.notes}
                  </p>
                </div>

                <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-500">
                    Full clinical values, AI prediction,
                    uploaded files and blockchain verification
                    will appear here after backend integration.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">

                  <button className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
                    Approve Final Record
                  </button>

                  <button className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">
                    Reject & Return
                  </button>

                  <button className="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                    Request Changes
                  </button>

                </div>

              </div>
            </>
          )}

        </div>

      </div>

    </div>
  )
}