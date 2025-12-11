// main.js

const clientId = 'f46b7b60021f4c3cb8f231289e5a36d4';
const redirectUri = 'https://miguelrr11.github.io/Algorithms/Spotify_Lyrics/';
let accessToken = '';
let lyricsArray = null;
let lastFetchTime = 0;
let hasAccess = false


function mouseClicked(){
    login()
}

function touchEnded(){
    login()
}

async function login(){
    if(!accessToken){
        const codeVerifier = generateRandomString(64);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        // Store code verifier for later use
        localStorage.setItem('code_verifier', codeVerifier);

        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-read-playback-state%20user-modify-playback-state%20user-top-read&code_challenge_method=S256&code_challenge=${codeChallenge}`;
        window.location.href = authUrl;
    }
}



// PKCE Helper Functions
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

async function generateCodeChallenge(codeVerifier) {
    const hashed = await sha256(codeVerifier);
    return base64encode(hashed);
}

// Extract Authorization Code from URL and Exchange for Access Token
async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
        return null;
    }

    const codeVerifier = localStorage.getItem('code_verifier');

    if (!codeVerifier) {
        console.error('Code verifier not found');
        return null;
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Clear the code verifier
            localStorage.removeItem('code_verifier');
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return data.access_token;
        } else {
            console.error('Failed to exchange code for token:', await response.text());
            return null;
        }
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        return null;
    }
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
        return data;
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
                // Parse the synced lyrics format [mm:ss.xx] lyrics text with millisecond precision
                const lyricsArray = data.syncedLyrics.split('\n')
                    .filter(line => line.trim())
                    .map(line => {
                        const match = line.match(/\[(\d+):(\d+\.\d+)\]\s*(.+)/);
                        if (match) {
                            const minutes = parseInt(match[1]);
                            const seconds = parseFloat(match[2]);
                            const totalMilliseconds = Math.floor((minutes * 60 + seconds) * 1000);
                            console.log(match[3])
                            return {
                                milliseconds: totalMilliseconds,
                                lyrics: match[3]
                            };
                        }
                        return null;
                    })
                    .filter(item => item !== null);

                console.log('Lyrics fetched successfully from lrclib.net');
                console.log(lyricsArray)
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

// Initialize
window.addEventListener('load', async () => {
    accessToken = await handleCallback();
    if (accessToken) {
        hasAccess = true;
        console.log('Successfully authenticated with Spotify');
    }
});