import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import {
  Package, Plus, MapPin, Calendar, ExternalLink,
  RefreshCw, Inbox, DollarSign
} from 'lucide-react'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function VendorDashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchShipments() {
    if (!user) return
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setShipments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchShipments()

    // Real-time subscription
    if (!user) return
    const channel = supabase
      .channel(`vendor-shipments-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments',
          filter: `vendor_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setShipments(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setShipments(prev =>
              prev.map(s => s.id === payload.new.id ? payload.new : s)
            )
          } else if (payload.eventType === 'DELETE') {
            setShipments(prev => prev.filter(s => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const stats = {
    total: shipments.length,
    active: shipments.filter(s => ['Assigned', 'Picked Up', 'In Transit'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'Delivered').length,
    spent: shipments.reduce((sum, s) => sum + (s.price || 0), 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              Welcome, {profile?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Here's your shipment overview</p>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="btn-primary text-sm px-4"
          >
            <Plus size={16} />
            New Shipment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-[#1A1A1A]', bg: 'bg-white' },
            { label: 'Active', value: stats.active, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Delivered', value: stats.delivered, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Spent', value: formatCurrency(stats.spent), color: 'text-[#0F6E56]', bg: 'bg-[#E6F3EF]' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-gray-100`}>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Shipments list */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1A1A1A]">Your Shipments</h2>
          <button
            onClick={fetchShipments}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0F6E56] transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading shipments…</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Inbox size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No shipments yet</h3>
            <p className="text-sm text-gray-400 mb-5">Create your first shipment to get started</p>
            <button onClick={() => navigate('/home')} className="btn-primary mx-auto">
              <Plus size={16} /> Create Shipment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {shipments.map(s => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-[#E6F3EF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package size={18} className="text-[#0F6E56]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-[#1A1A1A]">{s.shipment_id}</span>
                        <StatusBadge status={s.status} animate />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin size={11} />
                        <span className="truncate">{s.pickup_address} → {s.destination_address}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(s.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={11} />
                          {formatCurrency(s.price)}
                        </span>
                        <span>{s.package_type}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/track/${s.shipment_id}`)}
                    className="text-gray-400 hover:text-[#0F6E56] transition-colors p-1.5 rounded-lg hover:bg-[#E6F3EF] flex-shrink-0"
                    title="Track shipment"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
