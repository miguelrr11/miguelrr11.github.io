// main.js

const clientId = 'f46b7b60021f4c3cb8f231289e5a36d4';
const redirectUri = 'http://127.0.0.1:8080';
let accessToken = '';
let lyricsArray = null;

// Elements
const loginButton = document.getElementById('loginButton');
const lyricsContainer = document.getElementById('lyricsContainer');

// Spotify Login Function
loginButton.addEventListener('click', () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-read-playback-state`;
    window.location.href = authUrl;
});

// Extract Access Token from URL
function getAccessTokenFromUrl() {
    const hash = window.location.hash;
    if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        return params.get('access_token');
    }
    return null;
}

// Get Currently Playing Track
async function getCurrentlyPlayingTrack() {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (response.ok) {
        const data = await response.json();
        return {
            track: data.item,
            progress_ms: data.progress_ms
        };
    } else {
        console.error('Failed to fetch currently playing track');
    }
}

// Fetch Lyrics from Proxy Server
async function fetchLyrics(artist, track) {
    // Remove extra information like "- Remaster" or "(Live)" from the track name
    const cleanedTrack = track.replace(/ *\([^)]*\) */g, "").replace(/ *- [^)]*$/g, "");

    const response = await fetch(`http://127.0.0.1:3000/api/lyrics?q=${encodeURIComponent(cleanedTrack)}`);
    if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        } else {
            console.error('No lyrics found in the response');
        }
    } else {
        console.error('Failed to fetch lyrics');
    }
}

// Display Lyrics in Console Based on Timestamp
async function displayLyrics() {
    const { track, progress_ms } = await getCurrentlyPlayingTrack();
    if (track) {
        const artist = track.artists[0].name;
        const trackName = track.name;

        // Fetch lyrics only if not already fetched or if track changes
        if (!lyricsArray || lyricsArray.trackName !== trackName) {
            lyricsArray = await fetchLyrics(artist, trackName);
            if (lyricsArray) {
                lyricsArray.trackName = trackName;
            }
        }

        if (lyricsArray) {
            const currentSeconds = Math.floor(progress_ms / 1000);
            const currentLyric = lyricsArray.find(lyric => lyric.seconds === currentSeconds);

            if (currentLyric) {
                console.log(currentLyric.lyrics);
            }
        }
    }
}

// Initialize
window.addEventListener('load', () => {
    accessToken = getAccessTokenFromUrl();
    if (accessToken) {
        setInterval(displayLyrics, 1000); // Check and display lyrics every second
    }
});