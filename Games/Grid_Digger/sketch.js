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
    loadAllSounds()
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

function keyPressed(){
    let offset = 1
    if(keyCode == 65) moveToChunk(-offset, 0)       //a
    else if(keyCode == 68) moveToChunk(offset, 0)   //d
    else if(keyCode == 87) moveToChunk(0, offset)   //w
    else if(keyCode == 83) moveToChunk(0, -offset)  //s
    else if(keyCode == 80) generateImageMap(3)      //p
}

// function mousePressed(){
//     let x = floor(mouseX / cellPixelSize)
//     let y = floor(mouseY / cellPixelSize)
//     currentChunk[x][y].convertIntoAir()
// }



function bomb(x, y, tamInCells){
    let distance = tamInCells
    for(let i = 0; i < cellsPerRow; i++){
        for(let j = 0; j < cellsPerCol; j++){
            let d = dist(x, y, i, j)
            if(d < distance){
                if(d < distance * 0.8) currentChunk[i][j].damage(1000)
                else currentChunk[i][j].damage(10 * Math.exp(-1 * (d / distance)))
            }
        }
    }
}