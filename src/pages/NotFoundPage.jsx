import React from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-[#E6F3EF] rounded-2xl flex items-center justify-center mb-6">
        <Package size={40} className="text-[#0F6E56]" />
      </div>
      <h1 className="text-6xl font-bold text-[#0F6E56] mb-3">404</h1>
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        This page has been delivered to the wrong address. Let's get you back on track.
      </p>
      <Link to="/" className="btn-primary">
        <ArrowLeft size={16} />
        Back to Home
      </Link>
    </div>
  )
}
