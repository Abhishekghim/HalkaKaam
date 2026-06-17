// backend/src/db.js — single shared PostgreSQL pool
import pg from 'pg';
import 'dotenv/config';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgres://hk:hk_dev_password@localhost:5432/halka_kaam',
});

export const q = (text, params) => pool.query(text, params);
