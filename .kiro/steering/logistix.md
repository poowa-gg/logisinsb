# Logistix Steering File

## Project
Logistix — logistics orchestration platform for Nigerian vendors and buyers.
Stack: React + Tailwind CSS frontend, Supabase (Postgres) backend.
Primary color: teal #0F6E56. Font: Inter. Mobile-first at 390px.

## Existing tables (do not recreate)
users: id, name, email, phone, role, status, created_at
shipments: id, shipment_id (LTX-2026-XXXXXX), vendor_id, partner_id,
  pickup_address, destination_address, package_type, weight_kg,
  distance_km, price, eta_hours, dedicated_pickup (bool), status,
  created_at, updated_at
shipment_events: id, shipment_id, actor_id, action, location, timestamp

## Design rules
- Status badges: Created=gray, Assigned=blue, Picked Up/In Transit=amber, Delivered=green.
- All buttons min 48px tall for mobile touch.
- Icons must be universally recognisable.
- Onboarding page already exists — do not modify it.

## Differentiation to preserve
- Dedicated pickup toggle (visible on quote form, default ON).
- Chain of custody timeline (every handoff logged in shipment_events).
- OTP-verified delivery (closes shipment only after buyer confirms).
- Proof of delivery photos (stored against shipment_events row).
