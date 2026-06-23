-- ============================================================
-- LOGISTIX SEED SCRIPT — 25 realistic Nigerian shipments
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- 1. Add photo_url column to shipment_events if not exists
ALTER TABLE public.shipment_events
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Create a seed vendor and partner user
--    (These are dummy rows — replace UUIDs with real user IDs
--     from your auth.users table if you want full RLS compliance,
--     OR temporarily disable RLS to seed, then re-enable)

-- Get your real user IDs by running:
-- SELECT id, email FROM auth.users;
-- Then replace the UUIDs below.

-- For seeding purposes we use a DO block with fixed seed UUIDs.
-- If these users don't exist in auth.users, insert into public.users only
-- (which works if the FK is not enforced during seed).

DO $$
DECLARE
  vendor_id  UUID := '00000000-0000-0000-0000-000000000001';
  partner_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN

  -- Insert seed vendor profile (ignore if exists)
  INSERT INTO public.users (id, name, email, phone, role, status)
  VALUES (vendor_id, 'Tunde Adeyemi', 'tunde@logistix.test', '+2348011111111', 'vendor', 'active')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.users (id, name, email, phone, role, status)
  VALUES (partner_id, 'Chukwuemeka Obi', 'emeka@logistix.test', '+2348022222222', 'logistics_partner', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- ── 25 shipments across 5 statuses ──────────────────────────

  -- STATUS: Created (5 shipments)
  INSERT INTO public.shipments (shipment_id, vendor_id, pickup_address, destination_address, package_type, weight_kg, distance_km, price, eta_hours, dedicated_pickup, status, created_at)
  VALUES
    ('LTX-2026-A1B2C3', vendor_id, 'Lagos', 'Abuja',         'Small Parcel',  2.5, 760, 39550, 15.5, true,  'Created', now() - interval '2 days'),
    ('LTX-2026-D4E5F6', vendor_id, 'Lagos', 'Port Harcourt', 'Document',      0.3, 540, 19890, 10.8, false, 'Created', now() - interval '1 day'),
    ('LTX-2026-G7H8I9', vendor_id, 'Kano',  'Lagos',         'Large Parcel',  8.0, 1100,97500, 22.0, true,  'Created', now() - interval '3 hours'),
    ('LTX-2026-J1K2L3', vendor_id, 'Lagos', 'Ibadan',        'Small Parcel',  1.2, 120, 9240,  2.5,  true,  'Created', now() - interval '5 hours'),
    ('LTX-2026-M4N5O6', vendor_id, 'Abuja', 'Enugu',         'Document',      0.5, 340, 13400, 6.8,  false, 'Created', now() - interval '12 hours');

  -- STATUS: Assigned (5 shipments)
  INSERT INTO public.shipments (shipment_id, vendor_id, partner_id, pickup_address, destination_address, package_type, weight_kg, distance_km, price, eta_hours, dedicated_pickup, status, created_at)
  VALUES
    ('LTX-2026-P7Q8R9', vendor_id, partner_id, 'Port Harcourt', 'Lagos',   'Large Parcel',  5.0, 540, 43500, 10.8, true,  'Assigned', now() - interval '4 days'),
    ('LTX-2026-S1T2U3', vendor_id, partner_id, 'Lagos',         'Kaduna',  'Small Parcel',  3.0, 880, 46300, 17.6, true,  'Assigned', now() - interval '3 days'),
    ('LTX-2026-V4W5X6', vendor_id, partner_id, 'Ibadan',        'Ilorin',  'Document',      0.4, 190, 8400,  3.8,  false, 'Assigned', now() - interval '2 days'),
    ('LTX-2026-Y7Z8A1', vendor_id, partner_id, 'Abuja',         'Jos',     'Small Parcel',  1.8, 330, 18300, 6.6,  true,  'Assigned', now() - interval '1 day'),
    ('LTX-2026-B2C3D4', vendor_id, partner_id, 'Lagos',         'Onitsha', 'Large Parcel',  6.5, 510, 54000, 10.2, true,  'Assigned', now() - interval '6 hours');

  -- STATUS: Picked Up (5 shipments)
  INSERT INTO public.shipments (shipment_id, vendor_id, partner_id, pickup_address, destination_address, package_type, weight_kg, distance_km, price, eta_hours, dedicated_pickup, status, created_at)
  VALUES
    ('LTX-2026-E5F6G7', vendor_id, partner_id, 'Lagos',  'Benin City',    'Small Parcel', 2.0, 320, 20100, 6.4,  true,  'Picked Up', now() - interval '5 days'),
    ('LTX-2026-H8I9J1', vendor_id, partner_id, 'Kano',   'Kaduna',        'Document',     0.6, 200, 9200,  4.0,  false, 'Picked Up', now() - interval '4 days'),
    ('LTX-2026-K2L3M4', vendor_id, partner_id, 'Lagos',  'Warri',         'Large Parcel', 7.0, 390, 51750, 7.8,  true,  'Picked Up', now() - interval '2 days'),
    ('LTX-2026-N5O6P7', vendor_id, partner_id, 'Abuja',  'Benin City',    'Small Parcel', 1.5, 595, 30425, 11.9, true,  'Picked Up', now() - interval '1 day'),
    ('LTX-2026-Q8R9S1', vendor_id, partner_id, 'Lagos',  'Zaria',         'Document',     0.8, 950, 34700, 19.0, false, 'Picked Up', now() - interval '8 hours');

  -- STATUS: In Transit (5 shipments)
  INSERT INTO public.shipments (shipment_id, vendor_id, partner_id, pickup_address, destination_address, package_type, weight_kg, distance_km, price, eta_hours, dedicated_pickup, status, created_at)
  VALUES
    ('LTX-2026-T2U3V4', vendor_id, partner_id, 'Port Harcourt', 'Enugu',   'Small Parcel', 2.2, 250, 15240, 5.0,  true,  'In Transit', now() - interval '6 days'),
    ('LTX-2026-W5X6Y7', vendor_id, partner_id, 'Lagos',         'Abuja',   'Large Parcel', 10.0,760, 83250, 15.5, true,  'In Transit', now() - interval '5 days'),
    ('LTX-2026-Z8A9B1', vendor_id, partner_id, 'Abuja',         'Kano',    'Document',     0.3, 380, 14300, 7.6,  false, 'In Transit', now() - interval '3 days'),
    ('LTX-2026-C2D3E4', vendor_id, partner_id, 'Lagos',         'Aba',     'Small Parcel', 3.5, 590, 33450, 11.8, true,  'In Transit', now() - interval '2 days'),
    ('LTX-2026-F5G6H7', vendor_id, partner_id, 'Ibadan',        'Lagos',   'Large Parcel', 4.0, 120, 17100, 2.5,  true,  'In Transit', now() - interval '1 day');

  -- STATUS: Delivered (5 shipments)
  INSERT INTO public.shipments (shipment_id, vendor_id, partner_id, pickup_address, destination_address, package_type, weight_kg, distance_km, price, eta_hours, dedicated_pickup, status, created_at)
  VALUES
    ('LTX-2026-I8J9K1', vendor_id, partner_id, 'Lagos',         'Abuja',         'Small Parcel', 1.0, 760, 33350, 15.5, true,  'Delivered', now() - interval '10 days'),
    ('LTX-2026-L2M3N4', vendor_id, partner_id, 'Kano',          'Lagos',         'Large Parcel', 9.0, 1100,102000,22.0, true,  'Delivered', now() - interval '12 days'),
    ('LTX-2026-O5P6Q7', vendor_id, partner_id, 'Abuja',         'Port Harcourt', 'Document',     0.4, 790, 28900, 15.8, false, 'Delivered', now() - interval '8 days'),
    ('LTX-2026-R8S9T1', vendor_id, partner_id, 'Lagos',         'Ibadan',        'Small Parcel', 2.0, 120, 10740, 2.5,  true,  'Delivered', now() - interval '7 days'),
    ('LTX-2026-U2V3W4', vendor_id, partner_id, 'Port Harcourt', 'Enugu',         'Small Parcel', 1.5, 250, 13800, 5.0,  true,  'Delivered', now() - interval '15 days');

  -- ── Seed custody events for delivered shipments ──────────────
  INSERT INTO public.shipment_events (shipment_id, actor_id, action, location, timestamp)
  SELECT s.id, partner_id, 'Job accepted by logistics partner', s.pickup_address, s.created_at + interval '2 hours'
  FROM public.shipments s WHERE s.status IN ('Assigned','Picked Up','In Transit','Delivered');

  INSERT INTO public.shipment_events (shipment_id, actor_id, action, location, timestamp)
  SELECT s.id, partner_id, 'Package picked up from sender', s.pickup_address, s.created_at + interval '4 hours'
  FROM public.shipments s WHERE s.status IN ('Picked Up','In Transit','Delivered');

  INSERT INTO public.shipment_events (shipment_id, actor_id, action, location, timestamp)
  SELECT s.id, partner_id, 'Shipment in transit', 'En route', s.created_at + interval '6 hours'
  FROM public.shipments s WHERE s.status IN ('In Transit','Delivered');

  INSERT INTO public.shipment_events (shipment_id, actor_id, action, location, timestamp)
  SELECT s.id, partner_id, 'Package delivered successfully', s.destination_address, s.created_at + interval '18 hours'
  FROM public.shipments s WHERE s.status = 'Delivered';

END $$;

-- Verify counts
SELECT status, count(*) FROM public.shipments GROUP BY status ORDER BY status;
