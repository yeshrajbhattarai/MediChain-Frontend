// src/components/doctor/CKDPredictionModal.jsx
// Modal for displaying CKD prediction results with clinical interpretation

import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle, AlertTriangle, TrendingDown } from 'lucide-react'

/**
 * CKDPredictionModal
 * 
 * Shows CKD prediction results with:
 * - Prediction (CKD / Not CKD)
 * - Confidence percentage
 * - Risk level (High, Moderate, Low-Moderate, Low)
 * - Clinical interpretation
 * - Suggested actions
 * - Imputed fields warning
 */
export default function CKDPredictionModal({ prediction, onClose, isLoading }) {
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
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

  const isError = !prediction.prediction
  const isCKD = prediction.prediction === 'CKD'
  const confidence = prediction.confidence || 0
  const riskLevel = prediction.risk_level || 'Unknown'
  const suggestedAction = prediction.suggested_action || 'Consult with healthcare provider'
  const imputedFields = prediction.imputed_fields || []

  // Risk level styling
  const riskStyles = {
    'High': {
      badge: 'bg-red-100 text-red-700 border border-red-300',
      icon: AlertCircle,
      color: 'text-red-600',
    },
    'Moderate': {
      badge: 'bg-amber-100 text-amber-700 border border-amber-300',
      icon: AlertTriangle,
      color: 'text-amber-600',
    },
    'Low-Moderate': {
      badge: 'bg-blue-100 text-blue-700 border border-blue-300',
      icon: AlertTriangle,
      color: 'text-blue-600',
    },
    'Low': {
      badge: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      icon: CheckCircle,
      color: 'text-emerald-600',
    },
  }

  const style = riskStyles[riskLevel] || riskStyles['Low']
  const RiskIcon = style.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">CKD Analysis Complete</h2>
              <p className="text-sm text-violet-100 mt-0.5">{prediction.patient_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Prediction Result */}
          <div className={`rounded-xl p-5 border-2 ${
            isCKD ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Prediction</p>
            <p className={`text-2xl font-bold ${isCKD ? 'text-red-700' : 'text-emerald-700'}`}>
              {prediction.prediction}
            </p>
          </div>

          {/* Confidence & Risk */}
          <div className="grid grid-cols-2 gap-4">
            {/* Confidence */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Confidence</p>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">{confidence}%</p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Risk Level */}
            <div className={`rounded-xl p-4 border ${style.badge}`}>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Risk Level</p>
              <div className="flex items-center gap-2">
                <RiskIcon size={20} className={style.color} />
                <p className={`text-lg font-bold ${style.color}`}>{riskLevel}</p>
              </div>
            </div>
          </div>

          {/* Probabilities */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">Probabilities</p>
            
            {/* CKD Probability */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">CKD</span>
                <span className="text-sm font-bold text-red-600">{prediction.ckd_probability}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${prediction.ckd_probability}%` }}
                />
              </div>
            </div>

            {/* Non-CKD Probability */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">No CKD</span>
                <span className="text-sm font-bold text-emerald-600">{prediction.not_ckd_probability}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${prediction.not_ckd_probability}%` }}
                />
              </div>
            </div>
          </div>

          {/* Suggested Action */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">i</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-900 uppercase mb-1">Suggested Action</p>
                <p className="text-sm text-blue-800">{suggestedAction}</p>
              </div>
            </div>
          </div>

          {/* Imputed Fields Warning */}
          {imputedFields.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-900 uppercase mb-1">Data Quality Note</p>
                  <p className="text-xs text-amber-800 mb-2">
                    The following fields were missing and were filled with default values:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {imputedFields.map(field => (
                      <span key={field} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <p>
              <span className="font-semibold">Disclaimer:</span> This prediction is generated by a machine learning model trained on the UCI CKD dataset. 
              It is intended to support clinical decision-making and should not be used as a substitute for professional medical judgment. 
              Always consult with qualified healthcare professionals for diagnosis and treatment decisions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  )
}