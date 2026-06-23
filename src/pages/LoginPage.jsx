import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Package, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Fetch user profile to determine role-based redirect
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    setLoading(false)

    if (profile?.role === 'vendor') navigate('/vendor')
    else if (profile?.role === 'logistics_partner') navigate('/partner')
    else navigate('/home')
  }

  return (
    <div className="min-h-screen auth-bg flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dotted route lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="#0F6E56" />
            </pattern>
            <pattern id="route" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M10 60 Q60 10 110 60 Q60 110 10 60" stroke="#0F6E56" strokeWidth="1.5" fill="none" strokeDasharray="4 4"/>
              <circle cx="10" cy="60" r="4" fill="#0F6E56"/>
              <circle cx="110" cy="60" r="4" fill="#0F6E56"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Large decorative package icons */}
        <div className="absolute top-16 right-8 opacity-5">
          <Package size={120} className="text-[#0F6E56]" />
        </div>
        <div className="absolute bottom-20 left-8 opacity-5">
          <Package size={80} className="text-[#0F6E56]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 group">
          <div className="w-10 h-10 bg-[#0F6E56] rounded-xl flex items-center justify-center shadow-lg">
            <Package size={22} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-[#1A1A1A]">
            Logisti<span className="text-[#0F6E56]">x</span>
          </span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8 fade-in-up">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to your Logistix account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0F6E56] font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              to="/how-it-works"
              className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-[#0F6E56] transition-colors"
            >
              New here? See how Logistix works →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
