import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import HomePage        from './pages/HomePage'
import VendorDashboard from './pages/VendorDashboard'
import PartnerDashboard from './pages/PartnerDashboard'
import TrackPage       from './pages/TrackPage'
import OnboardingPage  from './pages/OnboardingPage'
import NotFoundPage    from './pages/NotFoundPage'
import AdminPanel      from './pages/AdminPanel'
import { Package, WifiOff } from 'lucide-react'

// ── Branded full-screen loader ────────────────────────────────
function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-[#E6F3EF]" />
          <div className="absolute inset-0 rounded-full border-4 border-[#0F6E56] border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Package size={20} className="text-[#0F6E56]" />
          </div>
        </div>
        <p className="text-sm text-gray-400 font-medium tracking-wide">Loading Logistix…</p>
      </div>
    </div>
  )
}

// ── Offline / config error screen ────────────────────────────
function ConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <WifiOff size={26} className="text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">Cannot connect</h2>
        <p className="text-sm text-gray-500 mb-5">
          Check your internet connection and try again. If the problem persists, the service may be temporarily unavailable.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary w-full justify-center"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

// ── Role-based redirect ───────────────────────────────────────
function RoleRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (!user)   return <Navigate to="/login" replace />

  const role = profile?.role || user?.user_metadata?.role
  if (!role) return <Loader />  // still resolving — wait

  if (role === 'admin')             return <Navigate to="/admin"   replace />
  if (role === 'vendor')            return <Navigate to="/vendor"  replace />
  if (role === 'logistics_partner') return <Navigate to="/partner" replace />
  return <Navigate to="/home" replace />
}

// ── Route guard ──────────────────────────────────────────────
function Protected({ children, roles }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <Loader />
  if (!user)   return <Navigate to="/login" replace />

  const role = profile?.role || user?.user_metadata?.role

  // Still resolving role — wait instead of bouncing
  if (!role) return <Loader />

  if (roles && !roles.includes(role)) {
    if (role === 'admin')             return <Navigate to="/admin"   replace />
    if (role === 'vendor')            return <Navigate to="/vendor"  replace />
    if (role === 'logistics_partner') return <Navigate to="/partner" replace />
    return <Navigate to="/home" replace />
  }

  return children
}

// ── Redirect logged-in users away from login/register ────────
function PublicOnly({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (!user)   return children

  const role = profile?.role || user?.user_metadata?.role
  if (!role) return <Loader />
  if (role === 'admin')             return <Navigate to="/admin"   replace />
  if (role === 'vendor')            return <Navigate to="/vendor"  replace />
  if (role === 'logistics_partner') return <Navigate to="/partner" replace />
  return <Navigate to="/home" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public — redirect away if already logged in */}
          <Route path="/login"    element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

          {/* Always public */}
          <Route path="/how-it-works"      element={<OnboardingPage />} />
          <Route path="/track/:shipmentId" element={<TrackPage />} />

          {/* Role redirect from root */}
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
          <Route path="/admin" element={
            <Protected roles={['admin']}>
              <AdminPanel />
            </Protected>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
