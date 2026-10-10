# हल्का काम (Halka Kaam) — Next.js & React Frontend

This is the modernized **React + Next.js (App Router) + TypeScript + Tailwind CSS** rewrite of the Halka Kaam web client, completely rebuilt from the ground up from the original vanilla HTML/CSS/JS frontend while preserving **100% visual design, branding, responsiveness, animations, and functionality**.

---

## 🚀 How to Run

### Development Mode
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## 🏗️ Architecture & Component Breakdown

All logic and UI from the original vanilla files (`00-i18n.js`, `01-core.js`, `02-worker.js`, `03-host.js`, `04-reviews-profile.js`, `05-bootstrap.js`) have been organized into modern modular React components:

| Feature / Screen | Component | Description |
| :--- | :--- | :--- |
| **Bilingual i18n** | `src/lib/i18n.ts` | Complete English & Nepali dictionary with `t(key)` and `catName(cat)`. |
| **State & Store** | `src/context/AppContext.tsx` | Global state, local persistence (`localStorage`), simulated demo student bots, and action handlers. |
| **Language Chooser** | `src/components/ScreenLangPick.tsx` | Nepali / English welcome screen. |
| **Hero Landing** | `src/components/ScreenLanding.tsx` | "I need help" (Host) vs "I want to earn" (Worker) role chooser. |
| **Auth & OTP** | `src/components/ScreenAuth.tsx` | 10-digit mobile number input + 6-digit OTP verification. |
| **Location Step** | `src/components/ScreenLocation.tsx` | Marketplace-style interactive map with centered pinned circle, radius slider sync, and area shortcuts. |
| **Main App Shell** | `src/components/AppShell.tsx` | Responsive layout with desktop left-rail (brand, mode toggle, nav, user profile) and mobile bottom bar + FAB. |
| **Worker Feed** | `src/components/WorkerFeed.tsx` | Proximity job feed with category chips, distance calculations, and empty state widen search. |
| **Job Card** | `src/components/JobCard.tsx` | Card with Nepali NPR currency formatting, tags, distance, and bid status. |
| **Job Details & Offer** | `src/components/SheetModal.tsx` | Bottom sheet modal for job specs, photo strip, Leaflet pin map, and private pitch submission. |
| **Worker Offers** | `src/components/WorkerOffers.tsx` | Worker's submitted pitches, assignment indicators, and chat buttons. |
| **Host Tasks** | `src/components/HostJobs.tsx` | Poster's task list and applicant counts. |
| **Post a Job** | `src/components/PostJob.tsx` | Step-by-step task poster with interactive pin map, category grid, photo upload, and price selector. |
| **Applicant Inbox** | `src/components/InboxSheet.tsx` | Host reviewing private bids, choosing workers, featuring posts, and marking tasks completed. |
| **Live Chat** | `src/components/ChatView.tsx` | Direct one-way to two-way chat simulation with interactive demo student responses. |
| **Double-Loop Reviews** | `src/components/ReviewModal.tsx` | 3-criteria star ratings for both workers and hosts + automated bot reviews. |
| **User Profile** | `src/components/ProfileView.tsx` | Bio editor, worker/host ratings, public review history, and logout. |
