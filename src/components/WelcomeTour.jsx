import React, { useState, useEffect } from 'react'
import { Package, DollarSign, Truck, MapPin, X, ChevronRight, ChevronLeft, Check } from 'lucide-react'

const TOUR_KEY = 'logistix_tour_seen'

const STEPS = [
  {
    icon: DollarSign,
    emoji: '💰',
    bg: 'bg-[#E6F3EF]',
    iconColor: 'text-[#0F6E56]',
    title: 'Logistix go show you price first, before you send anything.',
    sub: 'No hidden charge. You go see how much e go cost, before you pay.',
  },
  {
    icon: Truck,
    emoji: '🚚',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'Person wey we verify go come carry your package.',
    sub: 'We don check the rider well well, before we send am to you.',
  },
  {
    icon: MapPin,
    emoji: '📍',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'You go fit see where your package dey, anytime.',
    sub: 'From the moment we carry am, to the moment e land for your hand.',
  },
]

// ── Floating ? button ─────────────────────────────────────────
export function TourTrigger({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      title="How Logistix works"
      className="fixed bottom-5 right-5 z-40 w-11 h-11 bg-[#0F6E56] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#0A5240] transition-colors text-base font-bold"
    >
      ?
    </button>
  )
}

// ── Main tour modal ────────────────────────────────────────────
export default function WelcomeTour({ onClose }) {
  const [step, setStep] = useState(0) // 0 = welcome screen, 1-3 = tour steps, 4 = done

  function handleSkip() {
    localStorage.setItem(TOUR_KEY, 'true')
    onClose()
  }

  function handleFinish() {
    localStorage.setItem(TOUR_KEY, 'true')
    onClose()
  }

  function next() { setStep(s => s + 1) }
  function prev() { setStep(s => s - 1) }

  // Tour step index (0-based into STEPS array)
  const tourIdx = step - 1
  const isWelcome = step === 0
  const isTourStep = step >= 1 && step <= STEPS.length
  const isDone = step > STEPS.length
  const currentStep = STEPS[tourIdx]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden fade-in-up">

        {/* Progress dots — only during tour */}
        {isTourStep && (
          <div className="flex justify-center gap-1.5 pt-5 pb-0 px-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < tourIdx ? 'bg-[#0F6E56] w-5' :
                  i === tourIdx ? 'bg-[#0F6E56] w-8' :
                  'bg-gray-200 w-5'
                }`}
              />
            ))}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
        >
          <X size={15} />
        </button>

        <div className="p-6 pt-5">

          {/* ── WELCOME SCREEN ── */}
          {isWelcome && (
            <div className="text-center">
              {/* Logo */}
              <div className="w-16 h-16 bg-[#0F6E56] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#0F6E5630]">
                <Package size={32} className="text-white" />
              </div>

              <h1 className="text-xl font-bold text-[#1A1A1A] leading-snug mb-2">
                Welcome to Logistix
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Send package, sell goods, or track delivery,{' '}
                <span className="text-[#0F6E56] font-semibold">easy way.</span>
              </p>

              {/* Illustration row */}
              <div className="flex justify-center gap-4 mb-7">
                {[
                  { emoji: '💰', label: 'Instant price' },
                  { emoji: '🚚', label: 'Verified rider' },
                  { emoji: '📍', label: 'Live tracking' },
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl border border-gray-100">
                      {item.emoji}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <button
                onClick={() => setStep(1)}
                className="btn-primary w-full mb-3"
              >
                If you wan know how e dey work, follow this small tour
                <ChevronRight size={16} />
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 text-sm text-gray-500 hover:text-[#0F6E56] transition-colors font-medium"
              >
                I sabi already, make I start
              </button>

              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                You fit see this tour again anytime — tap{' '}
                <span className="inline-flex items-center justify-center w-5 h-5 bg-[#0F6E56] text-white rounded-full text-[10px] font-bold align-middle">?</span>{' '}
                at the bottom.
              </p>
            </div>
          )}

          {/* ── TOUR STEPS ── */}
          {isTourStep && currentStep && (
            <div className="text-center">
              {/* Step icon */}
              <div className={`w-20 h-20 ${currentStep.bg} rounded-3xl flex items-center justify-center mx-auto mb-5`}>
                <span className="text-4xl">{currentStep.emoji}</span>
              </div>

              <div className="mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Step {tourIdx + 1} of {STEPS.length}
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#1A1A1A] leading-snug mb-3 px-2">
                {currentStep.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-7 px-2">
                {currentStep.sub}
              </p>

              {/* Navigation */}
              <div className="flex gap-3">
                {tourIdx > 0 && (
                  <button
                    onClick={prev}
                    className="btn-secondary flex-1 text-sm"
                  >
                    <ChevronLeft size={15} /> Back
                  </button>
                )}
                {tourIdx < STEPS.length - 1 ? (
                  <button onClick={next} className="btn-primary flex-1 text-sm">
                    Next <ChevronRight size={15} />
                  </button>
                ) : (
                  <button onClick={handleFinish} className="btn-primary flex-1 text-sm">
                    I don sabi, make we start <Check size={15} />
                  </button>
                )}
              </div>

              {tourIdx === 0 && (
                <button
                  onClick={handleSkip}
                  className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip tour
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Hook: manages tour visibility ─────────────────────────────
export function useTour() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Show automatically on first visit
    const seen = localStorage.getItem(TOUR_KEY)
    if (!seen) {
      // Small delay so the page renders first
      const t = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  return {
    tourOpen: open,
    openTour: () => setOpen(true),
    closeTour: () => setOpen(false),
  }
}
