import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPatientConsents } from '../../api/consent'
import {
  Activity,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Clock3,
  ChevronRight,
  TrendingUp,
  Zap,
  ArrowRight,
  Calendar,
  User,
  Droplet,
  AlertCircle,
} from 'lucide-react'

import { getPayload } from '../../auth_store/authStore'
import { errorToast } from '../../utils/alert'
import {
  getPatientDashboard,
  getPatientProfile,
} from '../../api/patient'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState(null)
  const [consents, setConsents] = useState([])
  const [profile, setProfile] = useState(null)

  const payload = getPayload()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const [dashboardData, consentData, profileData] = await Promise.all([
        getPatientDashboard(),
        getPatientConsents(),
        getPatientProfile(),
      ])
      setProfile(profileData)
      setDashboard(dashboardData)
      setConsents(Array.isArray(consentData) ? consentData : [])
    } catch (err) {
      errorToast(err?.message || err?.error || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const pendingConsents = consents.filter(
    consent =>
      consent.patient_choice === 'PENDING' &&
      consent.request_status === 'PENDING'
  )

  const stats = dashboard?.stats || {}
  const totalRecords = stats.total_lab_requests || stats.total_requests || stats.total_records || 0
  const pendingRequests = stats.pending_lab_requests || stats.pending_requests || 0
  const approvedConsents = stats.completed_requests || stats.approved_consents || 0
  const activityCount = stats.hospitals_count || stats.activity_count || 0

  const patientName = profile?.patient?.full_name || payload?.patient_name || payload?.full_name || 'Patient'

  const statCards = [
    {
      title: 'Medical Records',
      value: totalRecords,
      icon: FileText,
      color: 'blue',
      trend: '+2 this month',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      icon: Clock3,
      color: 'amber',
      trend: 'Awaiting action',
    },
    {
      title: 'Approved Access',
      value: approvedConsents,
      icon: ShieldCheck,
      color: 'emerald',
      trend: 'Verified',
    },
    {
      title: 'Health Activity',
      value: activityCount,
      icon: Activity,
      color: 'purple',
      trend: 'Active',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">

          <div className="h-32 rounded-3xl bg-slate-200" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200" />
            ))}
          </div>

          <div className="h-40 rounded-2xl bg-slate-200" />

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white p-6 md:p-8 shadow-xl">

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full -ml-20 -mb-20" />

          <div className="relative z-10">

            <div className="flex items-start justify-between gap-4 mb-2">

              <div>

                <p className="text-blue-100 text-sm font-medium">Welcome back,</p>

                <h1 className="text-3xl md:text-4xl font-bold mt-1">
                  {patientName}
                </h1>

              </div>

              <div className="text-right">

                <p className="text-blue-100 text-sm">
                  {new Date().toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>

                {pendingConsents.length > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-400/20 border border-blue-300/30 rounded-full px-3 py-1">
                    <AlertCircle size={14} />
                    <span className="text-xs font-semibold">{pendingConsents.length} actions needed</span>
                  </div>
                )}

              </div>

            </div>

            <p className="text-blue-100 mt-3 max-w-md">
              Your healthcare dashboard gives you access to all medical records, reports, and consents.
            </p>

          </div>

        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

          {statCards.map((card, index) => {
            const Icon = card.icon
            const colorMap = {
              blue: 'bg-blue-50 text-blue-600',
              amber: 'bg-amber-50 text-amber-600',
              emerald: 'bg-emerald-50 text-emerald-600',
              purple: 'bg-purple-50 text-purple-600',
            }

            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group"
              >

                <div className="flex items-start justify-between mb-3">

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[card.color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>

                  <span className="text-xs font-medium text-slate-500">
                    {card.trend}
                  </span>

                </div>

                <p className="text-sm text-slate-600 mb-1">
                  {card.title}
                </p>

                <p className="text-3xl font-bold text-slate-900">
                  {card.value}
                </p>

              </div>
            )
          })}

        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {[
            { label: 'All Records', icon: FileText, path: '/patient/records', color: 'blue' },
            { label: 'Manage Consent', icon: ShieldCheck, path: '/patient/consent', color: 'emerald' },
            { label: 'View Profile', icon: User, path: '/patient/profile', color: 'purple' },
            { label: 'Lab Reports', icon: Droplet, path: '/patient/records', color: 'red' },
          ].map((action, idx) => {
            const Icon = action.icon
            const colorMap = {
              blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
              emerald: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600',
              purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
              red: 'bg-red-50 hover:bg-red-100 text-red-600',
            }

            return (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className={`rounded-2xl p-4 border border-slate-200 transition-all duration-200 group active:scale-95 ${colorMap[action.color]} flex flex-col items-center justify-center gap-2`}
              >

                <Icon size={20} />

                <span className="text-xs font-semibold text-center">
                  {action.label}
                </span>

              </button>
            )
          })}

        </div>

        {/* PENDING CONSENTS */}
        {pendingConsents.length > 0 && (
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-6 md:p-8 shadow-lg">

            <div className="flex items-start gap-4 mb-6">

              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <ShieldAlert size={24} className="text-amber-600" />
              </div>

              <div className="flex-1">

                <h2 className="text-2xl font-bold text-slate-900">
                  Pending Consent Approvals
                </h2>

                <p className="text-sm text-slate-600 mt-1">
                  {pendingConsents.length} hospital{pendingConsents.length !== 1 ? 's are' : ' is'} requesting access to your medical records
                </p>

              </div>

              <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold shrink-0">
                {pendingConsents.length} Pending
              </span>

            </div>

            <div className="space-y-3">

              {pendingConsents.slice(0, 3).map(consent => (
                <div
                  key={consent.consent_id}
                  className="bg-white border border-amber-100 rounded-2xl p-4 hover:shadow-md transition-all group"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex-1">

                      <h3 className="font-semibold text-slate-900">
                        {consent.requesting_hospital || 'Hospital'}
                      </h3>

                      <div className="flex flex-wrap gap-2 mt-2">

                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ Hospital Approved
                        </span>

                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          ⏳ Waiting for You
                        </span>

                      </div>

                    </div>

                    <button
                      onClick={() => navigate('/patient/consent')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shrink-0"
                    >
                      Review
                    </button>

                  </div>

                </div>
              ))}

            </div>

            {pendingConsents.length > 3 && (
              <button
                onClick={() => navigate('/patient/consent')}
                className="mt-4 w-full py-2.5 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold text-sm transition-colors"
              >
                View All {pendingConsents.length} Requests
              </button>
            )}

          </div>
        )}

        {/* RECENT RECORDS */}
        {dashboard?.recent_activity?.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

            <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Recent Activity
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Your latest healthcare interactions
                </p>

              </div>

              <button
                onClick={() => navigate('/patient/records')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-medium text-sm transition-colors"
              >

                View All
                <ChevronRight size={16} />

              </button>

            </div>

            <div className="divide-y divide-slate-100">

              {dashboard.recent_activity.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="px-6 md:px-8 py-4 hover:bg-slate-50 transition-colors group"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex-1">

                      <h3 className="font-semibold text-slate-900">
                        {item.title || 'Activity'}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {item.description || 'Healthcare activity'}
                      </p>

                    </div>

                    <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-400 shrink-0 mt-1 transition-colors" />

                  </div>

                </div>
              ))}

            </div>

            {dashboard.recent_activity.length > 5 && (
              <div className="px-6 md:px-8 py-4 bg-slate-50 border-t border-slate-100">

                <button
                  onClick={() => navigate('/patient/records')}
                  className="w-full py-2.5 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                >
                  View All Activities
                </button>

              </div>
            )}

          </div>
        )}

        {!dashboard?.recent_activity?.length && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">

            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Activity size={32} className="text-slate-400" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No recent activity
            </h3>

            <p className="text-sm text-slate-500 mb-6">
              Your healthcare interactions will appear here
            </p>

            <button
              onClick={() => navigate('/patient/records')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
            >

              <FileText size={16} />
              View Records

            </button>

          </div>
        )}

        {/* PROFILE SUMMARY */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

          <div className="px-6 md:px-8 py-5 border-b border-slate-100">

            <h2 className="text-xl font-bold text-slate-900">
              Health Profile
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Your personal healthcare information
            </p>

          </div>

          <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">

            <ProfileField
              label="Full Name"
              value={patientName}
            />

            <ProfileField
              label="Patient ID"
              value={payload?.patient_id || '—'}
              mono
            />

            <ProfileField
              label="Phone"
              value={profile?.patient?.phone || '—'}
            />

            <ProfileField
              label="Gender"
              value={profile?.patient?.gender || '—'}
            />

            <ProfileField
              label="Blood Group"
              value={profile?.patient?.blood_group || '—'}
            />

            <ProfileField
              label="Date of Birth"
              value={profile?.patient?.date_of_birth ? new Date(profile.patient.date_of_birth).toLocaleDateString('en-IN') : '—'}
            />

            <ProfileField
              label="Email"
              value={profile?.patient?.email || '—'}
            />

            <ProfileField
              label="Status"
              value="Active"
              badge
              badgeColor="emerald"
            />

          </div>

          <div className="px-6 md:px-8 py-4 bg-slate-50 border-t border-slate-100">

            <button
              onClick={() => navigate('/patient/profile')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors flex items-center gap-2"
            >

              Update Profile
              <ArrowRight size={16} />

            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

function ProfileField({ label, value, mono, badge, badgeColor }) {
  return (
    <div>

      <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-2">
        {label}
      </p>

      {badge ? (
        <div className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${
          badgeColor === 'emerald' 
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-slate-100 text-slate-700'
        }`}>
          {value}
        </div>
      ) : (
        <p className={`font-semibold text-slate-900 ${mono ? 'font-mono text-xs' : ''}`}>
          {value}
        </p>
      )}

    </div>
  )
}