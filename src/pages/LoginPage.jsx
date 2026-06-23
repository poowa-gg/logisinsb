import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Package, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Read role from user_metadata — instant, no extra DB call needed
    const role = data?.user?.user_metadata?.role

    // Also try to ensure profile row exists (fire and forget, don't await)
    if (data?.user) {
      const meta = data.user.user_metadata
      supabase.from('users').upsert({
        id:     data.user.id,
        name:   meta?.name  || '',
        email:  data.user.email || '',
        phone:  meta?.phone || '',
        role:   meta?.role  || 'buyer',
        status: 'active',
      }, { onConflict: 'id' }).then(() => {})  // fire and forget
    }

    // Redirect immediately based on metadata role
    if (role === 'vendor')             navigate('/vendor',  { replace: true })
    else if (role === 'logistics_partner') navigate('/partner', { replace: true })
    else                               navigate('/home',    { replace: true })
  }

  return (
    <div className="min-h-screen auth-bg relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1.5" fill="#0F6E56"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
        <div className="absolute top-12 right-6 opacity-5">
          <Package size={110} className="text-[#0F6E56]" />
        </div>
        <div className="absolute bottom-16 left-6 opacity-5">
          <Package size={70} className="text-[#0F6E56]" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <Link to="/how-it-works" className="flex items-center gap-2 mb-7">
          <div className="w-10 h-10 bg-[#0F6E56] rounded-xl flex items-center justify-center shadow-md">
            <Package size={20} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-[#1A1A1A]">
            Logisti<span className="text-[#0F6E56]">x</span>
          </span>
        </Link>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 fade-in-up">
          <h1 className="text-xl font-bold text-[#1A1A1A] mb-0.5">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-6">Sign in to continue</p>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4 text-sm text-red-700">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="input-field pl-9"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  autoFocus
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-9 pr-10"
                  placeholder="Your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </span>
                : <span className="flex items-center gap-2">
                    Sign In <ArrowRight size={15} />
                  </span>
              }
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            No account?{' '}
            <Link to="/register" className="text-[#0F6E56] font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link
              to="/how-it-works"
              className="text-xs text-gray-400 hover:text-[#0F6E56] transition-colors"
            >
              New here? See how Logistix works →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
