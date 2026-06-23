# Logistix 🚚

A full-stack logistics booking web app built with **React + Tailwind CSS + Supabase**.

---

## Setup (5 steps)

### 1. Install Node.js
Download from https://nodejs.org (LTS version). Restart your terminal after installing.

### 2. Create Supabase Project
1. Go to https://supabase.com and sign in
2. Click **New Project** — choose a name, region, and password
3. Wait for provisioning (~1 minute)
4. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key

### 3. Set up the Database
1. In Supabase → **SQL Editor** → **New Query**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste and click **Run**
4. You should see "Success" for all statements

### 4. Configure Environment
Edit `.env` in the project root:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Install & Run
```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Features

### Authentication (Real Supabase Auth)
- 2-step registration with progress indicator
- Step 1: Name, phone, role selection (Buyer / Vendor / Logistics Partner)
- Step 2: Email + password
- Profile row auto-created in `users` table with correct role
- Login redirects to role-appropriate dashboard

### Home Page — Instant Quote
- Select pickup city, destination city
- Choose package type (Document / Small Parcel / Large Parcel) with icons
- Enter weight
- Dedicated Pickup toggle (ON by default)
- **Price formula:** `(500 + distance_km×35 + weight_kg×150) × type_factor`
- **ETA:** `distance_km / 50` rounded to nearest 0.5h
- "Book This Delivery" → real INSERT into Supabase `shipments` table

### Vendor Dashboard
- Lists all shipments where `vendor_id = current user`
- Status badges with colors (gray/blue/amber/green)
- **Real-time**: status updates live via Supabase subscriptions
- Quick stats (total, active, delivered, total spent)

### Logistics Partner Dashboard
- **Pending tab**: shipments with `status=Created` and no `partner_id`
- **Active tab**: shipments assigned to current partner
- **Completed tab**: delivered shipments
- "Accept Job" → updates `partner_id` + status to `Assigned` + inserts event
- Status buttons: Mark Picked Up → In Transit → Delivered (each logs event)

### Public Tracking Page (`/track/:id`)
- No login required
- **DOMINANT live timeline** showing all 5 statuses
- Current status highlighted with pulse animation + "LIVE" badge
- Progress bar (0–100%)
- Activity log from `shipment_events`
- **Real-time**: auto-updates via Supabase subscription — no refresh needed
- Estimated arrival time at the top
- Mobile-first at 360px

### How It Works / Onboarding (`/how-it-works`)
- Interactive 5-step walkthrough
- Role cards (Buyer / Vendor / Partner)
- Mock tracking demo
- FAQ accordion
- Designed for low-literacy users with emojis and plain language

---

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | References auth.users |
| name | TEXT | |
| email | TEXT | Unique |
| phone | TEXT | |
| role | ENUM | buyer, vendor, logistics_partner, admin |
| status | ENUM | active, suspended, pending |
| created_at | TIMESTAMPTZ | |

### `shipments`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| shipment_id | TEXT | LTX-YYYY-XXXXXX format |
| vendor_id | UUID | FK → users |
| partner_id | UUID | FK → users, nullable |
| pickup_address | TEXT | |
| destination_address | TEXT | |
| package_type | TEXT | Document / Small Parcel / Large Parcel |
| weight_kg | NUMERIC | |
| distance_km | NUMERIC | |
| price | NUMERIC | |
| eta_hours | NUMERIC | |
| dedicated_pickup | BOOLEAN | Default true |
| status | ENUM | Created/Assigned/Picked Up/In Transit/Delivered |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated by trigger |

### `shipment_events`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| shipment_id | UUID | FK → shipments |
| actor_id | UUID | FK → users |
| action | TEXT | Description of event |
| location | TEXT | Optional |
| timestamp | TIMESTAMPTZ | Default now() |

---

## Row Level Security Summary

| Table | Who | Access |
|-------|-----|--------|
| users | Own user | SELECT, UPDATE |
| users | Admin | SELECT all |
| shipments | Vendor (own) | SELECT, INSERT, UPDATE |
| shipments | Partner | SELECT pending + own, UPDATE assigned |
| shipments | Public (anon) | SELECT (filtered by shipment_id in app) |
| shipment_events | Auth users | SELECT own + INSERT |
| shipment_events | Public | SELECT (for /track page) |

---

## Design System

- **Primary**: `#0F6E56` (teal)
- **Background**: `#ffffff`
- **Text**: `#1A1A1A`
- **Font**: Inter
- **Min button height**: 48px
- **Mobile-first**: 390px breakpoint

---

## Security Testing (Anon User)

To verify RLS works correctly:
1. Open a new incognito window (no login)
2. Visit `/track/LTX-2026-XXXXX` — ✅ You CAN see one shipment's tracking page
3. In browser console, try:
   ```js
   const { createClient } = supabase
   // The anon key doesn't allow: SELECT * FROM shipments (without filter)
   ```
4. Full table scans are blocked — only individual shipment lookup by ID works

---

## Tech Stack
- React 18 + React Router 6
- Tailwind CSS 3
- Supabase (Auth + PostgreSQL + Realtime)
- Vite 5
- Lucide React (icons)
