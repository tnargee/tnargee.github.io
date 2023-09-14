// auth.js

const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const session = require('express-session');

const router = express.Router();

// Initialize Passport
passport.use(
    new SpotifyStrategy(
        {
            clientID: 'YOUR_CLIENT_ID',
            clientSecret: 'YOUR_CLIENT_SECRET',
            callbackURL: 'http://localhost:3000/callback', // Update with your redirect URI
        },
        (accessToken, refreshToken, expires_in, profile, done) => {
            // You can save user data in the session or database here
            // Example: req.session.user = { id: profile.id, ... };
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => {
    // Serialize the user profile to store in the session
    done(null, user);
});

passport.deserializeUser((user, done) => {
    // Deserialize the user from the session
    done(null, user);
});

// Set up session middleware
router.use(
    session({
        secret: 'your_secret_key',
        resave: true,
        saveUninitialized: true,
    })
);

// Initialize Passport and restore authentication state, if any, from the session
router.use(passport.initialize());
router.use(passport.session());

// Authentication route - initiate Spotify login
router.get('/login', passport.authenticate('spotify'));

// Callback route - handle the Spotify callback
router.get(
    '/callback',
    passport.authenticate('spotify', {
        successRedirect: '/', // Redirect to the home page after successful login
        failureRedirect: '/login', // Redirect to the login page if authentication fails
    })
);

// Logout route
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
