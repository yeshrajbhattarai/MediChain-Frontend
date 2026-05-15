import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Activity,
  FlaskConical,
  Search,
  Filter,
  Calendar,
  Hospital,
  ShieldCheck,
  Download,
  Eye,
  AlertCircle,
  FileText,
  ArrowUpDown,
} from 'lucide-react'

import { getPatientRecords } from '../../api/patient'

export default function PatientRecordsPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [labRecords, setLabRecords] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])

  const [search, setSearch] = useState('')
  const [recordTypeFilter, setRecordTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getPatientRecords()

      if (Array.isArray(data)) {
        setLabRecords(data.filter(r => r.record_type === 'lab'))
        setMedicalRecords(data.filter(r => r.record_type === 'medical'))
      } else {
        setLabRecords(data?.lab_records || [])
        setMedicalRecords(data?.medical_records || [])
      }

    } catch (err) {
      console.error(err)
      setError('Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  const allRecords = useMemo(() => {

    const labs = (labRecords || []).map((record) => ({
      ...record,
      record_type: 'lab',
      type_display: 'Lab Report',
    }))

    const medical = (medicalRecords || []).map((record) => ({
      ...record,
      record_type: 'medical',
      type_display: 'Medical Record',
    }))

    return [...medical, ...labs]

  }, [labRecords, medicalRecords])

  const filteredRecords = useMemo(() => {

    let filtered = allRecords.filter((record) => {

      const searchable = JSON.stringify(record).toLowerCase()
      const matchesSearch = searchable.includes(search.toLowerCase())
      const matchesFilter = recordTypeFilter === 'all' ? true : recordTypeFilter === record.record_type

      return matchesSearch && matchesFilter

    })

    // Sort
    if (sortBy === 'latest') {
      filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === 'oldest') {
      filtered = filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }

    return filtered

  }, [allRecords, search, recordTypeFilter, sortBy])

  const stats = useMemo(() => ({
    total: allRecords.length,
    medical: medicalRecords.length,
    lab: labRecords.length,
    verified: allRecords.filter(r => r.integrity_verified !== false).length,
  }), [allRecords, medicalRecords, labRecords])

  const openRecord = (record) => {
    const isLabRecord = !!record.lab_name
    if (isLabRecord) {
      navigate(`/patient/lab-records/${record.record_id}`)
    } else {
      navigate(`/patient/medical-records/${record.record_id}`)
    }
  }

  const printRecord = (record) => {
    const isLabRecord = !!record.lab_name
    const basePath = isLabRecord ? '/patient/lab-records' : '/patient/medical-records'
    window.open(`${basePath}/${record.record_id}?print=true`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          <div className="h-12 w-48 rounded-2xl bg-slate-200 animate-pulse" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>

          <div className="h-12 rounded-2xl bg-slate-200 animate-pulse" />

          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* HEADER */}
        <div className="space-y-4">

          <div className="flex items-start justify-between gap-4">

            <div>

              <div className="flex items-center gap-3 mb-2">

                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Medical Records
                </h1>

              </div>

              <p className="text-slate-500 text-sm md:text-base">
                View and manage all your medical reports and lab findings
              </p>

            </div>

          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <StatCard
              label="Total Reports"
              value={stats.total}
              icon={<FileText size={18} />}
              color="blue"
            />

            <StatCard
              label="Medical Records"
              value={stats.medical}
              icon={<Activity size={18} />}
              color="blue"
            />

            <StatCard
              label="Lab Reports"
              value={stats.lab}
              icon={<FlaskConical size={18} />}
              color="emerald"
            />

            <StatCard
              label="Verified"
              value={stats.verified}
              icon={<ShieldCheck size={18} />}
              color="emerald"
            />

          </div>

        </div>

        {/* FILTER / SEARCH BAR */}
        <div className="sticky top-4 z-20 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-3 md:p-4 shadow-lg">

          <div className="flex flex-col gap-3">

            {/* SEARCH */}
            <div className="relative">

              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search by hospital, doctor, lab..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />

            </div>

            {/* FILTERS & SORT */}
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">

              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 flex-1 -mx-3 px-3 sm:mx-0 sm:px-0">

                {[
                  { label: 'All', value: 'all' },
                  { label: 'Medical', value: 'medical' },
                  { label: 'Lab', value: 'lab' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setRecordTypeFilter(option.value)}
                    className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      recordTypeFilter === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}

              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">

                <ArrowUpDown size={16} className="text-slate-400 hidden sm:block" />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all w-full sm:w-auto"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>

              </div>

            </div>

          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-sm">

            <AlertCircle size={18} className="shrink-0" />

            <span>{error}</span>

          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredRecords.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-slate-400" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              No Records Found
            </h2>

            <p className="text-slate-500 text-sm">
              {search || recordTypeFilter !== 'all' 
                ? 'Try adjusting your filters or search terms.' 
                : 'Your medical reports will appear here.'}
            </p>

          </div>
        )}

        {/* RECORDS LIST */}
        <div className="space-y-3">

          {filteredRecords.map((record) => {

            const isMedical = record.record_type === 'medical'
            const createdDate = new Date(record.created_at).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })

            return (
              <RecordCard
                key={record.record_id}
                record={record}
                isMedical={isMedical}
                createdDate={createdDate}
                onView={() => openRecord(record)}
                onDownload={() => printRecord(record)}
              />
            )
          })}

        </div>

      </div>

    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  const bgClass = color === 'blue' ? 'bg-blue-50' : 'bg-emerald-50'
  const textClass = color === 'blue' ? 'text-blue-600' : 'text-emerald-600'
  const borderClass = color === 'blue' ? 'border-blue-100' : 'border-emerald-100'

  return (
    <div className={`${bgClass} ${borderClass} border rounded-2xl p-4 text-center hover:shadow-md transition-shadow`}>

      <div className={`flex justify-center mb-2 ${textClass}`}>
        {icon}
      </div>

      <p className="text-2xl md:text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="text-xs text-slate-600 mt-1">
        {label}
      </p>

    </div>
  )
}

