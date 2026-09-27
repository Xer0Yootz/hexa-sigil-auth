import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './passport.js';
import { comparePassword, createUser, findUserByEmail, findUserById, hashPassword } from './db.js';
import { getBitChatStatus, toggleBitChat } from './bitchat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Server is healthy' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const newUser = createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    provider: 'local'
  });

  req.login(newUser, (loginError) => {
    if (loginError) {
      return res.status(500).json({ message: 'Unable to log in after signup.' });
    }

    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        provider: newUser.provider
      }
    });
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, rememberMe } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = findUserByEmail(email);
  if (!user || !user.password_hash) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const validPassword = comparePassword(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  req.login(user, (loginError) => {
    if (loginError) {
      return res.status(500).json({ message: 'Unable to log in.' });
    }

    if (rememberMe) {
      res.cookie('remember_session', 'true', {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: 'lax'
      });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider
      }
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.clearCookie('remember_session');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = findUserById(req.user.id);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider
    }
  });
});

app.get('/api/bitchat/status', async (req, res) => {
  const status = await getBitChatStatus();
  res.json(status);
});

app.post('/api/bitchat/connect', async (req, res) => {
  const { enabled } = req.body || {};
  const status = await toggleBitChat(Boolean(enabled));
  res.json({ status });
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/?oauth=failed` }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/?oauth=failed` }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
