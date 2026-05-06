import { Routes, Route } from 'react-router-dom'
import Landing    from './pages/Landing'

import Login      from './pages/auth/Login'
import Register   from './pages/auth/Register'

import AdminLayout  from './components/layout/AdminLayout'
import DoctorLayout from './components/layout/DoctorLayout'
import TechLayout   from './components/layout/TechLayout'

import ProtectedRoute from './pages/auth/ProtectedRoute'

import AdminDashboard   from './pages/admin/Dashboard'
import AdminProfile     from './pages/admin/Profile'
import AdminTechnicians from './pages/admin/Technicians'
import AdminDoctors     from './pages/admin/Doctors'
import AdminNurses      from './pages/admin/Nurses'
import AdminLabs        from './pages/admin/Labs'
import AdminPatients    from './pages/admin/Patients'

import DoctorDashboard      from './pages/doctor/Dashboard'
import DoctorProfile        from './pages/doctor/Profile'
import DoctorPatients       from './pages/doctor/MyPatients'
import DoctorPatientsDetail from './pages/doctor/MyPatientsDetail'
import DoctorLabs from './pages/doctor/Labs'
import CreateMedicalRecord from './pages/doctor/CreateMedicalREcord'

import TechnicianDashboard from './pages/technician/Dashboard'
import TechnicianPatients from './pages/technician/TechnicianPatients'
import LabQueue from './pages/technician/LabQueue'
import TechnicianRecords from './pages/technician/Records'
import TechnicianProfile from './pages/technician/Profile'

import PatientLayout from './components/layout/PatientLayout'
import PatientDashboard from './pages/patient/PatientDashboard'
import { PatientRecords, PatientRecordDetail } from './pages/patient/PatientRecords'
import PatientProfile from './pages/patient/PatientProfile'
import PatientConsent from './pages/patient/PatientConsent'

import Consent from './pages/shared/Consent'   // ← replaces ConsentList

const Placeholder = ({ name }) => (
  <div className="p-8 text-gray-500 text-lg">{name} — coming soon</div>
)

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin — hospital_admin only */}
      <Route element={<ProtectedRoute allowedRoles={['hospital_admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard"   element={<AdminDashboard />} />
          <Route path="doctors"     element={<AdminDoctors />} />
          <Route path="nurses"      element={<AdminNurses />} />
          <Route path="technicians" element={<AdminTechnicians />} />
          <Route path="patients"    element={<AdminPatients />} />
          <Route path="labs"        element={<AdminLabs />} />
          <Route path="consent"     element={<Consent />} /> 
          <Route path="profile"     element={<AdminProfile />} />
        </Route>
      </Route>

      {/* Doctor — doctor role only */}
      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route path="dashboard"    element={<DoctorDashboard />} />
          <Route path="patients"     element={<DoctorPatients />} />
          <Route path="patients/:id" element={<DoctorPatientsDetail />} />
          <Route path="patients/:id/create-record" element={<CreateMedicalRecord />} />
          <Route path="consent"      element={<Consent />} />  
          <Route path="labs" element={<DoctorLabs />} />
          <Route path="profile"      element={<DoctorProfile />} />
        </Route>
      </Route>

      {/* Technician */}
      <Route element={<ProtectedRoute allowedRoles={['technician']} />}>
        <Route path="/technician" element={<TechLayout />}>
          <Route path="dashboard"    element={<TechnicianDashboard />} />  // existing
          <Route path="patients"     element={<TechnicianPatients />} />   // NEW
          <Route path="lab-queue"    element={<LabQueue />} />              // NEW
          <Route path="records"      element={<TechnicianRecords />} />    // NEW
          <Route path="profile"      element={<TechnicianProfile />} />    // NEW
        </Route>
      </Route>

      {/* Patient */}
      <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
        <Route path="/patient" element={<PatientLayout />}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="records"   element={<PatientRecords />} />
          <Route path="records/:record_id" element={<PatientRecordDetail />} />
          <Route path="consent"   element={<PatientConsent />} />
          <Route path="profile"   element={<PatientProfile />} />
        </Route>
      </Route>
    </Routes>
  )
}