import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import {
  FileText, Package, PackageOpen, MapPin, Scale, Clock,
  DollarSign, ArrowRight, Check, Truck, ToggleLeft, ToggleRight,
  Copy, ExternalLink, AlertCircle
} from 'lucide-react'

const PACKAGE_TYPES = [
  { id: 'Document', label: 'Document', icon: FileText, factor: 1.0, desc: 'Papers, letters' },
  { id: 'Small Parcel', label: 'Small Parcel', icon: Package, factor: 1.2, desc: 'Shoes, electronics' },
  { id: 'Large Parcel', label: 'Large Parcel', icon: PackageOpen, factor: 1.5, desc: 'Furniture, appliances' },
]

const CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Kaduna',
  'Enugu', 'Benin City', 'Jos', 'Ilorin', 'Aba', 'Warri', 'Zaria', 'Onitsha',
]

// Rough distance matrix between Nigerian cities (km)
const DISTANCES = {
  'Lagos-Abuja': 760, 'Lagos-Port Harcourt': 540, 'Lagos-Kano': 1100,
  'Lagos-Ibadan': 120, 'Lagos-Kaduna': 880, 'Lagos-Enugu': 640,
  'Lagos-Benin City': 320, 'Lagos-Jos': 940, 'Lagos-Ilorin': 290,
  'Lagos-Aba': 590, 'Lagos-Warri': 390, 'Lagos-Zaria': 950,
  'Lagos-Onitsha': 510, 'Abuja-Port Harcourt': 790, 'Abuja-Kano': 380,
  'Abuja-Ibadan': 660, 'Abuja-Kaduna': 188, 'Abuja-Enugu': 340,
  'Abuja-Benin City': 595, 'Abuja-Jos': 330, 'Abuja-Ilorin': 475,
  'Port Harcourt-Kano': 1200, 'Port Harcourt-Enugu': 250,
  'Kano-Kaduna': 200, 'Kano-Jos': 305, 'Ibadan-Ilorin': 190,
}

function getDistance(from, to) {
  if (from === to) return 0
  const key1 = `${from}-${to}`
  const key2 = `${to}-${from}`
  return DISTANCES[key1] || DISTANCES[key2] || 50 + Math.floor(Math.random() * 200)
}

