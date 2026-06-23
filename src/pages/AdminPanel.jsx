import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import {
  Shield, Users, Package, Filter, RefreshCw, Check,
  X, ExternalLink, ChevronDown, AlertCircle, Search,
  TrendingUp, DollarSign, Truck, Clock
} from 'lucide-react'

const STATUS_OPTIONS = ['All', 'Created', 'Assigned', 'Picked Up', 'In Transit', 'Delivered']

function formatCurrency(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n || 0)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminPanel() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [shipments,   setShipments]   = useState([])
  const [pendingUsers,setPendingUsers] = useState([])
  const [loadingShip, setLoadingShip] = useState(true)
  const [loadingUsers,setLoadingUsers] = useState(true)
  const [statusFilter,setStatusFilter] = useState('All')
  const [search,       setSearch]      = useState('')
  const [actionMsg,    setActionMsg]   = useState('')
  const [error,        setError]       = useState('')

  // ── Fetch all shipments with vendor + partner names ──────────
  const fetchShipments = useCallback(async () => {
    setLoadingShip(true)
    const { data, error: err } = await supabase
      .from('shipments')
      .select(`
        id, shipment_id, status, created_at, price, package_type,
        pickup_address, destination_address,
        vendor:vendor_id ( id, name, email ),
        partner:partner_id ( id, name, email )
      `)
      .order('created_at', { ascending: false })

    if (err) { setError(err.message); setLoadingShip(false); return }
    setShipments(data || [])
    setLoadingShip(false)
  }, [])

  // ── Fetch pending verification queue ────────────────────────
  const fetchPendingUsers = useCallback(async () => {
    setLoadingUsers(true)
    const { data, error: err } = await supabase
      .from('users')
      .select('id, name, email, phone, role, status, created_at')
      .eq('status', 'pending')
      .in('role', ['vendor', 'logistics_partner'])
      .order('created_at', { ascending: false })

    if (!err) setPendingUsers(data || [])
    setLoadingUsers(false)
  }, [])

  useEffect(() => {
    fetchShipments()
    fetchPendingUsers()
  }, [fetchShipments, fetchPendingUsers])

  // ── Approve / Suspend user ───────────────────────────────────
  async function updateUserStatus(userId, newStatus) {
    const { error: err } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', userId)

    if (err) { setError(err.message); return }

    setPendingUsers(prev => prev.filter(u => u.id !== userId))
    setActionMsg(`User ${newStatus === 'active' ? 'approved' : 'suspended'} successfully`)
    setTimeout(() => setActionMsg(''), 3000)
  }

  // ── Filter + search ──────────────────────────────────────────
  const filtered = shipments.filter(s => {
    const matchStatus = statusFilter === 'All' || s.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      s.shipment_id?.toLowerCase().includes(q) ||
      s.vendor?.name?.toLowerCase().includes(q) ||
      s.partner?.name?.toLowerCase().includes(q) ||
      s.pickup_address?.toLowerCase().includes(q) ||
      s.destination_address?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  // ── Stats ────────────────────────────────────────────────────
  const stats = {
    total:     shipments.length,
    active:    shipments.filter(s => ['Assigned','Picked Up','In Transit'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'Delivered').length,
    revenue:   shipments.reduce((sum, s) => sum + (s.price || 0), 0),
  }

  const displayName = profile?.name || user?.user_metadata?.name || 'Admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F6E56] rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">Admin Panel</h1>
              <p className="text-sm text-gray-500">Welcome, {displayName}</p>
            </div>
          </div>
          <button onClick={() => { fetchShipments(); fetchPendingUsers() }}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0F6E56] transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
            <AlertCircle size={14} />{error}
          </div>
        )}
        {actionMsg && (
          <div className="flex items-center gap-2 bg-[#E6F3EF] border border-[#0F6E56]/20 rounded-xl px-4 py-3 mb-4 text-sm text-[#0F6E56]">
            <Check size={14} />{actionMsg}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Shipments', value: stats.total,               icon: Package,  color: 'text-[#1A1A1A]', bg: 'bg-white'     },
            { label: 'Active',          value: stats.active,              icon: Truck,    color: 'text-amber-600', bg: 'bg-amber-50'  },
            { label: 'Delivered',       value: stats.delivered,           icon: Check,    color: 'text-green-600', bg: 'bg-green-50'  },
            { label: 'Total Revenue',   value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-[#0F6E56]', bg: 'bg-[#E6F3EF]' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">{s.label}</p>
                <s.icon size={14} className={s.color} />
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── SHIPMENTS TABLE ── */}
        <div className="bg-white rounded-2xl border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h2 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                <Package size={16} className="text-[#0F6E56]" />
                All Shipments
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {filtered.length}
                </span>
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-48">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                    placeholder="Search ID, vendor, city…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                {/* Status filter */}
                <div className="relative">
                  <select
                    className="appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-7 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0F6E56] cursor-pointer"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {loadingShip ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No shipments match your filter</p>
            </div>
          ) : (
            /* Scrollable table on mobile */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium">Shipment ID</th>
                    <th className="text-left px-4 py-3 font-medium">Vendor</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Partner</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Route</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                    <th className="text-right px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-xs text-[#1A1A1A]">{s.shipment_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-gray-700">{s.vendor?.name || '—'}</span>
                        <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{s.vendor?.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-600">{s.partner?.name || <span className="text-gray-300 italic">Unassigned</span>}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-gray-500 truncate max-w-[160px] block">
                          {s.pickup_address} → {s.destination_address}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-400">{formatDate(s.created_at)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-semibold text-[#0F6E56]">{formatCurrency(s.price)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/track/${s.shipment_id}`)}
                          className="text-gray-300 hover:text-[#0F6E56] transition-colors"
                        >
                          <ExternalLink size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── PARTNER VERIFICATION QUEUE ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#1A1A1A] flex items-center gap-2">
              <Users size={16} className="text-[#0F6E56]" />
              Verification Queue
              {pendingUsers.length > 0 && (
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {pendingUsers.length} pending
                </span>
              )}
            </h2>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Check size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No pending verifications</p>
              <p className="text-xs mt-1">All users are verified or there are no new sign-ups</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingUsers.map(u => (
                <div key={u.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-amber-600">
                        {u.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#1A1A1A] truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          u.role === 'logistics_partner'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          {u.role === 'logistics_partner' ? 'Logistics Partner' : 'Vendor'}
                        </span>
                        <span className="text-[10px] text-gray-400">{formatDate(u.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateUserStatus(u.id, 'active')}
                      className="flex items-center gap-1.5 bg-[#E6F3EF] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white font-semibold text-xs px-3 py-2 rounded-lg transition-colors min-h-[36px]"
                    >
                      <Check size={12} /> Approve
                    </button>
                    <button
                      onClick={() => updateUserStatus(u.id, 'suspended')}
                      className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-semibold text-xs px-3 py-2 rounded-lg transition-colors min-h-[36px]"
                    >
                      <X size={12} /> Suspend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
