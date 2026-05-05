// HOW IT WORKS:
//   1. After login  → fetchAndSaveProfile() is called once
//   2. Profile data is saved to localStorage (survives page refresh)
//   3. Any component can call getProfile() to read it instantly (no API call)
//   4. On logout    → clearProfile() wipes it

import { getAccessToken, getUserType, getStaffRole } from './authStore'

const BASE = 'http://localhost:8000/api/v1'
const KEY  = 'medichain_profile'   // localStorage key

// ── Which API endpoint to call based on role ──────────────────────────────────
function getProfileEndpoint() {
  const type = getUserType()
  if (type === 'hospital_admin') return '/profile/'
  const role = getStaffRole()
  if (role === 'doctor')     return '/staff/doctor/profile/'
  if (role === 'technician') return '/staff/technician/profile/'
  return null
}

// ── Save profile to localStorage ──────────────────────────────────────────────
function saveProfile(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

// ── Read profile from localStorage ───────────────────────────────────────────
export function getProfile() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── Clear profile on logout ───────────────────────────────────────────────────
export function clearProfile() {
  localStorage.removeItem(KEY)
}

// ── Fetch profile from backend and save it ────────────────────────────────────
//
// Call this ONCE right after login succeeds.
// Returns the profile object on success, null on failure.
//
// Flow:
//   1. Detect role → pick correct endpoint
//   2. Call API with JWT token in Authorization header
//   3. Save response to localStorage
//   4. Return the profile (so Login.jsx can use it if needed)
//
export async function fetchAndSaveProfile() {
  const endpoint = getProfileEndpoint()
  if (!endpoint) return null   // unknown role — skip

  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    })

    if (!res.ok) return null   // API error — don't crash the login

    const data = await res.json()
    saveProfile(data)
    return data
  } catch {
    return null   // network error — don't block login
  }
}