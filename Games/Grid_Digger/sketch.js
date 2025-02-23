//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true


let currentChunk, chunkUp, chunkDown, chunkLeft, chunkRight
let player, anims, curLightMap, transitionLightMap

let SHOW_DEBUG = false

function setup(){
    createCanvas(WIDTH, HEIGHT)
    loadChunks(0, 0)
    prepareSpawn()
    player = new Player()
    anims = new AnimationManager()
    initLighting()
    initMinimap()
    console.log('--------------------------------')

    //emptyChunk()
}

function draw(){
    background(0)
    computeLightingGrid(curLightMap)
    player.update()
    anims.update()
    
    // translate(-player.pos.x * cellPixelSize, -player.pos.y * cellPixelSize)
    // scale(2)

    showChunk()
    player.show()
    anims.show()

    updateMinimap()
    showMinimap()
}

function mouseClicked(){
    let x = floor(mouseX / cellPixelSize)
    let y = floor(mouseY / cellPixelSize)
    currentChunk[x][y].illuminate()
    console.log(curLightMap.lightingGrid[x][y])
}

function mouseDragged(){
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