function generateShipmentId() {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `LTX-${year}-${rand}`
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatETA(hours) {
  if (hours < 1) return '< 1 hour'
  const rounded = Math.round(hours * 2) / 2
  if (rounded < 24) return `${rounded} hr${rounded !== 1 ? 's' : ''}`
  const days = Math.floor(rounded / 24)
  const rem = rounded % 24
  return `${days}d ${rem > 0 ? `${rem}h` : ''}`.trim()
}

export default function HomePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    pickup: '',
    destination: '',
    packageType: 'Small Parcel',
    weight: '',
    dedicatedPickup: true,
  })

  const [quote, setQuote] = useState(null)
  const [booking, setBooking] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [copied, setCopied] = useState(false)

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setQuote(null)
    setBooking(null)
    setBookingError('')
  }

  function calcQuote(e) {
    e.preventDefault()
    if (!form.pickup || !form.destination || !form.weight) return
    if (form.pickup === form.destination) return alert('Pickup and destination must be different cities')

    const distanceKm = getDistance(form.pickup, form.destination)
    const weightKg = parseFloat(form.weight)
    const pkgType = PACKAGE_TYPES.find(p => p.id === form.packageType)
    const factor = pkgType?.factor || 1.0

    const basePrice = 500 + (distanceKm * 35) + (weightKg * 150)
    const price = Math.round(basePrice * factor)
    const etaHours = Math.round((distanceKm / 50) * 2) / 2

    const shipmentId = generateShipmentId()

    setQuote({ price, etaHours, distanceKm, shipmentId })
    setBooking(null)
    setBookingError('')
  }

  async function bookDelivery() {
    if (!quote || !user) return
    setBookingLoading(true)
    setBookingError('')

    const { data, error } = await supabase.from('shipments').insert({
      shipment_id: quote.shipmentId,
      vendor_id: user.id,
      pickup_address: form.pickup,
      destination_address: form.destination,
      package_type: form.packageType,
      weight_kg: parseFloat(form.weight),
      distance_km: quote.distanceKm,
      price: quote.price,
      eta_hours: quote.etaHours,
      dedicated_pickup: form.dedicatedPickup,
      status: 'Created',
    }).select().single()

    setBookingLoading(false)

    if (error) {
      setBookingError('Failed to book shipment. Please try again.')
      console.error(error)
      return
    }

    setBooking(data)
  }

  function copyId() {
    navigator.clipboard.writeText(quote?.shipmentId || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero section */}
      <div className="bg-gradient-to-br from-[#0F6E56] to-[#0A5240] text-white">
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Truck size={14} />
            Fast, reliable delivery across Nigeria
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            Ship anything, anywhere
          </h1>
          <p className="text-white/80 text-base">
            Get an instant price quote and book your delivery in under 2 minutes.
          </p>
        </div>
      </div>

      {/* Quote form */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-5 flex items-center gap-2">
            <DollarSign size={20} className="text-[#0F6E56]" />
            Get Instant Quote
          </h2>

          <form onSubmit={calcQuote} className="space-y-5">
            {/* Pickup / Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#0F6E56]" /> Pickup City
                  </span>
                </label>
                <select
                  className="input-field"
                  value={form.pickup}
                  onChange={e => updateForm('pickup', e.target.value)}
                  required
                >
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-red-500" /> Destination City
                  </span>
                </label>
                <select
                  className="input-field"
                  value={form.destination}
                  onChange={e => updateForm('destination', e.target.value)}
                  required
                >
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Package type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
              <div className="grid grid-cols-3 gap-2">
                {PACKAGE_TYPES.map(pkg => {
                  const Icon = pkg.icon
                  const selected = form.packageType === pkg.id
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => updateForm('packageType', pkg.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-[#0F6E56] bg-[#E6F3EF]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={22} className={selected ? 'text-[#0F6E56]' : 'text-gray-500'} />
                      <span className={`text-xs font-semibold ${selected ? 'text-[#0F6E56]' : 'text-gray-700'}`}>
                        {pkg.label}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden sm:block">{pkg.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Scale size={14} className="text-[#0F6E56]" /> Weight (kg)
                </span>
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                max="500"
                className="input-field"
                placeholder="e.g. 2.5"
                value={form.weight}
                onChange={e => updateForm('weight', e.target.value)}
                required
              />
            </div>

            {/* Dedicated pickup toggle */}
            <div className="bg-[#f8fbfa] rounded-xl p-4 border border-[#E6F3EF]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#E6F3EF] rounded-lg flex items-center justify-center">
                    <Package size={18} className="text-[#0F6E56]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">Dedicated Pickup</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Your package travels alone — we don't mix it with other orders.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm('dedicatedPickup', !form.dedicatedPickup)}
                  className={`toggle-switch ${form.dedicatedPickup ? 'bg-[#0F6E56]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`toggle-switch-thumb ${form.dedicatedPickup ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full text-base">
              Get Quote <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Quote result */}
        {quote && !booking && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#E6F3EF] rounded-full flex items-center justify-center">
                <Check size={16} className="text-[#0F6E56]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">Your Quote</h3>
            </div>

            {/* Route info */}
            <div className="flex items-center gap-2 mb-5 text-sm text-gray-600">
              <span className="font-medium">{form.pickup}</span>
              <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                <Truck size={14} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#0F6E56] bg-white" />
              </div>
              <span className="font-medium">{form.destination}</span>
            </div>
            <p className="text-xs text-gray-400 mb-5 -mt-3">
              {quote.distanceKm} km · {form.packageType} · {form.weight} kg
              {form.dedicatedPickup && ' · Dedicated'}
            </p>

            {/* Price and ETA - same large size side by side */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-[#f8fbfa] rounded-xl p-4 text-center border border-[#E6F3EF]">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Price</p>
                <p className="text-2xl font-bold text-[#0F6E56]">{formatCurrency(quote.price)}</p>
              </div>
              <div className="bg-[#f8fbfa] rounded-xl p-4 text-center border border-[#E6F3EF]">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Est. Arrival</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{formatETA(quote.etaHours)}</p>
              </div>
            </div>

            {/* Shipment ID */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-5">
              <span className="text-xs text-gray-500">Shipment ID:</span>
              <span className="font-mono font-bold text-sm text-[#1A1A1A] flex-1">{quote.shipmentId}</span>
              <button
                onClick={copyId}
                className="text-gray-400 hover:text-[#0F6E56] transition-colors"
                title="Copy ID"
              >
                {copied ? <Check size={15} className="text-[#0F6E56]" /> : <Copy size={15} />}
              </button>
            </div>

            {bookingError && (
              <div className="flex items-center gap-2 bg-red-50 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
                <AlertCircle size={15} />
                {bookingError}
              </div>
            )}

            <button
              onClick={bookDelivery}
              disabled={bookingLoading}
              className="btn-primary w-full text-base"
            >
              {bookingLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Booking…
                </span>
              ) : (
                <>Book This Delivery <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        )}

        {/* Booking success */}
        {booking && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-green-100 p-6 fade-in-up">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">Delivery Booked!</h3>
              <p className="text-sm text-gray-500">Your shipment has been created and saved.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">Shipment ID</span>
                <span className="font-mono font-bold text-[#0F6E56]">{booking.shipment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Route</span>
                <span className="font-medium">{booking.pickup_address} → {booking.destination_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price</span>
                <span className="font-bold text-[#0F6E56]">{formatCurrency(booking.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-gray-700">Created</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/track/${booking.shipment_id}`)}
                className="btn-secondary flex-1 text-sm"
              >
                <ExternalLink size={15} /> Track Shipment
              </button>
              <button
                onClick={() => { setQuote(null); setBooking(null); setForm({ pickup: '', destination: '', packageType: 'Small Parcel', weight: '', dedicatedPickup: true }) }}
                className="btn-primary flex-1 text-sm"
              >
                New Quote
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
