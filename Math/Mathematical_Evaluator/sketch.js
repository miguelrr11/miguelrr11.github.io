//
//Miguel Rodríguez
//

//y = f(x)

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600
let g1
let font 

function preload(){
    font = loadFont('Roboto-Light.ttf')
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    g1 = new Graph("y = sin(x)*5")
    textFont(font)
}

function draw(){
    background(230)
    showAxis()
    g1.show(frameCount*5)
}
