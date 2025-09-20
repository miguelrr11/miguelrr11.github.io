//BeatRing
//Miguel Rodríguez
//18-09-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600
const nSounds = 10

let rings = []

let kicks = []
let hihats = []

function keyPressed(){
    if(keyCode == 77){
        for(let ring of rings) ring.toggleMute()
    }
    if(keyCode == 32){
        for(let ring of rings) ring.togglePlay()
    }
}

function mouseClicked(){
    for(let ring of rings){ 
        ring.playing = true
        ring.checkClick()
    }
}

function doubleClicked(){
    for(let ring of rings) ring.checkClick(true)
}

async function setup(){
    createCanvas(WIDTH, HEIGHT)

    for(let i = 0; i < nSounds; i++){
        let kick = await loadSound('kick.mp3')
        kicks.push(kick)
        let hihat = await loadSound('hihat.mp3')
        hihats.push(hihat)
    }
    

    let ring = new Ring(200, 16, kicks)
    ring.col = [255, 20, 30]
    ring.fill([0, 3, 6, 10, 12])
    rings.push(ring)

    let ring2 = new Ring(100, 16, hihats)
    ring2.fill([0, 4, 8, 12])
    ring2.col = [50, 90, 255]
    rings.push(ring2)

    // let ring3 = new Ring(0, 1, kicks)
    // ring3.col = [235, 225, 20]
    // ring3.fill([0])
    // rings.push(ring3)
}

function draw(){
    background(0)

    for(let ring of rings) {
        ring.update()
        ring.show()
    }
}
