import React from 'react'
import { AlertCircle, RefreshCw, Inbox, WifiOff } from 'lucide-react'

// ── Full-page loader ─────────────────────────────────────────
export function PageLoader({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-[#E6F3EF]" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-[#0F6E56] border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-gray-400 font-medium">{message}</p>
      </div>
    </div>
  )
}

// ── Inline spinner ────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const s = size === 'sm' ? 'w-4 h-4 border-2' : size === 'lg' ? 'w-8 h-8 border-4' : 'w-6 h-6 border-2'
  return (
    <div className={`${s} rounded-full border-[#0F6E56] border-t-transparent animate-spin ${className}`} />
  )
}

// ── Error state ──────────────────────────────────────────────
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-400" />
      </div>
      <h3 className="font-semibold text-[#1A1A1A] mb-1">Something went wrong</h3>
      <p className="text-sm text-gray-500 mb-5 max-w-xs">{message || 'We could not load this data. Please try again.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-[#E6F3EF] text-[#0F6E56] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#0F6E56] hover:text-white transition-colors min-h-[44px]"
        >
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────
export function EmptyState({ icon: Icon = Inbox, title, desc, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={26} className="text-gray-300" />
      </div>
      <h3 className="font-semibold text-gray-600 mb-1">{title}</h3>
      {desc && <p className="text-sm text-gray-400 mb-5 max-w-xs">{desc}</p>}
      {action && actionLabel && (
        <button
          onClick={action}
          className="btn-primary text-sm mx-auto"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ── Network error ─────────────────────────────────────────────
export function NetworkError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <WifiOff size={26} className="text-gray-400" />
      </div>
      <h3 className="font-semibold text-[#1A1A1A] mb-1">No connection</h3>
      <p className="text-sm text-gray-500 mb-5">Check your internet and try again.</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-sm mx-auto">
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  )
}

// ── Inline error banner ──────────────────────────────────────
export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
      <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 flex-shrink-0">×</button>
      )}
    </div>
  )
}

// ── Success banner ────────────────────────────────────────────
export function SuccessBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 bg-[#E6F3EF] border border-[#0F6E56]/20 rounded-xl px-4 py-3 text-sm text-[#0F6E56] font-medium">
      <span className="w-4 h-4 bg-[#0F6E56] rounded-full flex items-center justify-center flex-shrink-0">
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {message}
    </div>
  )
}
