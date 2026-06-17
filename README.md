# हल्का काम — Halka Kaam (HK)

A peer-to-peer gig marketplace for Nepal. Hosts post everyday tasks; university
students nearby pitch privately and earn flexible micro-incomes.
**No work is too small — हल्का काम, ठूलो सम्मान.**

> **What's new in this version — mobile-first redesign + Marketplace map + desktop layout**
> The web client is built for phones first (the way most users in Nepal will open
> it), and now stretches into a proper wide-screen layout on laptops too.
> - **Pick your language first.** A नेपाली / English chooser is the very first
>   screen; the whole interface re-labels live, and you can switch any time from
>   the top bar or your profile. Built for less tech-savvy and older users.
> - **A Facebook-Marketplace–style location picker.** The "Where are you?" screen
>   shows a map with a circle **pinned to the centre of the screen**. You drag the
>   map underneath the circle to set your centre — the circle never moves. The
>   distance changes two ways that stay in sync: the **slider** *and* **zooming the
>   map** (zoom out = bigger radius, zoom in = smaller). "Apply" uses wherever the
>   map is centred plus the current radius. The map sits above the "Choose an area
>   instead" shortcuts.
> - **No map in the job feed.** The feed just shows a tidy location summary
>   ("Your location · Showing jobs within X km · Change"); tap it to open the map
>   screen. Jobs get the whole screen.
> - **Real desktop / wide-screen layout (≥900px).** Instead of a skinny phone
>   column floating in empty space, laptops get a **left sidebar rail** (brand,
>   Work/Hire toggle, navigation, your-location card, profile + language) and a
>   content area that fills the width — job cards flow in a grid, and the location
>   screen becomes a big map on the left with the controls panel on the right.
>   The phone layout is unchanged. Tablets get a 2-up card grid.
> - **Nepal-flag colours on a white base.** Red and blue are accents only:
>   **blue when you're working, red when you're hiring** — the app tints itself by
>   mode so you always know which side you're on.
> - **Big, finger-friendly UI:** larger text, 54px+ tap targets, simple words,
>   one main action per screen, a clear bottom nav (phone) or side rail (desktop),
>   and a ＋ button to post.

This is a real, multi-file project you download and run on your own machine.
It has two independent parts you can use separately or together.

```
halka-kaam/
├── README.md                 ← you are here
├── frontend/                 ← the web client (HTML + CSS + vanilla JS, no build step)
│   ├── index.html            ← thin shell; screens are rendered by the js/ files
│   ├── css/
│   │   ├── tokens.css        ← flag palette (white base, red/blue accents), big tap targets
│   │   ├── onboarding.css    ← language picker, landing, auth, location step
│   │   └── app.css           ← app shell, job cards, sheets, chat, reviews, maps
│   └── js/
│       ├── 00-i18n.js        ← नेपाली / English language layer (t() + category names)
│       ├── 01-core.js        ← storage, state, helpers, boot, language pick, auth, LOCATION step, shell, router
│       ├── 02-worker.js      ← proximity feed + map (radius auto-fits), job detail, private offers, chat
│       ├── 03-host.js        ← my tasks, post-a-job, applicant inbox, assign, demo bots
│       ├── 04-reviews-profile.js ← double-loop reviews, disputes, public profiles
│       ├── 05-bootstrap.js   ← wires inline handlers, starts the app
│       └── api.js            ← OPTIONAL client for the real backend (off by default)
│
└── backend/                  ← the production API (Node + Express + PostgreSQL/PostGIS)
    ├── package.json          ← npm scripts: start, dev, db:schema, db:seed, db:reset
    ├── .env.example          ← copy to .env
    ├── db/
    │   ├── schema.sql        ← tables, GIST spatial index, one-way-chat TRIGGER, views
    │   └── seed.sql          ← sample Kathmandu Valley users, jobs, bids, reviews
    └── src/
        ├── server.js         ← entrypoint (serves the API + the frontend/)
        ├── db.js             ← shared PostgreSQL connection pool
        ├── bots.js           ← demo "student" auto-bidders (dev liveliness)
        ├── middleware/auth.js← JWT bearer auth
        └── routes/
            ├── auth.js       ← phone + OTP login
            ├── jobs.js       ← post job, nearby feed (ST_DWithin), assign, complete, review
            ├── bids.js       ← private pitches, one-way chat, messages
            └── users.js      ← /me and public profiles with lifetime scores
```

---

## Option A — run the frontend only (zero setup, 30 seconds)

The web client works completely on its own using your browser's `localStorage`
for storage (a built-in **demo mode**). Nothing to install.

```bash
cd frontend
# any static file server works; pick one you have:
python3 -m http.server 8080
#   or:  npx serve .
#   or:  php -S localhost:8080
```

