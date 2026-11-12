//Basic TD
//Miguel Rodríguez
//11-11-2026

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 680
const HEIGHT_UI = 80

let game, dt

function mouseClicked(){
    game.click(mouseX, mouseY)
}

function doubleClicked(){
    game.dbClick(mouseX, mouseY)
}

async function setup(){
    createCanvas(WIDTH, HEIGHT)
    let font = await loadFont('font.ttf')
    textFont(font)
    game = new Game()
}


function draw(){
    background(255)

    dt = deltaTime
    if(keyIsPressed) dt *= 15

    game.update()
    game.render()
}
