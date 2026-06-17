// backend/src/routes/jobs.js — job lifecycle
// Privacy rule (PRD §3.2.C) lives HERE: the worker-facing queries only ever
// expose COUNT(bids); full bid rows are served exclusively to the host.
import { Router } from 'express';
import { q, pool } from '../db.js';
import { auth, fail } from '../middleware/auth.js';
import { botsOnNewJob, botReviewBack } from '../bots.js';

const router = Router();

/* ---------- POST /api/jobs — host posts a task (PRD §3.2.A) ---------- */
router.post('/jobs', auth, async (req, res) => {
  const { title, description, category, task_type, price_type, price_npr,
          address, scheduled_txt, lat, lng, photos } = req.body;
  if (!title || !category || !price_npr) return fail(res, 400, 'missing_fields');
  if (task_type !== 'virtual' && (lat == null || lng == null))
    return fail(res, 400, 'in_person_requires_map_pin');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [job] } = await client.query(
      `INSERT INTO jobs (host_id, title, description, category, task_type,
                         price_type, price_npr, address, scheduled_txt, geom)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,
               CASE WHEN $5::task_type='virtual' THEN NULL
                    ELSE ST_SetSRID(ST_MakePoint($10::float8,$11::float8),4326)::geography END)
       RETURNING id, title, status, created_at`,
      [req.user.uid, title.trim(), description || null, category,
       task_type === 'virtual' ? 'virtual' : 'in_person',
       price_type === 'hourly' ? 'hourly' : 'flat',
       price_npr, address || null, scheduled_txt || null, lng ?? 0, lat ?? 0]);

    const pics = Array.isArray(photos) ? photos.slice(0, 5) : [];
    for (let i = 0; i < pics.length; i++) {
      if (typeof pics[i] === 'string' && pics[i].length < 400_000)
        await client.query(
          `INSERT INTO job_photos (job_id, url, position) VALUES ($1,$2,$3)`,
          [job.id, pics[i], i + 1]);
    }
    await client.query('COMMIT');
    botsOnNewJob(job.id);                       // demo liveliness (no-op if disabled)
    res.status(201).json(job);
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally { client.release(); }
});

/* ---------- GET /api/jobs/nearby — proximity feed (PRD §3.2.B + §4.3) ---------- */
router.get('/jobs/nearby', auth, async (req, res) => {
  const lat = parseFloat(req.query.lat), lng = parseFloat(req.query.lng);
  const radiusM = Math.min(30000, parseInt(req.query.radius_m || '4000', 10));
  const category = req.query.category && req.query.category !== 'All' ? req.query.category : null;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return fail(res, 400, 'lat_lng_required');

  const { rows } = await q(
    `SELECT j.id, j.title, j.category, j.task_type, j.price_type, j.price_npr,
            j.address, j.scheduled_txt, j.is_featured, j.created_at,
            u.full_name AS host_name,
            ST_Y(j.geom::geometry) AS lat, ST_X(j.geom::geometry) AS lng,
            ST_Distance(j.geom, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) AS distance_m,
            (SELECT COUNT(*)::int FROM bids b WHERE b.job_id = j.id) AS applicant_count,
            EXISTS (SELECT 1 FROM bids b WHERE b.job_id=j.id AND b.worker_id=$5) AS i_applied
     FROM jobs j JOIN users u ON u.id = j.host_id
     WHERE j.status = 'open'
       AND j.host_id <> $5
       AND (j.task_type = 'virtual'
            OR ST_DWithin(j.geom, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3))
       AND ($4::text IS NULL OR j.category = $4)
     ORDER BY j.is_featured DESC, distance_m ASC NULLS LAST
     LIMIT 100`,
    [lng, lat, radiusM, category, req.user.uid]);
  res.json(rows);
});

