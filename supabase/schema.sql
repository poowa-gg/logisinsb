-- ============================================================
-- LOGISTIX — Run each STEP separately if needed
-- Copy ALL of this into SQL Editor and click Run
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- STEP 1: ENUMS
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'buyer', 'vendor', 'logistics_partner', 'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE shipment_status AS ENUM (
    'Created', 'Assigned', 'Picked Up', 'In Transit', 'Delivered'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- STEP 2: USERS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID        PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  phone      TEXT,
  role       user_role   NOT NULL DEFAULT 'buyer',
  status     user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING ( id = auth.uid() );

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK ( id = auth.uid() );

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING ( id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- STEP 3: SHIPMENTS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shipments (
  id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id         TEXT            NOT NULL UNIQUE,
  vendor_id           UUID            NOT NULL,
  partner_id          UUID,
  pickup_address      TEXT            NOT NULL,
  destination_address TEXT            NOT NULL,
  package_type        TEXT            NOT NULL
    CHECK (package_type IN ('Document', 'Small Parcel', 'Large Parcel')),
  weight_kg           NUMERIC(8,2)    NOT NULL,
  distance_km         NUMERIC(8,2),
  price               NUMERIC(12,2),
  eta_hours           NUMERIC(6,2),
  dedicated_pickup    BOOLEAN         NOT NULL DEFAULT TRUE,
  status              shipment_status NOT NULL DEFAULT 'Created',
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipments_vendor_select"   ON public.shipments;
DROP POLICY IF EXISTS "shipments_vendor_insert"   ON public.shipments;
DROP POLICY IF EXISTS "shipments_vendor_update"   ON public.shipments;
DROP POLICY IF EXISTS "shipments_partner_pending" ON public.shipments;
DROP POLICY IF EXISTS "shipments_partner_own"     ON public.shipments;
DROP POLICY IF EXISTS "shipments_partner_update"  ON public.shipments;
DROP POLICY IF EXISTS "shipments_public_read"     ON public.shipments;

CREATE POLICY "shipments_vendor_select" ON public.shipments
  FOR SELECT USING ( vendor_id = auth.uid() );

CREATE POLICY "shipments_vendor_insert" ON public.shipments
  FOR INSERT WITH CHECK ( vendor_id = auth.uid() );

CREATE POLICY "shipments_vendor_update" ON public.shipments
  FOR UPDATE USING ( vendor_id = auth.uid() );

CREATE POLICY "shipments_partner_own" ON public.shipments
  FOR SELECT USING ( partner_id = auth.uid() );

CREATE POLICY "shipments_partner_update" ON public.shipments
  FOR UPDATE USING (
    partner_id = auth.uid()
    OR ( partner_id IS NULL AND status = 'Created'::shipment_status )
  );

CREATE POLICY "shipments_public_read" ON public.shipments
  FOR SELECT USING ( true );

-- ─────────────────────────────────────────────────────────────
-- STEP 4: SHIPMENT_EVENTS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shipment_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID        NOT NULL,
  actor_id    UUID,
  action      TEXT        NOT NULL,
  location    TEXT,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_auth_insert" ON public.shipment_events;
DROP POLICY IF EXISTS "events_public_read" ON public.shipment_events;

CREATE POLICY "events_auth_insert" ON public.shipment_events
  FOR INSERT WITH CHECK ( actor_id = auth.uid() );

CREATE POLICY "events_public_read" ON public.shipment_events
  FOR SELECT USING ( true );

-- ─────────────────────────────────────────────────────────────
-- STEP 5: FOREIGN KEYS (added after tables exist)
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE public.users
    ADD CONSTRAINT users_id_fk
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.shipments
    ADD CONSTRAINT shipments_vendor_fk
    FOREIGN KEY (vendor_id) REFERENCES public.users(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.shipments
    ADD CONSTRAINT shipments_partner_fk
    FOREIGN KEY (partner_id) REFERENCES public.users(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.shipment_events
    ADD CONSTRAINT events_shipment_fk
    FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.shipment_events
    ADD CONSTRAINT events_actor_fk
    FOREIGN KEY (actor_id) REFERENCES public.users(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- STEP 6: REALTIME
-- ─────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipment_events;

-- ─────────────────────────────────────────────────────────────
-- STEP 7: updated_at TRIGGER
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shipments_updated_at ON public.shipments;
CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
