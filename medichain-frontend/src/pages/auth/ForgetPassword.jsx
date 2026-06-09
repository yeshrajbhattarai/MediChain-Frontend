// src/pages/auth/ForgotPassword.jsx
//
// Two-step forgot password flow for Hospital / Staff users.
// Step 1 — Enter email → backend sends OTP
// Step 2 — Enter OTP + new password → backend resets and redirects to /login
//
// API endpoints used:
//   POST /api/v1/forgot-password/        { email }
//   POST /api/v1/forgot-password/verify/ { email, otp, new_password, confirm_password }

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react'
import { successToast, errorToast } from '../../utils/alert'

const BASE = '/api/v1'

// ── tiny fetch helpers (no auth needed) ─────────────────────────────────────
async function apiPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }) {
  const labels = ['Enter email', 'Reset password']
  return (
    <div className="flex items-center gap-2 mb-8">
      {labels.map((label, i) => {
        const step   = i + 1
        const done   = current > step
        const active = current === step
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
              ${done || active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {done ? '✓' : step}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-gray-800' : 'text-gray-500'}`}>{label}</span>
            {i < labels.length - 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1 — Email entry ─────────────────────────────────────────────────────
function EmailStep({ onSuccess }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiPost('/forgot-password/', { email: email.trim().toLowerCase() })
      successToast('OTP sent! Check your email.')
      onSuccess(email.trim().toLowerCase())
    } catch (err) {
      const msg = err?.error || err?.errors?.email || err?.errors?.detail || 'Something went wrong. Please try again.'
      setError(Array.isArray(msg) ? msg[0] : msg)
      errorToast(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <Steps current={1} />

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Forgot password?</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your registered email and we'll send you a 6-digit OTP to reset your password.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Email address</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@hospital.com"
            required
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                   text-white font-medium text-sm rounded-lg py-2.5 transition-colors duration-150 cursor-pointer"
      >
        {loading ? 'Sending OTP…' : 'Send OTP'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Remembered it?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
      </p>
    </form>
  )
}

// ── Step 2 — OTP + new password ───────────────────────────────────────────────
function ResetStep({ email, onBack }) {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    otp:              '',
    new_password:     '',
    confirm_password: '',
  })
  const [loading,     setLoading]     = useState(false)
  const [resending,   setResending]   = useState(false)
  const [errors,      setErrors]      = useState({})
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await apiPost('/forgot-password/verify/', {
        email:            email,
        otp:              form.otp.trim(),
        new_password:     form.new_password,
        confirm_password: form.confirm_password,
      })
      successToast('Password reset! Please sign in.')
      navigate('/login')
    } catch (err) {
      const errs = err?.errors || {}
      if (typeof errs === 'string') {
        setErrors({ detail: errs })
        errorToast(errs)
      } else {
        setErrors(errs)
        const first = Object.values(errs)[0]
        errorToast(Array.isArray(first) ? first[0] : first)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setErrors({})
    try {
      await apiPost('/forgot-password/', { email })
      successToast('New OTP sent to your email.')
    } catch (err) {
      const msg = err?.error || 'Failed to resend OTP.'
      setErrors({ detail: Array.isArray(msg) ? msg[0] : msg })
      errorToast(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setResending(false)
    }
  }

  const firstError = (key) => {
    const v = errors[key]
    if (!v) return null
    return Array.isArray(v) ? v[0] : v
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <Steps current={2} />

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reset your password</h1>
        <p className="text-sm text-gray-500 mb-6">
          We sent a 6-digit OTP to{' '}
          <span className="text-gray-700 font-medium">{email}</span>
        </p>
      </div>

      {(errors.detail) && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {errors.detail}
        </div>
      )}

      {/* OTP field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">One-time password</label>
        <div className="relative">
          <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="otp"
            value={form.otp}
            onChange={handle}
            placeholder="6-digit OTP"
            maxLength={6}
            required
            className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg outline-none
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        ${firstError('otp') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
          />
        </div>
        {firstError('otp') && <p className="text-xs text-red-500">{firstError('otp')}</p>}
      </div>

      {/* New password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">New password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="new_password"
            type={showPass ? 'text' : 'password'}
            value={form.new_password}
            onChange={handle}
            placeholder="Min. 8 characters"
            required
            className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg outline-none
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        ${firstError('new_password') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {firstError('new_password') && <p className="text-xs text-red-500">{firstError('new_password')}</p>}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Confirm new password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="confirm_password"
            type={showConfirm ? 'text' : 'password'}
            value={form.confirm_password}
            onChange={handle}
            placeholder="Repeat new password"
            required
            className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg outline-none
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        ${firstError('confirm_password') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {firstError('confirm_password') && <p className="text-xs text-red-500">{firstError('confirm_password')}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                   text-white font-medium text-sm rounded-lg py-2.5 transition-colors duration-150 cursor-pointer"
      >
        {loading ? 'Resetting…' : 'Reset password'}
      </button>

      {/* Resend + back */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} /> Wrong email?
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-sm text-blue-600 hover:underline disabled:opacity-50 bg-transparent border-none cursor-pointer"
        >
          {resending ? 'Resending…' : "Resend OTP"}
        </button>
      </div>
    </form>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const [step,  setStep]  = useState(1)
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen flex">
      {/* Left — form panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white">
        <div className="mb-12">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">M</div>
            <span className="font-semibold text-gray-900 text-lg">MediChain</span>
          </Link>
        </div>

        {step === 1
          ? <EmailStep onSuccess={(mail) => { setEmail(mail); setStep(2) }} />
          : <ResetStep email={email} onBack={() => setStep(1)} />
        }
      </div>

      {/* Right — decorative panel (mirrors Login) */}
      <div className="hidden lg:flex w-[45%] bg-gray-50 border-l border-gray-100 flex-col items-center justify-center px-16 gap-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
          <ShieldCheck size={32} className="text-blue-600" />
        </div>
        <div className="text-center max-w-xs">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Secure password reset</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            We verify your identity with a one-time OTP sent to your registered email before allowing any password change.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {[
            { step: '1', text: 'Enter your registered email address' },
            { step: '2', text: 'Receive a 6-digit OTP in your inbox' },
            { step: '3', text: 'Set your new password securely' },
          ].map(({ step: s, text }) => (
            <div key={s} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {s}
              </div>
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}