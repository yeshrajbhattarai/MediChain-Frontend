// Badge — shows status as a colored pill chip
// Usage: <Badge status="active" /> or <Badge status="pending" /> or <Badge status="suspended" />
// You can also pass any custom label: <Badge status="approved" />

const STATUS_STYLES = {
  active:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  inactive:  'bg-gray-100   text-gray-500   border border-gray-200',
  pending:   'bg-amber-50   text-amber-700  border border-amber-200',
  suspended: 'bg-red-50     text-red-600    border border-red-200',
  approved:  'bg-blue-50    text-blue-700   border border-blue-200',
  rejected:  'bg-red-50     text-red-600    border border-red-200',
}

const DOT_STYLES = {
  active:    'bg-emerald-500',
  inactive:  'bg-gray-400',
  pending:   'bg-amber-500',
  suspended: 'bg-red-500',
  approved:  'bg-blue-500',
  rejected:  'bg-red-500',
}

export default function Badge({ status = 'pending' }) {
  const key    = status.toLowerCase()
  const style  = STATUS_STYLES[key] || 'bg-gray-100 text-gray-600 border border-gray-200'
  const dot    = DOT_STYLES[key]    || 'bg-gray-400'
  const label  = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}