/* ---------- GET /api/jobs/:id — public detail (count only, never bids) ---------- */
router.get('/jobs/:id', auth, async (req, res) => {
  const { rows: [job] } = await q(
    `SELECT j.*, u.full_name AS host_name, u.campus AS host_campus,
            ST_Y(j.geom::geometry) AS lat, ST_X(j.geom::geometry) AS lng,
            (SELECT COUNT(*)::int FROM bids b WHERE b.job_id=j.id) AS applicant_count,
            COALESCE(hr.avg_rating,0) AS host_rating, COALESCE(hr.review_count,0) AS host_reviews
     FROM jobs j
     JOIN users u ON u.id=j.host_id
     LEFT JOIN user_ratings hr ON hr.user_id=j.host_id AND hr.direction='worker_to_host'
     WHERE j.id=$1`, [req.params.id]);
  if (!job) return fail(res, 404, 'job_not_found');
  const { rows: photos } = await q(
    `SELECT url FROM job_photos WHERE job_id=$1 ORDER BY position`, [req.params.id]);
  const { rows: [mine] } = await q(
    `SELECT id, amount_npr FROM bids WHERE job_id=$1 AND worker_id=$2`,
    [req.params.id, req.user.uid]);
  delete job.geom;
  res.json({ ...job, photos: photos.map(p => p.url), my_bid: mine || null });
});

/* ---------- GET /api/jobs/:id/bids — HOST-ONLY inbox ---------- */
router.get('/jobs/:id/bids', auth, async (req, res) => {
  const { rows: [job] } = await q(`SELECT host_id FROM jobs WHERE id=$1`, [req.params.id]);
  if (!job) return fail(res, 404, 'job_not_found');
  if (job.host_id !== req.user.uid) return fail(res, 403, 'pitches_are_private_to_host');
  const { rows } = await q(
    `SELECT b.id, b.amount_npr, b.pitch, b.chat_open, b.created_at,
            u.id AS worker_id, u.full_name, u.campus,
            COALESCE(r.avg_rating,0) AS rating, COALESCE(r.review_count,0) AS review_count
     FROM bids b
     JOIN users u ON u.id = b.worker_id
     LEFT JOIN user_ratings r ON r.user_id = u.id AND r.direction = 'host_to_worker'
     WHERE b.job_id = $1
     ORDER BY b.amount_npr ASC`, [req.params.id]);
  res.json(rows);
});

/* ---------- POST /api/jobs/:id/bids — worker pitches privately ---------- */
router.post('/jobs/:id/bids', auth, async (req, res) => {
  const { amount_npr, pitch } = req.body;
  if (!amount_npr || !pitch?.trim()) return fail(res, 400, 'amount_and_pitch_required');
  const { rows: [job] } = await q(`SELECT host_id, status FROM jobs WHERE id=$1`, [req.params.id]);
  if (!job) return fail(res, 404, 'job_not_found');
  if (job.status !== 'open') return fail(res, 409, 'job_not_open');
  if (job.host_id === req.user.uid) return fail(res, 403, 'cannot_bid_own_job');
  try {
    const { rows: [bid] } = await q(
      `INSERT INTO bids (job_id, worker_id, amount_npr, pitch)
       VALUES ($1,$2,$3,$4) RETURNING id, created_at`,
      [req.params.id, req.user.uid, amount_npr, pitch.trim()]);
    res.status(201).json(bid);
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'already_pitched');
    throw e;
  }
});

/* ---------- POST /api/jobs/:id/assign ---------- */
router.post('/jobs/:id/assign', auth, async (req, res) => {
  const { bid_id } = req.body;
  const { rows: [job] } = await q(`SELECT host_id, status FROM jobs WHERE id=$1`, [req.params.id]);
  if (!job) return fail(res, 404, 'job_not_found');
  if (job.host_id !== req.user.uid) return fail(res, 403, 'only_host_can_assign');
  if (job.status !== 'open') return fail(res, 409, 'job_not_open');
  const { rowCount } = await q(
    `UPDATE jobs SET status='assigned', assigned_bid=$2
     WHERE id=$1 AND EXISTS (SELECT 1 FROM bids WHERE id=$2 AND job_id=$1)`,
    [req.params.id, bid_id]);
  if (!rowCount) return fail(res, 400, 'bid_not_on_this_job');
  // TODO Phase 3: create escrow_transactions row + Khalti SFT fund call
  res.json({ ok: true });
});

