// backend/src/routes/bids.js — chat & the worker's pitch dashboard
// One-way rule (PRD §3.2.D): the API checks it, and the database trigger
// (trg_one_way_chat) is the final guard even against a hacked client.
import { Router } from 'express';
import { q } from '../db.js';
import { auth, fail } from '../middleware/auth.js';
import { botGreetOnInitiate, botReplyOnMessage } from '../bots.js';

const router = Router();

/* ---------- GET /api/me/bids — worker dashboard ---------- */
router.get('/me/bids', auth, async (req, res) => {
  const { rows } = await q(
    `SELECT b.id AS bid_id, b.amount_npr, b.chat_open, b.created_at,
            j.id AS job_id, j.title, j.status AS job_status, j.assigned_bid,
            h.full_name AS host_name,
            (j.assigned_bid = b.id) AS i_won,
            (j.assigned_bid IS NOT NULL AND j.assigned_bid <> b.id) AS chat_locked,
            (j.status='done' AND j.assigned_bid=b.id AND NOT EXISTS
              (SELECT 1 FROM reviews r WHERE r.job_id=j.id AND r.direction='worker_to_host')
            ) AS needs_my_review
     FROM bids b
     JOIN jobs j ON j.id = b.job_id
     JOIN users h ON h.id = j.host_id
     WHERE b.worker_id = $1
     ORDER BY b.created_at DESC`, [req.user.uid]);
  res.json(rows);
});

/* ---------- POST /api/bids/:id/initiate-chat — host opens the door ---------- */
router.post('/bids/:id/initiate-chat', auth, async (req, res) => {
  const { rows: [row] } = await q(
    `SELECT b.id, b.chat_open, b.worker_id, j.host_id
     FROM bids b JOIN jobs j ON j.id=b.job_id WHERE b.id=$1`, [req.params.id]);
  if (!row) return fail(res, 404, 'bid_not_found');
  if (row.host_id !== req.user.uid) return fail(res, 403, 'only_host_can_initiate');
  if (!row.chat_open) {
    await q(`UPDATE bids SET chat_open = TRUE WHERE id=$1`, [req.params.id]);
    botGreetOnInitiate(req.params.id, row.worker_id);
    // TODO: push notification to worker — "Host started a discussion"
  }
  res.json({ ok: true });
});

/* ---------- GET /api/bids/:id/thread — chat context + messages ---------- */
router.get('/bids/:id/thread', auth, async (req, res) => {
  const { rows: [ctx] } = await q(
    `SELECT b.id, b.amount_npr, b.chat_open, b.worker_id, j.id AS job_id,
            j.title, j.host_id, j.assigned_bid, j.status AS job_status,
            hw.full_name AS host_name, ww.full_name AS worker_name
     FROM bids b
     JOIN jobs j  ON j.id = b.job_id
     JOIN users hw ON hw.id = j.host_id
     JOIN users ww ON ww.id = b.worker_id
     WHERE b.id=$1`, [req.params.id]);
  if (!ctx) return fail(res, 404, 'bid_not_found');
  const isHost = ctx.host_id === req.user.uid;
  const isWorker = ctx.worker_id === req.user.uid;
  if (!isHost && !isWorker) return fail(res, 403, 'not_a_participant');
  if (isWorker && !ctx.chat_open) return fail(res, 423, 'host_must_initiate_first');
  const { rows: messages } = await q(
    `SELECT id, sender_id, body, created_at
     FROM messages WHERE bid_id=$1 ORDER BY created_at ASC`, [req.params.id]);
  res.json({
    bid_id: ctx.id, job_id: ctx.job_id, job_title: ctx.title,
    amount_npr: ctx.amount_npr, job_status: ctx.job_status,
    peer_name: isHost ? ctx.worker_name : ctx.host_name,
    i_am: isHost ? 'host' : 'worker',
    locked: !!(ctx.assigned_bid && ctx.assigned_bid !== ctx.id),
    messages,
  });
});

/* ---------- POST /api/bids/:id/messages ---------- */
router.post('/bids/:id/messages', auth, async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return fail(res, 400, 'empty_message');
  const { rows: [ctx] } = await q(
    `SELECT b.id, b.worker_id, j.host_id, j.assigned_bid
     FROM bids b JOIN jobs j ON j.id=b.job_id WHERE b.id=$1`, [req.params.id]);
  if (!ctx) return fail(res, 404, 'bid_not_found');
  if (![ctx.worker_id, ctx.host_id].includes(req.user.uid))
    return fail(res, 403, 'not_a_participant');
  if (ctx.assigned_bid && ctx.assigned_bid !== ctx.id)
    return fail(res, 423, 'chat_locked_worker_not_selected');
  try {
    const { rows: [msg] } = await q(
      `INSERT INTO messages (bid_id, sender_id, body)
       VALUES ($1,$2,$3) RETURNING id, sender_id, body, created_at`,
      [req.params.id, req.user.uid, body.trim()]);
    if (req.user.uid === ctx.host_id) botReplyOnMessage(req.params.id, ctx.worker_id);
    res.status(201).json(msg);
  } catch (e) {
    if (String(e.message).includes('HK_CHAT_LOCKED'))
      return fail(res, 423, 'host_must_initiate_first');
    throw e;
  }
});

export default router;
