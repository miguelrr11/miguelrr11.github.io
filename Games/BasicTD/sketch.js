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

function keyPressed(){
    game.keyPressed(key)
}

async function setup(){
    createCanvas(WIDTH, HEIGHT)
    let font = await loadFont('font.ttf')
    textFont(font)
    game = new Game()
}


function draw(){
    background(240)

    dt = deltaTime
    //if(keyIsPressed) dt *= 15

    game.update()

    if(keyIsPressed && keyCode == 32){
        for(let i = 0; i < 50; i++) game.update()
    }

    game.render()
}
