//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true


let currentChunk, chunkUp, chunkDown, chunkLeft, chunkRight
let player

function setup(){
    createCanvas(WIDTH, HEIGHT)
    loadChunks(0, 0)
    prepareSpawn()
    player = new Player()
    console.log('--------------------------------')
}

function draw(){
    background(0)
    push()
    showChunk()
    pop()
    player.update()
    player.show()
}

// function keyReleased(){
//     let offset = 1
//     if(keyCode == LEFT_ARROW) moveToChunk(-offset, 0)
//     else if(keyCode == RIGHT_ARROW) moveToChunk(offset, 0)
//     else if(keyCode == UP_ARROW) moveToChunk(0, -offset)
//     else if(keyCode == DOWN_ARROW) moveToChunk(0, offset)
// }

// function mousePressed(){
//     let x = floor(mouseX / cellPixelSize)
//     let y = floor(mouseY / cellPixelSize)
//     currentChunk[x][y].convertIntoAir()
// }