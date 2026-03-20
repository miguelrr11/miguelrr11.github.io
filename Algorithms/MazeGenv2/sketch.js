//Maze Generator v2
//Miguel Rodríguez
//20-03-2026

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 800

let maze

function setup(){
    createCanvas(WIDTH, HEIGHT)
    background(255)
    maze = new Maze()
}

function keyPressed(){
    background(255)
    maze = new Maze()
}

function draw(){
    for(let i = 0; i < 1000; i++) maze.step()
}
