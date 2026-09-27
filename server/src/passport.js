import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserByGithubId,
  findUserById,
  updateUserById
} from './db.js';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = findUserById(id);
  done(null, user);
});

if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: '/auth/google/callback',
        scope: ['profile', 'email']
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || 'Google User';

          if (!email) {
            return done(new Error('Google account has no email address.'));
          }

          let user = findUserByEmail(email);

          if (user) {
            if (!user.google_id) {
              user = updateUserById(user.id, {
                google_id: profile.id,
                provider: 'google'
              });
            }
            return done(null, user);
          }

          const existingGoogleUser = findUserByGoogleId(profile.id);
          if (existingGoogleUser) return done(null, existingGoogleUser);

          const newUser = createUser({
            name,
            email,
            passwordHash: null,
            provider: 'google',
            googleId: profile.id,
            githubId: null
          });

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.');
}

if (githubClientId && githubClientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: githubClientId,
        clientSecret: githubClientSecret,
        callbackURL: '/auth/github/callback',
        scope: ['user:email']
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
          const name = profile.displayName || profile.username || 'GitHub User';

          let user = findUserByEmail(email);

          if (user) {
            if (!user.github_id) {
              user = updateUserById(user.id, {
                github_id: profile.id,
                provider: 'github'
              });
            }
            return done(null, user);
          }

          const existingGithubUser = findUserByGithubId(profile.id);
          if (existingGithubUser) return done(null, existingGithubUser);

          const newUser = createUser({
            name,
            email,
            passwordHash: null,
            provider: 'github',
            googleId: null,
            githubId: profile.id
          });

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
} else {
  console.warn('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable it.');
}

export default passport;
