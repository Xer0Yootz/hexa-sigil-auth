# Hexa Sigil Auth

A full-stack authentication project with a neon cyberpunk aesthetic, local email/password auth, OAuth support, optional BitChat integration, and a React dashboard.

## Stack

- Frontend: React + Vite
- Backend: Express + SQLite + Passport
- Auth: local email/password + Google/GitHub OAuth
- Session handling: secure cookies
- Optional integration: BitChat API service layer

## Features

- Signup and login with email/password
- Remember me checkbox
- Google OAuth
- GitHub OAuth
- Protected dashboard
- Optional BitChat toggle panel
- Neon cyberpunk dashboard aesthetic

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Then open:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Important

This app includes an optional BitChat integration layer. It will work when you add a valid BitChat API endpoint and key in the environment variables. Without those, the BitChat feature remains disabled but the rest of the auth app works.

## OAuth setup

### Google
- Create a Google OAuth app
- Set these variables in `.env`:
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
- Callback URL: http://localhost:4000/auth/google/callback

### GitHub
- Create a GitHub OAuth app
- Set these variables in `.env`:
  - GITHUB_CLIENT_ID
  - GITHUB_CLIENT_SECRET
- Callback URL: http://localhost:4000/auth/github/callback

### BitChat (optional)
Add these variables if you have a BitChat API endpoint:
- BITCHAT_BASE_URL
- BITCHAT_API_KEY

## Notes

- Passwords are hashed with bcrypt.
- Session cookies use secure-ish settings for local development.
- This is a front-end sample for a real app; in production use HTTPS and a production database.
