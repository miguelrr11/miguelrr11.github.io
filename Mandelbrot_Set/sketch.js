//Mandelbrot Set
//Miguel Rodríguez
//30-09-2024

p5.disableFriendlyErrors = true
const WIDTH = 1500
const HEIGHT = 800

let centers = [
              [0.38903221973403584, 0.19756963474980135],
              [0.1439337013960416, 0.6522895367229832],
              [0.3754608061919572, -0.20644978309384265],
              [-1.4187152255376616, 0.000026160095769667177],
              [-0.15439585080603746, -1.0284689320921054]
             ]

let center = 0

let zoom = 1.

let cx, cy

function preload(){
    sh = loadShader('vert.glsl', 'frag.glsl')
}

function setup(){
    createCanvas(WIDTH, HEIGHT, WEBGL)
    shader(sh)
    noStroke()

    handleInput()

    //cx = createSlider(0.4, 0.42, 0.41, 0.0001)
    //cy = createSlider(0.3, 0.32, 0.31, 0.0001)
}

function mouseClicked(){
    console.log(mouseX/WIDTH, mouseY/HEIGHT)
}

function mouseWheel(event) {
    // Zoom in or out
    zoom *= event.delta > 0 ? 1.1 : 0.9;
}

function handleInput() {

    window.addEventListener('keydown', (e) => {
        let panAmount = 0.1 / zoom;  // Pan faster when zoomed out, slower when zoomed in
        if (e.key === 'ArrowLeft') centers[center][0] -= panAmount;
        if (e.key === 'ArrowRight') centers[center][0] += panAmount;
        if (e.key === 'ArrowUp') centers[center][1] += panAmount;
        if (e.key === 'ArrowDown') centers[center][1] -= panAmount;

        console.log(centers[center])
    });
}

function draw(){
    clear()
    //center = [cx.value(), cy.value()]
    zoom *= 1.02
    if(zoom > 2587728.){
        zoom = 1.
        center++
        center = center % centers.length
    }
    sh.setUniform("u_zoom", zoom)
    sh.setUniform("u_center", centers[center])
    rect(0, 0, WIDTH, HEIGHT)
}