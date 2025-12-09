//Music Visualizer
//Miguel Rodríguez
//13-10-2024

//cd /Users/miguelrodriguezmbp/Desktop/p5js/Algorithms/Music_And_Lyrics_Visualizer
//NODE_TLS_REJECT_UNAUTHORIZED=0 node proxy-server.js

p5.disableFriendlyErrors = true
let WIDTH = 650
let HEIGHT = 650
let fft128, spectrum128
let fft256, spectrum256
let fftSmall, spectrumSmall
let amp, ampT
let playing = false
let backImg
let inactivityTimer
const INACTIVITY_TIME = 3000
let showing = false
let mic
let particleStartOffset
let song

let selectedFile

let particles = []
let fs = false

let first = true

let curSong = "Mic Audio"
let lyricsFont 

const clientId = 'f46b7b60021f4c3cb8f231289e5a36d4';
const redirectUri = 'https://miguelrr11.github.io/Algorithms/Music_And_Lyrics_Visualizer';
//const redirectUri = 'http://127.0.0.1:8080';
let accessToken = '';
let lyricsArray = null;
let lastFetchTime = 0;

let curLyrics, nextLyrics, timeCurLyrics
let currentTrackName = ""
let artist = ""
let dtCurLyrics = 0
let bpm = 0
let lastLyricIndex = -1
let cachedTrackData = null
let lastSpotifyFetchTime = 0
let currentSongProgress = 0
let currentSongDuration = 0
let smoothedProgress = 0
let lyricsScrollOffset = 0
let targetScrollOffset = 0
// Timing anchor system - stores exact values when Spotify data is received
let anchoredProgressMs = 0      // The progress_ms from Spotify at anchor time
let anchoredTimestamp = 0       // Date.now() when we received that progress

let panel, panel_offset, panel_sensitivity

function mouseMoved() {
    resetInactivityTimer();
}

function preload(){
    backImg = loadImage('imgback.png')
    song = loadSound("songs/AmIDreaming.mp3")
    lyricsFont = loadFont('tipoLyrics.ttf')
}

function toggleFullScreen(){
    fullscreen(!fs)
    fs = !fs
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    WIDTH = windowWidth
    HEIGHT = windowHeight
}

function setup(){
    let cnv = createCanvas(windowWidth, windowHeight)
    mic = new p5.AudioIn()

    WIDTH = windowWidth
    HEIGHT = windowHeight

    fft128 = new p5.FFT(0.95, 128)
    fft256 = new p5.FFT(0.95, 1024)
    fftSmall = new p5.FFT(0.999, 1024)

    angleMode(DEGREES)
    noFill()
    
    // cnv.mousePressed(() => {
    //     if(first){
    //         song.play()
    //         song.stop()
    //         mic.start()
    //     }
    //     first = false
    // })

    fft128.setInput(mic)
    fft256.setInput(mic)
    fftSmall.setInput(mic)

    noCursor()
    resetInactivityTimer()   

}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    cursor()
    showing = true

    inactivityTimer = setTimeout(() => {
        noCursor(); 
        showing = false
    }, INACTIVITY_TIME);
}

function gaussianBell(x, a1, a2) {
  const a = 2;    // peak value
  const mu = (a1+a2)/2;  // center of the bell
  const sigma = 6; // width of the bell

  // Gaussian function
  return a * Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
}

function drawRingGauss(spectrum, width, col, amp, bool = curSong == "Mic Audio"){
    fill(255)
    noStroke()
    let mult = bool ? 2 : 1
    let off = map(amp, 0, 255, -40, 40)
    let offG = map(amp, 120, 255, 0, 50, true)
    let minR = 140 + off
    let maxR = 350 + off
    let max = 0
    for(let t = -1; t <= 1; t += 2){
        beginShape()
        for(let i = 0; i <= 180; i += 0.25){
            let index = floor(map(i, 0, 180, 0, spectrum.length - 1))

            //let r = map(spectrum[index], -1, 1, minR, maxR)
            r = 75
            if(r > max) max = r

            //if(abs(i-90) <= 45 && abs(i-90) >= 25) r += 50
            let absI = i - 90
            let a1 = 50  
            let a2 = 10
            if(absI <= a1 && absI >= a2){
                let gauss = gaussianBell(absI, a1, a2)
                r += gauss*offG
            }
            
            let x = r * sin(i) * t 
            let y = r * cos(i)
            vertex(x, y)
        }
        endShape()
    }
}

