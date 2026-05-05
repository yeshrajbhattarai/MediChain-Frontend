// EmptyState — shown when a list/table has no data
// Usage: <EmptyState title="No patients yet" message="Add your first patient to get started." />
// Optional: pass an action button
// <EmptyState title="No doctors" action={<Button onClick={...}>Add Doctor</Button>} />

export default function EmptyState({ title = 'Nothing here', message, icon = '📭', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">

      {/* Icon */}
      <div className="text-5xl mb-4">{icon}</div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>

      {/* Message */}
      {message && <p className="text-sm text-gray-400 max-w-xs">{message}</p>}

      {/* Optional action button */}
      {action && <div className="mt-5">{action}</div>}

    </div>
  )
}