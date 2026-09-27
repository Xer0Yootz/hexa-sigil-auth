import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'app.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    provider TEXT DEFAULT 'local',
    google_id TEXT,
    github_id TEXT,
    github_token TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS repos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    repo_name TEXT,
    repo_url TEXT,
    repo_owner TEXT,
    saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) || null;
}

export function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
}

export function createUser({ name, email, passwordHash, provider, googleId, githubId, githubToken }) {
  const id = `user_${Date.now()}`;
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, provider, google_id, github_id, github_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, email.toLowerCase(), passwordHash, provider, googleId, githubId, githubToken);
  return findUserById(id);
}

export function updateUser(id, data) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  db.prepare(`UPDATE users SET ${fields} WHERE id = ?`).run(...values);
  return findUserById(id);
}

export function hashPassword(pwd) {
  return bcrypt.hashSync(pwd, 10);
}

export function comparePassword(pwd, hash) {
  return bcrypt.compareSync(pwd, hash);
}

export function findUserByGithubId(id) {
  return db.prepare('SELECT * FROM users WHERE github_id = ?').get(id) || null;
}

export function findUserByGoogleId(id) {
  return db.prepare('SELECT * FROM users WHERE google_id = ?').get(id) || null;
}

export function saveRepo(userId, repoName, repoUrl, repoOwner) {
  const id = `repo_${Date.now()}`;
  db.prepare(`
    INSERT INTO repos (id, user_id, repo_name, repo_url, repo_owner)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, userId, repoName, repoUrl, repoOwner);
}

export function getUserRepos(userId) {
  return db.prepare('SELECT * FROM repos WHERE user_id = ? ORDER BY saved_at DESC').all(userId);
}

export default db;
