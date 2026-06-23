import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Package, LogOut, Menu, X } from 'lucide-react'
import WelcomeTour, { TourTrigger } from './WelcomeTour'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [tourOpen,  setTourOpen]  = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const roleLabel = {
    buyer:             'Buyer',
    vendor:            'Vendor',
    logistics_partner: 'Logistics Partner',
    admin:             'Admin',
  }

  const name     = profile?.name || user?.user_metadata?.name || ''
  const role     = profile?.role || user?.user_metadata?.role || ''
  const initials = name?.charAt(0).toUpperCase() || '?'

  return (
    <>
      {tourOpen && <WelcomeTour onClose={() => setTourOpen(false)} />}
      <TourTrigger onOpen={() => setTourOpen(true)} />

      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#0F6E56] rounded-lg flex items-center justify-center group-hover:bg-[#0A5240] transition-colors">
              <Package size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-[#1A1A1A] tracking-tight">
              Logisti<span className="text-[#0F6E56]">x</span>
            </span>
          </Link>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{name}</p>
                  <p className="text-xs text-gray-400">{roleLabel[role] || role}</p>
                </div>
                <div className="w-9 h-9 bg-[#E6F3EF] rounded-full flex items-center justify-center border-2 border-[#0F6E56]/10">
                  <span className="text-[#0F6E56] font-bold text-sm">{initials}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 min-h-[36px]"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMenuOpen(m => !m)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3 fade-in-up">
            {user && (
              <>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 bg-[#E6F3EF] rounded-full flex items-center justify-center">
                    <span className="text-[#0F6E56] font-bold">{initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{name}</p>
                    <p className="text-xs text-gray-400">{roleLabel[role] || role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setTourOpen(true); setMenuOpen(false) }}
                  className="flex items-center gap-2 text-sm text-[#0F6E56] py-2 w-full font-medium"
                >
                  <span className="w-5 h-5 bg-[#0F6E56] text-white rounded-full flex items-center justify-center text-xs font-bold">?</span>
                  How Logistix Works
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-red-500 py-2 w-full border-t border-gray-100 pt-3"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
