//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
let game

function setup(){
    createCanvas(WIDTH, HEIGHT)
    game = new Game()
}

function draw(){
    background(0)
    game.update()
    game.show()
}
