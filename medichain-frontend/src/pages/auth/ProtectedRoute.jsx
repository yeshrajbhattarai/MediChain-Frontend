// ProtectedRoute — wraps routes that require authentication
// Usage:
//   <Route element={<ProtectedRoute allowedRoles={['hospital_admin']} />}>
//     <Route path="/admin/dashboard" element={<Dashboard />} />
//   </Route>
//
// allowedRoles: array of 'hospital_admin' | 'doctor' | 'nurse' | 'technician'
// If no allowedRoles passed — just checks logged in

import { Navigate, Outlet } from 'react-router-dom'
import { isLoggedIn, getUserType, getStaffRole } from '../../auth_store/authStore'

export default function ProtectedRoute({ allowedRoles = [] }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0) {
    const type = getUserType()
    const role = getStaffRole()
    // 'hospital_admin' matches user_type; 'doctor'/'technician' match staff_role
    const effective = type === 'hospital_admin' ? 'hospital_admin' : type === 'patient' ? 'patient' : role
    if (!allowedRoles.includes(effective)) {
      return <Navigate to="/login" replace />
    }
  }

  return <Outlet />
}