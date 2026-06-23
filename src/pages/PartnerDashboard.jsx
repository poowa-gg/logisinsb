import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import {
  Truck, Package, MapPin, Calendar, ExternalLink,
  Check, ChevronRight, Clock, Scale, AlertCircle, RefreshCw, Inbox
} from 'lucide-react'

const TABS = [
  { id: 'pending',   label: 'Pending',   desc: 'Available jobs'    },
  { id: 'active',    label: 'Active',    desc: 'Your deliveries'   },
  { id: 'completed', label: 'Completed', desc: 'Done'              },
]

const STATUS_TRANSITIONS = {
  'Assigned':   { next: 'Picked Up',  label: 'Mark Picked Up',  icon: Package },
  'Picked Up':  { next: 'In Transit', label: 'Mark In Transit', icon: Truck   },
  'In Transit': { next: 'Delivered',  label: 'Mark Delivered',  icon: Check   },
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(n || 0)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export default function PartnerDashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]               = useState('pending')
  const [allShipments, setAll]      = useState([])
  const [loading, setLoading]       = useState(true)
  const [actionLoading, setActing]  = useState({})
  const [error, setError]           = useState('')

  const fetchShipments = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')

    try {
      // Fetch pending jobs (unassigned, Created)
      const { data: pending, error: e1 } = await supabase
        .from('shipments')
        .select('*')
        .eq('status', 'Created')
        .is('partner_id', null)
        .order('created_at', { ascending: false })

      // Fetch own jobs (assigned to me)
      const { data: mine, error: e2 } = await supabase
        .from('shipments')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false })

      if (e1) console.error('Pending fetch error:', e1)
      if (e2) console.error('Mine fetch error:', e2)

      // Merge and deduplicate
      const map = new Map()
      ;[...(pending || []), ...(mine || [])].forEach(s => map.set(s.id, s))
      setAll(Array.from(map.values()))
    } catch (err) {
      setError('Failed to load shipments. Pull down to refresh.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Fetch when user is available
  useEffect(() => {
    if (user?.id) fetchShipments()
  }, [user?.id, fetchShipments])

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`partner-${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'shipments',
      }, payload => {
        setAll(prev => {
          if (payload.eventType === 'INSERT') {
            const s = payload.new
            // Only add to list if it's a new pending job
            if (s.status === 'Created' && !s.partner_id) {
              if (prev.find(x => x.id === s.id)) return prev
              return [s, ...prev]
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
  }, [user?.id])

  async function acceptJob(shipment) {
    setActing(p => ({ ...p, [shipment.id]: true }))
    setError('')

    const { error: err } = await supabase
      .from('shipments')
      .update({
        partner_id: user.id,
        status: 'Assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipment.id)

    if (err) {
      setError('Failed to accept job — ' + err.message)
      setActing(p => ({ ...p, [shipment.id]: false }))
      return
    }

    await supabase.from('shipment_events').insert({
      shipment_id: shipment.id,
      actor_id:    user.id,
      action:      'Job accepted by logistics partner',
    })

    setAll(prev => prev.map(s =>
      s.id === shipment.id ? { ...s, partner_id: user.id, status: 'Assigned' } : s
    ))
    setActing(p => ({ ...p, [shipment.id]: false }))
    setTab('active')
  }

  async function updateStatus(shipment, newStatus) {
    setActing(p => ({ ...p, [shipment.id]: true }))
    setError('')

    const { error: err } = await supabase
      .from('shipments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', shipment.id)

    if (err) {
      setError('Failed to update — ' + err.message)
      setActing(p => ({ ...p, [shipment.id]: false }))
      return
    }

    await supabase.from('shipment_events').insert({
      shipment_id: shipment.id,
      actor_id:    user.id,
      action:      `Status updated to ${newStatus}`,
    })

    setAll(prev => prev.map(s =>
      s.id === shipment.id ? { ...s, status: newStatus } : s
    ))
    setActing(p => ({ ...p, [shipment.id]: false }))
    if (newStatus === 'Delivered') setTab('completed')
  }

  // Bucket shipments into tabs
  const buckets = {
    pending:   allShipments.filter(s => s.status === 'Created' && !s.partner_id),
    active:    allShipments.filter(s => s.partner_id === user?.id && ['Assigned', 'Picked Up', 'In Transit'].includes(s.status)),
    completed: allShipments.filter(s => s.partner_id === user?.id && s.status === 'Delivered'),
  }

  const displayName = profile?.name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'Partner'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#1A1A1A]">Delivery Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {displayName} · Logistics Partner</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Available', count: buckets.pending.length,   color: 'text-gray-700',   bg: 'bg-white'      },
            { label: 'Active',    count: buckets.active.length,    color: 'text-amber-600',  bg: 'bg-amber-50'   },
            { label: 'Delivered', count: buckets.completed.length, color: 'text-green-600',  bg: 'bg-green-50'   },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-gray-100 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === t.id
                  ? 'bg-white text-[#0F6E56] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {buckets[t.id]?.length > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-[#E6F3EF] text-[#0F6E56]' : 'bg-gray-200 text-gray-500'
                }`}>
                  {buckets[t.id].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={fetchShipments}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#0F6E56] transition-colors"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading shipments…</p>
          </div>
        ) : buckets[tab].length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Inbox size={40} className="text-gray-200 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-500 mb-1">
              {tab === 'pending'   ? 'No available jobs right now'   :
               tab === 'active'    ? 'No active deliveries'          :
                                     'No completed deliveries yet'    }
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {tab === 'pending' ? 'New jobs will appear here automatically' :
               tab === 'active'  ? 'Accept a pending job to start delivering' :
                                   'Delivered shipments will show here'}
            </p>
            {tab !== 'pending' && (
              <button
                onClick={() => setTab('pending')}
                className="btn-primary mx-auto text-sm"
              >
                Browse Pending Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {buckets[tab].map(s => {
              const transition = STATUS_TRANSITIONS[s.status]
              const busy = actionLoading[s.id]

              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-[#E6F3EF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-[#0F6E56]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-bold text-sm text-[#1A1A1A] truncate">{s.shipment_id}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <StatusBadge status={s.status} animate />
                          <span className="text-xs text-gray-400">{s.package_type}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/track/${s.shipment_id}`)}
                      className="text-gray-300 hover:text-[#0F6E56] p-1.5 rounded-lg hover:bg-[#E6F3EF] transition-colors flex-shrink-0"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-[#0F6E56] flex-shrink-0" />
                      <span className="truncate">{s.pickup_address} → {s.destination_address}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1"><Scale size={11} />{s.weight_kg} kg</span>
                      <span className="flex items-center gap-1"><Clock size={11} />ETA {s.eta_hours}h</span>
                      <span className="flex items-center gap-1 text-[#0F6E56] font-semibold">
                        {formatCurrency(s.price)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />{formatDate(s.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  {tab === 'pending' && (
                    <button
                      onClick={() => acceptJob(s)}
                      disabled={busy}
                      className="btn-primary w-full text-sm"
                    >
                      {busy
                        ? <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Accepting…
                          </span>
                        : <>Accept Job <ChevronRight size={14} /></>
                      }
                    </button>
                  )}

                  {tab === 'active' && transition && (
                    <button
                      onClick={() => updateStatus(s, transition.next)}
                      disabled={busy}
                      className="btn-primary w-full text-sm"
                    >
                      {busy
                        ? <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Updating…
                          </span>
                        : <><transition.icon size={14} /> {transition.label}</>
                      }
                    </button>
                  )}

                  {tab === 'completed' && (
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700 font-medium">
                      <Check size={13} /> Delivered successfully
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
