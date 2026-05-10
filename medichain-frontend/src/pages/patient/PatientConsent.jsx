// src/pages/patient/PatientConsent.jsx

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Building2,
  CalendarDays,
  X,
} from 'lucide-react'

import {
  getPatientConsents,
  submitPatientDecision,
} from '../../api/consent'

import {
  errorToast,
  successToast,
  confirmDialog,
} from '../../utils/alert'

export default function PatientConsent() {
  const [loading, setLoading] = useState(true)
  const [consents, setConsents] = useState([])

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const [selectedConsent, setSelectedConsent] =
    useState(null)

  useEffect(() => {
    fetchConsents()
  }, [])

  const fetchConsents = async () => {
    try {
      setLoading(true)

      const data = await getPatientConsents()

      setConsents(Array.isArray(data) ? data : [])
    } catch (err) {
      errorToast(
        err?.error || 'Failed to load consent requests'
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredConsents = useMemo(() => {
    return consents.filter(consent => {
      const query = search.toLowerCase()

      const matchesSearch =
        consent?.requesting_hospital
          ?.toLowerCase()
          .includes(query) ||
        consent?.record_title
          ?.toLowerCase()
          .includes(query)

      const status = normalizeStatus(consent?.request_status || consent?.status)
      const matchesFilter =
        filter === 'all'
          ? true
          : status === filter

      return matchesSearch && matchesFilter
    })
  }, [consents, search, filter])

  const pendingCount = consents.filter(
    c => normalizeStatus(c.request_status || c.status) === 'PENDING'
  ).length

  const approvedCount = consents.filter(
    c => normalizeStatus(c.request_status || c.status) === 'APPROVED'
  ).length

  const rejectedCount = consents.filter(
    c => normalizeStatus(c.request_status || c.status) === 'REJECTED'
  ).length

  const handleDecision = async (
    consentId,
    choice
  ) => {
    const normalizedChoice = normalizeStatus(choice)
    const confirmed = await confirmDialog(
      `${normalizedChoice === 'APPROVED' ? 'Approve' : 'Reject'} Request`,
      `Are you sure you want to ${normalizedChoice.toLowerCase()} this consent request?`,
      normalizedChoice === 'APPROVED'
        ? 'Approve'
        : 'Reject',
      normalizedChoice !== 'APPROVED'
    )

    if (!confirmed) return

    try {
      await submitPatientDecision(
        consentId,
        normalizedChoice
      )

      successToast(
        `Consent ${normalizedChoice.toLowerCase()} successfully`
      )

      fetchConsents()

      setSelectedConsent(null)
    } catch (err) {
      errorToast(
        err?.error ||
          `Failed to ${normalizedChoice.toLowerCase()} consent`
      )
    }
  }

  const getStatusStyle = (status) => {
    switch (normalizeStatus(status)) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700'

      case 'REJECTED':
        return 'bg-red-50 text-red-600'

      default:
        return 'bg-amber-50 text-amber-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Consent Requests
          </h1>

          <p className="text-gray-500 mt-2 text-base">
            Manage hospitals requesting access to your
            medical records.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title="Pending Requests"
            value={pendingCount}
            icon={Clock3}
            color="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Approved"
            value={approvedCount}
            icon={CheckCircle2}
            color="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Rejected"
            value={rejectedCount}
            icon={XCircle}
            color="bg-red-50 text-red-600"
          />
        </div>

        {/* SEARCH + FILTER */}
        <div className="
          bg-white
          border border-gray-200
          rounded-3xl
          p-4
          flex flex-col lg:flex-row gap-4
        ">
          <div className="
            flex-1
            flex items-center gap-3
            border border-gray-200
            rounded-2xl
            px-4 py-3
          ">
            <Search className="w-5 h-5 text-gray-400" />

            <input
              type="text"
              placeholder="Search by hospital or record..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                w-full
                bg-transparent
                outline-none
                text-sm
                placeholder:text-gray-400
              "
            />
          </div>

          <div className="
            flex items-center gap-2
            bg-gray-100
            rounded-2xl
            p-1
          ">
            {[
              'all',
              'PENDING',
              'APPROVED',
              'REJECTED',
            ].map(item => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`
                  px-4 py-2
                  rounded-xl
                  text-sm font-medium
                  transition-all
                  ${
                    filter === item
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500'
                  }
                `}
              >
                {item.charAt(0).toUpperCase() +
                  item.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        {!filteredConsents.length ? (
          <div className="
            bg-white
            border border-gray-200
            rounded-3xl
            py-28
            text-center
          ">
            <div className="
              w-20 h-20
              rounded-3xl
              bg-gray-100
              flex items-center justify-center
              mx-auto
            ">
              <ShieldCheck className="w-10 h-10 text-gray-400" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-6">
              No consent requests
            </h2>

            <p className="text-gray-500 mt-2">
              Consent requests will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredConsents.map(consent => (
              <button
                key={consent.id}
                onClick={() =>
                  setSelectedConsent(consent)
                }
                className="
                  text-left
                  bg-white
                  border border-gray-200
                  rounded-3xl
                  p-7
                  hover:border-blue-200
                  hover:shadow-md
                  transition-all
                "
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {consent?.record_title ||
                          'Medical Record'}
                      </h2>

                      <div
                        className={`
                          px-3 py-1
                          rounded-full
                          text-xs font-semibold
                          ${getStatusStyle(
                            consent?.request_status || consent?.status
                          )}
                        `}
                      >
                        {normalizeStatus(consent?.request_status || consent?.status)}
                      </div>
                    </div>

                    <div className="
                      flex items-center gap-2
                      mt-4
                      text-gray-500
                    ">
                      <Building2 className="w-4 h-4" />

                      <span className="text-sm">
                        {consent?.requesting_hospital ||
                          'Unknown Hospital'}
                      </span>
                    </div>
                  </div>

                  <div className="
                    w-14 h-14
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                    flex items-center justify-center
                  ">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="
                  flex items-center justify-between
                  mt-8
                  pt-5
                  border-t border-gray-100
                ">
                  <div className="
                    flex items-center gap-2
                    text-sm text-gray-500
                  ">
                    <CalendarDays className="w-4 h-4" />

                    {consent?.created_at
                      ? new Date(
                          consent.created_at
                        ).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </div>

                  <div className="
                    flex items-center gap-2
                    text-blue-600
                    font-medium text-sm
                  ">
                    Open

                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedConsent && (
        <div className="
          fixed inset-0 z-50
          bg-black/40
          backdrop-blur-sm
          flex items-center justify-center
          p-4
        ">
          <div className="
            bg-white
            w-full max-w-3xl
            rounded-[2rem]
            overflow-hidden
            shadow-2xl
          ">
            {/* HEADER */}
            <div className="
              px-8 py-6
              border-b border-gray-100
              flex items-start justify-between
            ">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Consent Detail
                </h2>

                <p className="text-gray-500 mt-2">
                  Review access request information
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedConsent(null)
                }
                className="
                  w-11 h-11
                  rounded-2xl
                  hover:bg-gray-100
                  flex items-center justify-center
                "
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-8 space-y-6">
              <Info
                label="Hospital"
                value={
                  selectedConsent?.requesting_hospital
                }
              />

              <Info
                label="Record Requested"
                value={
                  selectedConsent?.record_title
                }
              />

              <Info
                label="Purpose"
                value={
                  selectedConsent?.purpose ||
                  'No purpose specified'
                }
              />

              <Info
                label="Requested At"
                value={
                  selectedConsent?.created_at
                    ? new Date(
                        selectedConsent.created_at
                      ).toLocaleString('en-IN')
                    : '—'
                }
              />

              <Info
                label="Status"
                value={selectedConsent?.status}
              />
            </div>

            {/* ACTIONS */}
            {normalizeStatus(selectedConsent?.request_status || selectedConsent?.status) ===
              'PENDING' && (
              <div className="
                px-8 py-6
                border-t border-gray-100
                flex items-center justify-end gap-3
              ">
                <button
                  onClick={() =>
                    handleDecision(
                      selectedConsent.id,
                      'REJECTED'
                    )
                  }
                  className="
                    px-5 py-3
                    rounded-2xl
                    bg-red-50
                    text-red-600
                    font-medium
                    hover:bg-red-100
                    transition-all
                  "
                >
                  Reject
                </button>

                <button
                  onClick={() =>
                    handleDecision(
                      selectedConsent.id,
                      'APPROVED'
                    )
                  }
                  className="
                    px-5 py-3
                    rounded-2xl
                    bg-blue-600
                    text-white
                    font-medium
                    hover:bg-blue-700
                    transition-all
                  "
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}) {
  return (
    <div className="
      bg-white
      border border-gray-200
      rounded-3xl
      p-6
    ">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">
            {title}
          </p>

          <h2 className="text-4xl font-bold text-gray-900 mt-3">
            {value}
          </h2>
        </div>

        <div
          className={`
            w-12 h-12
            rounded-2xl
            flex items-center justify-center
            ${color}
          `}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="
      bg-gray-50
      rounded-2xl
      p-5
    ">
      <p className="
        text-xs uppercase tracking-wide
        text-gray-400 font-semibold
      ">
        {label}
      </p>

      <p className="text-gray-800 font-medium mt-3">
        {value || '—'}
      </p>
    </div>
  )
}
  const normalizeStatus = (status) =>
    String(status || '').toUpperCase()
