// Enigma Machine
// Miguel Rodríguez
// 04-08-2025

p5.disableFriendlyErrors = true
const WIDTH = 900
const HEIGHT = 800

const yRotors = 0
const yLamps = 200
const yKeys = 400
const yPlugs = 600

function setup(){
    createCanvas(WIDTH, HEIGHT)
}

function draw(){
    background(0)

    drawRotors()
    drawLamps()
    drawKeys()
    drawPlugs()
}

function drawRotors(){
    push()
    fill(20)
    rect(0, yRotors, WIDTH, yLamps)
    pop()
}

function drawLamps(){
    push()
    fill(50)
    rect(0, yLamps, WIDTH, yKeys)
    pop()
}

function drawKeys(){
    push()
    fill(30)
    rect(0, yKeys, WIDTH, yPlugs)
    pop()
}

function drawPlugs(){
    push()
    fill(70)
    rect(0, yPlugs, WIDTH, HEIGHT)
    pop()
}