function RecordCard({ record, isMedical, createdDate, onView, onDownload }) {

  const recordTitle = isMedical 
    ? 'Medical Consultation' 
    : (record.lab_name || 'Lab Report')

  const hospital = record.hospital_name || '—'
  const doctor = isMedical 
    ? (record.doctor_name || record.doctor?.full_name || '—')
    : (record.lab_name || '—')

  const bgAccent = isMedical ? 'bg-blue-100' : 'bg-emerald-100'
  const textAccent = isMedical ? 'text-blue-600' : 'text-emerald-600'
  const badgeBg = isMedical ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl p-4 md:p-5 hover:shadow-xl hover:border-blue-200 transition-all duration-300">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex gap-4 flex-1 min-w-0">

          {/* ICON */}
          <div className={`${bgAccent} ${textAccent} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
            {isMedical ? <Activity size={24} /> : <FlaskConical size={24} />}
          </div>

          {/* CONTENT */}
          <div className="flex-1 min-w-0">

            {/* BADGES */}
            <div className="flex flex-wrap gap-2 mb-2">

              <span className={`${badgeBg} px-2.5 py-1 rounded-lg text-xs font-semibold`}>
                {record.type_display || (isMedical ? 'Medical Record' : 'Lab Report')}
              </span>

              {record.integrity_verified !== false && (
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              )}

            </div>

            {/* TITLE */}
            <h3 className="text-base md:text-lg font-bold text-slate-900 truncate mb-2">
              {recordTitle}
            </h3>

            {/* META */}
            <div className="grid grid-cols-2 gap-3 text-sm">

              <div>
                <p className="text-slate-500 text-xs">Hospital</p>
                <p className="font-medium text-slate-900 truncate">{hospital}</p>
              </div>

              <div>
                <p className="text-slate-500 text-xs">{isMedical ? 'Doctor' : 'Lab'}</p>
                <p className="font-medium text-slate-900 truncate">{doctor}</p>
              </div>

              <div>
                <p className="text-slate-500 text-xs">Created</p>
                <p className="font-medium text-slate-900">{createdDate}</p>
              </div>

              <div>
                <p className="text-slate-500 text-xs">
                  {isMedical ? 'Updated' : 'Status'}
                </p>
                <p className="font-medium text-slate-900">
                  {isMedical 
                    ? (record.updated_at 
                        ? new Date(record.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—')
                    : (record.status_display || 'Completed')}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT - ACTIONS */}
        <div className="flex gap-2 md:flex-col md:w-auto">

          <button
            onClick={onView}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">View</span>
          </button>

          <button
            onClick={onDownload}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
          >
            <Download size={16} />
            <span className="hidden sm:inline">PDF</span>
          </button>

        </div>

      </div>

    </div>
  )
}