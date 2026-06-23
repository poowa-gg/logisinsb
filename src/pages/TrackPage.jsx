import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Package, MapPin, Clock, CheckCircle2, Circle, Truck,
  PackageCheck, PackageOpen, ArrowLeft, RefreshCw, AlertCircle,
  Search
} from 'lucide-react'

const STATUSES = ['Created', 'Assigned', 'Picked Up', 'In Transit', 'Delivered']

const STATUS_META = {
  'Created': {
    icon: Package,
    label: 'Order Created',
    desc: 'Your shipment has been booked and is awaiting pickup assignment.',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    activeBg: 'bg-gray-500',
  },
  'Assigned': {
    icon: Truck,
    label: 'Driver Assigned',
    desc: 'A logistics partner has been assigned to your shipment.',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    activeBg: 'bg-blue-500',
  },
  'Picked Up': {
    icon: PackageOpen,
    label: 'Package Picked Up',
    desc: 'Your package has been collected from the pickup location.',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    activeBg: 'bg-amber-500',
  },
  'In Transit': {
    icon: Truck,
    label: 'In Transit',
    desc: 'Your package is on its way to the destination.',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    activeBg: 'bg-amber-500',
  },
  'Delivered': {
    icon: CheckCircle2,
    label: 'Delivered',
    desc: 'Your package has been successfully delivered.',
    color: 'text-green-600',
    bg: 'bg-green-100',
    activeBg: 'bg-green-500',
  },
}

