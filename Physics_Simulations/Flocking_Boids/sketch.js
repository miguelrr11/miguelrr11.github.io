//Flocking Boids v2
//Miguel Rodríguez
//03-10-2024

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 800

let boids = []
const nBoids = 1000

let res = 40
let cols = Math.floor(WIDTH/res)
let rows = Math.floor(WIDTH/res)
let grid = new Array(cols)

let panel

function setup(){
    createCanvas(WIDTH, HEIGHT)
    for(let i = 0; i < nBoids; i++){
        boids.push(new Boid())
    }
    for(let i = 0; i < cols; i++){
        grid[i] = []
        for(let j = 0; j < rows; j++){
            grid[i][j] = []
        }
    }

    stroke(0)
    fill(255, 200)
    panel = new Panel()
    panel.addText("FLOCKING BOIDS", true)
    panel.addSlider(0, 5, 1.5, "Separation", true)
    panel.addSlider(0, 5, 1, "Cohesion", true)
    panel.addSlider(0, 5, 3, "Alignment", true)
    panel.addText()
}

function draw(){
    background(0)

    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j] = []
        }
    }

    for(let b of boids){
        let col = floor(b.pos.x / res)
        let row = floor(b.pos.y / res)
        col = constrain(col, 0, cols - 1)
        row = constrain(row, 0, rows - 1)
        grid[col][row].push(b)
    }

    for(let b of boids){
        let col = floor(b.pos.x / res)
        let row = floor(b.pos.y / res)
        col = constrain(col, 0, cols - 1)
        row = constrain(row, 0, rows - 1)
        
        b.update(grid[col][row], panel.getValue(0), panel.getValue(1), panel.getValue(2))
        b.show()
    }

    // for(let b of boids){
    //     b.update(boids, panel.getValue(0) * panel.getValue(0), panel.getValue(1), panel.getValue(2), panel.getValue(3))
    //     b.show()
    // }

    panel.setText(1, "FPS: " + floor(frameRate()))
    panel.update()
    panel.show()
}
