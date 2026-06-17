// backend/src/bots.js — demo liveliness service
// The seeded "students" (users.is_bot = TRUE) animate the marketplace so a
// single developer can rehearse the entire hire loop locally.
// Disable with DEMO_BOTS=false in .env — production should run with bots off.
import { q } from './db.js';

const enabled = () => (process.env.DEMO_BOTS ?? 'true') !== 'false';

const PITCHES = [
  (n) => `Namaste! I study nearby and I'm free at your scheduled time — happy to help. Please check my reviews. 🙏`,
  (n) => `I've completed ${n} similar gigs on Halka Kaam. I can bring my own tools/transport if needed and I'm very punctual.`,
  ( ) => `I live within your area and can start exactly on time. Bidding fairly — quality work, no shortcuts.`,
];
const REPLIES = [
  'Sounds good! I can be there right on time. 👍',
  'No problem at all — see you then! 🙏',
  'Yes, I have done this kind of task before. Happy to help.',
  'Perfect, noted. I will keep everything ready.',
];

/* a few seeded students discover a freshly posted job */
export function botsOnNewJob(jobId) {
  if (!enabled()) return;
  [3000, 7500, 12000].forEach((delay, k) => setTimeout(async () => {
    try {
      const { rows: [job] } = await q(
        `SELECT id, host_id, price_npr, status FROM jobs WHERE id=$1`, [jobId]);
      if (!job || job.status !== 'open') return;
      const { rows: [bot] } = await q(
        `SELECT u.id, COALESCE(r.review_count,0) AS done
         FROM users u
         LEFT JOIN user_ratings r ON r.user_id=u.id AND r.direction='host_to_worker'
         WHERE u.is_bot AND u.id <> $1
           AND NOT EXISTS (SELECT 1 FROM bids b WHERE b.job_id=$2 AND b.worker_id=u.id)
         ORDER BY random() LIMIT 1`, [job.host_id, jobId]);
      if (!bot) return;
      const amount = Math.max(50, Math.round(job.price_npr * (0.85 + Math.random() * 0.25) / 10) * 10);
      await q(`INSERT INTO bids (job_id, worker_id, amount_npr, pitch)
               VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
              [jobId, bot.id, amount, PITCHES[k % PITCHES.length](bot.done || 5)]);
    } catch (e) { console.warn('[bots] bid failed:', e.message); }
  }, delay));
}

/* bot worker greets when the host opens the discussion */
export function botGreetOnInitiate(bidId, workerId) {
  if (!enabled()) return;
  setTimeout(async () => {
    try {
      const { rows: [w] } = await q(`SELECT is_bot FROM users WHERE id=$1`, [workerId]);
      if (!w?.is_bot) return;
      await q(`INSERT INTO messages (bid_id, sender_id, body) VALUES ($1,$2,$3)`,
        [bidId, workerId, 'Namaste! Thank you for opening a discussion 🙏 Happy to answer anything about my pitch.']);
    } catch (e) { console.warn('[bots] greet failed:', e.message); }
  }, 1200);
}

/* bot worker replies when the host messages */
export function botReplyOnMessage(bidId, workerId) {
  if (!enabled()) return;
  setTimeout(async () => {
    try {
      const { rows: [w] } = await q(`SELECT is_bot FROM users WHERE id=$1`, [workerId]);
      if (!w?.is_bot) return;
      await q(`INSERT INTO messages (bid_id, sender_id, body) VALUES ($1,$2,$3)`,
        [bidId, workerId, REPLIES[Math.floor(Math.random() * REPLIES.length)]]);
    } catch (e) { console.warn('[bots] reply failed:', e.message); }
  }, 1500);
}

/* after the host reviews a bot worker, the bot reviews the host back */
export function botReviewBack(jobId) {
  if (!enabled()) return;
  setTimeout(async () => {
    try {
      const { rows: [ctx] } = await q(
        `SELECT j.host_id, b.worker_id, u.is_bot
         FROM jobs j JOIN bids b ON b.id=j.assigned_bid JOIN users u ON u.id=b.worker_id
         WHERE j.id=$1`, [jobId]);
      if (!ctx?.is_bot) return;
      const s = 4 + Math.round(Math.random());
      await q(`INSERT INTO reviews (job_id, direction, reviewer_id, reviewee_id,
                                    score_a, score_b, score_c, comment)
               VALUES ($1,'worker_to_host',$2,$3,$4,5,$4,
                       'Clear instructions and friendly host. Paid as agreed — would gladly work for them again. 🙏')
               ON CONFLICT DO NOTHING`,
              [jobId, ctx.worker_id, ctx.host_id, s]);
    } catch (e) { console.warn('[bots] review failed:', e.message); }
  }, 4000);
}
