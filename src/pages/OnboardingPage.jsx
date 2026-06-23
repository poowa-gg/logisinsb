import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package, Truck, CheckCircle2, ArrowRight, MapPin,
  UserCheck, Bell, ShoppingBag, Store, Users, ChevronRight,
  Star, Play, Shield, Clock, DollarSign
} from 'lucide-react'

const STEPS = [
  {
    id: 1,
    icon: ShoppingBag,
    emoji: '📦',
    title: 'You have something to send',
    subtitle: 'A package, a document, anything.',
    desc: "Whether you're a shop owner or just sending a gift, Logistix handles it. Tell us where it's going and how heavy it is.",
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: 2,
    icon: DollarSign,
    emoji: '💰',
    title: 'Get an instant price',
    subtitle: 'No hidden fees. Clear price upfront.',
    desc: 'We calculate the cost immediately based on the distance, weight, and package type. What you see is what you pay.',
    color: 'bg-green-50',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  {
    id: 3,
    icon: Truck,
    emoji: '🚚',
    title: 'A driver picks it up',
    subtitle: 'Our logistics partners come to you.',
    desc: "A verified driver is assigned to your order. They come to pick it up from your location. You don't go anywhere.",
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    id: 4,
    icon: MapPin,
    emoji: '📍',
    title: 'Track it live',
    subtitle: 'Know exactly where your package is.',
    desc: 'Share the tracking link with anyone. The status updates automatically — no need to call or refresh the page.',
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    id: 5,
    icon: CheckCircle2,
    emoji: '✅',
    title: 'Delivered!',
    subtitle: 'Safe, on time, confirmed.',
    desc: "Your package arrives at the destination. You get notified the moment it's delivered. That's it.",
    color: 'bg-[#E6F3EF]',
    iconColor: 'text-[#0F6E56]',
    iconBg: 'bg-[#0F6E56]/10',
  },
]

const ROLES = [
  {
    icon: ShoppingBag,
    title: 'Buyers & Senders',
    desc: 'Anyone who needs to send something — from a birthday gift to business inventory.',
    actions: ['Get an instant quote', 'Book delivery in 2 minutes', 'Track your package live'],
    cta: 'Start Sending',
    link: '/register',
    color: 'border-blue-200 bg-blue-50',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    icon: Store,
    title: 'Vendors & Shops',
    desc: 'Business owners who ship products regularly and need to manage multiple orders.',
    actions: ['Dashboard for all shipments', 'Quick reorder and tracking', 'Real-time status updates'],
    cta: 'Register as Vendor',
    link: '/register',
    color: 'border-[#0F6E56]/20 bg-[#E6F3EF]',
    btnColor: 'bg-[#0F6E56] hover:bg-[#0A5240]',
  },
  {
    icon: Truck,
    title: 'Logistics Partners',
    desc: 'Drivers and delivery agents who want to earn by fulfilling delivery jobs.',
    actions: ['See available jobs nearby', 'Accept and manage deliveries', 'Update status with one tap'],
    cta: 'Join as Partner',
    link: '/register',
    color: 'border-amber-200 bg-amber-50',
    btnColor: 'bg-amber-600 hover:bg-amber-700',
  },
]

const FAQS = [
  {
    q: "How do I know my package is safe?",
    a: "All our logistics partners are verified. Your package travels alone (dedicated pickup) by default — it's not mixed with other orders.",
  },
  {
    q: "How long does delivery take?",
    a: "It depends on the distance. We show you the estimated time before you book. Lagos to Abuja, for example, typically takes about 15 hours.",
  },
  {
    q: "What if I don't have internet to track?",
    a: "Share the tracking link with someone who does. Anyone with the link can check the status — no login needed.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes, you can cancel before a driver has been assigned. Once assigned, please contact support.",
  },
  {
    q: "What kinds of packages can I send?",
    a: "Documents, small parcels (clothes, electronics, shoes), and large parcels (furniture, appliances). We'll tell you the price for each type.",
  },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F6E56] rounded-lg flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl">Logisti<span className="text-[#0F6E56]">x</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-[#0F6E56] font-medium">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4 rounded-xl">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F6E56] via-[#0d7a60] to-[#0A5240] text-white overflow-hidden relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>

        {/* Floating icons */}
        <div className="absolute top-8 right-4 opacity-10 hidden md:block">
          <Truck size={100} />
        </div>
        <div className="absolute bottom-8 left-4 opacity-10 hidden md:block">
          <Package size={80} />
        </div>

        <div className="max-w-3xl mx-auto px-4 py-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Play size={14} /> How Logistix Works
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Sending a package<br/>
            <span className="text-white/80">should be this simple.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            No confusing steps. No hidden fees. Just tell us what you're sending and where — we handle the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-white text-[#0F6E56] font-bold rounded-xl px-6 py-3.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors min-h-[48px]">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="bg-white/15 border border-white/30 text-white font-semibold rounded-xl px-6 py-3.5 flex items-center justify-center gap-2 hover:bg-white/25 transition-colors min-h-[48px]">
              I already have an account
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><Shield size={14} /> Verified drivers</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> Same-day available</span>
            <span className="flex items-center gap-1.5"><Star size={14} /> Real-time tracking</span>
          </div>
        </div>
      </div>

      {/* Interactive step walkthrough */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-3">5 Easy Steps</h2>
          <p className="text-gray-500">From "I need to send this" to "It's delivered" — here's the journey.</p>
        </div>

        {/* Step tabs (desktop) */}
        <div className="hidden md:flex gap-2 justify-center mb-8">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeStep === i
                  ? 'bg-[#0F6E56] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{step.emoji}</span>
              Step {step.id}
            </button>
          ))}
        </div>

        {/* Active step detail */}
        <div className={`hidden md:block rounded-2xl p-8 mb-8 transition-all duration-300 ${STEPS[activeStep].color} border border-gray-100`}>
          <div className="flex items-start gap-6">
            <div className={`w-16 h-16 ${STEPS[activeStep].iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <span className="text-3xl">{STEPS[activeStep].emoji}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Step {STEPS[activeStep].id} of 5</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">{STEPS[activeStep].title}</h3>
              <p className={`font-semibold mb-2 ${STEPS[activeStep].iconColor}`}>{STEPS[activeStep].subtitle}</p>
              <p className="text-gray-600 text-base leading-relaxed">{STEPS[activeStep].desc}</p>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="text-sm text-gray-500 hover:text-[#0F6E56] disabled:opacity-30 font-medium"
            >
              ← Previous
            </button>
            {activeStep < STEPS.length - 1 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="flex items-center gap-1.5 bg-[#0F6E56] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0A5240] transition-colors"
              >
                Next Step <ArrowRight size={14} />
              </button>
            ) : (
              <Link
                to="/register"
                className="flex items-center gap-1.5 bg-[#0F6E56] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0A5240] transition-colors"
              >
                Get Started <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-4">
          {STEPS.map((step, i) => (
            <div key={step.id} className={`${step.color} rounded-2xl p-5 border border-gray-100`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-2xl">{step.emoji}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Step {i + 1}</p>
                  <h3 className="font-bold text-[#1A1A1A] text-base mb-1">{step.title}</h3>
                  <p className={`text-sm font-medium mb-1.5 ${step.iconColor}`}>{step.subtitle}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who is it for */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-3">Who uses Logistix?</h2>
            <p className="text-gray-500">Everyone who sends or delivers packages.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLES.map(role => {
              const Icon = role.icon
              return (
                <div key={role.title} className={`rounded-2xl border p-6 ${role.color}`}>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                    <Icon size={24} className="text-[#1A1A1A]" />
                  </div>
                  <h3 className="font-bold text-[#1A1A1A] text-lg mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{role.desc}</p>
                  <ul className="space-y-2 mb-5">
                    {role.actions.map(action => (
                      <li key={action} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={14} className="text-[#0F6E56] flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={role.link}
                    className={`${role.btnColor} text-white font-semibold rounded-xl px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition-colors min-h-[44px]`}
                  >
                    {role.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Visual tracking demo */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-3">
            📍 See where your package is, always
          </h2>
          <p className="text-gray-500">
            Our tracking page updates automatically. No refresh needed. No app required.
          </p>
        </div>

        {/* Mock tracking display */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">Shipment</p>
              <p className="font-mono font-bold">LTX-2026-DEMO1</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#0F6E56] font-medium">
              <div className="w-2 h-2 bg-[#0F6E56] rounded-full animate-pulse" />
              Live
            </div>
          </div>

          {/* Mini timeline */}
          {['Created', 'Assigned', 'Picked Up', 'In Transit', 'Delivered'].map((status, i) => {
            const meta = {
              'Created': { emoji: '📦', label: 'Order Created' },
              'Assigned': { emoji: '🤝', label: 'Driver Assigned' },
              'Picked Up': { emoji: '📬', label: 'Package Picked Up' },
              'In Transit': { emoji: '🚚', label: 'In Transit' },
              'Delivered': { emoji: '✅', label: 'Delivered' },
            }[status]
            const isActive = i === 3 // "In Transit" is current
            const isPast = i < 3

            return (
              <div key={status} className="flex items-start gap-3 mb-3 last:mb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
                  isActive ? 'ring-2 ring-[#0F6E56] ring-offset-2 shadow-lg' : ''
                } ${isPast ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-30'}`}>
                  {meta.emoji}
                </div>
                <div className={`pt-1 ${!isPast && !isActive ? 'opacity-30' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isActive ? 'text-[#0F6E56]' : 'text-[#1A1A1A]'}`}>
                      {meta.label}
                    </span>
                    {isActive && (
                      <span className="text-xs bg-[#0F6E56] text-white px-1.5 py-0.5 rounded-full font-bold">
                        NOW
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1A1A1A] text-center mb-10">
            Questions people ask
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-[#1A1A1A] text-sm">{faq.q}</span>
                  <ChevronRight
                    size={18}
                    className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-[#0F6E56] py-16">
        <div className="max-w-xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to send your first package?</h2>
          <p className="text-white/80 mb-8 text-base">
            Create a free account in under 2 minutes. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-[#0F6E56] font-bold rounded-xl px-8 py-4 hover:bg-gray-50 transition-colors text-base min-h-[52px]"
          >
            Create Free Account <ArrowRight size={20} />
          </Link>
          <p className="mt-4 text-white/60 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-white underline hover:no-underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0A2E24] text-white/60 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0F6E56] rounded-lg flex items-center justify-center">
              <Package size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">Logistix</span>
          </div>
          <p>© {new Date().getFullYear()} Logistix. Fast, reliable delivery.</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
