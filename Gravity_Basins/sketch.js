//Gravity Basins
//Miguel Rodríguez
//30-09-2024

p5.disableFriendlyErrors = true
const WIDTH = 700
const HEIGHT = 700

let sh
let angleP = 0

let sliderG
let sliderMaxSpeed

let planets = []

function getPosPlanet(angle){
  return [cos(angle)*100 + 0.5, sin(angle)*100 + 0.5]
}

function preload(){
    sh = loadShader('vert.glsl', 'frag.glsl')
}

//g = .25
//s = .36

function setup(){
    createCanvas(WIDTH, HEIGHT, WEBGL)
    shader(sh)
    noStroke()
    sliderG = createSlider(0.0, 3.0, 0.25, 0.01)
    sliderMaxSpeed = createSlider(0.0, 5.0, 0.36, 0.01)

    planets = [random(),random(),random(),random(),random(),random(),random(),random()]

    //planets = [0 + 0.125, 0.5, 0.25 + 0.125, 0.5, 0.5 + 0.125, 0.5, 0.75 + 0.125, 0.5]
}

function edges(planetx, planety){
    let resx = planetx
    let resy = planety
    if(planetx < 0) resx = 1
    if(planetx > 1) resx = 0
    if(planety < 0) resy = 1
    if(planety > 1) resy = 0
    return [resx, resy]
}

function draw(){
    clear()
    // angleP += 0.002
    // let pos = getPosPlanet(angleP)
    // planets[0] = pos[0]
    // planets[1] = pos[1]
    // pos = getPosPlanet(angleP + TWO_PI/3)
    // planets[2] = pos[0]
    // planets[3] = pos[1]
    // pos = getPosPlanet(angleP + (TWO_PI/3)*2)
    // planets[4] = pos[0]
    // planets[5] = pos[1]

    planets[0] = mouseX/WIDTH
    planets[1] = 1.0-mouseY/HEIGHT

    sh.setUniform("planets", planets)
    sh.setUniform("G", sliderG.value())
    sh.setUniform("maxSpeed", sliderMaxSpeed.value())
    rect(0, 0, WIDTH, HEIGHT)
}


