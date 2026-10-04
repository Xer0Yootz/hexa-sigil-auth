# Portable backend already in this repo

`server/` is the older self-hosted auth from main. It is useful while Base44 is out of credits.

Keep:
- Email signup and login with session cookies
- Google and GitHub OAuth via Passport
- `/api/auth/me` and logout
- BitChat status toggle against an external API (`BITCHAT_BASE_URL`, `BITCHAT_API_KEY`)

Do not treat that BitChat toggle as Hexa's chat. The Base44 dashboard chat is the lore thread. This server only knows connected / not connected.

Run: `cd server && npm install && npm start` on port 4000. Frontend expects `VITE_API_URL=http://localhost:4000` if you wire the old client.
