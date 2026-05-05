
import { useNavigate } from 'react-router-dom'

export default function BackButton({ to, label = 'Back' }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) navigate(to)
    else navigate(-1)
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      className="
        fixed top-5 left-5 z-50
        inline-flex items-center gap-1.5
        text-sm font-medium text-gray-500
        hover:text-gray-800
        bg-white border border-gray-200
        hover:border-gray-300
        rounded-lg px-3 py-2
        shadow-sm hover:shadow
        transition-all duration-150
        cursor-pointer
      "
    >
      {/* Left arrow */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  )
}