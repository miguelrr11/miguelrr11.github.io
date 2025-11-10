//
//Miguel Rodríguez
//
/*
Tic Tac Toe Game Tree Visualization
State Space Visualization of Tic Tac Toe using p5.js
*/

p5.disableFriendlyErrors = true
const WIDTH = 1000
const HEIGHT = 750

let graph

function setup(){
    createCanvas(WIDTH, HEIGHT)
    graph = new Graph()
}

function draw(){
    background(0)
    graph.updatePhysicsAndShow()
}
