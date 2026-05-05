// src/pages/auth/Register.jsx

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Input from '../../components/ui/Input'
import BackButton from '../../components/ui/BackButton'
import { registerHospital, verifyOTP, resendOTP } from '../../api/auth'
import { successAlert, successToast, errorToast, infoToast } from '../../utils/alert'

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {['Details', 'Verify'].map((label, i) => {
        const step = i + 1
        const done = current > step
        const active = current === step
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
              ${done || active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {done ? '✓' : step}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-gray-800' : 'text-gray-500'}`}>{label}</span>
            {i < 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1 ────────────────────────────────────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const [form, setForm]       = useState({ hospital_name: '', email: '', contact_number: '', password: '', confirm_password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const data = await registerHospital(form)
      infoToast('OTP sent to your email!')
      onSuccess(data.hospital_id, form.email)
    } catch (err) {
      setErrors(err?.errors || { general: 'Registration failed. Please try again.' })
      errorToast('Registration failed. Check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 w-full max-w-xl">
      <Steps current={1} />

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Register your hospital</h1>
        <p className="text-sm text-gray-500 mb-4">Fill in the details to create your MediChain account.</p>
      </div>

      {errors.general && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{errors.general}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input label="Hospital name" name="hospital_name" placeholder="Apollo Hospital" onChange={handle} error={errors.hospital_name?.[0]} required />
        </div>
        <Input label="Email"          name="email"          type="email" placeholder="admin@hospital.com" onChange={handle} error={errors.email?.[0]}          required />
        <Input label="Contact number" name="contact_number"              placeholder="9876543210"          onChange={handle} error={errors.contact_number?.[0]}  required />
        <Input label="Password"         name="password"         type="password" placeholder="Min. 8 characters" onChange={handle} error={errors.password?.[0]}         required />
        <Input label="Confirm password" name="confirm_password" type="password" placeholder="Repeat password"   onChange={handle} error={errors.confirm_password?.[0]} required />
      </div>

      <button type="submit" disabled={loading}
        className="mt-1 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium text-sm rounded-lg py-2.5 transition-colors duration-150 cursor-pointer">
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Already registered?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
      </p>
    </form>
  )
}

// ── Step 2 ────────────────────────────────────────────────────────────────────
function OTPForm({ hospitalId, email }) {
  const navigate = useNavigate()
  const [otp, setOtp]             = useState('')
  const [loading, setLoading]     = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError]         = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOTP(hospitalId, otp)
      await successAlert('Email Verified!', 'Your hospital account is ready. Please sign in.')
      navigate('/login')
    } catch (err) {
      const msg = err?.error || 'Invalid OTP. Please try again.'
      setError(msg)
      errorToast(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true); setError('')
    try {
      await resendOTP(hospitalId)
      infoToast('New OTP sent to your email.')
    } catch (err) {
      const msg = err?.error || 'Failed to resend OTP.'
      setError(msg)
      errorToast(msg)
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 w-full max-w-sm">
      <Steps current={2} />
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Check your email</h1>
        <p className="text-sm text-gray-500 mb-6">
          We sent a 6-digit OTP to <span className="text-gray-700 font-medium">{email}</span>
        </p>
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}
      <Input label="One-time password" name="otp" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
      <button type="submit" disabled={loading}
        className="mt-1 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium text-sm rounded-lg py-2.5 transition-colors duration-150 cursor-pointer">
        {loading ? 'Verifying…' : 'Verify email'}
      </button>
      <button type="button" onClick={handleResend} disabled={resending}
        className="text-sm text-blue-600 hover:underline text-center disabled:opacity-50 bg-transparent border-none cursor-pointer">
        {resending ? 'Resending…' : "Didn't get it? Resend OTP"}
      </button>
    </form>
  )
}

// ── Right panel ───────────────────────────────────────────────────────────────
function RightPanel() {
  const stats = [
    { icon: '👨‍⚕️', label: 'Doctors',  value: '2,400+' },
    { icon: '🏥',  label: 'Hospitals', value: '180+'   },
    { icon: '📋',  label: 'Records',   value: '94k+'   },
  ]
  const feed = [
    { hospital: 'Apollo Delhi',     action: 'transferred a record', time: '2m ago',  color: 'bg-blue-500'    },
    { hospital: 'Fortis Mumbai',    action: 'approved a consent',   time: '5m ago',  color: 'bg-emerald-500' },
    { hospital: 'AIIMS Kolkata',    action: 'added a new patient',  time: '9m ago',  color: 'bg-violet-500'  },
    { hospital: 'Max Bangalore',    action: 'ran CKD prediction',   time: '14m ago', color: 'bg-amber-500'   },
    { hospital: 'Medanta Gurugram', action: 'verified record hash', time: '21m ago', color: 'bg-blue-500'    },
  ]
  return (
    <div className="flex flex-col gap-6 w-full max-w-xs">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Live network</p>
        <h2 className="text-lg font-bold text-gray-800">Hospitals on MediChain</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon, label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-1 text-center shadow-sm">
            <span className="text-xl">{icon}</span>
            <p className="text-base font-bold text-blue-600">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-xs font-semibold text-gray-600">Recent activity</p>
        </div>
        <div className="divide-y divide-gray-50">
          {feed.map(({ hospital, action, time, color }, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {hospital[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{hospital}</p>
                <p className="text-xs text-gray-400">{action}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{time}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center leading-relaxed">
        Join hospitals already exchanging records securely with full patient consent.
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Register() {
  const [step, setStep]         = useState(1)
  const [hospitalId, setHospitalId] = useState('')
  const [email, setEmail]       = useState('')

  const handleRegistered = (id, mail) => {
    setHospitalId(id); setEmail(mail); setStep(2)
  }

  return (
    <div className="min-h-screen flex">
      <BackButton to="/" label="Back" />
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 bg-white">
        <div className="mb-10 mt-16 lg:mt-0 lg:mb-10">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">M</div>
            <span className="font-semibold text-gray-900 text-lg">MediChain</span>
          </Link>
        </div>
        {step === 1
          ? <RegisterForm onSuccess={handleRegistered} />
          : <OTPForm hospitalId={hospitalId} email={email} />
        }
      </div>
      <div className="hidden lg:flex w-[42%] bg-gray-50 border-l border-gray-100 flex-col items-center justify-center px-14">
        <RightPanel />
      </div>
    </div>
  )
}