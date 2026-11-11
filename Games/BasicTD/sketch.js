//Basic TD
//Miguel Rodríguez
//11-11-2026

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let game

function mouseClicked(){
    game.plantTower(mouseX, mouseY)
}

function setup(){
    createCanvas(WIDTH, HEIGHT)

    game = new Game()
}


function draw(){
    background(255)

    game.update()
    game.render()
}
