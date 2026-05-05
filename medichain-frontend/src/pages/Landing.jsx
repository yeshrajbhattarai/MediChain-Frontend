import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Footer from '../components/layout/Footer'

// Small reusable card — only used on this page so defined here
function FeatureCard({ icon, title, description, accent }) {
  return (
    <div className={`bg-white border-2 ${accent} rounded-xl p-6 flex flex-col items-center text-center gap-3`}>
      <div className="text-3xl">{icon}</div>
      <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

// Numbered step row
function Step({ number, text }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-5 py-4">
      <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
        {number}
      </div>
      <p className="text-gray-700 text-sm">{text}</p>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gray-50 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">

          <span className="text-xs border border-gray-300 text-gray-500 rounded-full px-3 py-1 flex items-center gap-1">
            🔒 Secure Medical Data Exchange
          </span>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Secure. Consent-Driven.{' '}
            <span className="text-blue-600">Intelligent.</span>
          </h1>

          <p className="text-gray-500 text-base max-w-lg leading-relaxed">
            MediChain enables hospitals to share patient records securely with patient consent,
            SHA-256 integrity verification, and AI-powered risk prediction.
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link to="/register">
              <Button variant="primary" size="lg">Register Your Hospital →</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Login</Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ── Core Features ────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <FeatureCard
                icon={
                    <lord-icon
                    src="https://cdn.lordicon.com/xovdoewm.json"
                    trigger="loop"
                    colors="primary:#104891,secondary:#104891"
                    style={{ width: "60px", height: "60px" }}
                    />
                }
                accent="border-blue-200"
                title="Consent Management"
                description="Dual consent from patient and owner hospital before any record moves."
            />
            <FeatureCard
                icon={
                    <lord-icon
                    src="https://cdn.lordicon.com/apbwvyeg.json"
                    trigger="loop"
                    colors="primary:#104891,secondary:#104891"
                    style={{ width: "60px", height: "60px" }}
                    />
                }
                accent="border-blue-200"
                title="SHA-256 Integrity"
                description="Every medical record verified cryptographically during transfer."
            />
            <FeatureCard
                icon={
                    <lord-icon
                    src="https://cdn.lordicon.com/nfuackpv.json"
                    trigger="loop"
                    colors="primary:#104891,secondary:#104891"
                    style={{ width: "60px", height: "60px" }}
                    />
                }
                accent="border-blue-200"
                title="CKD AI Prediction"
                description="Random Forest model predicts Chronic Kidney Disease risk from KFT lab values."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">How It Works</h2>
          <div className="flex flex-col gap-3">
            <Step number={1} text="Hospital registers and gets API key" />
            <Step number={2} text="Requesting hospital creates consent request" />
            <Step number={3} text="Patient and owner hospital both approve" />
            <Step number={4} text="Requester fetches verified medical record" />
          </div>
        </div>
      </section>
    <Footer />
    </div>
  )
}