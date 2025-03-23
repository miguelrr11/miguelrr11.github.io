//Simply5 
//Miguel Rodríguez
//23-03-2025

const WIDTH = 600
const HEIGHT = 600

function setup(){
    createCanvas(WIDTH, HEIGHT)
    rectMode(CENTER)
    stroke([255, 0, 0])
    strokeWeight(10)
    noFill()
    background(0)
}

function mouseDragged(){
    point(mouseX, mouseY)
}


function draw(){
    console.log(mouseIsDragged)
}