Open <http://localhost:8080>. Sign up with any 10-digit Nepali number
(`98…`/`97…`); the OTP is demo mode — **any 6 digits work** (try `123456`).
Post a job and seeded "student" bots will pitch on it within seconds so you can
walk the entire hire → chat → assign → complete → review loop solo.

> You can also just double-click `frontend/index.html`, but a tiny server is
> recommended so the maps and geolocation behave normally.

---

## Option B — run the full stack (frontend + real database)

Needs **Node 18+** and **PostgreSQL 14+ with the PostGIS extension**.

```bash
# 1) create the database (once)
createdb halka_kaam
psql halka_kaam -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# 2) backend
cd backend
cp .env.example .env          # then edit DATABASE_URL if needed
npm install
npm run db:schema             # create tables, indexes, triggers
npm run db:seed               # load sample Kathmandu data (optional)
npm start                     # → हल्का काम — API + web client on http://localhost:4000
```

`npm start` serves **both** the REST API (`/api/*`) **and** the web client from
`../frontend`, so just open <http://localhost:4000>.

To make the frontend talk to the API instead of localStorage, uncomment this
line in `frontend/index.html` and use the helpers in `js/api.js`:

```html
<script>window.HK_API_BASE = "http://localhost:4000";</script>
```

Handy: `npm run db:reset` wipes and rebuilds the schema + seed in one go.

---

## What's implemented (mapped to your PRD)

| PRD § | Feature | Where |
|---|---|---|
| 3.1 | Dual-state profile — one account, Host/Worker toggle | `frontend/js/01-core.js` |
| 3.2.A | Host posting: title, category, in-person/virtual, schedule, photos, **map pinpoint**, flat/hourly NPR | `03-host.js`, `routes/jobs.js` |
| 3.2.B | Proximity feed: geolocation, radius slider, category filter, live OpenStreetMap pins | `02-worker.js` |
| 3.2.C | **Anti-Copycat Engine** — private bids; others see applicant *count* only | enforced in `routes/jobs.js` queries |
| 3.2.D | **One-way messaging** — workers can't message first; chats auto-lock on assignment | `routes/bids.js` **+ a DB trigger** in `schema.sql` |
| 3.2.E | Double-loop public reviews + lifetime scores | `04-reviews-profile.js`, `routes/users.js`, `user_ratings` view |
| 4.1 | Tech stack: Node + Express + PostgreSQL/PostGIS | `backend/` |
| 4.3 | **`ST_DWithin` radius query on a GIST index** | `db/schema.sql`, `GET /api/jobs/nearby` |
| 5 | Phased monetization (0% launch → featured posts → escrow) | UI banners + `escrow_transactions`, `disputes` tables |
| 6 | Independent-contractor framing in the footer/terms | `frontend/index.html` |

The headline guarantee — your one-way chat rule — is enforced **in the database
itself**: a trigger (`trg_one_way_chat`) rejects any worker message before the
host opens the discussion, so even a hacked client cannot bypass it.

---

## API reference (quick)

```
POST /api/auth/otp/send         POST /api/auth/otp/verify
GET  /api/me                    PATCH /api/me
POST /api/jobs                  GET  /api/jobs/nearby?lat&lng&radius_m&category
GET  /api/me/jobs               GET  /api/jobs/:id
POST /api/jobs/:id/bids         GET  /api/jobs/:id/bids        (host only)
POST /api/jobs/:id/assign       POST /api/jobs/:id/complete    POST /api/jobs/:id/reviews
GET  /api/me/bids               POST /api/bids/:id/initiate-chat
GET  /api/bids/:id/thread       POST /api/bids/:id/messages
GET  /api/users/:id/profile
```

---

## Roadmap to launch

1. **Flutter app** (PRD §4.1) — `flutter_map` + `geolocator` against this API.
2. **Real OTP** — Sparrow SMS / Aakash SMS in `routes/auth.js` (Redis for codes).
3. **Geocoding** — LocationIQ free tier (5,000 req/day) for address ⇄ pin.
4. **Photo storage** — move from data-URLs to S3/Cloudinary; `job_photos` is ready.
5. **Phase 3 escrow** — Khalti SFT fund-on-assign / release-on-complete (hooks marked `TODO` in `routes/jobs.js`).
6. **Compliance** (PRD §6) — OCR Pvt. Ltd. registration, DOCSCP e-commerce certificate, PAN; keep the contractor tests (no fixed hours, no exclusivity, per-task pay) in the Terms.

---

## Notes & honest limitations

- OTP, payments, and cloud photo storage are **stubbed for local dev** — they
  need real provider keys before production.
- `bots.js` and the seed data exist to make local testing lively; remove or
  disable them for a real deployment (`botsOnNewJob` is a no-op without seed bots).
- Demo mode (localStorage) and the backend are two separate storage paths — the
  backend is the production one; localStorage just lets the UI run with no server.

हल्का काम, ठूलो सम्मान 🇳🇵
