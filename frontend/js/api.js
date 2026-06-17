/* =========================================================================
   HALKA KAAM · API client (OPTIONAL)
   -------------------------------------------------------------------------
   By default the frontend runs in DEMO MODE using localStorage (see
   01-core.js). When you're ready to use the real backend:

     1. Start the backend (see ../backend/README or root README).
     2. In index.html, uncomment:
            <script>window.HK_API_BASE = "http://localhost:4000";</script>
     3. Load this file AFTER 01-core.js and replace the DB.get/DB.set bodies,
        OR call these helpers directly from the view modules.

   This file is a thin, typed wrapper around the REST endpoints defined in
   ../backend/src/routes. It is intentionally NOT wired in yet so the app
   keeps working with zero setup — flip it on when your DB is running.
   ========================================================================= */

const API = {
  base: (typeof window !== 'undefined' && window.HK_API_BASE) || '',
  token: (typeof localStorage !== 'undefined' && localStorage.getItem('hk-token')) || null,

  setToken(t) { this.token = t; try { localStorage.setItem('hk-token', t); } catch (e) {} },
  clearToken() { this.token = null; try { localStorage.removeItem('hk-token'); } catch (e) {} },

  async req(method, path, body) {
    const res = await fetch(this.base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: 'Bearer ' + this.token } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status, data });
    return data;
  },

  /* ---- auth ---- */
  sendOtp(phone)                         { return this.req('POST', '/auth/otp/send', { phone }); },
  verifyOtp(phone, code, full_name, campus) {
    return this.req('POST', '/auth/otp/verify', { phone, code, full_name, campus })
      .then(r => { if (r.token) this.setToken(r.token); return r; });
  },

  /* ---- jobs ---- */
  postJob(job)                           { return this.req('POST', '/jobs', job); },
  nearbyJobs({ lat, lng, radius_m, category }) {
    const qs = new URLSearchParams({ lat, lng, radius_m, ...(category ? { category } : {}) });
    return this.req('GET', '/jobs/nearby?' + qs.toString());
  },

  /* ---- bids (the anti-copycat engine: list is host-only on the server) ---- */
  pitch(jobId, amount_npr, pitch)        { return this.req('POST', `/jobs/${jobId}/bids`, { amount_npr, pitch }); },
  inbox(jobId)                           { return this.req('GET', `/jobs/${jobId}/bids`); },

  /* ---- one-way chat ---- */
  initiateChat(bidId)                    { return this.req('POST', `/bids/${bidId}/initiate-chat`); },
  sendMessage(bidId, body)               { return this.req('POST', `/bids/${bidId}/messages`, { body }); },
  getMessages(bidId)                     { return this.req('GET', `/bids/${bidId}/messages`); },

  /* ---- assign / complete / review ---- */
  assign(jobId, bid_id)                  { return this.req('POST', `/jobs/${jobId}/assign`, { bid_id }); },
  complete(jobId)                        { return this.req('POST', `/jobs/${jobId}/complete`); },
  review(jobId, r)                       { return this.req('POST', `/jobs/${jobId}/reviews`, r); },
  profile(userId)                        { return this.req('GET', `/users/${userId}/profile`); },
};

if (typeof window !== 'undefined') window.API = API;
