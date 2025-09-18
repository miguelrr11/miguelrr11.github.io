//BeatRing
//Miguel Rodríguez
//18-09-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let ring

function mouseClicked(){
    ring.checkClick()
}

function doubleClicked(){
    ring.checkClick(true)
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    ring = new Ring()
}

function draw(){
    background(0)

    ring.update()
    ring.show()
}
