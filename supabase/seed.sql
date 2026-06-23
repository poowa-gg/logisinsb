-- ============================================================
-- LOGISTIX SEED SCRIPT
-- Run in Supabase SQL Editor AFTER you have at least 2 real
-- registered users (one vendor, one logistics_partner).
-- ============================================================

-- Step 1: Add photo_url column if not already there
ALTER TABLE public.shipment_events
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Step 2: Preview your real users (run this first to confirm)
-- SELECT id, email, role FROM public.users;

-- Step 3: Seed 25 shipments using real user IDs from your users table
DO $$
DECLARE
  v_vendor_id  UUID;
  v_partner_id UUID;
  s_id         UUID;
BEGIN

  -- Grab the first vendor in the table
  SELECT id INTO v_vendor_id
  FROM public.users
  WHERE role = 'vendor'
  LIMIT 1;

  -- Grab the first logistics_partner in the table
  SELECT id INTO v_partner_id
  FROM public.users
  WHERE role = 'logistics_partner'
  LIMIT 1;

  -- If no vendor found, use any user as vendor
  IF v_vendor_id IS NULL THEN
    SELECT id INTO v_vendor_id FROM public.users LIMIT 1;
  END IF;

  -- If no partner found, use vendor as partner for seed purposes
  IF v_partner_id IS NULL THEN
    v_partner_id := v_vendor_id;
  END IF;

  RAISE NOTICE 'Seeding with vendor_id=%, partner_id=%', v_vendor_id, v_partner_id;

  -- ── STATUS: Created (5) ────────────────────────────────────
  INSERT INTO public.shipments
    (shipment_id, vendor_id, pickup_address, destination_address, package_type, weight_kg, distance_km, price, eta_hours, dedicated_pickup, status, created_at, updated_at)
  VALUES
    ('LTX-2026-A1B2C3', v_vendor_id, 'Lagos',   'Abuja',         'Small Parcel', 2.5,  760,  39550, 15.5, true,  'Created', now()-'2 days'::interval,    now()-'2 days'::interval),
    ('LTX-2026-D4E5F6', v_vendor_id, 'Lagos',   'Port Harcourt', 'Document',     0.3,  540,  19890, 10.8, false, 'Created', now()-'1 day'::interval,     now()-'1 day'::interval),
    ('LTX-2026-G7H8I9', v_vendor_id, 'Kano',    'Lagos',         'Large Parcel', 8.0,  1100, 97500, 22.0, true,  'Created', now()-'3 hours'::interval,   now()-'3 hours'::interval),
    ('LTX-2026-J1K2L3', v_vendor_id, 'Lagos',   'Ibadan',        'Small Parcel', 1.2,  120,  9240,  2.5,  true,  'Created', now()-'5 hours'::interval,   now()-'5 hours'::interval),
    ('LTX-2026-M4N5O6', v_vendor_id, 'Abuja',   'Enugu',         'Document',     0.5,  340,  13400, 6.8,  false, 'Created', now()-'12 hours'::interval,  now()-'12 hours'::interval)
  ON CONFLICT (shipment_id) DO NOTHING;

  -- ── STATUS: Assigned (5) ──────────────────────────────────
  INSERT INTO public.shipments
    (shipment_id, vendor_id, partner_id, pickup_address, destination_address, package_type, weight_kg, distance_km, price, eta_hours, dedicated_pickup, status, created_at, updated_at)
  VALUES
    ('LTX-2026-P7Q8R9', v_vendor_id, v_partner_id, 'Port Harcourt', 'Lagos',   'Large Parcel', 5.0, 540,  43500, 10.8, true,  'Assigned', now()-'4 days'::interval, now()-'3 days'::interval),
    ('LTX-2026-S1T2U3', v_vendor_id, v_partner_id, 'Lagos',         'Kaduna',  'Small Parcel', 3.0, 880,  46300, 17.6, true,  'Assigned', now()-'3 days'::interval, now()-'2 days'::interval),
    ('LTX-2026-V4W5X6', v_vendor_id, v_partner_id, 'Ibadan',        'Ilorin',  'Document',     0.4, 190,  8400,  3.8,  false, 'Assigned', now()-'2 days'::interval, now()-'1 day'::interval),
    ('LTX-2026-Y7Z8A1', v_vendor_id, v_partner_id, 'Abuja',         'Jos',     'Small Parcel', 1.8, 330,  18300, 6.6,  true,  'Assigned', now()-'1 day'::interval,  now()-'18 hours'::interval),
    ('LTX-2026-B2C3D4', v_vendor_id, v_partner_id, 'Lagos',         'Onitsha', 'Large Parcel', 6.5, 510,  54000, 10.2, true,  'Assigned', now()-'6 hours'::interval, now()-'4 hours'::interval)
  ON CONFLICT (shipment_id) DO NOTHING;

  -- ── STATUS: Picked Up (5) ─────────────────────────────────
  INSERT INTO public.shipments
    (shipment_id, vendor_id, partner_id, pickup_address, destination_address, package_type, weight_kg, distance_km, price, eta_hours, dedicated_pickup, status, created_at, updated_at)
  VALUES
    ('LTX-2026-E5F6G7', v_vendor_id, v_partner_id, 'Lagos',  'Benin City', 'Small Parcel', 2.0, 320,  20100, 6.4,  true,  'Picked Up', now()-'5 days'::interval, now()-'4 days'::interval),
    ('LTX-2026-H8I9J1', v_vendor_id, v_partner_id, 'Kano',   'Kaduna',     'Document',     0.6, 200,  9200,  4.0,  false, 'Picked Up', now()-'4 days'::interval, now()-'3 days'::interval),
    ('LTX-2026-K2L3M4', v_vendor_id, v_partner_id, 'Lagos',  'Warri',      'Large Parcel', 7.0, 390,  51750, 7.8,  true,  'Picked Up', now()-'2 days'::interval, now()-'1 day'::interval),
    ('LTX-2026-N5O6P7', v_vendor_id, v_partner_id, 'Abuja',  'Benin City', 'Small Parcel', 1.5, 595,  30425, 11.9, true,  'Picked Up', now()-'1 day'::interval,  now()-'18 hours'::interval),
    ('LTX-2026-Q8R9S1', v_vendor_id, v_partner_id, 'Lagos',  'Zaria',      'Document',     0.8, 950,  34700, 19.0, false, 'Picked Up', now()-'8 hours'::interval, now()-'6 hours'::interval)
  ON CONFLICT (shipment_id) DO NOTHING;

  -- ── STATUS: In Transit (5) ────────────────────────────────
  INSERT INTO public.shipments
    (shipment_id, vendor_id, partner_id, pickup_address, destination_address, package_type, weight_kg, distance_km, price, eta_hours, dedicated_pickup, status, created_at, updated_at)
  VALUES
    ('LTX-2026-T2U3V4', v_vendor_id, v_partner_id, 'Port Harcourt', 'Enugu',  'Small Parcel', 2.2,  250,  15240, 5.0,  true,  'In Transit', now()-'6 days'::interval, now()-'5 days'::interval),
    ('LTX-2026-W5X6Y7', v_vendor_id, v_partner_id, 'Lagos',         'Abuja',  'Large Parcel', 10.0, 760,  83250, 15.5, true,  'In Transit', now()-'5 days'::interval, now()-'4 days'::interval),
    ('LTX-2026-Z8A9B1', v_vendor_id, v_partner_id, 'Abuja',         'Kano',   'Document',     0.3,  380,  14300, 7.6,  false, 'In Transit', now()-'3 days'::interval, now()-'2 days'::interval),
    ('LTX-2026-C2D3E4', v_vendor_id, v_partner_id, 'Lagos',         'Aba',    'Small Parcel', 3.5,  590,  33450, 11.8, true,  'In Transit', now()-'2 days'::interval, now()-'1 day'::interval),
    ('LTX-2026-F5G6H7', v_vendor_id, v_partner_id, 'Ibadan',        'Lagos',  'Large Parcel', 4.0,  120,  17100, 2.5,  true,  'In Transit', now()-'1 day'::interval,  now()-'12 hours'::interval)
  ON CONFLICT (shipment_id) DO NOTHING;

  -- ── STATUS: Delivered (5) ────────────────────────────────
  INSERT INTO public.shipments
    (shipment_id, vendor_id, partner_id, pickup_address, destination_address, package_type, weight_kg, distance_km, price, eta_hours, dedicated_pickup, status, created_at, updated_at)
  VALUES
    ('LTX-2026-I8J9K1', v_vendor_id, v_partner_id, 'Lagos',         'Abuja',         'Small Parcel', 1.0, 760,  33350,  15.5, true,  'Delivered', now()-'10 days'::interval, now()-'9 days'::interval),
    ('LTX-2026-L2M3N4', v_vendor_id, v_partner_id, 'Kano',          'Lagos',         'Large Parcel', 9.0, 1100, 102000, 22.0, true,  'Delivered', now()-'12 days'::interval, now()-'11 days'::interval),
    ('LTX-2026-O5P6Q7', v_vendor_id, v_partner_id, 'Abuja',         'Port Harcourt', 'Document',     0.4, 790,  28900,  15.8, false, 'Delivered', now()-'8 days'::interval,  now()-'7 days'::interval),
    ('LTX-2026-R8S9T1', v_vendor_id, v_partner_id, 'Lagos',         'Ibadan',        'Small Parcel', 2.0, 120,  10740,  2.5,  true,  'Delivered', now()-'7 days'::interval,  now()-'6 days'::interval),
    ('LTX-2026-U2V3W4', v_vendor_id, v_partner_id, 'Port Harcourt', 'Enugu',         'Small Parcel', 1.5, 250,  13800,  5.0,  true,  'Delivered', now()-'15 days'::interval, now()-'14 days'::interval)
  ON CONFLICT (shipment_id) DO NOTHING;

  -- ── Seed custody events ───────────────────────────────────
  -- Assigned events
  INSERT INTO public.shipment_events (shipment_id, actor_id, action, location, timestamp)
  SELECT s.id, v_partner_id, 'Job accepted by logistics partner', s.pickup_address,
         s.created_at + '2 hours'::interval
  FROM public.shipments s
  WHERE s.status IN ('Assigned','Picked Up','In Transit','Delivered')
    AND s.vendor_id = v_vendor_id
  ON CONFLICT DO NOTHING;

  -- Picked up events
  INSERT INTO public.shipment_events (shipment_id, actor_id, action, location, timestamp)
  SELECT s.id, v_partner_id, 'Package picked up from sender', s.pickup_address,
         s.created_at + '4 hours'::interval
  FROM public.shipments s
  WHERE s.status IN ('Picked Up','In Transit','Delivered')
    AND s.vendor_id = v_vendor_id
  ON CONFLICT DO NOTHING;

  -- In transit events
  INSERT INTO public.shipment_events (shipment_id, actor_id, action, location, timestamp)
  SELECT s.id, v_partner_id, 'Shipment in transit to destination', 'En route',
         s.created_at + '6 hours'::interval
  FROM public.shipments s
  WHERE s.status IN ('In Transit','Delivered')
    AND s.vendor_id = v_vendor_id
  ON CONFLICT DO NOTHING;

  -- Delivered events
  INSERT INTO public.shipment_events (shipment_id, actor_id, action, location, timestamp)
  SELECT s.id, v_partner_id, 'Package delivered successfully', s.destination_address,
         s.created_at + '18 hours'::interval
  FROM public.shipments s
  WHERE s.status = 'Delivered'
    AND s.vendor_id = v_vendor_id
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed complete!';
END $$;

-- Verify: show count per status
SELECT status, count(*) as count
FROM public.shipments
GROUP BY status
ORDER BY status;
