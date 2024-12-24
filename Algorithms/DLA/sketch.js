//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600
let grid = []
let newGrid = []
let sizeGrid = 150
let tamCell = WIDTH/sizeGrid
let currentParticle = {x: 0, y: 0}
let maxTries = Infinity
let tries = 0
let white = 0
let total = sizeGrid * sizeGrid

let center = Math.floor(sizeGrid/2)
let distance = 25
let min = Math.max(0, center-distance)
let max = Math.min(sizeGrid-1, center+distance)

let directions = [
    { x: 1, y: 0 },  // right
    { x: -1, y: 0 }, // left
    { x: 0, y: 1 },  // down
    { x: 0, y: -1 },  // up


    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
];

let corners = [
    { x: 0, y: 0 },  // right
    { x: sizeGrid-1, y: 0 }, // left
    { x: 0, y: sizeGrid-1 },  // down
    { x: sizeGrid-1, y: sizeGrid-1 }  // up
];

function setup(){
    createCanvas(WIDTH, HEIGHT)
    for(let i = 0; i < sizeGrid; i++){
        grid[i] = []
        newGrid[i] = []
        for(let j = 0; j < sizeGrid; j++){
            grid[i][j] = 0
            newGrid[i][j] = 0
        }
    }
    grid[center][center] = 1
    noStroke()
}

function gaussianBlur(){
    for(let i = 0; i < sizeGrid; i++){
        for(let j = 0; j < sizeGrid; j++){
            let sum = 0
            if(i - 1 >= 0) sum += grid[i-1][j]
            if(i + 1 < sizeGrid) sum += grid[i+1][j]
            if(j - 1 >= 0) sum += grid[i][j-1]
            if(j + 1 < sizeGrid) sum += grid[i][j+1]
            sum /= 4
            newGrid[i][j] = sum
        }
    }
    grid = newGrid
}

//moves randomly the particle and if it touches a cell that is already occupied, it stops and a new particle is created
function moveParticle() {
    
    if(grid[currentParticle.x][currentParticle.y] > 0){
        createNewParticle()
        return
    }

    // Choose a random direction
    let dir = directions[Math.floor(Math.random()*directions.length)]
    let newPos = {x: 0, y: 0}
    newPos.x = currentParticle.x + dir.x;
    newPos.y = currentParticle.y + dir.y;
    newPos.x = clamp(newPos.x, min, max)
    newPos.y = clamp(newPos.y, min, max)

    if(grid[newPos.x][newPos.y] > 0){
        if(grid[currentParticle.x][currentParticle.y] == 0) white++
        grid[currentParticle.x][currentParticle.y]++
        grid[newPos.x][newPos.y]++
        createNewParticle()
        return true
    }
    else{
        currentParticle.x = newPos.x 
        currentParticle.y = newPos.y
        tries++
        if(tries > maxTries){
            createNewParticle()
            tries = 0
        }
        return false
    }
}

function updateBoundaries(){
    distance = clamp(distance+2, 0, Math.floor(sizeGrid/2))
    min = Math.max(0, center-distance)
    max = Math.min(sizeGrid-1, center+distance)
}

function createNewParticle() {
    // let corners = [
    //     { x: 0, y: Math.floor(Math.random() * distance) },  // left
    //     { x: sizeGrid, y: Math.floor(Math.random() * distance) }, // right
    //     { x: Math.floor(Math.random() * distance), y: sizeGrid },  // down
    //     { x: Math.floor(Math.random() * distance), y: 0 }  // up
    // ];
    // let corner = corners[Math.floor(Math.random()*4)]
    let signX = Math.random() < 0.5 ? 1 : -1
    let signY = Math.random() < 0.5 ? 1 : -1
    let corner = {
        x: center + Math.floor(Math.random() * distance) * signX,
        y: center + Math.floor(Math.random() * distance) * signY
    }
    // let x, y
    // if(Math.random() < .5){
    //     if(Math.random() < .5) x = min
    //     else x = max
    //     y = Math.floor(Math.random() * distance) + min
    // }
    // else{
    //     if(Math.random() < .5) y = min
    //     else y = max
    //     x = Math.floor(Math.random() * distance) + min
    // }
    corner.x = clamp(corner.x, min, max)
    corner.y = clamp(corner.y, min, max)
    // x = clamp(x, min, max)
    // y = clamp(y, min, max)
    currentParticle = {
        x: corner.x,
        y: corner.y
    }
    // currentParticle.x = clamp(Math.floor(currentParticle.x + Math.random() * sizeGrid/5), min, max)
    // currentParticle.y = clamp(Math.floor(currentParticle.y + Math.random() * sizeGrid/5), min, max)
    if(white > distance*distance/2) updateBoundaries()
}

function mousePressed(){
    gaussianBlur()
}

function draw(){
    background(0)
    let iter = 0
    while(!moveParticle() && iter < 1000) iter++
    drawGrid()
}

function drawGrid(){
    noStroke()
    for(let i = 0; i < sizeGrid; i++){
        for(let j = 0; j < sizeGrid; j++){
            if(grid[i][j] > 0) fill(grid[i][j] * 40)
            else fill(0)
            rect(i*tamCell, j*tamCell, tamCell, tamCell)
        }
    }

    fill(255, 0, 0)
    rect(currentParticle.x*tamCell, currentParticle.y*tamCell, tamCell, tamCell)

    push()
    noFill()
    stroke(255, 0, 0)
    rectMode(CENTER)
    rect(center*tamCell, center*tamCell, distance*2*tamCell, distance*2*tamCell)
    pop()
}


function clamp(val, min, max){
    return Math.max(Math.min(val, max), min)
}