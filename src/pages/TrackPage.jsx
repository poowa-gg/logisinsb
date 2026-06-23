import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Package, MapPin, Clock, CheckCircle2, Truck, PackageCheck,
  PackageOpen, ArrowLeft, RefreshCw, AlertCircle, Search,
  User, Camera, FileText, Shield
} from 'lucide-react'

const STATUSES = ['Created', 'Assigned', 'Picked Up', 'In Transit', 'Delivered']

const STATUS_META = {
  'Created':   { icon: Package,      label: 'Order Created',      desc: 'Booked and awaiting driver assignment.',      dot: 'bg-gray-400',   ring: 'border-gray-400'   },
  'Assigned':  { icon: Truck,        label: 'Driver Assigned',    desc: 'A logistics partner has been assigned.',       dot: 'bg-blue-500',   ring: 'border-blue-500'   },
  'Picked Up': { icon: PackageOpen,  label: 'Package Picked Up',  desc: 'Collected from the pickup location.',          dot: 'bg-amber-500',  ring: 'border-amber-500'  },
  'In Transit':{ icon: Truck,        label: 'In Transit',         desc: 'On the way to the destination.',               dot: 'bg-amber-500',  ring: 'border-amber-500'  },
  'Delivered': { icon: CheckCircle2, label: 'Delivered',          desc: 'Successfully delivered to the recipient.',     dot: 'bg-green-500',  ring: 'border-green-500'  },
}

