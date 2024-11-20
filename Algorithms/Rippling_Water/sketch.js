//Rippling Water
//Miguel Rodriguez
//23-04-24

const WIDTH = 600
const HEIGHT = 600
let next = []
let cur = []
let damp = 0.99

function setup(){
    createCanvas(WIDTH, HEIGHT)
    for(let i = 0; i < WIDTH; i++){
        next[i] = []
        cur[i] = []
        for(let j = 0; j < HEIGHT; j++){
            next[i][j] = 0
            cur[i][j] = 0
        }
    }
    pixelDensity(1)
}

function mouseDragged(){
    if(mouseX < WIDTH && mouseY < HEIGHT){
        cur[mouseX][mouseY] = 2500
    }
}

function draw(){
    background(0)

    loadPixels()
    for(let i = 1; i < WIDTH-1; i++){
        for(let j = 1; j < HEIGHT-1; j++){
            next[i][j] = ((cur[i+1][j] + cur[i-1][j] + cur[i][j+1] + cur[i][j-1]) / 2) - next[i][j]
            next[i][j] *= damp
            let index = (i + j * WIDTH) * 4;
            pixels[index + 0] = next[i][j];
            pixels[index + 1] = next[i][j];
            pixels[index + 2] = next[i][j];
        }
    }
    updatePixels()

    let temp = next
    cur = next
    cur = temp
}