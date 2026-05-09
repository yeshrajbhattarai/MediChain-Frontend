// src/pages/nurse/Profile.jsx
// FIXED: Breadcrumbs, better error handling, better API integration

import { useEffect, useState } from 'react'
import {
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Activity,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import {
  getNurseProfile,
  updateNurseProfile,
  updateNursePassword,
} from '../../api/nurse'

export default function NurseProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState('ok')

  // Personal edit state
  const [editPersonal, setEditPersonal] = useState(false)
  const [personalForm, setPersonalForm] = useState({
    date_of_birth: '',
    gender: '',
    years_experience: '',
    license_number: '',
    home_address: '',
    bio: '',
  })
  const [personalErrors, setPersonalErrors] = useState({})
  const [savingPersonal, setSavingPersonal] = useState(false)

  // Password state
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)

  // Load profile on mount
  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      setError('')
      const data = await getNurseProfile()
      setProfile(data)
      setPersonalForm({
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        years_experience: data.years_experience || '',
        license_number: data.license_number || '',
        home_address: data.home_address || '',
        bio: data.bio || '',
      })
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'ok') => {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(''), 3000)
  }

  // Save personal details
  const savePersonalDetails = async () => {
    try {
      setSavingPersonal(true)
      setPersonalErrors({})
      await updateNurseProfile(personalForm)
      setProfile((prev) => ({ ...prev, ...personalForm }))
      setEditPersonal(false)
      showToast('Profile updated successfully')
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Failed to update profile', 'err')
    } finally {
      setSavingPersonal(false)
    }
  }

  // Save password
  const savePassword = async () => {
    const errors = {}
    if (!passwordForm.current_password) errors.current_password = 'Required'
    if (!passwordForm.new_password) {
      errors.new_password = 'Required'
    } else if (passwordForm.new_password.length < 8) {
      errors.new_password = 'Min. 8 characters'
    }
    if (!passwordForm.confirm_password) {
      errors.confirm_password = 'Required'
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    try {
      setSavingPassword(true)
      setPasswordErrors({})
      await updateNursePassword(passwordForm)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setShowPassword(false)
      setShowCurrentPwd(false)
      setShowNewPwd(false)
      showToast('Password updated successfully')
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Failed to update password', 'err')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Profile"
          subtitle="Manage your account settings"
          breadcrumbs={[
            { label: 'Nurse Portal', href: '/nurse/dashboard' },
            { label: 'Profile' },
          ]}
        />

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div>
        <PageHeader
          title="Profile"
          subtitle="Manage your account settings"
          breadcrumbs={[
            { label: 'Nurse Portal', href: '/nurse/dashboard' },
            { label: 'Profile' },
          ]}
        />

        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-6">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
            <button
              onClick={loadProfile}
              className="text-xs text-red-600 hover:text-red-700 font-medium mt-3"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-transparent">
      <PageHeader
        title="Profile"
        subtitle="Manage your nursing account and settings"
        breadcrumbs={[
          { label: 'Nurse Portal', href: '/nurse/dashboard' },
          { label: 'Profile' },
        ]}
      />

      {/* TOAST */}
      {toast && (
        <div
          className={`
            mb-6
            flex
            items-center
            gap-3
            px-5
            py-3.5
            rounded-xl
            text-sm
            font-medium
            animate-in
            fade-in
            ${toastType === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}
          `}
        >
          {toastType === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast}
        </div>
      )}

      {/* HERO CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold shrink-0">
            {profile?.full_name?.[0] || 'N'}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {profile?.full_name || 'Nurse'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Registered Nursing Staff</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                Healthcare Staff
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                {profile?.status ? profile.status.toUpperCase() : 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ACCOUNT INFO */}
        <div className="lg:col-span-2 space-y-6">
          {/* STATIC INFO */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 break-all">
                    {profile?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {profile?.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Role</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">Nurse</p>
                </div>
              </div>
            </div>
          </div>

          {/* PERSONAL DETAILS */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Personal Details</h3>
                <p className="text-xs text-gray-500 mt-1">Update your profile information</p>
              </div>
              {!editPersonal && (
                <button
                  onClick={() => setEditPersonal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="px-6 py-5">
              {!editPersonal ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Gender</span>
                    <span className="text-gray-900 font-medium">{profile?.gender || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Date of Birth</span>
                    <span className="text-gray-900 font-medium">{profile?.date_of_birth || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">License Number</span>
                    <span className="text-gray-900 font-medium">{profile?.license_number || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Experience</span>
                    <span className="text-gray-900 font-medium">
                      {profile?.years_experience ? `${profile.years_experience} years` : '—'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">Gender</label>
                    <select
                      value={personalForm.gender}
                      onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    >
                      <option value="">Select…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={personalForm.date_of_birth}
                      onChange={(e) => setPersonalForm({ ...personalForm, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={personalForm.license_number}
                      onChange={(e) => setPersonalForm({ ...personalForm, license_number: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={personalForm.years_experience}
                      onChange={(e) => setPersonalForm({ ...personalForm, years_experience: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => {
                        setEditPersonal(false)
                        setPersonalErrors({})
                      }}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={savePersonalDetails}
                      disabled={savingPersonal}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg"
                    >
                      {savingPersonal ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Security</h3>
              <p className="text-xs text-gray-500 mt-1">Change your password</p>
            </div>
            {!showPassword && (
              <button
                onClick={() => setShowPassword(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Change
              </button>
            )}
          </div>

          <div className="px-6 py-5">
            {!showPassword ? (
              <p className="text-sm text-gray-500">Click "Change" to update your password.</p>
            ) : (
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? 'text' : 'password'}
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, current_password: e.target.value })
                      }
                      className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${
                        passwordErrors.current_password ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {passwordErrors.current_password && (
                    <p className="text-xs text-red-600 mt-1">{passwordErrors.current_password}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new_password: e.target.value })
                      }
                      className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${
                        passwordErrors.new_password ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {passwordErrors.new_password && (
                    <p className="text-xs text-red-600 mt-1">{passwordErrors.new_password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                      }
                      className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${
                        passwordErrors.confirm_password ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {passwordErrors.confirm_password && (
                    <p className="text-xs text-red-600 mt-1">{passwordErrors.confirm_password}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => {
                      setShowPassword(false)
                      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
                      setPasswordErrors({})
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePassword}
                    disabled={savingPassword}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg"
                  >
                    {savingPassword ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}