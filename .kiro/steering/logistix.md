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
shipment_events: id, shipment_id, actor_id, action, location, timestamp, photo_url

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

## Week 4 context
All core features are built and tested. Week 4 only adds:
1. Welcome/onboarding screen (pidgin English, optional tour).
2. UI polish: branded background on auth screens, loading states, empty states, error states.
3. Production deploy: Vercel (frontend) + Supabase (already hosted).
4. Demo environment: seed data stable, OTP fallback for demo use.

## Onboarding copy (use exactly this wording)
Welcome line: Welcome to Logistix - send package, sell goods, or track delivery, easy way.
Tour button: If you wan know how e dey work, follow this small tour
Skip button: I sabi already, make I start
Footer: You fit see this tour again anytime - tap ? at the top.
Step 1: Logistix go show you price first, before you send anything.
Sub: No hidden charge. You go see how much e go cost, before you pay.
Step 2: Person wey we verify go come carry your package.
Sub: We don check the rider well well, before we send am to you.
Step 3: You go fit see where your package dey, anytime.
Sub: From the moment we carry am, to the moment e land for your hand.
Final button: I don sabi, make we start