/* ---------- POST /api/jobs/:id/complete ---------- */
router.post('/jobs/:id/complete', auth, async (req, res) => {
  const { rows: [job] } = await q(`SELECT host_id, status FROM jobs WHERE id=$1`, [req.params.id]);
  if (!job) return fail(res, 404, 'job_not_found');
  if (job.host_id !== req.user.uid) return fail(res, 403, 'only_host_can_complete');
  if (job.status !== 'assigned') return fail(res, 409, 'job_not_assigned');
  await q(`UPDATE jobs SET status='done' WHERE id=$1`, [req.params.id]);
  // TODO Phase 3: Khalti escrow release → worker wallet, minus commission
  res.json({ ok: true, next: 'both_parties_review' });
});

/* ---------- POST /api/jobs/:id/feature — Phase 2 monetization ---------- */
router.post('/jobs/:id/feature', auth, async (req, res) => {
  const { rows: [job] } = await q(`SELECT host_id FROM jobs WHERE id=$1`, [req.params.id]);
  if (!job) return fail(res, 404, 'job_not_found');
  if (job.host_id !== req.user.uid) return fail(res, 403, 'only_host_can_feature');
  // Phase 1: free. Phase 2: charge NPR 50–100 before flipping the flag.
  await q(`UPDATE jobs SET is_featured=TRUE, featured_until=now()+interval '24 hours'
           WHERE id=$1`, [req.params.id]);
  res.json({ ok: true });
});

/* ---------- POST /api/jobs/:id/reviews — double loop (PRD §3.2.E) ---------- */
router.post('/jobs/:id/reviews', auth, async (req, res) => {
  const { score_a, score_b, score_c, comment } = req.body;
  for (const s of [score_a, score_b, score_c])
    if (!(s >= 1 && s <= 5)) return fail(res, 400, 'scores_must_be_1_to_5');
  const { rows: [job] } = await q(
    `SELECT j.host_id, j.status, b.worker_id
     FROM jobs j LEFT JOIN bids b ON b.id = j.assigned_bid WHERE j.id=$1`, [req.params.id]);
  if (!job) return fail(res, 404, 'job_not_found');
  if (job.status !== 'done') return fail(res, 409, 'review_opens_after_completion');
  let direction, reviewee;
  if (req.user.uid === job.host_id)        { direction = 'host_to_worker'; reviewee = job.worker_id; }
  else if (req.user.uid === job.worker_id) { direction = 'worker_to_host'; reviewee = job.host_id; }
  else return fail(res, 403, 'not_a_participant');
  try {
    const { rows: [rv] } = await q(
      `INSERT INTO reviews (job_id, direction, reviewer_id, reviewee_id,
                            score_a, score_b, score_c, comment)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.params.id, direction, req.user.uid, reviewee,
       score_a, score_b, score_c, comment?.trim() || null]);
    if (direction === 'host_to_worker') botReviewBack(req.params.id); // bots close the loop
    res.status(201).json(rv);
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'already_reviewed');
    throw e;
  }
});

/* ---------- POST /api/jobs/:id/disputes — Phase 3 arbitration intake ---------- */
router.post('/jobs/:id/disputes', auth, async (req, res) => {
  const { description } = req.body;
  if (!description?.trim()) return fail(res, 400, 'description_required');
  const { rows: [d] } = await q(
    `INSERT INTO disputes (job_id, raised_by, description)
     VALUES ($1,$2,$3) RETURNING id, created_at`,
    [req.params.id, req.user.uid, description.trim()]);
  res.status(201).json(d);
});

/* ---------- GET /api/me/jobs — host dashboard ---------- */
router.get('/me/jobs', auth, async (req, res) => {
  const { rows } = await q(
    `SELECT j.id, j.title, j.category, j.task_type, j.price_type, j.price_npr,
            j.status, j.is_featured, j.created_at, j.scheduled_txt,
            (SELECT COUNT(*)::int FROM bids b WHERE b.job_id=j.id) AS applicant_count,
            w.full_name AS assigned_name,
            (j.status='done' AND NOT EXISTS (SELECT 1 FROM reviews r
              WHERE r.job_id=j.id AND r.direction='host_to_worker')) AS needs_my_review
     FROM jobs j
     LEFT JOIN bids ab ON ab.id = j.assigned_bid
     LEFT JOIN users w ON w.id = ab.worker_id
     WHERE j.host_id = $1
     ORDER BY j.created_at DESC`, [req.user.uid]);
  res.json(rows);
});

export default router;
