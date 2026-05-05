// src/pages/auth/Login.jsx

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Input from '../../components/ui/Input'
import { login } from '../../api/auth'
import { saveTokens, getDashboardRoute } from '../../auth_store/authStore'
import { fetchAndSaveProfile } from '../../auth_store/profileStore'
import { successToast, errorToast } from '../../utils/alert'

const BASE = 'http://localhost:8000/api/v1'

const FEATURE_CARDS = [
  { src: 'https://cdn.lordicon.com/xovdoewm.json', label: 'Secure transfer' },
  { src: 'https://cdn.lordicon.com/gqzfzudq.json', label: 'Multi-hospital'  },
  { src: 'https://cdn.lordicon.com/uukerzzv.json', label: 'Dual consent'    },
  { src: 'https://cdn.lordicon.com/nfuackpv.json', label: 'Lab records'     },
  { src: 'https://cdn.lordicon.com/apbwvyeg.json', label: 'CKD prediction'  },
  { src: 'https://cdn.lordicon.com/egmlnyku.json', label: 'Audit trail'     },
]

function extractError(val) {
  if (!val) return null
  if (Array.isArray(val)) return val[0]
  if (typeof val === 'string') return val
  return null
}

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]           = useState({ email: '', password: '' })
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [isPatient, setIsPatient] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let data
      if (isPatient) {
        const res = await fetch(`${BASE}/patient/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        })
        data = await res.json()
        if (!res.ok) throw { errors: data.errors || {} }
        saveTokens(data.tokens.access, data.tokens.refresh)
      } else {
        data = await login(form.email, form.password)
        saveTokens(data.tokens.access, data.tokens.refresh)
        await fetchAndSaveProfile()
      }
      successToast('Welcome back!')
      navigate(getDashboardRoute())
    } catch (err) {
      const e = err?.errors || {}
      const msg =
        extractError(e.non_field_errors) ||
        extractError(e.email)            ||
        extractError(e.password)         ||
        extractError(err?.detail)        ||
        'Invalid credentials. Please try again.'
      setError(msg)
      errorToast(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white">
        <div className="mb-12">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">M</div>
            <span className="font-semibold text-gray-900 text-lg">MediChain</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-8">Enter your credentials to access your dashboard.</p>

          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Role toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button type="button"
              onClick={() => { setIsPatient(false); setError('') }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors
                ${!isPatient ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              Hospital / Staff
            </button>
            <button type="button"
              onClick={() => { setIsPatient(true); setError('') }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors
                ${isPatient ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              Patient
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" name="email" type="email" placeholder="you@hospital.com" onChange={handleChange} required />
            <Input label="Password" name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
            <button type="submit" disabled={loading}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium text-sm rounded-lg py-2.5 transition-colors duration-150 cursor-pointer">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500">
            New hospital?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">Register here</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-[45%] bg-gray-50 border-l border-gray-100 flex-col items-center justify-center px-16 gap-10">
        <div className="grid grid-cols-3 gap-4">
          {FEATURE_CARDS.map(({ src, label }) => (
            <div key={label} className="flex flex-col items-center gap-2.5 bg-white border border-gray-200 rounded-xl p-4 text-center">
              <lord-icon src={src} trigger="loop" colors="primary:#1d4ed8,secondary:#1d4ed8" style={{ width: '40px', height: '40px' }} />
              <span className="text-xs text-gray-600 leading-tight font-medium">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 leading-relaxed text-center max-w-xs">
          Secure, consent-driven medical record exchange — built for hospitals that prioritise patient trust.
        </p>
      </div>
    </div>
  )
}