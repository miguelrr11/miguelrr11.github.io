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
let amp
let playing = false
let backImg
let inactivityTimer
const INACTIVITY_TIME = 3000
let showing = false
let mic

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
        panel.changeText(0, "Play")
        return
    }
    if(!bool){ 
        song.play()
        playing = true
        panel.changeText(0, "Pause")
    }
    else{
        song.pause()
        playing = false
        panel.changeText(0, "Play")
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
         panel.changeText(2, "Play " + song.file.name) },
         () => {
            song.stop()
         })

        playing = true
        panel.changeText(0, "Pause")
    }
}

function setup(){
    createCanvas(windowWidth, windowHeight)
    WIDTH = windowWidth
    HEIGHT = windowHeight

    fft128 = new p5.FFT(0.95, 128)
    fft256 = new p5.FFT(0.95, 1024) //1024
    fftSmall = new p5.FFT(0.999, 1024)
    angleMode(DEGREES)
    noFill()

    panel = new Panel(0, 0, 195, 380, "", undefined, undefined, true)
    panel.addSelect(["Am I Dreaming", "Revali BOTW", "In The City", "The Unforgiven", "When The Sun Goes Down", "Mic Audio"], "Am I Dreaming")
    panel.addButton("Play", togglePlay)
    panel.addButton("Open file", openFile)
    panel.addButton("Play file", playFile)
    panel.addButton("Enter Fullscreen", toggleFullScreen)

    mic = new p5.AudioIn()
    mic.start()

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

function drawRing(spectrum, width, col, bool = curSong == "Mic Audio"){
    strokeWeight(width)
    stroke(col)
    let mult = bool ? 2 : 1
    for(let t = -1; t <= 1; t += 2){
        beginShape()
        for(let i = 0; i <= 180; i += 0.25){
            let index = floor(map(i, 0, 180, 0, spectrum.length - 1))
            let r = map(spectrum[index], -1, 1, 140, 350)
            let x = r * sin(i) * t 
            let y = r * cos(i)
            vertex(x, y)
        }
        endShape()
    }
}

function draw(){
    background(0)

    if(curSong != panel.getSelected(0)){
        song.stop()
        curSong = panel.getSelected(0)
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
    amp = fft256.getEnergy(20, 200)

    push()
    translate(WIDTH / 2, HEIGHT / 2)

    let offset = map(amp, 0, 255, 10, 15)
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

    if(amp > 0) particles.push(new Particle())
    if(amp > 230){ 
        particles.push(new Particle())
        particles.push(new Particle())
    }
    if(amp > 253){
        particles.push(new Particle())
        particles.push(new Particle())
        particles.push(new Particle())
        particles.push(new Particle())
    }


    fill(0, map(amp, 0, 255, 200, 50))
    rect(0, 0, WIDTH, HEIGHT)
    noFill()

    push()
    translate(WIDTH/2, HEIGHT/2)

    for(let i = 0; i < particles.length; i++) {
        let p = particles[i]
        if(p.edges()){
            p.update(amp > 230)
            p.show()
        }
        else{ 
            particles.splice(i, 1)
            i--
        }
    }

    drawRing(spectrum128, 10, color(100, 100))
    drawRing(spectrum256, 5, color(100))
    drawRing(spectrum256, map(amp, 0, 255, 1.5, 2.5), color(255))

    pop()

    if(showing){
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



