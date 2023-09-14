const express = require('express');
const axios = require('axios');
const session = require('express-session');
const app = express();

// Set up session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true,
}));

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Spotify API credentials
const client_id = '41a996f2c5d04c37b2f15e6c094984ba';
const client_secret = '358ccfbacad847c4850916078a70ded5';
const redirect_uri = 'http://localhost:3000/callback'; // Update with your actual redirect URI

// Spotify API endpoints
const authorizeURL = 'https://accounts.spotify.com/authorize';
const tokenURL = 'https://accounts.spotify.com/api/token';
const userTopArtistsURL = 'https://api.spotify.com/v1/me/top/artists';

// Set up the initial route to start the authentication process
app.get('/login', (req, res) => {
  const scope = 'user-top-read';
  res.redirect(`${authorizeURL}?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&response_type=code`);
});

// Callback route for handling Spotify's response
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange the code for an access token
    const response = await axios.post(tokenURL, {
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id,
      client_secret,
    });

    // Store the access token in the session
    req.session.accessToken = response.data.access_token;

    // Redirect to the dashboard page
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error exchanging code for access token:', error.message);
    res.redirect('/error');
  }
});

// Example route to fetch user's top artists
app.get('/top-artists', async (req, res) => {
  const accessToken = req.session.accessToken;

  try {
    const response = await axios.get(userTopArtistsURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Extract the top artists' names from the response (assuming they are in the 'name' field)
    const topArtists = response.data.items.slice(0, 10).map(artist => artist.name);

    res.json(topArtists);
  } catch (error) {
    console.error('Error fetching top artists:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});