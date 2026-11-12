//Basic TD
//Miguel Rodríguez
//11-11-2026

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 680
const HEIGHT_UI = 80

let game

function mouseClicked(){
    game.click(mouseX, mouseY)
}

function doubleClicked(){
    game.dbClick(mouseX, mouseY)
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
