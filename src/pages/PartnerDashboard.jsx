import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import {
  Truck, Package, MapPin, Calendar, ExternalLink,
  Check, ChevronRight, Clock, Scale, AlertCircle
} from 'lucide-react'

const TABS = [
  { id: 'pending', label: 'Pending', desc: 'Available jobs' },
  { id: 'active', label: 'Active', desc: 'Your current jobs' },
  { id: 'completed', label: 'Completed', desc: 'Delivered' },
]

const STATUS_TRANSITIONS = {
  'Assigned': { next: 'Picked Up', label: 'Mark Picked Up', icon: Package },
  'Picked Up': { next: 'In Transit', label: 'Mark In Transit', icon: Truck },
  'In Transit': { next: 'Delivered', label: 'Mark Delivered', icon: Check },
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export default function PartnerDashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('pending')
  const [allShipments, setAllShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [error, setError] = useState('')

  async function fetchShipments() {
    setLoading(true)
    // Fetch pending (no partner, status=Created) + own active/completed
    const [pending, mine] = await Promise.all([
      supabase
        .from('shipments')
        .select('*')
        .eq('status', 'Created')
        .is('partner_id', null)
        .order('created_at', { ascending: false }),
      supabase
        .from('shipments')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    const combined = [
      ...(pending.data || []),
      ...(mine.data || []),
    ]
    // Deduplicate
    const seen = new Set()
    const unique = combined.filter(s => {
      if (seen.has(s.id)) return false
      seen.add(s.id)
      return true
    })
    setAllShipments(unique)
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    fetchShipments()

    // Real-time: watch all relevant shipments
    const channel = supabase
      .channel(`partner-feed-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shipments',
      }, (payload) => {
        setAllShipments(prev => {
          if (payload.eventType === 'INSERT') {
            if (payload.new.status === 'Created' && !payload.new.partner_id) {
              return [payload.new, ...prev]
            }
            return prev
          }
          if (payload.eventType === 'UPDATE') {
            return prev.map(s => s.id === payload.new.id ? payload.new : s)
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter(s => s.id !== payload.old.id)
          }
          return prev
        })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  async function acceptJob(shipment) {
    setActionLoading(prev => ({ ...prev, [shipment.id]: true }))
    setError('')

    const { error: updateErr } = await supabase
      .from('shipments')
      .update({ partner_id: user.id, status: 'Assigned', updated_at: new Date().toISOString() })
      .eq('id', shipment.id)

    if (updateErr) {
      setError('Failed to accept job. Please try again.')
      setActionLoading(prev => ({ ...prev, [shipment.id]: false }))
      return
    }

    // Log the event
    await supabase.from('shipment_events').insert({
      shipment_id: shipment.id,
      actor_id: user.id,
      action: 'Accepted job',
      location: null,
    })

    // Update local state
    setAllShipments(prev =>
      prev.map(s => s.id === shipment.id
        ? { ...s, partner_id: user.id, status: 'Assigned' }
        : s
      )
    )
    setActionLoading(prev => ({ ...prev, [shipment.id]: false }))
    setTab('active')
  }

  async function updateStatus(shipment, newStatus) {
    setActionLoading(prev => ({ ...prev, [shipment.id]: true }))
    setError('')

    const { error: updateErr } = await supabase
      .from('shipments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', shipment.id)

    if (updateErr) {
      setError('Failed to update status. Please try again.')
      setActionLoading(prev => ({ ...prev, [shipment.id]: false }))
      return
    }

    // Log the event
    await supabase.from('shipment_events').insert({
      shipment_id: shipment.id,
      actor_id: user.id,
      action: `Status updated to ${newStatus}`,
      location: null,
    })

    setAllShipments(prev =>
      prev.map(s => s.id === shipment.id ? { ...s, status: newStatus } : s)
    )
    setActionLoading(prev => ({ ...prev, [shipment.id]: false }))

    if (newStatus === 'Delivered') setTab('completed')
  }

  const tabShipments = {
    pending: allShipments.filter(s => s.status === 'Created' && !s.partner_id),
    active: allShipments.filter(s =>
      s.partner_id === user?.id &&
      ['Assigned', 'Picked Up', 'In Transit'].includes(s.status)
    ),
    completed: allShipments.filter(s =>
      s.partner_id === user?.id && s.status === 'Delivered'
    ),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Delivery Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome, {profile?.name?.split(' ')[0]} · Logistics Partner
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Available', count: tabShipments.pending.length, color: 'text-gray-600', bg: 'bg-white' },
            { label: 'Active', count: tabShipments.active.length, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Delivered', count: tabShipments.completed.length, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3 border border-gray-100 text-center`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === t.id
                  ? 'bg-white text-[#0F6E56] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {tabShipments[t.id]?.length > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-[#E6F3EF] text-[#0F6E56]' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tabShipments[t.id].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading…</p>
          </div>
        ) : tabShipments[tab].length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Truck size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">
              {tab === 'pending' ? 'No available jobs right now' :
               tab === 'active' ? 'No active deliveries' :
               'No completed deliveries yet'}
            </h3>
            <p className="text-sm text-gray-400">
              {tab === 'pending' ? 'Check back soon for new delivery jobs' :
               tab === 'active' ? 'Accept a pending job to get started' :
               'Completed deliveries will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tabShipments[tab].map(s => {
              const transition = STATUS_TRANSITIONS[s.status]
              const isLoading = actionLoading[s.id]

              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-[#E6F3EF] rounded-lg flex items-center justify-center">
                        <Package size={17} className="text-[#0F6E56]" />
                      </div>
                      <div>
                        <span className="font-mono text-sm font-bold text-[#1A1A1A]">{s.shipment_id}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <StatusBadge status={s.status} animate />
                          <span className="text-xs text-gray-400">{s.package_type}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/track/${s.shipment_id}`)}
                      className="text-gray-400 hover:text-[#0F6E56] p-1.5 rounded-lg hover:bg-[#E6F3EF] transition-colors"
                    >
                      <ExternalLink size={15} />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#0F6E56] flex-shrink-0" />
                      <span className="truncate">{s.pickup_address} → {s.destination_address}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Scale size={12} />{s.weight_kg} kg</span>
                      <span className="flex items-center gap-1"><Clock size={12} />ETA {s.eta_hours}h</span>
                      <span className="flex items-center gap-1 text-[#0F6E56] font-semibold">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(s.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(s.created_at)}
                      {s.distance_km && <span> · {s.distance_km} km</span>}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {tab === 'pending' && (
                    <button
                      onClick={() => acceptJob(s)}
                      disabled={isLoading}
                      className="btn-primary w-full text-sm"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Accepting…
                        </span>
                      ) : (
                        <>Accept Job <ChevronRight size={15} /></>
                      )}
                    </button>
                  )}

                  {tab === 'active' && transition && (
                    <button
                      onClick={() => updateStatus(s, transition.next)}
                      disabled={isLoading}
                      className="btn-primary w-full text-sm"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating…
                        </span>
                      ) : (
                        <>
                          <transition.icon size={15} />
                          {transition.label}
                        </>
                      )}
                    </button>
                  )}

                  {tab === 'completed' && (
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700">
                      <Check size={13} />
                      Delivered successfully
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
