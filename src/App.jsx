import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import VendorDashboard from './pages/VendorDashboard'
import PartnerDashboard from './pages/PartnerDashboard'
import TrackPage from './pages/TrackPage'
import OnboardingPage from './pages/OnboardingPage'
import NotFoundPage from './pages/NotFoundPage'

// Full-screen loader
function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#0F6E56] border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading…</p>
      </div>
    </div>
  )
}

// Decides where to send the user based on role
function RoleRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (!user)   return <Navigate to="/login" replace />

  const role = profile?.role || user?.user_metadata?.role
  if (role === 'vendor')             return <Navigate to="/vendor"  replace />
  if (role === 'logistics_partner')  return <Navigate to="/partner" replace />
  return <Navigate to="/home" replace />
}

// Protects a route — waits for auth to finish before deciding
function Protected({ children, roles }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <Loader />
  if (!user)   return <Navigate to="/login" replace />

  // Use metadata as fallback while DB profile loads
  const role = profile?.role || user?.user_metadata?.role

  if (roles && role && !roles.includes(role)) {
    // Wrong role — send to correct dashboard
    if (role === 'vendor')            return <Navigate to="/vendor"  replace />
    if (role === 'logistics_partner') return <Navigate to="/partner" replace />
    return <Navigate to="/home" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/how-it-works" element={<OnboardingPage />} />
          <Route path="/track/:shipmentId" element={<TrackPage />} />

          {/* Role-based redirect from root */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Protected */}
          <Route path="/home" element={
            <Protected roles={['buyer', 'vendor', 'admin']}>
              <HomePage />
            </Protected>
          } />
          <Route path="/vendor" element={
            <Protected roles={['vendor', 'admin']}>
              <VendorDashboard />
            </Protected>
          } />
          <Route path="/partner" element={
            <Protected roles={['logistics_partner', 'admin']}>
              <PartnerDashboard />
            </Protected>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
