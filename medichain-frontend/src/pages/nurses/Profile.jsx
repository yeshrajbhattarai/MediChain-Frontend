// src/pages/nurse/Profile.jsx
// FIXED & PRODUCTION READY
// Integrates with: getNurseProfile(), updateNurseProfile(), updateNursePassword()

import { useEffect, useState } from 'react'
import {
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User2,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
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
    async function loadProfile() {
      try {
        setLoading(true)
        setError('')

        const data = await getNurseProfile()
        console.log('Nurse Profile:', data)

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
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

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

      setProfile((prev) => ({
        ...prev,
        ...personalForm,
      }))

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
    // Validate
    const errors = {}
    if (!passwordForm.current_password) {
      errors.current_password = 'Required'
    }
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

      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
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
      <div className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-6">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium animate-in fade-in ${
            toastType === 'ok'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toastType === 'ok' ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your nursing account settings
        </p>
      </div>

      {/* HERO CARD */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-24 h-24 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-semibold shrink-0">
            {profile?.full_name?.[0] || 'N'}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {profile?.full_name || 'Nurse'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Registered Nursing Staff
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* LEFT - STATIC INFO */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <h3 className="font-semibold text-gray-900 mb-5">
            Account Information
          </h3>

          <div className="space-y-4">
            <InfoField
              icon={User2}
              label="Full Name"
              value={profile?.full_name}
            />
            <InfoField
              icon={Mail}
              label="Email"
              value={profile?.email}
            />
            <InfoField
              icon={Phone}
              label="Phone"
              value={profile?.phone}
            />
            {profile?.specialization && (
              <InfoField
                icon={User2}
                label="Role"
                value={profile.role || 'Nurse'}
              />
            )}
          </div>

          <p className="text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100">
            Account managed by hospital administrator
          </p>
        </div>

        {/* RIGHT - EDITABLE SECTIONS */}
        <div className="space-y-5">
          {/* PERSONAL DETAILS */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Personal Details
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Update your profile information
                </p>
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
                  <InfoRow
                    label="Gender"
                    value={profile?.gender || '—'}
                  />
                  <InfoRow
                    label="Date of Birth"
                    value={profile?.date_of_birth || '—'}
                  />
                  <InfoRow
                    label="License Number"
                    value={profile?.license_number || '—'}
                  />
                  <InfoRow
                    label="Years of Experience"
                    value={
                      profile?.years_experience
                        ? `${profile.years_experience} years`
                        : '—'
                    }
                  />
                  <InfoRow
                    label="Home Address"
                    value={profile?.home_address || '—'}
                  />
                  {profile?.bio && (
                    <InfoRow label="Bio" value={profile.bio} />
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <FormField
                    label="Gender"
                    as="select"
                    value={personalForm.gender}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        gender: e.target.value,
                      })
                    }
                  >
                    <option value="">Select…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </FormField>

                  <FormField
                    label="Date of Birth"
                    type="date"
                    value={personalForm.date_of_birth}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        date_of_birth: e.target.value,
                      })
                    }
                  />

                  <FormField
                    label="License Number"
                    value={personalForm.license_number}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        license_number: e.target.value,
                      })
                    }
                  />

                  <FormField
                    label="Years of Experience"
                    type="number"
                    value={personalForm.years_experience}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        years_experience: e.target.value,
                      })
                    }
                  />

                  <FormField
                    label="Home Address"
                    value={personalForm.home_address}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        home_address: e.target.value,
                      })
                    }
                  />

                  <FormField
                    label="Bio"
                    as="textarea"
                    rows={3}
                    value={personalForm.bio}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        bio: e.target.value,
                      })
                    }
                  />

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
      </div>

      {/* PASSWORD SECTION */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Security</h3>
            <p className="text-xs text-gray-400 mt-1">
              Change your account password
            </p>
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
            <p className="text-sm text-gray-500">
              Click "Change" to update your password.
            </p>
          ) : (
            <div className="space-y-4">
              <PasswordField
                label="Current Password"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value,
                  })
                }
                show={showCurrentPwd}
                onToggle={() => setShowCurrentPwd(!showCurrentPwd)}
                error={passwordErrors.current_password}
              />

              <PasswordField
                label="New Password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                show={showNewPwd}
                onToggle={() => setShowNewPwd(!showNewPwd)}
                error={passwordErrors.new_password}
              />

              <PasswordField
                label="Confirm New Password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
                show={showCurrentPwd}
                onToggle={() => setShowCurrentPwd(!showCurrentPwd)}
                error={passwordErrors.confirm_password}
              />

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => {
                    setShowPassword(false)
                    setPasswordForm({
                      current_password: '',
                      new_password: '',
                      confirm_password: '',
                    })
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
  )
}

// ─────────────────────────────────────────────────────────────
// Info Field (read-only)
// ─────────────────────────────────────────────────────────────

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 font-medium truncate">
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Info Row
// ─────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Form Field
// ─────────────────────────────────────────────────────────────

function FormField({
  label,
  as = 'input',
  error,
  ...props
}) {
  const Component = as
  const inputClass = `w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`

  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
        {label}
      </label>
      <Component className={inputClass} {...props} />
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Password Field
// ─────────────────────────────────────────────────────────────

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  error,
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={`w-full border ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200'
          } rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  )
}