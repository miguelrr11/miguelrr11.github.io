// main.js

const clientId = 'f46b7b60021f4c3cb8f231289e5a36d4';
const redirectUri = 'http://127.0.0.1:8080';
let accessToken = '';
let lyricsArray = null;
let lastFetchTime = 0;

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

// Fetch Lyrics using lrclib.net API
async function fetchLyrics(artist, track) {
    // Rate limiting: maximum 1 call per second
    const now = Date.now();
    if (now - lastFetchTime < 1000) {
        console.log('Rate limit: skipping fetch, too soon since last call');
        return null;
    }
    lastFetchTime = now;

    // Remove extra information like "- Remaster" or "(Live)" from the track name
    const cleanedTrack = track.replace(/ *\([^)]*\) */g, "").replace(/ *- [^)]*$/g, "");

    const apiUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanedTrack)}&artist_name=${encodeURIComponent(artist)}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();

            if (data.syncedLyrics) {
                // Parse the synced lyrics format [mm:ss.xx] lyrics text
                const lyricsArray = data.syncedLyrics.split('\n')
                    .filter(line => line.trim())
                    .map(line => {
                        const match = line.match(/\[(\d+):(\d+\.\d+)\]\s*(.+)/);
                        if (match) {
                            const minutes = parseInt(match[1]);
                            const seconds = parseFloat(match[2]);
                            const totalSeconds = Math.floor(minutes * 60 + seconds);
                            return {
                                seconds: totalSeconds,
                                lyrics: match[3]
                            };
                        }
                        return null;
                    })
                    .filter(item => item !== null);

                console.log('Lyrics fetched successfully from lrclib.net');
                return lyricsArray;
            } else {
                console.error('No synced lyrics found in the response');
            }
        } else {
            console.error('Failed to fetch lyrics:', response.status);
        }
    } catch (error) {
        console.error('Error fetching lyrics:', error);
    }

    return null;
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