// This navbar will be reused on every page
// 'Link' from react-router = <a> tag but WITHOUT page reload (SPA behavior)

import { Link } from 'react-router-dom'
import Button from '../ui/Button'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo — clicking takes you to home */}
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">M</div>
          MediChain
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 px-3 py-2">Login</Link>
          <Link to="/register">
            <Button variant="primary" size="md">Register</Button>
          </Link>
        </div>

      </div>
    </nav>
  )
}