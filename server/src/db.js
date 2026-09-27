import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'users.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    provider TEXT NOT NULL DEFAULT 'local',
    google_id TEXT,
    github_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const row = db.prepare(`SELECT * FROM users WHERE email = ?`).get(normalized);
  return row || null;
}

export function findUserById(id) {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) || null;
}

export function findUserByGoogleId(googleId) {
  return db.prepare(`SELECT * FROM users WHERE google_id = ?`).get(googleId) || null;
}

export function findUserByGithubId(githubId) {
  return db.prepare(`SELECT * FROM users WHERE github_id = ?`).get(githubId) || null;
}

export function createUser({ name, email, passwordHash, provider = 'local', googleId = null, githubId = null }) {
  const userId = cryptoRandomId();
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, provider, google_id, github_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(userId, name, email.trim().toLowerCase(), passwordHash, provider, googleId, githubId);

  return findUserById(userId);
}

export function updateUserById(id, updates) {
  const fields = [];
  const values = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (!fields.length) return findUserById(id);

  values.push(id);
  db.prepare(`UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  return findUserById(id);
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function cryptoRandomId() {
  return `user_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`;
}

export default db;
