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

function RoleRouter() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#0F6E56] border-t-transparent animate-spin" />
          <p className="text-gray-500 font-medium">Loading Logistix…</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (profile?.role === 'vendor') return <Navigate to="/vendor" replace />
  if (profile?.role === 'logistics_partner') return <Navigate to="/partner" replace />
  return <Navigate to="/home" replace />
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 rounded-full border-4 border-[#0F6E56] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <RoleRouter />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/track/:shipmentId" element={<TrackPage />} />
          <Route path="/how-it-works" element={<OnboardingPage />} />

          {/* Role redirect */}
          <Route path="/" element={<RoleRouter />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'vendor', 'admin']}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner"
            element={
              <ProtectedRoute allowedRoles={['logistics_partner', 'admin']}>
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
