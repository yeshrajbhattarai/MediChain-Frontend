import { useEffect, useMemo, useState } from 'react'

import {
  Search,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Building2,
  X,
  FileText,
  Calendar,
  Lock,
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
  const [selectedConsent, setSelectedConsent] = useState(null)

  useEffect(() => {
    fetchConsents()
  }, [])

  const fetchConsents = async () => {
    try {
      setLoading(true)
      const data = await getPatientConsents()
      setConsents(Array.isArray(data) ? data : [])
    } catch (err) {
      errorToast(err?.error || 'Failed to load consent requests')
    } finally {
      setLoading(false)
    }
  }

  const filteredConsents = useMemo(() => {
    return consents.filter(consent => {
      const query = search.toLowerCase()
      const matchesSearch =
        consent?.requesting_hospital?.toLowerCase().includes(query) ||
        consent?.requested_to_hospital?.toLowerCase().includes(query)

      const status = normalizeStatus(consent?.request_status)
      const matchesFilter = filter === 'all' ? true : status === filter

      return matchesSearch && matchesFilter
    })
  }, [consents, search, filter])

  const stats = useMemo(() => ({
    pending: consents.filter(c => normalizeStatus(c.request_status) === 'PENDING').length,
    approved: consents.filter(c => normalizeStatus(c.request_status) === 'APPROVED').length,
    rejected: consents.filter(c => normalizeStatus(c.request_status) === 'REJECTED').length,
    total: consents.length,
  }), [consents])

  const handleDecision = async (consentId, choice) => {
    const normalizedChoice = normalizeStatus(choice)
    const confirmed = await confirmDialog(
      `${normalizedChoice === 'APPROVED' ? 'Approve' : 'Reject'} Request`,
      `Are you sure you want to ${normalizedChoice.toLowerCase()} this request?`,
      normalizedChoice === 'APPROVED' ? 'Approve' : 'Reject',
      normalizedChoice !== 'APPROVED'
    )

    if (!confirmed) return

    try {
      await submitPatientDecision(consentId, normalizedChoice)
      successToast(`Consent ${normalizedChoice.toLowerCase()} successfully`)
      fetchConsents()
      setSelectedConsent(null)
    } catch (err) {
      errorToast(err?.error || `Failed to ${normalizedChoice.toLowerCase()} request`)
    }
  }

  const getStatusStyle = (status) => {
    switch (normalizeStatus(status)) {
      case 'APPROVED':
        return 'border-l-emerald-500 bg-emerald-50/50'
      case 'REJECTED':
        return 'border-l-red-500 bg-red-50/50'
      default:
        return 'border-l-amber-500 bg-amber-50/50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-32 rounded-3xl bg-slate-200" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

          {/* HERO SECTION */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-700 text-white p-6 md:p-8 shadow-xl">

            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400/10 rounded-full -ml-20 -mb-20" />

            <div className="relative z-10">

              <div className="flex items-start justify-between gap-4 mb-2">

                <div>

                  <p className="text-emerald-100 text-sm font-medium">Healthcare Access Control</p>

                  <h1 className="text-3xl md:text-4xl font-bold mt-1">
                    Consent Requests
                  </h1>

                </div>

                <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center">
                  <Lock size={24} className="text-emerald-100" />
                </div>

              </div>

              <p className="text-emerald-100 mt-3 max-w-md">
                Securely manage hospital access requests for your medical records
              </p>

            </div>

          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

            <StatCard
              title="Total Requests"
              value={stats.total}
              icon={FileText}
              color="blue"
            />

            <StatCard
              title="Pending"
              value={stats.pending}
              icon={Clock3}
              color="amber"
            />

            <StatCard
              title="Approved"
              value={stats.approved}
              icon={CheckCircle2}
              color="emerald"
            />

            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon={XCircle}
              color="red"
            />

          </div>

          {/* SEARCH & FILTER */}
          <div className="sticky top-4 z-20 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-3 md:p-4 shadow-lg">

            <div className="flex flex-col gap-3">

              {/* SEARCH */}
              <div className="relative">

                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search hospitals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />

              </div>

              {/* FILTER TABS */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mx-3 px-3 md:mx-0 md:px-0">

                {[
                  { label: 'All', value: 'all' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Approved', value: 'APPROVED' },
                  { label: 'Rejected', value: 'REJECTED' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      filter === option.value
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}

              </div>

            </div>

          </div>

          {/* EMPTY STATE */}
          {!filteredConsents.length ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">

              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} className="text-slate-400" />
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-1">
                No Consent Requests
              </h2>

              <p className="text-sm text-slate-500 mb-6">
                Hospitals requesting access will appear here
              </p>

            </div>
          ) : (

            /* CONSENT CARDS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

              {filteredConsents.map(consent => {
                const status = normalizeStatus(consent.request_status)

                return (
                  <div
                    key={consent.consent_id}
                    onClick={() => setSelectedConsent(consent)}
                    className={`bg-white border border-slate-200 border-l-4 rounded-2xl p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer flex flex-col gap-4 min-h-[200px] group ${getStatusStyle(status)}`}
                  >

                    {/* HEADER */}
                    <div className="flex items-start gap-3">

                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                        <Building2 size={20} className="text-slate-600" />
                      </div>

                      <div className="flex-1 min-w-0">

                        <h3 className="font-semibold text-slate-900 text-sm truncate">
                          {consent.requesting_hospital || 'Hospital'}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          Requesting from
                        </p>

                        <p className="text-xs font-medium text-slate-700 truncate">
                          {consent.requested_to_hospital}
                        </p>

                      </div>

                    </div>

                    {/* META */}
                    <div className="space-y-2 text-sm">

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs">Record Type</span>
                        <span className="font-medium text-slate-900 text-xs">
                          {consent.record_id ? 'Specific Record' : 'All Records'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs">Requested</span>
                        <span className="font-medium text-slate-900 text-xs">
                          {new Date(consent.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                    </div>

                    {/* STATUS BADGE */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">

                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {status}
                      </span>

                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors" />

                    </div>

                  </div>
                )
              })}

            </div>
          )}

        </div>

      </div>

      {/* DETAIL MODAL */}
      {selectedConsent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* MODAL HEADER */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 p-6 md:p-8 flex items-start justify-between gap-4 sticky top-0">

              <div>

                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-4">
                  <ShieldCheck size={24} className="text-emerald-300" />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Consent Request Details
                </h2>

                <p className="text-slate-300 mt-2 text-sm">
                  Review and manage access permissions
                </p>

              </div>

              <button
                onClick={() => setSelectedConsent(null)}
                className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all shrink-0"
              >
                <X size={20} className="text-white" />
              </button>

            </div>

            {/* MODAL BODY */}
            <div className="p-6 md:p-8 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <InfoCard
                  icon={<Building2 size={18} />}
                  label="Requesting Hospital"
                  value={selectedConsent.requesting_hospital}
                />

                <InfoCard
                  icon={<Building2 size={18} />}
                  label="Records From Hospital"
                  value={selectedConsent.requested_to_hospital}
                />

                <InfoCard
                  icon={<FileText size={18} />}
                  label="Record Type"
                  value={selectedConsent.record_id ? `Record ${selectedConsent.record_id}` : 'All Medical Records'}
                />

                <InfoCard
                  icon={<Calendar size={18} />}
                  label="Requested Date"
                  value={
                    selectedConsent.created_at
                      ? new Date(selectedConsent.created_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : '—'
                  }
                />

              </div>

            </div>

            {/* ACTIONS */}
            {normalizeStatus(selectedConsent.request_status) === 'PENDING' && (
              <div className="px-6 md:px-8 py-5 border-t border-slate-200 bg-white sticky bottom-0 flex flex-col sm:flex-row justify-end gap-3">

                <button
                  onClick={() => handleDecision(selectedConsent.consent_id, 'REJECTED')}
                  className="px-5 py-2.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition-all active:scale-95"
                >
                  Reject Request
                </button>

                <button
                  onClick={() => handleDecision(selectedConsent.consent_id, 'APPROVED')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all active:scale-95"
                >
                  Approve Request
                </button>

              </div>
            )}

          </div>

        </div>
      )}
    </>
  )
}

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 hover:shadow-lg hover:border-slate-300 transition-all group">

      <div className="flex items-start justify-between mb-3">

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]} group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>

      </div>

      <p className="text-sm text-slate-600 mb-1">
        {title}
      </p>

      <p className="text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  )
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">

      <div className="flex items-center gap-2 text-slate-600 mb-2">
        {icon}
        <p className="text-xs uppercase tracking-wide font-semibold">
          {label}
        </p>
      </div>

      <p className="text-slate-900 font-semibold break-words">
        {value || '—'}
      </p>

    </div>
  )
}

const normalizeStatus = (status) => String(status || '').toUpperCase()