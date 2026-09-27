import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './passport.js';
import { comparePassword, createUser, findUserByEmail, findUserById, hashPassword, getUserRepos, saveRepo } from './db.js';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  if (password.length < 8) return res.status(400).json({ message: 'Password too short' });
  if (findUserByEmail(email)) return res.status(409).json({ message: 'Email exists' });
  
  const user = createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    provider: 'local'
  });
  
  req.login(user, (err) => {
    if (err) return res.status(500).json({ message: 'Login failed' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, provider: user.provider } });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
  
  const user = findUserByEmail(email);
  if (!user || !user.password_hash) return res.status(401).json({ message: 'Invalid credentials' });
  if (!comparePassword(password, user.password_hash)) return res.status(401).json({ message: 'Invalid credentials' });
  
  req.login(user, (err) => {
    if (err) return res.status(500).json({ message: 'Login failed' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, provider: user.provider } });
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not auth' });
  const user = findUserById(req.user.id);
  if (!user) return res.status(401).json({ message: 'Not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, provider: user.provider } });
});

// GitHub OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect(FRONTEND + '/dashboard');
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.redirect(FRONTEND + '/dashboard');
});

// GitHub repos
app.get('/api/repos/search', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not auth' });
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Query required' });
  
  try {
    const resp = await axios.get(`https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=10`, {
      headers: { 'User-Agent': 'HexaSigil' }
    });
    res.json({ repos: resp.data.items || [] });
  } catch (e) {
    res.status(500).json({ message: 'Search failed' });
  }
});

app.post('/api/repos/save', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not auth' });
  const { repoName, repoUrl, repoOwner } = req.body || {};
  if (!repoName || !repoUrl) return res.status(400).json({ message: 'Missing fields' });
  
  saveRepo(req.user.id, repoName, repoUrl, repoOwner);
  res.json({ message: 'Saved' });
});

app.get('/api/repos/saved', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not auth' });
  const repos = getUserRepos(req.user.id);
  res.json({ repos });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
