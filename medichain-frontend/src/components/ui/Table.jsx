// Table — reusable table with headers + rows
// Usage:
//   const columns = [
//     { key: 'name',   label: 'Name' },
//     { key: 'status', label: 'Status', render: (val) => <Badge status={val} /> },
//   ]
//   const rows = [{ name: 'Dr. Raj', status: 'active' }]
//   <Table columns={columns} rows={rows} />
//
// The optional `render` function in a column lets you customize how that cell looks
// If no render is provided, it just shows the raw value

import EmptyState from './EmptyState'

export default function Table({ columns = [], rows = [], emptyTitle = 'No records found', emptyMessage, loading }) {

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-7 h-7 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!rows.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-100 text-sm">

        {/* Header row */}
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Data rows */}
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  )
}