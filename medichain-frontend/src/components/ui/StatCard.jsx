// StatCard — number card for dashboards (doctors count, patients count, etc.)
// Usage: <StatCard label="Total Doctors" value={5} icon="👨‍⚕️" color="blue" />
// color options: "blue" | "green" | "amber" | "red" | "purple"

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   text: 'text-blue-700'   },
  green:  { bg: 'bg-emerald-50',icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600',  text: 'text-amber-700'  },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',      text: 'text-red-700'    },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600',text: 'text-purple-700' },
}

export default function StatCard({ label, value, icon, color = 'blue', sublabel }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue

  return (
    <div className={`rounded-xl p-5 ${c.bg} flex items-start justify-between`}>

      {/* Left — label + value */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-3xl font-bold ${c.text}`}>{value ?? '—'}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
      </div>

      {/* Right — icon bubble */}
      {icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${c.icon}`}>
          {icon}
        </div>
      )}

    </div>
  )
}