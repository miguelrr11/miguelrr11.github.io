let minimap = []
let transparencies
let transparenciesBig
let minimapSize = 101
let minimapShowingSize = 9
let bigMinimapShowingSize = 28
let tamCellBigMinimap = 28
let midShowingSize = Math.floor(minimapShowingSize / 2)
let spawnLocation = Math.floor(minimapSize / 2)
let midBigShowingSize = Math.floor(bigMinimapShowingSize / 2)
let tamCellMinimap = 10
let totalTam = tamCellMinimap * minimapShowingSize
let maxDist = Math.sqrt(midShowingSize * midShowingSize + midShowingSize * midShowingSize) - 1.5
let maxDistBig = Math.sqrt(midBigShowingSize * midBigShowingSize + midBigShowingSize * midBigShowingSize) - 1.5

// Arc settings
let arcFlatness = tamCellMinimap * 3;  // Increase for a flatter arc
let arcAngleRange = Math.PI / 8; // Adjust: PI/4 = steeper, PI/8 = flatter
let arcRadius = midShowingSize * 1.1;

const SPAWN = 0
const PLAYER = 1
const EXPLORED = 2
const NOMATERIAL = 3
const UNEXPLORED = 4

const colSPAWN = hexToRgb('#c1121f')    //rojo
const colPLAYER = hexToRgb('#ffffff')   //blanco
const colEXPLORED = hexToRgb('#adb5bd')  //gris

let playerPosMinimap = {x: 0, y: 0}


function initTransparencies(){
    transparencies = []
    for(let i = 0; i < minimapShowingSize; i++){
        transparencies[i] = []
        for(let j = 0; j < minimapShowingSize; j++){
            let d = dist(i, j, midShowingSize, midShowingSize)
            transparencies[i][j] = mapp(d, 0, maxDist, 255, 0)
        }
    }
    transparenciesBig = []
    for(let i = 0; i < bigMinimapShowingSize; i++){
        transparenciesBig[i] = []
        for(let j = 0; j < bigMinimapShowingSize; j++){
            let d = dist(i, j, midBigShowingSize, midBigShowingSize)
            transparenciesBig[i][j] = mapp(d, 0, maxDistBig, 255, 0)
        }
    }
}

function updateMinimap(){
    let mPlayerX = currentChunkPos.x + spawnLocation
    let mPlayerY = - currentChunkPos.y + spawnLocation
    if(minimap[mPlayerX][mPlayerY] == UNEXPLORED) minimap[mPlayerX][mPlayerY] = EXPLORED

    playerPosMinimap.x = currentChunkPos.x + spawnLocation
    playerPosMinimap.y = - currentChunkPos.y + spawnLocation
}

function updateExploredMinimap(){
    // update if all materials have been recolected when exiting the chunk
    for(let i = 0; i < cellsPerRow; i++){
        for(let j = 0; j < cellsPerCol; j++){
            if(currentChunk[i][j].isMaterial()){
                return
            }
        }
    }
    let minimapPlayerX = currentChunkPos.x + spawnLocation
    let minimapPlayerY = - currentChunkPos.y + spawnLocation
    if(minimap[minimapPlayerX][minimapPlayerY] == EXPLORED) minimap[minimapPlayerX][minimapPlayerY] = NOMATERIAL
}

function showCoords(){
    push()
    fill(255, 200)
    noStroke()
    textFont('Arial')
    textAlign(CENTER, CENTER)
    textSize(10)
    text('x: ' + currentChunkPos.x + '    y: ' + currentChunkPos.y, totalTam/2, -5)
    pop()
}

function showFPS(){
    push()
    fill(255, 200)
    noStroke()
    textFont('Arial')
    textAlign(CENTER, CENTER)
    textSize(10)
    text(meanFPS, totalTam/2, totalTam)
    pop()
}

function showNparticles(){
    push()
    fill(255, 200)
    noStroke()
    textFont('Arial')
    textAlign(CENTER, CENTER)
    textSize(10)
    text(anims.nParticles, totalTam/2, totalTam + 15)
    pop()
}

function showMaterialsPlayer(){
    push()
    noStroke()
    textFont('Arial')
    textAlign(LEFT, CENTER)
    textSize(12)

    fill(colMat1)
    text(mat1Name + ': ' + player.mat1, totalTam + 0, 20)
    fill(colMat2)
    text(mat2Name + ': ' + player.mat2, totalTam + 0, 40)
    fill(colMat3)
    text(mat3Name + ': ' + player.mat3, totalTam + 0, 60)

    pop()
}

