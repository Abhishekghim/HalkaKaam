// backend/src/server.js — entrypoint
// Serves the REST API at /api/* and the web client from ../frontend
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import bidRoutes from './routes/bids.js';
import userRoutes from './routes/users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '4mb' })); // job photos arrive as compressed data-URLs in dev

// ---- API ----
app.use('/api/auth', authRoutes);
app.use('/api', jobRoutes);   // /api/jobs..., /api/me/jobs
app.use('/api', bidRoutes);   // /api/bids...
app.use('/api', userRoutes);  // /api/users/:id/profile, /api/me

// ---- web client ----
app.use(express.static(path.join(__dirname, '../../frontend')));

// ---- error guard ----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`हल्का काम — API + web client on http://localhost:${PORT}`));
