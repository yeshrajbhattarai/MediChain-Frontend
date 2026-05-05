import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">M</div>
            MediChain
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Secure, consent-driven medical record sharing for hospitals.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Quick Links</h4>
          <Link to="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Home</Link>
          <Link to="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">About</Link>
          <Link to="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Features</Link>
          <Link to="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact</Link>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Contact</h4>
          <p className="text-sm text-gray-500">support@medichain.in</p>
          <p className="text-sm text-gray-500">+91 98765 43210</p>
          <p className="text-sm text-gray-500">Kolkata, West Bengal, India</p>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto border-t border-gray-100 mt-8 pt-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} MediChain. All rights reserved.
      </div>
    </footer>
  )
}