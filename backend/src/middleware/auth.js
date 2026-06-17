// backend/src/middleware/auth.js — JWT bearer auth
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export const sign = (user) =>
  jwt.sign({ uid: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });

export function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'auth_required' });
  }
}

export const fail = (res, code, msg) => res.status(code).json({ error: msg });
