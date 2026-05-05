// Input — styled text input OR select dropdown with label + error message
// Usage (text):   <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
// Usage (select): <Input label="Role" type="select" value={role} onChange={...} options={[{value:'doctor', label:'Doctor'}]} />
// Usage (error):  <Input label="Email" error="Email is required" />

export default function Input({
  label,
  name,             
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  options = [],
  required = false,
  disabled = false,
  className = '',
}) {
  const baseInput = `
    w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-800
    placeholder:text-gray-400 outline-none transition-all duration-150
    disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
    ${error
      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
      : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
    }
  `

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>

      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select or Text input */}
      {type === 'select' ? (
        <select
          name={name}    
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={baseInput}
        >
          <option value="">Select...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          name={name} 
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={baseInput}
        />
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

    </div>
  )
}