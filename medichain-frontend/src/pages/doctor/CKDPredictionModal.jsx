// src/components/doctor/CKDPredictionModal.jsx
import { X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

export default function CKDPredictionModal({ prediction, onClose, isLoading }) {
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Running CKD Analysis...</p>
            <p className="text-xs text-gray-400">This may take a few seconds</p>
          </div>
        </div>
      </div>
    )
  }

  if (!prediction) return null

  const isCKD = prediction.prediction === 'CKD'
  const confidence = prediction.confidence || 0
  const riskLevel = prediction.risk_level || 'Unknown'
  const suggestedAction = prediction.suggested_action || 'Consult with healthcare provider'
  const imputedFields = prediction.imputed_fields || []

  const riskStyles = {
    'High':         { badge: 'bg-red-100 text-red-700 border border-red-300',     icon: AlertCircle,   color: 'text-red-600'     },
    'Moderate':     { badge: 'bg-amber-100 text-amber-700 border border-amber-300', icon: AlertTriangle, color: 'text-amber-600'   },
    'Low-Moderate': { badge: 'bg-blue-100 text-blue-700 border border-blue-300',   icon: AlertTriangle, color: 'text-blue-600'    },
    'Low':          { badge: 'bg-emerald-100 text-emerald-700 border border-emerald-300', icon: CheckCircle, color: 'text-emerald-600' },
  }

  const style = riskStyles[riskLevel] || riskStyles['Low']
  const RiskIcon = style.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      {/* Modal — wider (max-w-2xl), fixed max-height so footer is always visible */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">CKD Analysis Complete</h2>
              <p className="text-xs text-violet-100">{prediction.patient_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Top row: Prediction + Confidence + Risk */}
          <div className="grid grid-cols-3 gap-3">

            {/* Prediction */}
            <div className={`col-span-1 rounded-xl p-4 border-2 flex flex-col justify-center ${
              isCKD ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Prediction</p>
              <p className={`text-2xl font-bold ${isCKD ? 'text-red-700' : 'text-emerald-700'}`}>
                {prediction.prediction}
              </p>
            </div>

            {/* Confidence */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col justify-center">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Confidence</p>
              <p className="text-2xl font-bold text-gray-900">{confidence}%</p>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>

            {/* Risk Level */}
            <div className={`rounded-xl p-4 border flex flex-col justify-center ${style.badge}`}>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Risk Level</p>
              <div className="flex items-center gap-1.5">
                <RiskIcon size={18} className={style.color} />
                <p className={`text-lg font-bold ${style.color}`}>{riskLevel}</p>
              </div>
            </div>
          </div>

          {/* Probabilities */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Probabilities</p>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">CKD</span>
                <span className="text-sm font-bold text-red-600">{prediction.ckd_probability}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${prediction.ckd_probability}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">No CKD</span>
                <span className="text-sm font-bold text-emerald-600">{prediction.not_ckd_probability}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${prediction.not_ckd_probability}%` }} />
              </div>
            </div>
          </div>

          {/* Suggested Action + Imputed Fields side by side when both present */}
          <div className={`grid gap-3 ${imputedFields.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>

            {/* Suggested Action */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">i</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-blue-900 uppercase mb-1">Suggested Action</p>
                <p className="text-sm text-blue-800">{suggestedAction}</p>
              </div>
            </div>

            {/* Imputed Fields Warning */}
            {imputedFields.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-amber-900 uppercase mb-1">Data Quality Note</p>
                  <p className="text-xs text-amber-800 mb-2">
                    Missing fields filled with defaults:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {imputedFields.map(field => (
                      <span key={field} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 border-t pt-3">
            <span className="font-semibold text-gray-500">Disclaimer:</span> ML model output for clinical decision support only.
            Not a substitute for professional medical judgment.
          </p>
        </div>

        {/* ── Footer — always visible ── */}
        <div className="bg-gray-50 px-5 py-3 border-t flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors text-sm"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  )
}