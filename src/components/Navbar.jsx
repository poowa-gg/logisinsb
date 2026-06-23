import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Package, LogOut, Menu, X, HelpCircle } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const roleLabel = {
    buyer: 'Buyer',
    vendor: 'Vendor',
    logistics_partner: 'Logistics Partner',
    admin: 'Admin',
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/how-it-works"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0F6E56] transition-colors"
          >
            <HelpCircle size={15} />
            How It Works
          </Link>
          {user && profile && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{profile.name}</p>
                <p className="text-xs text-gray-500">{roleLabel[profile.role] || profile.role}</p>
              </div>
              <div className="w-9 h-9 bg-[#E6F3EF] rounded-full flex items-center justify-center">
                <span className="text-[#0F6E56] font-bold text-sm">
                  {profile.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link
            to="/how-it-works"
            className="flex items-center gap-2 text-sm text-gray-600 py-2"
            onClick={() => setMenuOpen(false)}
          >
            <HelpCircle size={16} />
            How It Works
          </Link>
          {user && profile && (
            <>
              <div className="flex items-center gap-3 py-2 border-t border-gray-100">
                <div className="w-9 h-9 bg-[#E6F3EF] rounded-full flex items-center justify-center">
                  <span className="text-[#0F6E56] font-bold text-sm">
                    {profile.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{profile.name}</p>
                  <p className="text-xs text-gray-500">{roleLabel[profile.role]}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-red-500 py-2 w-full"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
