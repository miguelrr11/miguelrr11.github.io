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
let accessToken = '';
let lyricsArray = null;

let curLyrics, nextLyrics, timeCurLyrics
let currentTrackName = ""
let artist = ""
let dtCurLyrics = 0

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
    
    cnv.mousePressed(() => {
        if(first){
            song.play()
            song.stop()
            mic.start()
        }
        first = false
    })

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
    if(curLyrics){
        translate(width / 2, height / 2)
        textFont(lyricsFont)
        textAlign(CENTER, CENTER)
        let size = map(easeOutCirc(map(dtCurLyrics, 0, timeCurLyrics, 0, 1)), 0, 1, 15, 55)
        textSize(size)
        noStroke()
        let smoothVal = easeOutExpo(map(dtCurLyrics, 0, timeCurLyrics, 0, 1))
        let mappedSmoothVal = smoothVal < 0.95 
            ? map(smoothVal, 0, 0.95, 0, 255) 
            : map(smoothVal, 0.95, 1, 255, -10)
        fill(255, mappedSmoothVal)
        let amtShaking = map(easeOutExpo(map(amp, 0, 255, 0, 1)), 0, 1, -2, 2)
        rotate(map(sin(frameCount), 0, 1, -amtShaking, amtShaking))
        text(curLyrics, 0, 0)
    }
    pop()
    push()
    fill(255, 80)
    noStroke()
    textAlign(LEFT, CENTER)
    textFont(lyricsFont)
    textSize(15)
    let plus = lyricsArray == null ? " - Lyrics not available" : ""
    text(currentTrackName + " - " + artist + plus, 20, height - 20)
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
        setInterval(displayLyrics, 1000); // Check and display lyrics every second
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

            // Optionally store refresh token and expiry
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

// Fetch Lyrics using CORS Proxy
async function fetchLyrics(artist, track) {
    // Remove extra information like "- Remaster" or "(Live)" from the track name
    const cleanedTrack = track.replace(/ *\([^)]*\) */g, "").replace(/ *- [^)]*$/g, "");

    // Try multiple CORS proxies in order of preference
    const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://corsproxy.io/?'
    ];

    const apiUrl = `https://api.textyl.co/api/lyrics?q=${encodeURIComponent(cleanedTrack)}`;

    for (let proxy of corsProxies) {
        try {
            let fetchUrl;
            if (proxy.includes('allorigins')) {
                fetchUrl = proxy + encodeURIComponent(apiUrl);
            } else if (proxy.includes('corsproxy')) {
                fetchUrl = proxy + encodeURIComponent(apiUrl);
            } else {
                fetchUrl = proxy + apiUrl;
            }

            const response = await fetch(fetchUrl, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                if (Array.isArray(data)) {
                    console.log('Lyrics fetched successfully using:', proxy);
                    return data;
                } else {
                    console.error('No lyrics found in the response');
                }
            }
        } catch (error) {
            console.log(`Failed with ${proxy}, trying next proxy...`, error);
            continue;
        }
    }

    console.error('Failed to fetch lyrics from all proxies');
    return null;
}

// Display Lyrics in Console Based on Timestamp
async function displayLyrics() {
    const { track, progress_ms } = await getCurrentlyPlayingTrack();
    if (track) {
        artist = track.artists[0].name;
        const trackName = track.name;

        if (trackName && currentTrackName !== trackName) {
            currentTrackName = trackName;
        }

        // Fetch lyrics only if not already fetched or if track changes
        if (!lyricsArray || lyricsArray.trackName !== trackName) {
            lyricsArray = await fetchLyrics(artist, trackName);
            if (lyricsArray) {
                lyricsArray.trackName = trackName;
            }
        }

        if (lyricsArray) {
            const currentSeconds = Math.floor((progress_ms) / 1000);
            const currentIndex = lyricsArray.findIndex(lyric => lyric.seconds === currentSeconds);
            const currentLyrics = currentIndex !== -1 ? lyricsArray[currentIndex] : null;
            nextLyrics = currentIndex !== -1 && currentIndex < lyricsArray.length - 1 ? lyricsArray[currentIndex + 1] : null;


            if (currentLyrics) {
                curLyrics = currentLyrics.lyrics
                curLyrics = wrapText(curLyrics, 200, 40, lyricsFont)
                dtCurLyrics = 0
                timeCurLyrics = nextLyrics.seconds - currentLyrics.seconds
            }
        }
    }
}


