// backend/src/routes/auth.js — phone + OTP authentication
// Dev mode: the OTP is returned in the response (and printed to the console)
// so you can run locally with no SMS provider. In production, plug in
// Sparrow SMS / Aakash SMS and store codes in Redis with a TTL.
import { Router } from 'express';
import { q } from '../db.js';
import { sign, fail } from '../middleware/auth.js';

const router = Router();
const otps = new Map(); // phone -> { code, exp }   (Redis in production)
const isProd = process.env.NODE_ENV === 'production';

router.post('/otp/send', (req, res) => {
  const { phone } = req.body;
  if (!/^9[78]\d{8}$/.test(phone || '')) return fail(res, 400, 'invalid_phone');
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otps.set(phone, { code, exp: Date.now() + 5 * 60_000 });
  console.log(`[OTP] ${phone} -> ${code}`);
  // TODO production: send via Sparrow SMS, do NOT return the code
  res.json({ ok: true, ...(isProd ? {} : { dev_code: code }) });
});

router.post('/otp/verify', async (req, res) => {
  const { phone, code, full_name, campus } = req.body;
  const rec = otps.get(phone);
  if (!rec || rec.exp < Date.now() || rec.code !== code)
    return fail(res, 400, 'invalid_otp');
  otps.delete(phone);

  let { rows: [user] } = await q('SELECT * FROM users WHERE phone=$1', [phone]);
  if (!user) {
    if (!full_name || full_name.trim().length < 3)
      return fail(res, 400, 'name_required_for_signup');
    ({ rows: [user] } = await q(
      `INSERT INTO users (phone, full_name, campus)
       VALUES ($1,$2,$3) RETURNING *`,
      [phone, full_name.trim(), campus?.trim() || null]));
  }
  res.json({ token: sign(user), user });
});

export default router;
