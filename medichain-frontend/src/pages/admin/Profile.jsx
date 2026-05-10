import { useEffect, useState } from 'react'
import {
  Building2, Mail, Phone, MapPin, ShieldCheck, FileText,
  Lock, Pencil, Check, X, Eye, EyeOff, AlertCircle, CheckCircle2
} from 'lucide-react'
import { fetchWithAuth } from '../../api/client'

const api = (url, opts = {}) =>
  fetchWithAuth(`/api/v1${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  })

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium
      ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, locked }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 font-medium truncate">{value || '—'}</p>
      </div>
      {locked && (
        <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium shrink-0 mt-1">
          Locked
        </span>
      )}
    </div>
  )
}

function EditField({ label, name, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          placeholder:text-gray-300 transition-all" />
    </div>
  )
}

function Card({ title, subtitle, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  )
}

export default function AdminProfile() {
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [toast, setToast]           = useState(null)
  const [editAddr, setEditAddr]     = useState(false)
  const [addr, setAddr]             = useState({ address: '', city: '', state: '', country: '' })
  const [savingAddr, setSavingAddr] = useState(false)
  const [editLic, setEditLic]       = useState(false)
  const [lic, setLic]               = useState('')
  const [savingLic, setSavingLic]   = useState(false)
  const [showPwd, setShowPwd]       = useState(false)
  const [pwd, setPwd]               = useState({ current_password: '', new_password: '', confirm_new_password: '' })
  const [savingPwd, setSavingPwd]   = useState(false)
  const [showCur, setShowCur]       = useState(false)
  const [showNew, setShowNew]       = useState(false)

  const toast$ = (msg, type = 'ok') => setToast({ msg, type })

  useEffect(() => {
    api('/profile/').then(r => r.json()).then(d => {
      setProfile(d)
      setAddr({ address: d.address || '', city: d.city || '', state: d.state || '', country: d.country || '' })
      setLic(d.license_number || '')
    }).finally(() => setLoading(false))
  }, [])

  const saveAddress = async () => {
    setSavingAddr(true)
    try {
      const r = await api('/profile/update-address/', { method: 'PATCH', body: JSON.stringify(addr) })
      const d = await r.json()
      if (!r.ok) { toast$(d.error || 'Failed', 'err'); return }
      setProfile(p => ({ ...p, ...addr, account_status: d.account_status }))
      setEditAddr(false); toast$('Address updated')
    } finally { setSavingAddr(false) }
  }

  const saveLicense = async () => {
    setSavingLic(true)
    try {
      const r = await api('/profile/update-license/', { method: 'PATCH', body: JSON.stringify({ license_number: lic }) })
      const d = await r.json()
      if (!r.ok) { toast$(d.error || 'Failed', 'err'); return }
      setProfile(p => ({ ...p, license_number: lic, account_status: d.account_status }))
      setEditLic(false); toast$('License saved and locked')
    } finally { setSavingLic(false) }
  }

  const savePassword = async () => {
    if (pwd.new_password !== pwd.confirm_new_password) { toast$('Passwords do not match', 'err'); return }
    setSavingPwd(true)
    try {
      const r = await api('/profile/update-password/', { method: 'PATCH', body: JSON.stringify(pwd) })
      const d = await r.json()
      if (!r.ok) { toast$(d.error || 'Failed', 'err'); return }
      setPwd({ current_password: '', new_password: '', confirm_new_password: '' })
      setShowPwd(false); toast$('Password changed')
    } finally { setSavingPwd(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!profile) return <p className="text-red-500 p-4">Failed to load profile.</p>

  const statusColor = profile.account_status === 'active'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Building2 size={14} /><span>/</span>
        <span className="text-gray-700 font-medium">Profile</span>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {profile.hospital_name?.[0] || 'H'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{profile.hospital_name}</h1>
          <p className="text-sm text-gray-400">{profile.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
              {profile.account_status?.toUpperCase()}
            </span>
            {profile.license_number && <span className="text-xs text-gray-400">License · {profile.license_number}</span>}
            {profile.city && <span className="text-xs text-gray-400">{profile.city}{profile.state ? `, ${profile.state}` : ''}</span>}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 shrink-0 text-center">
          <div>
            <p className="text-xl font-bold text-blue-600">{profile.account_status === 'active' ? '✓' : '⏳'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Status</p>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div>
            <p className="text-xl font-bold text-gray-800">{new Date(profile.created_at).getFullYear()}</p>
            <p className="text-xs text-gray-400 mt-0.5">Since</p>
          </div>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* LEFT */}
        <div className="flex flex-col gap-5">
          <Card title="Hospital Information" subtitle="Contact admin to change email">
            <InfoRow icon={Building2} label="Hospital Name"  value={profile.hospital_name} locked={profile.name_locked} />
            <InfoRow icon={Mail}      label="Email Address"  value={profile.email} />
            <InfoRow icon={Phone}     label="Contact Number" value={profile.contact_number} />
            <InfoRow icon={FileText}  label="License Number" value={profile.license_number} locked={profile.license_locked} />
          </Card>

          {!profile.license_locked && (
            <Card
              title="License Details" subtitle="Once saved, this cannot be changed"
              action={
                !editLic
                  ? <button onClick={() => setEditLic(true)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"><Pencil size={12} /> Edit</button>
                  : <div className="flex items-center gap-2">
                      <button onClick={() => setEditLic(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={14} /></button>
                      <button onClick={saveLicense} disabled={savingLic} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60">
                        <Check size={12} /> {savingLic ? 'Saving…' : 'Save & Lock'}
                      </button>
                    </div>
              }
            >
              {!editLic
                ? <InfoRow icon={ShieldCheck} label="License Number" value={profile.license_number || 'Not set'} />
                : <div className="py-4 flex flex-col gap-3">
                    <EditField label="License Number" name="license_number" value={lic}
                      onChange={e => setLic(e.target.value)} placeholder="MH/HOS/2024/XXXXX" />
                    <p className="text-xs text-amber-600 flex items-center gap-1.5"><AlertCircle size={12} /> Locked permanently after saving.</p>
                  </div>
              }
            </Card>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-5">
          <Card
            title="Address" subtitle="Your hospital's physical location"
            action={
              !editAddr
                ? <button onClick={() => setEditAddr(true)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"><Pencil size={12} /> Edit</button>
                : <div className="flex items-center gap-2">
                    <button onClick={() => setEditAddr(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={14} /></button>
                    <button onClick={saveAddress} disabled={savingAddr} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60">
                      <Check size={12} /> {savingAddr ? 'Saving…' : 'Save'}
                    </button>
                  </div>
            }
          >
            {!editAddr ? (
              <>
                <InfoRow icon={MapPin} label="Street Address" value={profile.address} />
                <InfoRow icon={MapPin} label="City"           value={profile.city} />
                <InfoRow icon={MapPin} label="State"          value={profile.state} />
                <InfoRow icon={MapPin} label="Country"        value={profile.country} />
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 py-4">
                <div className="col-span-2">
                  <EditField label="Street Address" name="address" value={addr.address}
                    onChange={e => setAddr(a => ({ ...a, address: e.target.value }))} placeholder="123 Hospital Road" />
                </div>
                <EditField label="City" name="city" value={addr.city}
                  onChange={e => setAddr(a => ({ ...a, city: e.target.value }))} placeholder="Kolkata" />
                <EditField label="State" name="state" value={addr.state}
                  onChange={e => setAddr(a => ({ ...a, state: e.target.value }))} placeholder="West Bengal" />
                <div className="col-span-2">
                  <EditField label="Country" name="country" value={addr.country}
                    onChange={e => setAddr(a => ({ ...a, country: e.target.value }))} placeholder="India" />
                </div>
              </div>
            )}
          </Card>

          <Card
            title="Change Password" subtitle="Min. 8 characters"
            action={
              !showPwd
                ? <button onClick={() => setShowPwd(true)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"><Lock size={12} /> Change</button>
                : <button onClick={() => setShowPwd(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={14} /></button>
            }
          >
            {!showPwd
              ? <p className="text-sm text-gray-400 py-4">Click "Change" to update your password.</p>
              : <div className="flex flex-col gap-3 py-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Password</label>
                    <div className="relative">
                      <input type={showCur ? 'text' : 'password'} value={pwd.current_password}
                        onChange={e => setPwd(p => ({ ...p, current_password: e.target.value }))} placeholder="••••••••"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      <button onClick={() => setShowCur(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showCur ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Password</label>
                    <div className="relative">
                      <input type={showNew ? 'text' : 'password'} value={pwd.new_password}
                        onChange={e => setPwd(p => ({ ...p, new_password: e.target.value }))} placeholder="Min. 8 characters"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      <button onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <EditField label="Confirm New Password" name="confirm_new_password" type="password"
                    value={pwd.confirm_new_password}
                    onChange={e => setPwd(p => ({ ...p, confirm_new_password: e.target.value }))}
                    placeholder="Repeat new password" />
                  <button onClick={savePassword} disabled={savingPwd}
                    className="self-start flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors mt-1">
                    <Lock size={13} /> {savingPwd ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
            }
          </Card>
        </div>
      </div>
    </div>
  )
}
