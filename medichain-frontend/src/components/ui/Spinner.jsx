// Spinner — loading state indicator
// Usage: <Spinner /> or <Spinner size="lg" /> or <Spinner label="Fetching records..." />
// size options: "sm" | "md" | "lg"

const SIZE_MAP = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

export default function Spinner({ size = 'md', label, fullPage = false }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${SIZE_MAP[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  )

  // fullPage = true centers the spinner in the entire viewport
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}