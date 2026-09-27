import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { createUser, findUserByEmail, findUserByGithubId, findUserByGoogleId, findUserById, updateUser } from './db.js';

const gc = process.env.GOOGLE_CLIENT_ID;
const gs = process.env.GOOGLE_CLIENT_SECRET;
const ghc = process.env.GITHUB_CLIENT_ID;
const ghs = process.env.GITHUB_CLIENT_SECRET;

passport.serializeUser((u, d) => d(null, u.id));
passport.deserializeUser((id, d) => d(null, findUserById(id)));

if (gc && gs) {
  passport.use(new GoogleStrategy({
    clientID: gc,
    clientSecret: gs,
    callbackURL: '/auth/google/callback'
  }, (_, __, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('No email'));
      
      let user = findUserByEmail(email);
      if (user) {
        if (!user.google_id) updateUser(user.id, { google_id: profile.id });
        return done(null, user);
      }
      
      const guser = findUserByGoogleId(profile.id);
      if (guser) return done(null, guser);
      
      const newUser = createUser({
        name: profile.displayName || 'User',
        email,
        passwordHash: null,
        provider: 'google',
        googleId: profile.id
      });
      return done(null, newUser);
    } catch (e) {
      return done(e);
    }
  }));
}

if (ghc && ghs) {
  passport.use(new GitHubStrategy({
    clientID: ghc,
    clientSecret: ghs,
    callbackURL: '/auth/github/callback'
  }, (accessToken, _, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
      
      let user = findUserByEmail(email);
      if (user) {
        if (!user.github_id) updateUser(user.id, { github_id: profile.id, github_token: accessToken });
        return done(null, user);
      }
      
      const guser = findUserByGithubId(profile.id);
      if (guser) return done(null, guser);
      
      const newUser = createUser({
        name: profile.displayName || profile.username || 'User',
        email,
        passwordHash: null,
        provider: 'github',
        githubId: profile.id,
        githubToken: accessToken
      });
      return done(null, newUser);
    } catch (e) {
      return done(e);
    }
  }));
}

export default passport;
