async function fetchTopArtists() {
    try {
        const response = await fetch('/top-artists'); // Assuming this is the server endpoint you'll create
        const data = await response.json();

        // Assuming the response from the server is an array of artist names
        const topArtists = data.map((artist, index) => `${index + 1}. ${artist}`);

        // Display the top artists in the HTML widget
        const topArtistsWidget = document.getElementById('top-artists-widget');
        topArtistsWidget.innerHTML = `<h2>Top 10 Artists</h2><ul>${topArtists.map(artist => `<li>${artist}</li>`).join('')}</ul>`;
    } catch (error) {
        console.error('Error fetching top artists:', error);
    }
}

// Call the function to fetch and display top 10 artists when the page loads
window.onload = fetchTopArtists;