import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Package, User, Phone, Mail, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, ShoppingBag, Store, Truck, Check, AlertCircle
} from 'lucide-react'

const ROLES = [
  { id: 'buyer',             label: 'Buyer',             desc: 'I want to ship packages',    icon: ShoppingBag },
  { id: 'vendor',            label: 'Vendor',            desc: 'I manage multiple shipments', icon: Store       },
  { id: 'logistics_partner', label: 'Logistics Partner', desc: 'I deliver packages',          icon: Truck       },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep]         = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

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

    // 1. Supabase signUp — pass all profile data as user_metadata
    //    so AuthContext can use it instantly without a DB round-trip
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email:    form.email.trim().toLowerCase(),
      password: form.password,
      options: {
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

    const uid     = authData?.user?.id
    const session = authData?.session  // null when email confirm is ON

    if (!uid) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // 2. If we have an active session (email confirm OFF), insert profile now
    if (session) {
      await supabase.from('users').upsert({
        id:     uid,
        name:   form.name.trim(),
        email:  form.email.trim().toLowerCase(),
        phone:  form.phone.trim(),
        role:   form.role,
        status: 'active',
      }, { onConflict: 'id' })
      // Don't block on this — redirect immediately
      setSuccess('done')
      setTimeout(() => {
        if (form.role === 'vendor')             navigate('/vendor')
        else if (form.role === 'logistics_partner') navigate('/partner')
        else navigate('/home')
      }, 800)
    } else {
      // Email confirmation required
      setSuccess('confirm')
    }

    setLoading(false)
  }

  // ── Success: email confirmation needed ───────────────────────
  if (success === 'confirm') {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center fade-in-up">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={26} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-5">
            We sent a link to <strong>{form.email}</strong>. Click it to activate your
            account, then sign in.
          </p>
          <Link to="/login" className="btn-primary w-full justify-center">
            Go to Sign In
          </Link>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            To skip this step: Supabase → Authentication → Providers → Email →
            turn off <em>Confirm email</em>.
          </p>
        </div>
      </div>
    )
  }

  // ── Success: account created ─────────────────────────────────
  if (success === 'done') {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center fade-in-up">
          <div className="w-14 h-14 bg-[#E6F3EF] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-[#0F6E56]" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">Welcome, {form.name.split(' ')[0]}!</h2>
          <p className="text-gray-500 text-sm">Taking you to your dashboard…</p>
        </div>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen auth-bg relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-4 opacity-5"><Truck size={90} className="text-[#0F6E56]" /></div>
        <div className="absolute bottom-16 left-4 opacity-5"><Package size={64} className="text-[#0F6E56]" /></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <Link to="/how-it-works" className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-[#0F6E56] rounded-xl flex items-center justify-center shadow">
            <Package size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-[#1A1A1A]">
            Logisti<span className="text-[#0F6E56]">x</span>
          </span>
        </Link>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-1 bg-[#0F6E56] transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          <div className="p-5 sm:p-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-lg font-bold text-[#1A1A1A]">Create Account</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {step === 1 ? 'Tell us about yourself' : 'Set your login credentials'}
                </p>
              </div>
              <span className="text-xs font-bold text-[#0F6E56] bg-[#E6F3EF] px-2.5 py-1 rounded-full whitespace-nowrap">
                Step {step} / 2
              </span>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4 text-sm text-red-700">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form onSubmit={goNext} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="input-field pl-9"
                      placeholder="e.g. Amaka Johnson"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      className="input-field pl-9"
                      placeholder="+234 800 000 0000"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a…</label>
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
                            sel
                              ? 'border-[#0F6E56] bg-[#E6F3EF]'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sel ? 'bg-[#0F6E56]' : 'bg-gray-100'}`}>
                            <Icon size={16} className={sel ? 'text-white' : 'text-gray-500'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${sel ? 'text-[#0F6E56]' : 'text-[#1A1A1A]'}`}>{role.label}</p>
                            <p className="text-xs text-gray-400 truncate">{role.desc}</p>
                          </div>
                          {sel && <Check size={14} className="text-[#0F6E56] flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full mt-1">
                  Continue <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      className="input-field pl-9"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {form.password.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {[2, 4, 6, 8].map(n => (
                        <div key={n} className={`h-1 flex-1 rounded-full ${
                          form.password.length >= n
                            ? n <= 2 ? 'bg-red-400' : n <= 4 ? 'bg-amber-400' : n <= 6 ? 'bg-yellow-400' : 'bg-[#0F6E56]'
                            : 'bg-gray-100'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError('') }}
                    className="btn-secondary flex-1 text-sm"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 text-sm"
                  >
                    {loading
                      ? <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating…
                        </span>
                      : <>Create Account <ArrowRight size={14} /></>
                    }
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-xs text-gray-400 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0F6E56] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
