import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Package, User, Phone, Mail, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, ShoppingBag, Store, Truck, Check,
  AlertCircle
} from 'lucide-react'

const ROLES = [
  { id: 'buyer',            label: 'Buyer',             desc: 'I want to ship packages',      icon: ShoppingBag },
  { id: 'vendor',           label: 'Vendor',            desc: 'I manage multiple shipments',   icon: Store       },
  { id: 'logistics_partner',label: 'Logistics Partner', desc: 'I deliver packages',            icon: Truck       },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')
  const [success, setSuccess]  = useState(false)

  const [form, setForm] = useState({
    name: '', phone: '', role: '', email: '', password: '',
  })

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function goNext(e) {
    e.preventDefault()
    if (!form.name.trim())  return setError('Please enter your full name')
    if (!form.phone.trim()) return setError('Please enter your phone number')
    if (!form.role)         return setError('Please select your role')
    setError('')
    setStep(2)
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!form.email.trim())       return setError('Please enter your email')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')

    setLoading(true)
    setError('')

    try {
      // 1. Sign up — Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          // Pass profile data in user_metadata so a DB trigger can pick it up
          data: {
            name:  form.name.trim(),
            phone: form.phone.trim(),
            role:  form.role,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      const uid = authData?.user?.id
      if (!uid) {
        // Email confirmation is ON — user must confirm first
        setSuccess('confirm')
        setLoading(false)
        return
      }

      // 2. Insert profile row — use upsert so it never double-errors
      const { error: profileError } = await supabase.from('users').upsert({
        id:    uid,
        name:  form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role:  form.role,
        status: 'active',
      }, { onConflict: 'id' })

      if (profileError) {
        console.error('Profile insert error:', profileError)
        // Not fatal — auth succeeded; we'll try again on next login
      }

      setSuccess('done')
      setTimeout(() => {
        if (form.role === 'vendor')            navigate('/vendor')
        else if (form.role === 'logistics_partner') navigate('/partner')
        else navigate('/home')
      }, 1800)

    } catch (err) {
      setError('Network error. Check your connection and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Success screens ──────────────────────────────────────────
  if (success === 'confirm') {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center fade-in-up">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-4">
            We sent a confirmation link to <strong>{form.email}</strong>.
            Click it to activate your account, then come back and sign in.
          </p>
          <Link to="/login" className="btn-primary w-full justify-center">
            Go to Sign In
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Tip: To skip email confirmation, go to Supabase → Authentication → Settings → disable "Enable email confirmations".
          </p>
        </div>
      </div>
    )
  }

  if (success === 'done') {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center fade-in-up">
          <div className="w-16 h-16 bg-[#E6F3EF] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-[#0F6E56]" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Account Created!</h2>
          <p className="text-gray-500 text-sm mb-4">
            Welcome to Logistix, {form.name}. Taking you to your dashboard…
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-[#0F6E56] h-1.5 rounded-full w-full transition-all duration-1000" />
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ────────────────────────────────────────────────
  return (
    <div className="min-h-screen auth-bg relative">
      {/* Bg decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-4 opacity-5"><Truck size={100} className="text-[#0F6E56]" /></div>
        <div className="absolute bottom-16 left-4 opacity-5"><Package size={70} className="text-[#0F6E56]" /></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <Link to="/how-it-works" className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-[#0F6E56] rounded-xl flex items-center justify-center shadow-md">
            <Package size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-[#1A1A1A]">
            Logisti<span className="text-[#0F6E56]">x</span>
          </span>
        </Link>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-1 bg-[#0F6E56] transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-lg font-bold text-[#1A1A1A] leading-tight">Create Account</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {step === 1 ? 'About you' : 'Your credentials'}
                </p>
              </div>
              <span className="text-xs font-bold text-[#0F6E56] bg-[#E6F3EF] px-3 py-1.5 rounded-full">
                Step {step} / 2
              </span>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form onSubmit={goNext} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="input-field pl-9"
                      placeholder="e.g. Amaka Johnson"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      className="input-field pl-9"
                      placeholder="+234 800 000 0000"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a…</label>
                  <div className="space-y-2">
                    {ROLES.map(role => {
                      const Icon = role.icon
                      const sel  = form.role === role.id
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => update('role', role.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                            sel ? 'border-[#0F6E56] bg-[#E6F3EF]' : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${sel ? 'bg-[#0F6E56]' : 'bg-gray-100'}`}>
                            <Icon size={17} className={sel ? 'text-white' : 'text-gray-500'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-tight ${sel ? 'text-[#0F6E56]' : 'text-[#1A1A1A]'}`}>{role.label}</p>
                            <p className="text-xs text-gray-500 truncate">{role.desc}</p>
                          </div>
                          {sel && <Check size={15} className="text-[#0F6E56] flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full mt-1">
                  Continue <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      className="input-field pl-9"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input-field pl-9 pr-10"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Strength dots */}
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4].map(n => (
                      <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length >= n * 2
                          ? n <= 2 ? 'bg-red-400' : n === 3 ? 'bg-amber-400' : 'bg-[#0F6E56]'
                          : 'bg-gray-100'
                      }`} />
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError('') }}
                    className="btn-secondary flex-1 text-sm"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 text-sm"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating…
                      </span>
                    ) : (
                      <>Create <ArrowRight size={15} /></>
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-xs text-gray-400 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0F6E56] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
