// variant = "primary" | "outline"
// size = "sm" | "md" | "lg"
// Use it anywhere: <Button variant="primary">Click me</Button>

export default function Button({ children, variant = 'primary', size = 'md', onClick, type = 'button', className = '' }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
    outline: 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50',
  }

  const sizes = {
    sm:  'px-3 py-1.5 text-sm',
    md:  'px-5 py-2.5 text-sm',
    lg:  'px-6 py-3 text-base',
  }

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  )
}