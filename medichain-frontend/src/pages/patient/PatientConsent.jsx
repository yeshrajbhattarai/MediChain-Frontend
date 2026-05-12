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
  ArrowRight,
  FileLock2,
  Check,
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

      setConsents(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (err) {

      errorToast(
        err?.error ||
        'Failed to load consent requests'
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

        consent?.requested_to_hospital
          ?.toLowerCase()
          .includes(query)

      const status = normalizeStatus(
        consent?.request_status
      )

      const matchesFilter =
        filter === 'all'
          ? true
          : status === filter

      return matchesSearch && matchesFilter

    })

  }, [consents, search, filter])

  const pendingCount = consents.filter(
    c => normalizeStatus(c.request_status) === 'PENDING'
  ).length

  const approvedCount = consents.filter(
    c => normalizeStatus(c.request_status) === 'APPROVED'
  ).length

  const rejectedCount = consents.filter(
    c => normalizeStatus(c.request_status) === 'REJECTED'
  ).length

  const handleDecision = async (
    consentId,
    choice
  ) => {

    const normalizedChoice =
      normalizeStatus(choice)

    const confirmed = await confirmDialog(
      `${normalizedChoice === 'APPROVED'
        ? 'Approve'
        : 'Reject'
      } Request`,
      `Are you sure you want to ${normalizedChoice.toLowerCase()} this request?`,
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
        `Failed to ${normalizedChoice.toLowerCase()} request`
      )

    }
  }

  const getStatusStyle = (status) => {

    switch (normalizeStatus(status)) {

      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200'

      case 'REJECTED':
        return 'bg-red-50 text-red-600 border border-red-200'

      default:
        return 'bg-amber-50 text-amber-700 border border-amber-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>

      <div className="space-y-8">

        {/* HEADER */}
        <div>

          <h1 className="text-3xl sm:text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Consent Requests
          </h1>

          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Securely manage hospital access requests for your medical records.
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
          border border-slate-200
          rounded-[2rem]
          p-4
          shadow-sm
        ">

          <div className="
            flex flex-col xl:flex-row
            gap-4
          ">

            {/* SEARCH */}
            <div className="
              flex-1
              flex items-center gap-3
              border border-slate-200
              rounded-2xl
              px-4 py-3
            ">

              <Search className="w-5 h-5 text-slate-400" />

              <input
                type="text"
                placeholder="Search hospitals..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                  w-full
                  bg-transparent
                  outline-none
                  text-sm
                  placeholder:text-slate-400
                "
              />

            </div>

            {/* FILTER */}
            <div className="
              flex items-center gap-2
              bg-slate-100
              rounded-2xl
              p-1 overflow-auto
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
                    transition-all whitespace-nowrap
                    ${
                      filter === item
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500'
                    }
                  `}
                >
                  {
                    item.charAt(0) +
                    item.slice(1).toLowerCase()
                  }
                </button>

              ))}

            </div>

          </div>

        </div>

        {/* EMPTY */}
        {!filteredConsents.length ? (

          <div className="
            bg-white
            border border-slate-200
            rounded-[2rem]
            py-28
            text-center
          ">

            <div className="
              w-20 h-20
              rounded-3xl
              bg-slate-100
              flex items-center justify-center
              mx-auto
            ">
              <ShieldCheck className="w-10 h-10 text-slate-400" />
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-6">
              No Consent Requests
            </h2>

            <p className="text-slate-500 mt-2">
              Hospitals requesting access will appear here.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {filteredConsents.map(consent => (

              <button
                key={consent.consent_id}
                onClick={() =>
                  setSelectedConsent(consent)
                }
                className="
                  text-left
                  bg-white
                  border border-slate-200
                  rounded-[2rem]
                  p-7
                  hover:border-blue-200
                  hover:shadow-xl
                  transition-all
                  duration-300
                  group
                "
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Medical Record Access
                      </h2>

                      <div
                        className={`
                          px-3 py-1
                          rounded-full
                          text-xs font-semibold
                          ${getStatusStyle(
                            consent.request_status
                          )}
                        `}
                      >
                        {consent.request_status}
                      </div>

                    </div>

                    <div className="mt-5 space-y-3">

                      <div className="flex items-center gap-3 text-slate-600">

                        <Building2 className="w-5 h-5 text-slate-400" />

                        <span className="font-medium">
                          {consent.requesting_hospital}
                        </span>

                      </div>

                      <div className="flex items-center gap-3 text-slate-600">

                        <ArrowRight className="w-5 h-5 text-slate-400" />

                        <span>
                          requesting from
                        </span>

                        <span className="font-medium">
                          {consent.requested_to_hospital}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="
                    w-16 h-16
                    rounded-3xl
                    bg-blue-50
                    text-blue-600
                    flex items-center justify-center
                    shrink-0
                  ">
                    <FileLock2 className="w-8 h-8" />
                  </div>

                </div>

                <div className="
                  mt-8
                  pt-5
                  border-t border-slate-100
                  flex items-center justify-between
                ">

                  <div className="
                    flex items-center gap-2
                    text-sm text-slate-500
                  ">

                    <CalendarDays className="w-4 h-4" />

                    {
                      consent.created_at
                        ? new Date(
                            consent.created_at
                          ).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'
                    }

                  </div>

                  <div className="
                    flex items-center gap-2
                    text-blue-600
                    text-sm font-semibold
                  ">

                    Open

                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />

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
          bg-black/50
          backdrop-blur-md
          flex items-center justify-center
          p-4
        ">

          <div className="
            w-full max-w-4xl
            rounded-[2.5rem]
            overflow-hidden
            shadow-2xl
            bg-gradient-to-b from-white to-slate-50
            border border-white/40
            max-h-[95vh]
            overflow-y-auto
          ">

            {/* HERO */}
            <div className="
              relative
              overflow-hidden
              bg-gradient-to-br
              from-slate-950
              via-blue-950
              to-slate-900
              p-8 md:p-10
            ">

              <div className="
                absolute inset-0
                bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_30%)]
              " />

              <div className="relative flex items-start justify-between gap-5">

                <div>

                  <div className="
                    w-16 h-16
                    rounded-3xl
                    bg-blue-500/10
                    border border-blue-400/20
                    flex items-center justify-center
                  ">
                    <ShieldCheck className="text-blue-300 w-8 h-8" />
                  </div>

                  <h2 className="text-3xl sm:text-2xl sm:text-4xl font-bold text-white mt-6">
                    Consent Request
                  </h2>

                  <p className="text-slate-300 mt-3">
                    Review and manage access permissions
                  </p>

                  <div className="flex flex-wrap gap-3 mt-6">

                    <StatusPill
                      status={selectedConsent.request_status}
                      getStatusStyle={getStatusStyle}
                      label="Request"
                    />

                    <StatusPill
                      status={selectedConsent.hospital_choice}
                      getStatusStyle={getStatusStyle}
                      label="Hospital"
                    />

                    <StatusPill
                      status={selectedConsent.patient_choice}
                      getStatusStyle={getStatusStyle}
                      label="Patient"
                    />

                  </div>

                </div>

                <button
                  onClick={() =>
                    setSelectedConsent(null)
                  }
                  className="
                    w-12 h-12
                    rounded-2xl
                    bg-white/10
                    hover:bg-white/20
                    flex items-center justify-center
                    transition-all
                    shrink-0
                  "
                >
                  <X className="w-5 h-5 text-white" />
                </button>

              </div>

            </div>

            {/* BODY */}
            <div className="p-6 md:p-8 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <InfoCard
                  label="Requesting Hospital"
                  value={selectedConsent.requesting_hospital}
                />

                <InfoCard
                  label="Requested To Hospital"
                  value={selectedConsent.requested_to_hospital}
                />

                <InfoCard
                  label="Record ID"
                  value={
                    selectedConsent.record_id ||
                    'All Medical Records'
                  }
                />

                <InfoCard
                  label="Requested At"
                  value={
                    selectedConsent.created_at
                      ? new Date(
                          selectedConsent.created_at
                        ).toLocaleString('en-IN')
                      : '—'
                  }
                />

              </div>

              {/* FLOW */}
              <div className="
                rounded-[2rem]
                border border-slate-200
                bg-white
                p-6
              ">

                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Approval Workflow
                </h3>

                <div className="space-y-5">

                  <WorkflowItem
                    title="Hospital Approval"
                    status={selectedConsent.hospital_choice}
                  />

                  <WorkflowItem
                    title="Patient Approval"
                    status={selectedConsent.patient_choice}
                  />

                  <WorkflowItem
                    title="Final Status"
                    status={selectedConsent.request_status}
                  />

                </div>

              </div>

            </div>

            {/* ACTIONS */}
            {
              normalizeStatus(
                selectedConsent.request_status
              ) === 'PENDING' && (

                <div className="
                  px-8 py-6
                  border-t border-slate-200
                  bg-white
                  flex flex-col sm:flex-row
                  justify-end gap-3
                ">

                  <button
                    onClick={() =>
                      handleDecision(
                        selectedConsent.consent_id,
                        'REJECTED'
                      )
                    }
                    className="
                      px-6 py-4
                      rounded-2xl
                      bg-red-50
                      text-red-600
                      font-semibold
                      hover:bg-red-100
                      transition-all
                    "
                  >
                    Reject Request
                  </button>

                  <button
                    onClick={() =>
                      handleDecision(
                        selectedConsent.consent_id,
                        'APPROVED'
                      )
                    }
                    className="
                      px-6 py-4
                      rounded-2xl
                      bg-blue-600
                      text-white
                      font-semibold
                      hover:bg-blue-700
                      transition-all
                      shadow-lg shadow-blue-600/20
                    "
                  >
                    Approve Request
                  </button>

                </div>

              )
            }

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
      border border-slate-200
      rounded-[2rem]
      p-6
    ">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500 font-medium">
            {title}
          </p>

          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mt-4">
            {value}
          </h2>

        </div>

        <div className={`
          w-14 h-14
          rounded-3xl
          flex items-center justify-center
          ${color}
        `}>
          <Icon className="w-7 h-7" />
        </div>

      </div>

    </div>
  )
}

function InfoCard({
  label,
  value,
}) {

  return (
    <div className="
      rounded-[2rem]
      border border-slate-200
      bg-white
      p-6
    ">

      <p className="
        text-xs uppercase tracking-[0.2em]
        text-slate-400 font-semibold
      ">
        {label}
      </p>

      <p className="
        text-slate-900
        font-semibold
        mt-4
        break-words
      ">
        {value || '—'}
      </p>

    </div>
  )
}

function WorkflowItem({
  title,
  status,
}) {

  const normalized =
    normalizeStatus(status)

  return (
    <div className="
      flex items-center justify-between
      rounded-2xl
      border border-slate-100
      bg-slate-50
      px-5 py-4
    ">

      <p className="font-medium text-slate-800">
        {title}
      </p>

      <div className={`
        px-3 py-1
        rounded-full
        text-xs font-semibold
        ${
          normalized === 'APPROVED'
            ? 'bg-emerald-100 text-emerald-700'
            : normalized === 'REJECTED'
            ? 'bg-red-100 text-red-600'
            : 'bg-amber-100 text-amber-700'
        }
      `}>
        {normalized}
      </div>

    </div>
  )
}

function StatusPill({
  label,
  status,
  getStatusStyle,
}) {

  return (
    <div className={`
      px-4 py-2 rounded-2xl
      text-sm font-semibold
      ${getStatusStyle(status)}
    `}>
      {label}: {status}
    </div>
  )
}

const normalizeStatus = (status) =>
  String(status || '').toUpperCase()