function formatDateTime(d) {
  return new Date(d).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatETA(hours) {
  if (!hours) return 'Calculating…'
  const r = Math.round(hours * 2) / 2
  if (r < 24) return `${r} hr${r !== 1 ? 's' : ''}`
  const d = Math.floor(r / 24), rem = r % 24
  return `${d}d${rem > 0 ? ` ${rem}h` : ''}`
}

// ── Status Progress Timeline ─────────────────────────────────
function StatusTimeline({ currentStatus }) {
  const currentIdx = STATUSES.indexOf(currentStatus)
  return (
    <div className="space-y-0">
      {STATUSES.map((status, idx) => {
        const meta    = STATUS_META[status]
        const Icon    = meta.icon
        const isPast  = idx < currentIdx
        const isCurr  = idx === currentIdx
        const isFuture= idx > currentIdx
        const isLast  = idx === STATUSES.length - 1

        return (
          <div key={status} className="flex gap-4 relative">
            {/* Vertical connector */}
            {!isLast && (
              <div
                className="absolute left-[19px] top-10 bottom-0 w-0.5"
                style={{ background: isPast ? '#0F6E56' : '#e5e7eb' }}
              />
            )}

            {/* Circle */}
            <div className="relative z-10 flex-shrink-0 pt-0.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                isCurr
                  ? 'border-[#0F6E56] bg-[#0F6E56] shadow-lg shadow-[#0F6E5640] pulse-active'
                  : isPast
                  ? 'border-[#0F6E56] bg-[#0F6E56]'
                  : 'border-gray-200 bg-white'
              }`}>
                <Icon size={17} className={isCurr || isPast ? 'text-white' : 'text-gray-300'} />
              </div>
            </div>

            {/* Text */}
            <div className={`pb-8 flex-1 ${isLast ? 'pb-0' : ''} ${isFuture ? 'opacity-35' : ''}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-semibold text-base ${isCurr ? 'text-[#0F6E56]' : isPast ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>
                  {meta.label}
                </span>
                {isCurr && (
                  <span className="text-[10px] font-bold bg-[#0F6E56] text-white px-2 py-0.5 rounded-full animate-pulse tracking-wide">
                    LIVE
                  </span>
                )}
                {isPast && <CheckCircle2 size={13} className="text-[#0F6E56]" />}
              </div>
              <p className={`text-sm mt-0.5 leading-snug ${isFuture ? 'text-gray-300' : 'text-gray-500'}`}>
                {meta.desc}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Chain of Custody Timeline ────────────────────────────────
function CustodyTimeline({ events }) {
  if (!events.length) return (
    <div className="text-center py-8 text-gray-400">
      <Shield size={32} className="mx-auto mb-2 opacity-30" />
      <p className="text-sm">No custody events recorded yet</p>
    </div>
  )

  return (
    <div className="space-y-0">
      {events.map((ev, i) => {
        const isLast = i === events.length - 1
        const hasPhoto = ev.photo_url

        return (
          <div key={ev.id || i} className="flex gap-3 relative">
            {/* Connector */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-100" />
            )}

            {/* Dot */}
            <div className="relative z-10 flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-[#E6F3EF] border-2 border-[#0F6E56]/20 flex items-center justify-center">
                {hasPhoto
                  ? <Camera size={13} className="text-[#0F6E56]" />
                  : ev.actor_name
                  ? <User size={13} className="text-[#0F6E56]" />
                  : <FileText size={13} className="text-[#0F6E56]" />
                }
              </div>
            </div>

            {/* Content */}
            <div className={`pb-5 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}>
              <p className="font-semibold text-sm text-[#1A1A1A] leading-tight">{ev.action}</p>

              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                {ev.actor_name && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <User size={10} /> {ev.actor_name}
                  </span>
                )}
                {ev.location && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={10} /> {ev.location}
                  </span>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={10} /> {formatDateTime(ev.timestamp)}
                </span>
              </div>

              {/* Proof-of-delivery photo thumbnail */}
              {hasPhoto && (
                <a href={ev.photo_url} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                  <img
                    src={ev.photo_url}
                    alt="Proof of delivery"
                    className="w-24 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                  />
                  <p className="text-xs text-[#0F6E56] mt-1">View proof photo</p>
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function TrackPage() {
  const { shipmentId } = useParams()
  const [shipment,     setShipment]     = useState(null)
  const [events,       setEvents]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [searchId,     setSearchId]     = useState(shipmentId || '')
  const [lastUpdate,   setLastUpdate]   = useState(null)
  const [justUpdated,  setJustUpdated]  = useState(false)

  async function fetchTracking(id) {
    setLoading(true)
    setError('')
    setEvents([])

    const { data: shipData, error: shipErr } = await supabase
      .from('shipments')
      .select('id, shipment_id, pickup_address, destination_address, package_type, weight_kg, eta_hours, price, status, created_at, updated_at, dedicated_pickup')
      .eq('shipment_id', id)
      .maybeSingle()

    if (shipErr || !shipData) {
      setError('Shipment not found. Please check the ID and try again.')
      setShipment(null)
      setLoading(false)
      return
    }

    setShipment(shipData)

    // Fetch custody events — join actor name from users
    const { data: evData } = await supabase
      .from('shipment_events')
      .select('id, action, location, timestamp, photo_url, actor_id, users(name)')
      .eq('shipment_id', shipData.id)
      .order('timestamp', { ascending: false })

    const enriched = (evData || []).map(ev => ({
      ...ev,
      actor_name: ev.users?.name || null,
    }))

    setEvents(enriched)
    setLastUpdate(new Date())
    setLoading(false)
  }

  useEffect(() => {
    if (shipmentId) fetchTracking(shipmentId)
    else setLoading(false)
  }, [shipmentId])

  // Real-time
  useEffect(() => {
    if (!shipment) return
    const channel = supabase
      .channel(`track-${shipment.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'shipments',
        filter: `id=eq.${shipment.id}`,
      }, payload => {
        setShipment(prev => ({ ...prev, ...payload.new }))
        setLastUpdate(new Date())
        setJustUpdated(true)
        setTimeout(() => setJustUpdated(false), 4000)
      })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'shipment_events',
        filter: `shipment_id=eq.${shipment.id}`,
      }, payload => {
        const ev = payload.new
        setEvents(prev => [{ ...ev, actor_name: null }, ...prev])
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
        <div className="max-w-2xl mx-auto px-4 py-5">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Track Shipment</h1>
              <p className="text-white/70 text-xs">Real-time delivery tracking</p>
            </div>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full bg-white text-[#1A1A1A] rounded-xl pl-9 pr-3 py-3 text-sm font-mono placeholder-gray-400 focus:outline-none"
                placeholder="LTX-2026-XXXXXX"
                value={searchId}
                onChange={e => setSearchId(e.target.value.toUpperCase())}
              />
            </div>
            <button type="submit" className="bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl px-4 py-3 text-sm border border-white/20 flex items-center gap-2">
              <Search size={14} /><span className="hidden sm:inline">Track</span>
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#0F6E56] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading tracking data…</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
            <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
            <h3 className="font-semibold text-[#1A1A1A] mb-1">Shipment Not Found</h3>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : !shipment ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Package size={48} className="text-gray-200 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-500 mb-1">Enter a Shipment ID</h3>
            <p className="text-sm text-gray-400">Type your tracking ID above to see live status.</p>
          </div>
        ) : (
          <div className="space-y-4 fade-in-up">

            {/* Live update flash */}
            {justUpdated && (
              <div className="bg-[#E6F3EF] border border-[#0F6E56]/20 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-[#0F6E56] font-medium">
                <RefreshCw size={14} className="animate-spin" />
                Status updated live!
              </div>
            )}

            {/* Shipment summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Shipment ID</p>
                  <p className="font-mono font-bold text-base text-[#1A1A1A]">{shipment.shipment_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">Est. Arrival</p>
                  <p className="font-bold text-[#0F6E56] flex items-center gap-1 justify-end">
                    <Clock size={14} />{formatETA(shipment.eta_hours)}
                  </p>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <div className="w-2 h-2 rounded-full bg-[#0F6E56] flex-shrink-0" />
                  {shipment.pickup_address}
                </span>
                <div className="flex-1 border-t-2 border-dashed border-gray-200 relative min-w-[24px]">
                  <Truck size={12} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#0F6E56] bg-white" />
                </div>
                <span className="flex items-center gap-1.5 font-medium">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  {shipment.destination_address}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                <span className="bg-gray-50 rounded-lg px-2.5 py-1.5 flex items-center gap-1">
                  <Package size={10} /> {shipment.package_type}
                </span>
                <span className="bg-gray-50 rounded-lg px-2.5 py-1.5">{shipment.weight_kg} kg</span>
                {shipment.dedicated_pickup && (
                  <span className="bg-[#E6F3EF] text-[#0F6E56] rounded-lg px-2.5 py-1.5 flex items-center gap-1">
                    <PackageCheck size={10} /> Dedicated
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Delivery progress</span>
                  <span className="font-semibold text-[#0F6E56]">{progressPct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#0F6E56] h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>

            {/* ── LIVE STATUS TIMELINE (dominant) ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-[#1A1A1A]">Live Status</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-[#0F6E56] animate-pulse" />
                  Auto-updates
                </div>
              </div>
              <StatusTimeline currentStatus={shipment.status} />
            </div>

            {/* ── CHAIN OF CUSTODY TIMELINE ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#E6F3EF] rounded-lg flex items-center justify-center">
                    <Shield size={14} className="text-[#0F6E56]" />
                  </div>
                  <h2 className="text-base font-bold text-[#1A1A1A]">Chain of Custody</h2>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </span>
              </div>
              <CustodyTimeline events={events} />
            </div>

            {lastUpdate && (
              <p className="text-center text-xs text-gray-400 pb-4">
                Last updated {lastUpdate.toLocaleTimeString()} · Updates automatically
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
