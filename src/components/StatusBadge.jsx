import React from 'react'

const STATUS_CONFIG = {
  'Created': {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
    label: 'Created',
  },
  'Assigned': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'Assigned',
  },
  'Picked Up': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'Picked Up',
  },
  'In Transit': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'In Transit',
  },
  'Delivered': {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'Delivered',
  },
}

export default function StatusBadge({ status, animate = false }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Created']
  
  return (
    <span className={`status-badge ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${animate && (status === 'In Transit' || status === 'Picked Up') ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
