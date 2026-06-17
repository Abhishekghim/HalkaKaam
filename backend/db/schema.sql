-- ============================================================
-- HALKA KAAM — database schema
-- PostgreSQL 14+ with PostGIS  (PRD §4)
-- Applied automatically by docker-compose, or manually:
--   psql $DATABASE_URL -f backend/db/schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- USERS (dual-state: every user can host AND work) ----------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         VARCHAR(10) UNIQUE NOT NULL CHECK (phone ~ '^9[78][0-9]{8}$'),
  full_name     TEXT NOT NULL,
  campus        TEXT,
  bio           TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,   -- KYC / student-ID check
  is_bot        BOOLEAN NOT NULL DEFAULT FALSE,   -- demo-liveliness accounts
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- JOBS ----------
CREATE TYPE job_status  AS ENUM ('open','assigned','done','cancelled');
CREATE TYPE task_type   AS ENUM ('in_person','virtual');
CREATE TYPE price_type  AS ENUM ('flat','hourly');

CREATE TABLE jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id       UUID NOT NULL REFERENCES users(id),
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 120),
  description   TEXT,
  category      TEXT NOT NULL,
  task_type     task_type  NOT NULL DEFAULT 'in_person',
  price_type    price_type NOT NULL DEFAULT 'flat',
  price_npr     INTEGER NOT NULL CHECK (price_npr >= 50),
  address       TEXT,
  scheduled_txt TEXT,                              -- "2026-06-20 · 16:00" (display)
  status        job_status NOT NULL DEFAULT 'open',
  assigned_bid  UUID,                              -- FK added after bids table
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,    -- Phase 2 monetization
  featured_until TIMESTAMPTZ,
  -- the heart of the proximity engine: geography point, SRID 4326
  geom          GEOGRAPHY(Point, 4326),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PRD §4.3: GIST spatial index makes ST_DWithin radius lookups O(log n)
CREATE INDEX idx_jobs_geom    ON jobs USING gist (geom);
CREATE INDEX idx_jobs_status  ON jobs (status) WHERE status = 'open';
CREATE INDEX idx_jobs_host    ON jobs (host_id);

-- ---------- PHOTOS (up to 5 per job, PRD §3.2.A) ----------
-- url holds an object-storage URL in production; in local dev the API
-- stores compressed data-URLs directly.
CREATE TABLE job_photos (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id    UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  url       TEXT NOT NULL,
  position  SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 5),
  UNIQUE (job_id, position)
);

-- ---------- BIDS (private — the Anti-Copycat Engine, PRD §3.2.C) ----------
-- Privacy is enforced at the API layer: workers may only ever read
-- COUNT(*) of bids on a job; full rows are returned to the host alone.
CREATE TABLE bids (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id   UUID NOT NULL REFERENCES users(id),
  amount_npr  INTEGER NOT NULL CHECK (amount_npr >= 50),
  pitch       TEXT NOT NULL,
  chat_open   BOOLEAN NOT NULL DEFAULT FALSE,   -- one-way activation flag
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, worker_id)                    -- one pitch per worker per job
);
ALTER TABLE jobs
  ADD CONSTRAINT fk_assigned_bid FOREIGN KEY (assigned_bid) REFERENCES bids(id);

-- ---------- MESSAGES (one-way rule, PRD §3.2.D) ----------
-- Enforced by trigger: no message may exist on a bid until the HOST
-- has opened it (chat_open). Workers physically cannot message first —
-- even a buggy or malicious client is stopped by the database itself.
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id      UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_bid ON messages (bid_id, created_at);

CREATE OR REPLACE FUNCTION enforce_one_way_chat() RETURNS trigger AS $$
DECLARE v_host UUID; v_open BOOLEAN;
BEGIN
  SELECT j.host_id, b.chat_open INTO v_host, v_open
  FROM bids b JOIN jobs j ON j.id = b.job_id WHERE b.id = NEW.bid_id;
  IF NOT v_open AND NEW.sender_id <> v_host THEN
    RAISE EXCEPTION 'HK_CHAT_LOCKED: host must initiate the discussion first';
  END IF;
  IF NOT v_open AND NEW.sender_id = v_host THEN
    UPDATE bids SET chat_open = TRUE WHERE id = NEW.bid_id;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_one_way_chat
  BEFORE INSERT ON messages FOR EACH ROW EXECUTE FUNCTION enforce_one_way_chat();

-- ---------- REVIEWS (double loop, PRD §3.2.E) ----------
CREATE TYPE review_direction AS ENUM ('host_to_worker','worker_to_host');
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id),
  direction   review_direction NOT NULL,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  -- host→worker: punctuality / execution / attitude
  -- worker→host: payment clarity / communication / safety
  score_a     SMALLINT NOT NULL CHECK (score_a BETWEEN 1 AND 5),
  score_b     SMALLINT NOT NULL CHECK (score_b BETWEEN 1 AND 5),
  score_c     SMALLINT NOT NULL CHECK (score_c BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, direction)
);

-- public lifetime score (PRD §3.2.E)
CREATE OR REPLACE VIEW user_ratings AS
SELECT reviewee_id AS user_id, direction,
       ROUND(AVG((score_a + score_b + score_c) / 3.0), 2) AS avg_rating,
       COUNT(*)::int AS review_count
FROM reviews GROUP BY reviewee_id, direction;

-- ---------- ESCROW LEDGER (Phase 3 — Khalti SFT, PRD §5.2) ----------
CREATE TYPE escrow_status AS ENUM ('funded','released','refunded','disputed');
CREATE TABLE escrow_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id),
  khalti_txn_id   TEXT,
  amount_npr      INTEGER NOT NULL,
  commission_npr  INTEGER NOT NULL DEFAULT 0,     -- 5–10% in Phase 3
  status          escrow_status NOT NULL DEFAULT 'funded',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

-- ---------- DISPUTES (admin arbitration using photos + chat logs) ----------
CREATE TABLE disputes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id),
  raised_by   UUID NOT NULL REFERENCES users(id),
  description TEXT NOT NULL,
  resolution  TEXT,
  resolved    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
