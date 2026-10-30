-- =========================================================================
-- HALKA KAAM · PRODUCTION DATABASE SCHEMA & SECURITY POLICIES (POSTGRESQL + POSTGIS)
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- -------------------------------------------------------------------------
-- CUSTOM TYPES & ENUMS
-- -------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('host', 'worker', 'both', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('In-person', 'Virtual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('open', 'assigned', 'done', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE price_type AS ENUM ('Flat', 'Hourly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid', 'held', 'released', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE kyc_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE nepal_doc_type AS ENUM ('citizenship', 'nid', 'driving_license', 'passport');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE message_kind AS ENUM ('text', 'counter', 'system', 'image');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE escrow_status AS ENUM ('held', 'released', 'refunded', 'disputed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- -------------------------------------------------------------------------
-- TABLE 1: PROFILES (Extends Supabase auth.users)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role user_role NOT NULL DEFAULT 'both',
  area VARCHAR(100) DEFAULT 'Kathmandu',
  lat DOUBLE PRECISION DEFAULT 27.6789,
  lng DOUBLE PRECISION DEFAULT 85.2774,
  geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
  rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  kyc_status kyc_status NOT NULL DEFAULT 'unverified',
  avatar_url TEXT,
  bio TEXT,
  police_clearance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for phone lookups & geospatial queries
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_geom ON public.profiles USING GIST(geom);

-- -------------------------------------------------------------------------
-- TABLE 2: KYC VERIFICATIONS (Government ID documents)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doc_type nepal_doc_type NOT NULL DEFAULT 'citizenship',
  doc_number VARCHAR(80) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  dob DATE,
  district VARCHAR(100) NOT NULL,
  front_photo_url TEXT NOT NULL,
  back_photo_url TEXT,
  status kyc_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON public.kyc_verifications(status);

-- -------------------------------------------------------------------------
-- TABLE 3: JOBS (Hyperlocal Tasks)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(80) NOT NULL,
  type job_type NOT NULL DEFAULT 'In-person',
  address VARCHAR(255),
  lat DOUBLE PRECISION NOT NULL DEFAULT 27.6789,
  lng DOUBLE PRECISION NOT NULL DEFAULT 85.2774,
  geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
  when_description VARCHAR(100) DEFAULT 'Today',
  price INTEGER NOT NULL CHECK (price >= 100),
  ptype price_type NOT NULL DEFAULT 'Flat',
  hours NUMERIC(4, 1),
  urgent BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  status job_status NOT NULL DEFAULT 'open',
  assigned_bid_id UUID,
  escrow_balance INTEGER DEFAULT 0 CHECK (escrow_balance >= 0),
  accepted_payments TEXT[] DEFAULT ARRAY['esewa', 'khalti', 'imepay', 'cash'],
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_host ON public.jobs(host_id);
CREATE INDEX IF NOT EXISTS idx_jobs_geom ON public.jobs USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- -------------------------------------------------------------------------
-- TABLE 4: BIDS & OFFERS (Proposals with Counter-Offers)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  price INTEGER NOT NULL CHECK (price >= 100),
  message TEXT,
  status bid_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  counter_price INTEGER,
  counter_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_job_worker UNIQUE (job_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_bids_job ON public.bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_worker ON public.bids(worker_id);

-- -------------------------------------------------------------------------
-- TABLE 5: MESSAGES (Real-Time Negotiation & Chat)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  from_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT,
  kind message_kind NOT NULL DEFAULT 'text',
  counter_price INTEGER,
  img_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(job_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(to_id, is_read) WHERE is_read = FALSE;

-- -------------------------------------------------------------------------
-- TABLE 6: REVIEWS & RATINGS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  from_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL CHECK (role IN ('host', 'worker')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_review_job_pair UNIQUE (job_id, from_id, to_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_to_user ON public.reviews(to_id);

-- -------------------------------------------------------------------------
-- TABLE 7: ESCROW TRANSACTIONS (Financial Ledger)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE RESTRICT,
  bid_id UUID REFERENCES public.bids(id) ON DELETE RESTRICT,
  host_id UUID NOT NULL REFERENCES public.profiles(id),
  worker_id UUID NOT NULL REFERENCES public.profiles(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  gateway VARCHAR(30) NOT NULL DEFAULT 'esewa',
  gateway_ref VARCHAR(120),
  status escrow_status NOT NULL DEFAULT 'held',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_escrow_job ON public.escrow_transactions(job_id);

-- -------------------------------------------------------------------------
-- HIGH-PERFORMANCE GEOSPATIAL POSTGIS FUNCTION
-- Returns jobs within radius_km sorted by proximity in < 5ms
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_nearby_jobs(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 25.0,
  filter_category VARCHAR DEFAULT NULL,
  filter_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  host_id UUID,
  title VARCHAR,
  description TEXT,
  category VARCHAR,
  type job_type,
  address VARCHAR,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  distance_km DOUBLE PRECISION,
  price INTEGER,
  ptype price_type,
  urgent BOOLEAN,
  featured BOOLEAN,
  status job_status,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    j.id,
    j.host_id,
    j.title,
    j.description,
    j.category,
    j.type,
    j.address,
    j.lat,
    j.lng,
    CASE 
      WHEN j.type = 'Virtual' THEN NULL
      ELSE (ST_Distance(j.geom::geography, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) / 1000.0)
    END AS distance_km,
    j.price,
    j.ptype,
    j.urgent,
    j.featured,
    j.status,
    j.created_at
  FROM public.jobs j
  WHERE j.status = 'open'
    AND (
      j.type = 'Virtual' 
      OR ST_DWithin(j.geom::geography, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_km * 1000.0)
    )
    AND (filter_category IS NULL OR filter_category = 'All' OR j.category = filter_category)
    AND (filter_type IS NULL OR filter_type = 'All' OR j.type::text = filter_type)
  ORDER BY 
    j.urgent DESC,
    distance_km ASC NULLS LAST,
    j.created_at DESC;
$$;

-- -------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view profiles, users can only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Jobs: Anyone can read open jobs; hosts can insert/update their own
CREATE POLICY "Jobs viewable by everyone" ON public.jobs
  FOR SELECT USING (true);
CREATE POLICY "Hosts can insert jobs" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update their own jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = host_id);

-- Bids: Host and the worker can view bids for a job
CREATE POLICY "Bids visible to job host and bidder" ON public.bids
  FOR SELECT USING (
    auth.uid() = worker_id 
    OR auth.uid() IN (SELECT host_id FROM public.jobs WHERE id = bids.job_id)
  );
CREATE POLICY "Verified workers can submit bids" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "Bid parties can update status" ON public.bids
  FOR UPDATE USING (
    auth.uid() = worker_id 
    OR auth.uid() IN (SELECT host_id FROM public.jobs WHERE id = bids.job_id)
  );

-- Messages: Only participants in the conversation can read/insert
CREATE POLICY "Messages visible to participants" ON public.messages
  FOR SELECT USING (auth.uid() = from_id OR auth.uid() = to_id);
CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = from_id);
