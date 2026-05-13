// src/components/admin/LabFieldBuilder.jsx
// Component for adding custom lab fields with manual choice options

import { useState } from 'react'
import { ChevronDown, Plus, X, Trash2 } from 'lucide-react'

/**
 * LabFieldBuilder
 * 
 * Creates lab schema fields with support for:
 * - Integer fields
 * - Decimal fields
 * - Text fields
 * - Choice fields (with manual option entry)
 * 
 * Usage:
 * <LabFieldBuilder labId={labId} onFieldAdded={handleFieldAdded} />
 */
export default function LabFieldBuilder({ labId, onFieldAdded }) {
  const [showForm, setShowForm] = useState(false)
  const [fieldType, setFieldType] = useState('text')
  const [label, setLabel] = useState('')
  const [key, setKey] = useState('')
  const [required, setRequired] = useState(false)
  const [options, setOptions] = useState(['', ''])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Auto-generate key from label
  const handleLabelChange = (value) => {
    setLabel(value)
    // Convert "Red Blood Cells" → "rbc"
    const words = value.trim().toLowerCase().split(' ')
    const autoKey = words.map(w => w[0]).join('')
    setKey(autoKey)
  }

  // Update choice option
  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  // Add new option
  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  // Remove option
  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  // Validate form
  const validate = () => {
    const newErrors = {}

    if (!label.trim()) newErrors.label = 'Label is required'
    if (!key.trim()) newErrors.key = 'Key is required'

    if (fieldType === 'choice') {
      const filledOptions = options.filter(o => o.trim() !== '')
      if (filledOptions.length < 2) {
        newErrors.options = 'At least 2 options are required'
      }
      // Check for duplicates
      if (new Set(filledOptions.map(o => o.toLowerCase())).size !== filledOptions.length) {
        newErrors.options = 'Options must be unique'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit field
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      const payload = {
        lab_id: labId,
        label: label.trim(),
        key: key.trim(),
        field_type: fieldType,
        required: required,
      }

      // Add options for choice fields
      if (fieldType === 'choice') {
        payload.choice_options = options
          .filter(o => o.trim() !== '')
          .map(o => o.trim().toLowerCase())
      }

      const response = await fetch('/api/v1/admin/labs/fields/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        setErrors({ submit: data.error || 'Failed to create field' })
        return
      }

      const newField = await response.json()

      // Success
      setLabel('')
      setKey('')
      setFieldType('text')
      setRequired(false)
      setOptions(['', ''])
      setErrors({})
      setShowForm(false)

      if (onFieldAdded) onFieldAdded(newField)
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
      >
        <Plus size={18} />
        Add Field
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Add Lab Field</h3>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Label *
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder="e.g., Red Blood Cells"
          className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${
            errors.label
              ? 'border-red-400 bg-red-50'
              : 'border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-100'
          }`}
        />
        {errors.label && <p className="text-xs text-red-600 mt-1">{errors.label}</p>}
      </div>

      {/* Grid: Key + Type */}
      <div className="grid grid-cols-2 gap-4">
        {/* Key */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
            Key (auto-generated)
          </label>
          <input
            type="text"
            value={key}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Unique identifier sent to backend.</p>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <select
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100"
          >
            <option value="text">Text</option>
            <option value="integer">Integer</option>
            <option value="decimal">Decimal</option>
            <option value="choice">Choice (Dropdown)</option>
          </select>
        </div>
      </div>

      {/* Choice Options */}
      {fieldType === 'choice' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-2">Choice Options *</p>
            <p className="text-xs text-blue-700 mb-3">
              Enter each option value. These will be sent to the backend as-is (case-sensitive).
            </p>
          </div>

          {/* Options List */}
          <div className="space-y-2">
            {options.map((option, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm outline-none transition-all ${
                    errors.options
                      ? 'border-red-300'
                      : 'border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-100'
                  }`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Option Button */}
          <button
            type="button"
            onClick={handleAddOption}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            <Plus size={16} />
            Add Option
          </button>

          {errors.options && <p className="text-xs text-red-600">{errors.options}</p>}

          {/* Example */}
          <div className="bg-white rounded border border-blue-100 p-2">
            <p className="text-xs font-mono text-gray-600">
              Backend will receive: {JSON.stringify(options.filter(o => o.trim() !== '').map(o => o.toLowerCase()))}
            </p>
          </div>
        </div>
      )}

      {/* Required Checkbox */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="required"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-teal-600"
        />
        <label htmlFor="required" className="text-sm text-gray-700">
          Required field
        </label>
      </div>

      {/* Errors */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? 'Creating...' : 'Create Field'}
        </button>
      </div>
    </form>
  )
}

/**
 * EXAMPLE USAGE IN ADMIN LAB FORM:
 * 
 * <LabFieldBuilder
 *   labId={labId}
 *   onFieldAdded={(newField) => {
 *     console.log('Field added:', newField)
 *     // Refresh fields list
 *   }}
 * />
 */