// backend/src/routes/users.js — profiles & the signed-in user
import { Router } from 'express';
import { q } from '../db.js';
import { auth, fail } from '../middleware/auth.js';

const router = Router();

/* current user */
router.get('/me', auth, async (req, res) => {
  const { rows: [user] } = await q(
    `SELECT id, phone, full_name, campus, bio, created_at FROM users WHERE id=$1`,
    [req.user.uid]);
  if (!user) return fail(res, 404, 'user_not_found');
  res.json(user);
});

router.patch('/me', auth, async (req, res) => {
  const { bio, campus } = req.body;
  const { rows: [user] } = await q(
    `UPDATE users SET bio=COALESCE($2,bio), campus=COALESCE($3,campus)
     WHERE id=$1 RETURNING id, full_name, campus, bio`,
    [req.user.uid, bio ?? null, campus ?? null]);
  res.json(user);
});

/* public profile + lifetime double-loop scores (PRD §3.2.E) */
router.get('/users/:id/profile', auth, async (req, res) => {
  const { rows: [user] } = await q(
    `SELECT id, full_name, campus, bio, created_at FROM users WHERE id=$1`,
    [req.params.id]);
  if (!user) return fail(res, 404, 'user_not_found');
  const { rows: ratings } = await q(
    `SELECT direction, avg_rating, review_count FROM user_ratings WHERE user_id=$1`,
    [req.params.id]);
  const { rows: reviews } = await q(
    `SELECT r.direction, r.score_a, r.score_b, r.score_c, r.comment, r.created_at,
            u.full_name AS reviewer_name, j.title AS job_title
     FROM reviews r
     JOIN users u ON u.id=r.reviewer_id
     JOIN jobs j  ON j.id=r.job_id
     WHERE r.reviewee_id=$1
     ORDER BY r.created_at DESC LIMIT 50`, [req.params.id]);
  res.json({ user, ratings, reviews });
});

export default router;
