// src/components/PageHeader.jsx
// Reusable header component with breadcrumbs and navigation

import { ChevronRight, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  showBack = false,
  onBack = null,
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="mb-8 space-y-4">
      {/* BREADCRUMBS */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-300" />
              )}
              {crumb.href ? (
                <button
                  onClick={() => navigate(crumb.href)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-gray-600 font-medium">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {showBack && (
            <button
              onClick={handleBack}
              className="
                mb-3
                flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-lg
                text-sm
                text-gray-600
                hover:bg-gray-100
                transition-colors
              "
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}