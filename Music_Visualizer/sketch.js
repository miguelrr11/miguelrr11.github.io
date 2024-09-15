//Music Visualizer
//Miguel Rodríguez
//14-09-2024

p5.disableFriendlyErrors = true
let WIDTH = 650
let HEIGHT = 650
let songs = []
let fft128, spectrum128
let fft256, spectrum256
let amp
let playing = false
let backImg

let particles = []
let fs = false

let panel

let curSong = "Am I Dreaming"

function preload(){
    soundFormats('mp3');
    songs[0] = loadSound("songs/AmIDreaming.mp3")
    songs[1] = loadSound("songs/HitEmUp.mp3")
    songs[2] = loadSound("songs/InTheCity.mp3")
    songs[3] = loadSound("songs/TheUnforgiven.mp3")
    songs[4] = loadSound("songs/WhenTheSunGoesDown.mp3")
    song = songs[0]
    backImg = loadImage('imgback.png')
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    WIDTH = windowWidth
    HEIGHT = windowHeight
}

function mouseClicked(){
    fullscreen(true) 
}

function togglePlay(bool = playing){
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

function setup(){
    createCanvas(windowWidth, windowHeight)
    WIDTH = windowWidth
    HEIGHT = windowHeight

    fft128 = new p5.FFT(0.95, 128)
    fft256 = new p5.FFT(0.95, 512)
    angleMode(DEGREES)
    noFill()

    panel = new Panel(0, 0, 195, 240, "", undefined, undefined, true)
    panel.addSelect(["Am I Dreaming", "Hit Em Up", "In The City", "The Unforgiven", "When The Sun Goes Down"], "Am I Dreaming")
    panel.addButton("Play", togglePlay)
}

function drawRing(spectrum, width, col){
    strokeWeight(width)
    stroke(col)
    for(let t = -1; t <= 1; t += 2){
        beginShape()
        for(let i = 0; i <= 180; i += 0.5){
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
        console.log(curSong)
        if(curSong == "Am I Dreaming") song = songs[0]
        if(curSong == "Hit Em Up") song = songs[1]
        if(curSong == "In The City") song = songs[2]
        if(curSong == "The Unforgiven") song = songs[3]
        if(curSong == "When The Sun Goes Down") song = songs[4]
        if(playing) song.play()
    }
    spectrum128 = fft128.waveform()
    spectrum256 = fft256.waveform()

    fft256.analyze()
    amp = fft256.getEnergy(20, 200)
    push()
    translate(WIDTH/2, HEIGHT/2)
    if(amp > 250){
        rotate(random(-0.5, 0.5))
    }
    image(backImg,- WIDTH/2, -HEIGHT/2, WIDTH+100, HEIGHT+300)
    pop()
    
    if(amp > 0) particles.push(new Particle())

    fill(0, map(amp, 0, 255, 200, 50))
    rect(0, 0, WIDTH, HEIGHT)
    noFill()

    push()
    translate(WIDTH/2, HEIGHT/2)
    drawRing(spectrum128, 10, color(100, 100))
    drawRing(spectrum256, 5, color(100))
    drawRing(spectrum256, 1.5, color(255))

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
    pop()

    panel.update()
    panel.show()  
}
