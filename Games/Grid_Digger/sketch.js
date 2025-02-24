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

    // let fov = PI / 2;
    // let gridSize = WIDTH
    // let camZ = gridSize / (2 * tan(fov / 2));
    // perspective(fov, width / height, 0.1, 10000);
    // camera(0, 0, camZ, 0, 0, 0, 0, 1, 0);

    //emptyChunk()
}

function draw(){
    //translate(-width/2, -height/2)
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
    console.log(currentChunk[x][y])
    // let distance = Math.random() * 15 * cellPixelSize
    // for(let i = 0; i < cellsPerRow; i++){
    //     for(let j = 0; j < cellsPerRow; j++){
    //         let d = dist(mouseX, mouseY, i * cellPixelSize, j * cellPixelSize)
    //         if(d < distance){
    //             currentChunk[i][j].hp -= Math.floor(map(d, 0, distance, maxHealthCell, 0)) 
    //             if(currentChunk[i][j].hp < 0) currentChunk[i][j].hp = 0
    //         }
    //     }
    // }

    // console.log(currentChunk[x][y])

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


function bomb(x, y, tamInCells){
    
    let distance = tamInCells * cellPixelSize
    for(let i = 0; i < cellsPerRow; i++){
        for(let j = 0; j < cellsPerRow; j++){
            let d = dist(x, y, i * cellPixelSize, j * cellPixelSize)
            if(d < distance){
                currentChunk[i][j].hp -= Math.floor(map(d, 0, distance, maxHealthCell, 0)) 
                if(currentChunk[i][j].hp < 0) currentChunk[i][j].hp = 0
            }
        }
    }

}