function showMiniMinimap(){
    translate(20, 20)
    noFill()
    //always draw the minimap centered in player
    let startI = playerPosMinimap.x - midShowingSize
    let startJ = playerPosMinimap.y - midShowingSize
    for(let i = startI; i < minimapShowingSize + startI; i++){
        for(let j = startJ; j < minimapShowingSize + startJ; j++){
            strokeWeight(.5)
            let trans = transparencies[i - startI][j - startJ]
            let col;
            switch(minimap[i][j]){
                case SPAWN: 
                    col = (colSPAWN)
                    break
                case EXPLORED:
                    col = (colEXPLORED)
                    break
                case NOMATERIAL:
                    col = (colEXPLORED)
                    break
                case UNEXPLORED:
                    col = [0, 0, 0]
                    break
                default: console.log('error')
                
            }
            if(i == playerPosMinimap.x && j == playerPosMinimap.y){
                col = (colPLAYER)
            }
            if(i == spawnLocation && j == spawnLocation){
                col = (colSPAWN)
            } 
            
            fill([...col, trans])
            stroke(20, trans)
            if(minimap[i][j] == UNEXPLORED){
                noFill()
            }
            let drawI = i - startI
            let drawJ = j - startJ
            rect(drawI*tamCellMinimap, drawJ*tamCellMinimap, tamCellMinimap, tamCellMinimap)
            if(minimap[i][j] == NOMATERIAL){
                stroke(20, trans)
                strokeWeight(1)
                //cross in cell
                line(drawI*tamCellMinimap + 1, drawJ*tamCellMinimap + 1, (drawI + 1)*tamCellMinimap - 1, (drawJ + 1)*tamCellMinimap - 1)
                line(drawI*tamCellMinimap + 1, (drawJ + 1)*tamCellMinimap - 1, (drawI + 1)*tamCellMinimap - 1, drawJ*tamCellMinimap + 1)
            }
        }
    }
}

function showBigMinimap(){
    let half = (midBigShowingSize*tamCellBigMinimap)
    let x = WIDTH/2 - half - midBigShowingSize
    let y = HEIGHT/2 - half + midBigShowingSize
    translate(x, y)
    noFill()
    //always draw the minimap centered in player
    let startI = playerPosMinimap.x - midBigShowingSize
    let startJ = playerPosMinimap.y - midBigShowingSize
    for(let i = startI; i < bigMinimapShowingSize + startI; i++){
        for(let j = startJ; j < bigMinimapShowingSize + startJ; j++){
            strokeWeight(.5)
            let trans = transparenciesBig[i - startI][j - startJ]
            let col;
            switch(minimap[i][j]){
                case SPAWN: 
                    col = (colSPAWN)
                    break
                case EXPLORED:
                    col = (colEXPLORED)
                    break
                case NOMATERIAL:
                    col = (colEXPLORED)
                    break
                case UNEXPLORED:
                    col = [0, 0, 0]
                    break
                default: console.log('error')
                
            }
            if(i == playerPosMinimap.x && j == playerPosMinimap.y){
                col = (colPLAYER)
            }
            if(i == spawnLocation && j == spawnLocation){
                col = (colSPAWN)
            } 
            
            fill([...col, trans])
            stroke(20, trans)
            if(minimap[i][j] == UNEXPLORED){
                noFill()
            }
            let drawI = i - startI
            let drawJ = j - startJ
            rect(drawI*tamCellBigMinimap, drawJ*tamCellBigMinimap, tamCellBigMinimap, tamCellBigMinimap)
            if(minimap[i][j] == NOMATERIAL){
                stroke(20, trans)
                strokeWeight(1)
                //cross in cell
                line(drawI*tamCellBigMinimap + 1, drawJ*tamCellBigMinimap + 1, (drawI + 1)*tamCellBigMinimap - 1, (drawJ + 1)*tamCellBigMinimap - 1)
                line(drawI*tamCellBigMinimap + 1, (drawJ + 1)*tamCellBigMinimap - 1, (drawI + 1)*tamCellBigMinimap - 1, drawJ*tamCellBigMinimap + 1)
            }
        }
    }
}

function showMinimap(){
    push()
    if(keyIsPressed && keyCode == 32) showBigMinimap()
    else showMiniMinimap()
    drawSpawnOutsideMinimap()
    showCoords()
    showFPS()
    showNparticles()
    showMaterialsPlayer()
    pop()
}

function isItOutside(i, j){
    return i < 0 || i >= minimapShowingSize ||
           j < 0 || j >= minimapShowingSize || 
           transparencies[i][j] == undefined || 
           transparencies[i][j] <= 0
}

function drawSpawnOutsideMinimap() {
    let drawI = spawnLocation - playerPosMinimap.x + midShowingSize;
    let drawJ = spawnLocation - playerPosMinimap.y + midShowingSize;
    //is the spawn transparent?
    if (isItOutside(drawI, drawJ)) {
        push();
        translate(tamCellMinimap / 2, tamCellMinimap / 2);
        let angle = Math.atan2(drawJ - midShowingSize, drawI - midShowingSize);
        let arcX = Math.cos(angle) * arcRadius + midShowingSize;
        let arcY = Math.sin(angle) * arcRadius + midShowingSize;

        noFill();
        strokeWeight(1.5);
        stroke(colSPAWN);
        arc(arcX * tamCellMinimap, arcY * tamCellMinimap, 
            arcFlatness, arcFlatness, 
            angle - arcAngleRange, angle + arcAngleRange);

        pop();
    }
    
}

function initMinimap(){
    for(let i = 0; i < minimapSize; i++){
        minimap.push([])
        for(let j = 0; j < minimapSize; j++){
            minimap[i].push(UNEXPLORED)
        }
    }
    minimap[spawnLocation][spawnLocation] = SPAWN
    initTransparencies()
}