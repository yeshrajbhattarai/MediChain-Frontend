import { useEffect, useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplet,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

import {
  getPatientProfile,
  updatePatientPassword,
  updatePatientProfile,
} from '../../api/patient'

import { successToast, errorToast } from '../../utils/alert'

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function PatientProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [form, setForm] = useState({})
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_new_password: '' })
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    getPatientProfile()
      .then(d => {
        setProfile(d)
        const p = d.patient || {}
        setForm({
          full_name: p.full_name || '',
          email: p.email || '',
          phone: p.phone || '',
          address: p.address || '',
          gender: p.gender || '',
          date_of_birth: p.date_of_birth || '',
          blood_group: p.blood_group || '',
          gov_id_type: d.gov_id?.type || '',
          gov_id_number: '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      const data = await updatePatientProfile(form)
      if (data?.success === false) {
        const errs = data?.errors || {}
        const first = Object.values(errs)[0]
        setMsg({ type: 'error', text: Array.isArray(first) ? first[0] : first || data?.error || 'Update failed.' })
        return
      }

      successToast('Profile updated successfully')
      setMsg({ type: 'success', text: 'Profile updated successfully.' })
      const refresh = await getPatientProfile()
      setProfile(refresh)
    } catch (error) {
      const errs = error?.data?.errors || {}
      const first = Object.values(errs)[0]
      errorToast(Array.isArray(first) ? first[0] : first || error?.data?.error || 'Network error.')
      setMsg({ type: 'error', text: Array.isArray(first) ? first[0] : first || error?.data?.error || 'Network error.' })
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSave() {
    setPwSaving(true)
    setPwMsg({ type: '', text: '' })
    try {
      const data = await updatePatientPassword(pwForm)
      if (data?.success === false) {
        errorToast(data?.error || 'Failed to update password.')
        setPwMsg({ type: 'error', text: data?.error || 'Failed to update password.' })
        return
      }

      successToast('Password updated successfully')
      setPwMsg({ type: 'success', text: data?.message || 'Password updated successfully.' })
      setPwForm({ current_password: '', new_password: '', confirm_new_password: '' })
    } catch (error) {
      errorToast(error?.data?.error || 'Network error.')
      setPwMsg({ type: 'error', text: error?.data?.error || 'Network error.' })
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return <Spinner />

  const patient = profile?.patient || {}
  const govId = profile?.gov_id || {}
  const missing = profile?.missing_fields || []
  const completion = profile?.profile_completion_percent || 0

  const inp = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 transition-colors'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white p-6 md:p-8 shadow-xl">

          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full -ml-20 -mb-20" />

          <div className="relative z-10">

            <div className="flex items-start justify-between gap-4 mb-4">

              <div>

                <p className="text-blue-100 text-sm font-medium">Your Identity</p>

                <h1 className="text-3xl md:text-4xl font-bold mt-1">
                  {patient.full_name || 'My Profile'}
                </h1>

              </div>

              <div className="w-12 h-12 rounded-2xl bg-blue-400/20 border border-blue-300/30 flex items-center justify-center">
                <Shield size={24} className="text-blue-100" />
              </div>

            </div>

            <p className="text-blue-100 max-w-md text-sm">
              Manage your personal healthcare information, security settings, and preferences
            </p>

          </div>

        </div>

        {/* PROFILE COMPLETION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">

          <div className="flex items-center justify-between mb-3">

            <p className="text-sm font-semibold text-slate-900">Profile Completion</p>

            <span className={`text-sm font-bold ${completion === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {completion}%
            </span>

          </div>

          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${completion === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
              style={{ width: `${completion}%` }}
            />
          </div>

          {missing.length > 0 && (
            <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
              <AlertCircle size={14} />
              Missing: {missing.join(', ')}
            </p>
          )}

        </div>

        {/* TABS */}
        <div className="border-b border-slate-200">

          <div className="flex gap-1 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">

            {[
              { key: 'info', label: 'Personal Info', icon: '👤' },
              { key: 'password', label: 'Security', icon: '🔒' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap flex items-center gap-2 ${
                  tab === key
                    ? 'text-emerald-600 border-emerald-600'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}

          </div>

        </div>

        {/* INFO TAB */}
        {tab === 'info' && (
          <div className="space-y-6">

            {msg.text && (
              <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-3 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {msg.text}
              </div>
            )}

            {/* BASIC INFO SECTION */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-5">

              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <InputField
                  label="Full Name"
                  icon={User}
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                />

                <InputField
                  label="Email"
                  icon={Mail}
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />

                <InputField
                  label="Phone"
                  icon={Phone}
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />

                <SelectField
                  label="Gender"
                  options={['Male', 'Female', 'Other']}
                  value={form.gender}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                />

                <InputField
                  label="Date of Birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                />

                <SelectField
                  label="Blood Group"
                  options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                  value={form.blood_group}
                  onChange={e => setForm(f => ({ ...f, blood_group: e.target.value }))}
                />

              </div>

              {/* ADDRESS */}
              <div>

                <label className="text-xs uppercase tracking-wide font-semibold text-slate-600 mb-2 flex items-center gap-2 block">
                  <MapPin size={14} />
                  Address
                </label>

                <textarea
                  className={inp + ' resize-none h-20'}
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                />

              </div>

            </div>

            {/* GOVERNMENT ID SECTION */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-5">

              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield size={20} className="text-emerald-600" />
                Government Identification
              </h2>

              {govId.locked ? (
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">

                  <div>

                    <p className="text-sm font-medium text-emerald-900 capitalize">
                      {govId.type}: {govId.number_masked}
                    </p>

                    <p className="text-xs text-emerald-700 mt-1">
                      Verified and locked for security
                    </p>

                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-200/50 text-emerald-700 text-xs font-semibold shrink-0">
                    <CheckCircle2 size={14} />
                    Verified
                  </div>

                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <SelectField
                    label="ID Type"
                    options={[{ label: 'Aadhar', value: 'aadhar' }, { label: 'Voter ID', value: 'voter' }]}
                    value={form.gov_id_type}
                    onChange={e => setForm(f => ({ ...f, gov_id_type: e.target.value }))}
                    isComplex
                  />

                  <InputField
                    label="ID Number"
                    placeholder="Enter ID number"
                    value={form.gov_id_number}
                    onChange={e => setForm(f => ({ ...f, gov_id_number: e.target.value }))}
                  />

                </div>
              )}

            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-end">

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-sm transition-all active:scale-95"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>

            </div>

          </div>
        )}

        {/* PASSWORD TAB */}
        {tab === 'password' && (
          <div className="space-y-6">

            {pwMsg.text && (
              <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-3 ${
                pwMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {pwMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {pwMsg.text}
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-5">

              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock size={20} className="text-blue-600" />
                Change Password
              </h2>

              {[
                { key: 'current_password', label: 'Current Password' },
                { key: 'new_password', label: 'New Password' },
                { key: 'confirm_new_password', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key}>

                  <label className="text-xs uppercase tracking-wide font-semibold text-slate-600 mb-2 block">
                    {label}
                  </label>

                  <input
                    type="password"
                    className={inp}
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  />

                </div>
              ))}

              <div className="flex justify-end pt-3">

                <button
                  onClick={handlePasswordSave}
                  disabled={pwSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm transition-all active:scale-95"
                >
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  )
}

function InputField({ label, icon: Icon, type = 'text', placeholder, value, onChange }) {
  return (
    <div>

      <label className="text-xs uppercase tracking-wide font-semibold text-slate-600 mb-2 flex items-center gap-2 block">
        {Icon && <Icon size={14} />}
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 transition-colors"
      />

    </div>
  )
}

function SelectField({ label, options, value, onChange, isComplex }) {
  return (
    <div>

      <label className="text-xs uppercase tracking-wide font-semibold text-slate-600 mb-2 block">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 transition-colors"
      >
        <option value="">Select…</option>
        {options.map(opt => (
          <option key={isComplex ? opt.value : opt} value={isComplex ? opt.value : opt}>
            {isComplex ? opt.label : opt}
          </option>
        ))}
      </select>

    </div>
  )
}