function formatDateTime(d) {
  return new Date(d).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatETA(hours) {
  if (!hours) return 'Calculating...'
  const rounded = Math.round(hours * 2) / 2
  if (rounded < 24) return `${rounded} hr${rounded !== 1 ? 's' : ''}`
  const days = Math.floor(rounded / 24)
  const rem = rounded % 24
  return `${days}d ${rem > 0 ? `${rem}h` : ''}`.trim()
}

function StatusTimeline({ currentStatus }) {
  const currentIdx = STATUSES.indexOf(currentStatus)

  return (
    <div className="relative">
      {STATUSES.map((status, idx) => {
        const meta = STATUS_META[status]
        const Icon = meta.icon
        const isPast = idx < currentIdx
        const isCurrent = idx === currentIdx
        const isFuture = idx > currentIdx
        const isLast = idx === STATUSES.length - 1

        return (
          <div key={status} className="relative flex gap-4">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-[19px] top-[40px] w-0.5 h-[calc(100%-8px)]"
                style={{
                  background: isPast
                    ? '#0F6E56'
                    : 'linear-gradient(to bottom, #d1d5db, #e5e7eb)',
                }}
              />
            )}

            {/* Icon */}
            <div className="relative z-10 flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                isCurrent
                  ? 'border-[#0F6E56] bg-[#0F6E56] pulse-active shadow-lg shadow-[#0F6E5640]'
                  : isPast
                  ? 'border-[#0F6E56] bg-[#0F6E56]'
                  : 'border-gray-200 bg-white'
              }`}>
                <Icon
                  size={18}
                  className={isCurrent || isPast ? 'text-white' : 'text-gray-300'}
                />
              </div>
            </div>

            {/* Content */}
            <div className={`pb-8 flex-1 ${isLast ? 'pb-0' : ''}`}>
              <div className={`flex items-center gap-2 ${isFuture ? 'opacity-40' : ''}`}>
                <span className={`font-semibold text-base ${
                  isCurrent ? 'text-[#0F6E56]' : isPast ? 'text-[#1A1A1A]' : 'text-gray-400'
                }`}>
                  {meta.label}
                </span>
                {isCurrent && (
                  <span className="text-xs font-semibold bg-[#0F6E56] text-white px-2 py-0.5 rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
                {isPast && (
                  <CheckCircle2 size={14} className="text-[#0F6E56]" />
                )}
              </div>
              <p className={`text-sm mt-0.5 ${isFuture ? 'text-gray-300' : 'text-gray-500'}`}>
                {meta.desc}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function TrackPage() {
  const { shipmentId } = useParams()
  const [shipment, setShipment] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchId, setSearchId] = useState(shipmentId || '')
  const [lastUpdate, setLastUpdate] = useState(null)
  const [justUpdated, setJustUpdated] = useState(false)

  async function fetchTracking(id) {
    setLoading(true)
    setError('')

    // Public: only fetch by specific shipment_id (not exposing full table)
    const { data: shipData, error: shipErr } = await supabase
      .from('shipments')
      .select('id, shipment_id, pickup_address, destination_address, package_type, weight_kg, eta_hours, price, status, created_at, updated_at, dedicated_pickup')
      .eq('shipment_id', id)
      .single()

    if (shipErr || !shipData) {
      setError('Shipment not found. Please check the ID and try again.')
      setShipment(null)
      setLoading(false)
      return
    }

    setShipment(shipData)

    // Fetch events for this specific shipment
    const { data: evData } = await supabase
      .from('shipment_events')
      .select('id, action, location, timestamp')
      .eq('shipment_id', shipData.id)
      .order('timestamp', { ascending: false })

    setEvents(evData || [])
    setLastUpdate(new Date())
    setLoading(false)
  }

  useEffect(() => {
    if (shipmentId) fetchTracking(shipmentId)
    else setLoading(false)
  }, [shipmentId])

  useEffect(() => {
    if (!shipment) return

    // Real-time subscription for this specific shipment
    const channel = supabase
      .channel(`track-${shipment.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'shipments',
        filter: `id=eq.${shipment.id}`,
      }, (payload) => {
        setShipment(prev => ({ ...prev, ...payload.new }))
        setLastUpdate(new Date())
        setJustUpdated(true)
        setTimeout(() => setJustUpdated(false), 3000)
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'shipment_events',
        filter: `shipment_id=eq.${shipment.id}`,
      }, (payload) => {
        setEvents(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [shipment?.id])

  function handleSearch(e) {
    e.preventDefault()
    if (searchId.trim()) fetchTracking(searchId.trim().toUpperCase())
  }

  const progressPct = shipment
    ? Math.round((STATUSES.indexOf(shipment.status) / (STATUSES.length - 1)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0F6E56] text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Package size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Track Shipment</h1>
              <p className="text-white/70 text-sm">Real-time delivery tracking</p>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full bg-white text-[#1A1A1A] rounded-xl pl-9 pr-4 py-3 text-sm font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter Shipment ID (e.g. LTX-2026-ABC123)"
                value={searchId}
                onChange={e => setSearchId(e.target.value.toUpperCase())}
              />
            </div>
            <button
              type="submit"
              className="bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-colors flex items-center gap-2 border border-white/20"
            >
              <Search size={15} />
              <span className="hidden sm:inline">Track</span>
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#0F6E56] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Loading tracking data…</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Shipment Not Found</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <p className="text-xs text-gray-400">
              Tip: Shipment IDs look like <span className="font-mono font-semibold">LTX-2026-ABC123</span>
            </p>
          </div>
        ) : !shipment ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Package size={56} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">Enter a Shipment ID</h3>
            <p className="text-sm text-gray-400">
              Enter your shipment ID above to track your delivery in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-4 fade-in-up">
            {/* Live update flash */}
            {justUpdated && (
              <div className="bg-[#E6F3EF] border border-[#0F6E56]/20 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-[#0F6E56] font-medium animate-bounce">
                <RefreshCw size={15} className="animate-spin" />
                Status updated in real time!
              </div>
            )}

            {/* Shipment header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Shipment ID</p>
                  <p className="font-mono font-bold text-lg text-[#1A1A1A]">{shipment.shipment_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Estimated Arrival</p>
                  <p className="font-bold text-lg text-[#0F6E56] flex items-center gap-1 justify-end">
                    <Clock size={16} />
                    {formatETA(shipment.eta_hours)}
                  </p>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-2 text-sm mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#0F6E56]" />
                  <span className="font-medium">{shipment.pickup_address}</span>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-gray-200 relative">
                  <Truck size={14} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#0F6E56] bg-white" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-medium">{shipment.destination_address}</span>
                </div>
              </div>

              {/* Details row */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <Package size={11} /> {shipment.package_type}
                </span>
                <span className="flex items-center gap-1 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  {shipment.weight_kg} kg
                </span>
                {shipment.dedicated_pickup && (
                  <span className="flex items-center gap-1 bg-[#E6F3EF] rounded-lg px-2.5 py-1.5 text-[#0F6E56]">
                    <PackageCheck size={11} /> Dedicated
                  </span>
                )}
                <span className="flex items-center gap-1 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <Clock size={11} /> {formatDateTime(shipment.created_at)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Progress</span>
                  <span className="font-semibold text-[#0F6E56]">{progressPct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-[#0F6E56] h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* === LIVE STATUS TIMELINE — DOMINANT ELEMENT === */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#1A1A1A]">Live Status</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-[#0F6E56] animate-pulse" />
                  Live tracking active
                </div>
              </div>

              <StatusTimeline currentStatus={shipment.status} />
            </div>

            {/* Event log */}
            {events.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-[#1A1A1A] mb-4 text-sm uppercase tracking-wide">
                  Activity Log
                </h3>
                <div className="space-y-3">
                  {events.map((ev, i) => (
                    <div key={ev.id || i} className="flex gap-3 text-sm">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-[#0F6E56] mt-1.5 flex-shrink-0" />
                        {i < events.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-100 mt-1" />
                        )}
                      </div>
                      <div className="pb-3 flex-1">
                        <p className="font-medium text-[#1A1A1A]">{ev.action}</p>
                        {ev.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {ev.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDateTime(ev.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last updated */}
            {lastUpdate && (
              <p className="text-center text-xs text-gray-400">
                Last updated {lastUpdate.toLocaleTimeString()} · Updates automatically
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
