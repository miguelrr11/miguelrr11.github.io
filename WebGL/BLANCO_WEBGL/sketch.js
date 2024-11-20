//
//Miguel Rodríguez
//

const WIDTH = 700
const HEIGHT = 700

function preload(){
    sh = loadShader('vert.glsl', 'frag.glsl')
}

function setup(){
    createCanvas(WIDTH, HEIGHT, WEBGL)
    shader(sh)
    noStroke()
}

function draw(){
    clear()
    rect(0, 0, WIDTH, HEIGHT)
}