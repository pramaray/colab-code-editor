// server/config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ oauthId: profile.id, provider: "google" });
  if (!user) {
    user = await User.create({
      oauthId: profile.id,
      provider: "google",
      username: profile.displayName,
    });
  }
  return done(null, user);
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback",
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ oauthId: profile.id, provider: "github" });
  if (!user) {
    user = await User.create({
      oauthId: profile.id,
      provider: "github",
      username: profile.username,
    });
  }
  return done(null, user);
}));
