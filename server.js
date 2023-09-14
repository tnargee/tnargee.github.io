const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const axios = require('axios');

const app = express();

// Set up session middleware
app.use(
    session({
      secret: 'niznet',
      resave: true,
      saveUninitialized: true,
    })
);

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Configure Spotify Strategy
passport.use(
    new SpotifyStrategy(
        {
          clientID: '41a996f2c5d04c37b2f15e6c094984ba',
          clientSecret: '358ccfbacad847c4850916078a70ded5',
          callbackURL: 'https://tnargee.github.io/callback', // Update with your GitHub Pages URL
        },
        (accessToken, refreshToken, expires_in, profile, done) => {
          // Store user data in session
          const user = { accessToken, refreshToken };
          return done(null, user);
        }
    )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Create a route for initiating Spotify authentication
app.get('/auth/spotify', passport.authenticate('spotify'));

// Create a route for the Spotify callback
app.get(
    '/callback',
    passport.authenticate('spotify', {
      successRedirect: '/',
      failureRedirect: '/login',
    })
);

// Create a middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/spotify');
}

// Create a route for the home page
app.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });

    const topArtists = response.data.items.slice(0, 10).map((artist) => artist.name);

    // Render the home page with top artists
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MyTunes</title>
      </head>
      <body>
        <h1>MyTunes - Top 10 Artists</h1>
        <ul>
          ${topArtists.map((artist) => `<li>${artist}</li>`).join('')}
        </ul>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching top artists.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