function drawRing(spectrum, width, col, amp, bool = curSong == "Mic Audio"){
    strokeWeight(width)
    stroke(col)
    let mult = bool ? 2 : 1
    let off = map(amp, 0, 255, -40, 40)
    let offG = map(amp, 120, 255, 0, 50, true)
    let minR = 140 + off
    let maxR = 350 + off
    let max = 0
    for(let t = -1; t <= 1; t += 2){
        beginShape()
        for(let i = 0; i <= 180; i += 0.25){
            let index = floor(map(i, 0, 180, 0, spectrum.length - 1))

            let r = map(spectrum[index], -1, 1, minR, maxR)
            if(r > max) max = r

            let x = r * sin(i) * t 
            let y = r * cos(i)
            vertex(x, y)
        }
        endShape()
    }
    particleStartOffset = max
}

function draw(){
    dtCurLyrics += 1/60
    background(0)

    spectrum128 = fft128.waveform()
    spectrum256 = fft256.waveform()
    spectrumSmall = fftSmall.waveform()

    fft256.analyze()
    amp = fft256.getEnergy("bass")
    ampT = fft256.getEnergy("treble")

    push()
    translate(WIDTH / 2, HEIGHT / 2)

    let offset = map(amp, 0, 255, 10, 20)
    let scaleFactor = 1 + offset / 100

    let imgWidth = WIDTH+100
    let imgHeight = HEIGHT+100
    let scaledWidth = imgWidth * scaleFactor
    let scaledHeight = imgHeight * scaleFactor

    if (amp > 250) {
        rotate(random(-0.5, 0.5))
    }

    scale(scaleFactor)
    image(backImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    pop()

    let nPart = map(amp, 80, 255, 0, 0.75)
    while(random() < nPart) particles.push(new Particle())


    fill(0, map(amp, 0, 225, 200, 50))
    rect(0, 0, WIDTH, HEIGHT)
    noFill()

    push()
    translate(WIDTH/2, HEIGHT/2)

    for(let i = 0; i < particles.length; i++) {
        let p = particles[i]
        if(p.edges()){
            p.update(amp > 245, amp < 50)
            p.show(amp < 50)
        }
        else{ 
            particles.splice(i, 1)
            i--
        }
    }

    let col = map(amp, 0, 100, 0, 100)
    drawRing(spectrum128, 10, color(100, col/4), amp)
    drawRing(spectrum256, 5, color(100, col), amp)
    drawRing(spectrum256, map(amp, 0, 255, 1, 2.5), color(255, col), amp)
    //drawRingGauss(spectrum256, 0, 0, amp)

    pop()

    //Lyrics
    push()
    if(lyricsArray && lastLyricIndex !== -1){
        translate(width / 2, height / 2 + 20)

        // Smooth scroll animation
        lyricsScrollOffset = lerp(lyricsScrollOffset, targetScrollOffset, 0.15)
        translate(0, lyricsScrollOffset)

        textFont(lyricsFont)
        textAlign(CENTER, CENTER)
        noStroke()

        const lineSpacing = 60
        const numPreviousLines = 4
        const numNextLines = 4

        // Calculate progress for current lyric animation
        let progress = timeCurLyrics > 0 ? map(dtCurLyrics, 0, timeCurLyrics, 0, 1, true) : 0

        // Draw previous lyrics (above current)
        for(let i = numPreviousLines; i >= 1; i--){
            let index = lastLyricIndex - i
            if(index >= 0 && index < lyricsArray.length){
                let yPos = -i * lineSpacing
                let alpha = map(i, numPreviousLines, 0, 30, 120)
                textSize(25)
                fill(255, alpha)
                text(lyricsArray[index].lyrics, 0, yPos)
            }
        }

        // Draw current lyric (center, animated)
        push()
        let size = map(easeOutCirc(progress), 0, 1, 35, 50)
        textSize(size)
        let smoothVal = easeOutExpo(progress)
        let alpha = smoothVal < 0.95
            ? map(smoothVal, 0, 0.95, 180, 255)
            : map(smoothVal, 0.95, 1, 255, 180)
        fill(255, alpha)
        let amtShaking = map(easeOutExpo(map(amp, 0, 255, 0, 1)), 0, 1, -1, 1)
        rotate(map(sin(frameCount), 0, 1, -amtShaking, amtShaking))
        text(lyricsArray[lastLyricIndex].lyrics == ' ' ? '...' : lyricsArray[lastLyricIndex].lyrics, 0, 0)
        pop()

        // Draw next lyrics (below current)
        for(let i = 1; i <= numNextLines; i++){
            let index = lastLyricIndex + i
            if(index < lyricsArray.length){
                let yPos = i * lineSpacing
                let alpha = map(i, 1, numNextLines, 120, 30)
                textSize(25)
                fill(255, alpha)
                text(lyricsArray[index].lyrics == ' ' ? '...' : lyricsArray[index].lyrics, 0, yPos)
            }
        }
    }
    pop()
    push()
    fill(255, 80)
    noStroke()
    textAlign(LEFT, CENTER)
    textFont(lyricsFont)
    textSize(15)
    let displayText = ""
    if (!accessToken) {
        displayText = "Click to log in"
    } else if (currentTrackName) {
        let plus = lyricsArray == null ? " - Lyrics not available" : ""
        displayText = currentTrackName + " - " + artist + plus
    }
    text(displayText, 20, height - 20)
    pop()

    push()
    if(currentSongDuration > 0){
        // Smooth the progress bar animation
        smoothedProgress = lerp(smoothedProgress, currentSongProgress, 0.1)
        fill(255, 80)
        let progress = map(smoothedProgress, 0, currentSongDuration, 0, width, true)
        rect(0, height - 5, progress, 5)
    }
    pop()

    // if(showing){
    //     panel.update()
    //     panel.show()
    // }
}

function easeOutCirc(x){
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

function easeOutExpo(x){
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
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

async function mouseClicked(){
    if(!accessToken){
        const codeVerifier = generateRandomString(64);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        // Store code verifier for later use
        localStorage.setItem('code_verifier', codeVerifier);

        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-read-playback-state&code_challenge_method=S256&code_challenge=${codeChallenge}`;
        window.location.href = authUrl;
    }
}

window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // Exchange code for token
        const codeVerifier = localStorage.getItem('code_verifier');
        await exchangeCodeForToken(code, codeVerifier);

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        // Check if we already have a token
        accessToken = localStorage.getItem('access_token');
    }

    if (accessToken) {
        setInterval(displayLyrics, 100); // Check and display lyrics every 100ms for better sync
    }
});

async function exchangeCodeForToken(code, codeVerifier) {
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
    };

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', payload);
        const data = await response.json();

        if (data.access_token) {
            accessToken = data.access_token;
            localStorage.setItem('access_token', accessToken);

            // Store refresh token and expiry
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }
            if (data.expires_in) {
                const expiryTime = Date.now() + (data.expires_in * 1000);
                localStorage.setItem('token_expiry', expiryTime);
            }
        }
    } catch (error) {
        console.error('Error exchanging code for token:', error);
    }
}

// Refresh the access token using the refresh token
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        console.error('No refresh token available');
        return false;
    }

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    };

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', payload);
        const data = await response.json();

        if (data.access_token) {
            accessToken = data.access_token;
            localStorage.setItem('access_token', accessToken);

            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }
            if (data.expires_in) {
                const expiryTime = Date.now() + (data.expires_in * 1000);
                localStorage.setItem('token_expiry', expiryTime);
            }
            console.log('Token refreshed successfully');
            return true;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
    }
    return false;
}



async function getCurrentlyPlayingTrack() {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.status === 401) {
        // Token expired, try to refresh
        console.log('Token expired, attempting refresh...');
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            // Retry the request with new token
            const retryResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (retryResponse.ok) {
                const data = await retryResponse.json();
                return {
                    track: data.item,
                    progress_ms: data.progress_ms
                };
            }
        }
        return null;
    }

    if (response.ok) {
        const data = await response.json();
        return {
            track: data.item,
            progress_ms: data.progress_ms
        };
    } else {
        console.error('Failed to fetch currently playing track, status:', response.status);
    }
    return null;
}

// Get Audio Features including BPM
async function getTrackAudioFeatures(trackId) {
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.error('Failed to fetch audio features, status:', response.status);
        return null;
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
            console.log(data)

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
                            return {
                                milliseconds: totalMilliseconds,
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
    const now = Date.now();

    // Fetch from Spotify API once per second to get ground truth
    if (now - lastSpotifyFetchTime >= 1000) {
        const newData = await getCurrentlyPlayingTrack();
        if (newData && newData.track) {
            cachedTrackData = newData;
            lastSpotifyFetchTime = now;
            // Anchor the timing to Spotify's ground truth
            anchoredProgressMs = newData.progress_ms;
            anchoredTimestamp = now;
        }
    }

    if (!cachedTrackData) return;

    const { track } = cachedTrackData;

    // Calculate current progress using anchored timing
    // This is simply: where Spotify said we were + time since then
    const currentProgress = anchoredProgressMs + (now - anchoredTimestamp);

    // Update global progress for UI (progress bar)
    currentSongProgress = currentProgress;

    if (track) {
        artist = track.artists[0].name;
        const trackName = track.name;
        const trackId = track.id;
        currentSongDuration = track.duration_ms;

        if (trackName && currentTrackName !== trackName) {
            currentTrackName = trackName;
            lastLyricIndex = -1; // Reset lyric index on track change
            lyricsScrollOffset = 0; // Reset scroll
            targetScrollOffset = 0; // Reset target scroll
            // Reset timing anchor on track change
            anchoredProgressMs = 0;
            anchoredTimestamp = now;

            // Fetch BPM when track changes
            const audioFeatures = await getTrackAudioFeatures(trackId);
            if (audioFeatures && audioFeatures.tempo) {
                bpm = Math.round(audioFeatures.tempo);
                console.log(`BPM for "${trackName}": ${bpm}`);
            }
        }

        // Fetch lyrics only if not already fetched or if track changes
        if (!lyricsArray || lyricsArray.trackName !== trackName) {
            lyricsArray = await fetchLyrics(artist, trackName);
            if (lyricsArray) {
                lyricsArray.trackName = trackName;
            }
        }

        if (lyricsArray && lyricsArray.length > 0) {
            // Find the current lyric based on milliseconds using current progress
            let currentIndex = -1;

            // Linear search through lyrics to find current one
            for (let i = 0; i < lyricsArray.length; i++) {
                if (lyricsArray[i].milliseconds <= currentProgress) {
                    currentIndex = i;
                } else {
                    break;
                }
            }

            // Ensure we have a valid index
            if (currentIndex === -1 && lyricsArray.length > 0) {
                currentIndex = 0; // Default to first lyric if we're before the first timestamp
            }

            // Only update if the lyric index has changed and is valid
            if (currentIndex !== -1 && currentIndex !== lastLyricIndex && currentIndex < lyricsArray.length) {
                const lineSpacing = 60

                if (lastLyricIndex === -1) {
                    // First lyric load - no animation
                    targetScrollOffset = 0
                    lyricsScrollOffset = 0
                } else {
                    // Start scroll from below (positive offset) and animate to 0
                    // This creates the effect of the new lyric scrolling up into position
                    lyricsScrollOffset = lineSpacing
                    targetScrollOffset = 0
                }

                lastLyricIndex = currentIndex;

                const currentLyrics = lyricsArray[currentIndex];
                nextLyrics = currentIndex < lyricsArray.length - 1 ? lyricsArray[currentIndex + 1] : null;

                curLyrics = currentLyrics.lyrics
                curLyrics = wrapText(curLyrics, 200, 40, lyricsFont)
                dtCurLyrics = 0

                if (nextLyrics) {
                    const timeDiff = nextLyrics.milliseconds - currentLyrics.milliseconds
                    timeCurLyrics = timeDiff > 0 ? timeDiff / 1000 : 5;
                } else {
                    // If no next lyric, set a default duration
                    timeCurLyrics = 5;
                }
            }
        }
    }
}


