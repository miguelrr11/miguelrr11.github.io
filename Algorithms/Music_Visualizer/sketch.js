//Music Visualizer
//Miguel Rodríguez
//14-09-2024

p5.disableFriendlyErrors = true
let WIDTH = 650
let HEIGHT = 650
let songs = []
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

let selectedFile

let particles = []
let fs = false

let panel
let first = false

let curSong = "Am I Dreaming"

function mouseMoved() {
    resetInactivityTimer();
}

function preload(){
    soundFormats('mp3');
    songs[0] = loadSound("songs/AmIDreaming.mp3")
    songs[1] = loadSound("songs/RevaliBOTW.mp3")
    songs[2] = loadSound("songs/InTheCity.mp3")
    songs[3] = loadSound("songs/TheUnforgiven.mp3")
    songs[4] = loadSound("songs/WhenTheSunGoesDown.mp3")
    song = songs[0]
    backImg = loadImage('imgback.png')
}

function toggleFullScreen(){
    fullscreen(!fs)
    fs = !fs
    if(fs){
        panel.changeText(3, "Exit Fullscreen")
    }
    else panel.changeText(3, "Enter Fullscreen")
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    WIDTH = windowWidth
    HEIGHT = windowHeight
}

function openFile(){
    openFileExplorer()
    .then(file => {
        loadFile(file)
    })
    .then(() => {
        playFile()
        if(fs) fullscreen(fs)
    })
    .catch(error => {
        console.error(error);
    });
}

function togglePlay(bool = playing){
    if(curSong == "Mic Audio"){
        playing = false
        panel_But_TogglePlay.setText("Play")
        return
    }
    if(!bool){ 
        song.play()
        playing = true
        panel_But_TogglePlay.setText("Pause")
    }
    else{
        song.pause()
        playing = false
        panel_But_TogglePlay.setText("Play")
    }
}

function loadFile(file){
    selectedFile = file
}

function playFile(){
    if(selectedFile){
        song.stop()
        song = loadSound(selectedFile,
         () => { song.play()
         panel_But_Play.setText("Play " + song.file.name) },
         () => {
            song.stop()
         })

        playing = true
        panel_But_TogglePlay.setText("Pause")
    }
}

let panel_Sel_Songs,
    panel_But_TogglePlay,
    panel_But_Open,
    panel_But_Play,
    panel_But_Full,
    panel_Tx_1,
    panel_Tx_2

function setup(){
    createCanvas(windowWidth, windowHeight)
    WIDTH = windowWidth
    HEIGHT = windowHeight

    fft128 = new p5.FFT(0.95, 128)
    fft256 = new p5.FFT(0.95, 1024) //1024
    fftSmall = new p5.FFT(0.999, 1024)
    angleMode(DEGREES)
    noFill()

    panel = new Panel(0, 0, 195, 420, "", undefined, undefined, true)
    panel = new Panel({
        x: 0,
        width: 195
    })
    panel_Sel_Songs = panel.createSelect(["Am I Dreaming", "Revali BOTW", "In The City", "The Unforgiven", "When The Sun Goes Down", "Mic Audio"], "Am I Dreaming")
    panel_But_TogglePlay = panel.createButton("Play", togglePlay)
    panel_But_Open = panel.createButton("Open file", openFile)
    panel_But_Play = panel.createButton("Play file", playFile)
    panel_But_Full = panel.createButton("Enter Fullscreen", toggleFullScreen)

    panel_Tx_1 = panel.createText()
    panel_Tx_2 = panel.createText()

    //panel.addSlider(6, 8, 7, "", true)

    mic = new p5.AudioIn()
    mic.start()

    noCursor()
    resetInactivityTimer()

    curSong = "Mic Audio"
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
    background(0)

    panel_Tx_1.setText("amp bass: " + Math.round(amp))
    panel_Tx_2.setText("amp treb: " + Math.round(ampT))
    if(curSong != panel_Sel_Songs.getSelected()){
        song.stop()
        curSong = panel_Sel_Songs.getSelected()
        if(curSong == "Am I Dreaming") song = songs[0]
        if(curSong == "Revali BOTW") song = songs[1]
        if(curSong == "In The City") song = songs[2]
        if(curSong == "The Unforgiven") song = songs[3]
        if(curSong == "When The Sun Goes Down") song = songs[4]
        if(curSong == "Mic Audio"){
            fft128.setInput(mic)
            fft256.setInput(mic)
            fftSmall.setInput(mic)
            togglePlay()
        }
        if(curSong != "Mic Audio"){
            fft128 = new p5.FFT(0.95, 128)
            fft256 = new p5.FFT(0.95, 1024)
            fftSmall = new p5.FFT(0.999, 1024)
        }
        if(playing) song.play()
    }

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
            p.update(amp > 230, amp < 50)
            p.show(amp < 50)
        }
        else{ 
            particles.splice(i, 1)
            i--
        }
    }

    let col = map(amp, 0, 100, 0, 255)
    drawRing(spectrum128, 10, color(100, col/4), amp)
    drawRing(spectrum256, 5, color(100, col), amp)
    drawRing(spectrum256, map(amp, 0, 255, 1, 2.5), color(255, col), amp)
    //drawRingGauss(spectrum256, 0, 0, amp)

    pop()

    if(showing){  //showing
        panel.update()
        panel.show()  
    }
    
}


function openFileExplorer() {
    return new Promise((resolve, reject) => {
        // Create a hidden input element programmatically
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.style.display = 'none'; // Ensure it's hidden

        // Append the input to the document body
        document.body.appendChild(inputElement);

        // Add event listener to handle file selection
        inputElement.addEventListener('change', function(event) {
            const file = event.target.files[0]; // Get the selected file
            if (file) {
                resolve(file);  // Resolve the promise with the file
            } else {
                reject('No file selected'); // Reject if no file is selected
            }

            // Clean up: remove the input element after the selection
            document.body.removeChild(inputElement);
        });

        // Trigger the file explorer by programmatically clicking the hidden input
        inputElement.click();
    });
}



