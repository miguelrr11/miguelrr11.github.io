//it loads a chunk reconstructing each cell from a csv string
function loadChunk(x, y){
    let chunk = []
    if(chunks.has(x + ',' + y)){
        console.log('loading chunk' + ' x: ' + x + ' y: ' + y)
        let csvCells = chunks.get(x + ',' + y).split('\n')
        for(let i = 0; i < cellsPerRow; i++){
            chunk[i] = []
            for(let j = 0; j < cellsPerRow; j++){
                let properties = csvCells[i*cellsPerRow + j].split(',')
                //material, hp, illuminated
                let material = parseInt(properties[0])
                let hp = parseInt(properties[1])
                let illuminated = parseInt(properties[2]) == 1 ? true : false
                let rnd = parseFloat(properties[3])
                let biome = parseInt(properties[4])
                chunk[i][j] = new Cell(i, j, material, hp, illuminated, rnd, biome)
            }
        }
    }
    return chunk
}

function emptyChunk(){
    for(let i = 0; i < cellsPerRow; i++){
        for(let j = 0; j < cellsPerRow; j++){
            currentChunk[i][j].hp = 0
        }
    }
}

function getBiome(x, y){
    //if the point is inseide a circle of center (0, 0) and radius 15, then is biome 1
    let distance = dist(x, y, 0, 0)
    if(distance < 15) return 1
    //else the a sqaure of sides 60x60 centered in (0, 0) is cut into 4 pieces, diagonally
    if(y >= x && y >= -x) return 2
    if(y <= x && y >= -x) return 3
    if(y <= x && y <= -x) return 4
    if(y >= x && y <= -x) return 5

    //si en un futuro quiero poner un bioma de transicion entre biomas tengo que quitar las igualdades (quedarme con < o >)
    //y poner aqui un return 6
}


function generateChunk(x, y){
    let newChunk = []
    console.log('generating chunk' + ' x: ' + x + ' y: ' + y)  
    for(let i = 0; i < cellsPerRow; i++){
        let row = []
        for(let j = 0; j < cellsPerRow; j++){
            let air = willBeAir(i, j, x, y)
            let material
            if(air == 0) material = 0
            else material = willBeMaterial(i, j, x, y)
            let biome = getBiome(x, y)
            let newCell = new Cell(i, j, material, air, undefined, undefined, biome)
            row.push(newCell)
        }
        newChunk.push(row)
    }
    return newChunk
}

function isWall(chunk, x, y){
    return chunk[x][y].hp > 0 ? true : false
}

function isIluminated(chunk, x, y){
    return chunk[x][y].illuminated
}

function hitCell(chunk, x, y){
    let actualX = x  
    let acutalY = y
    if(chunk != currentChunk){
        if(y == cellsPerRow-1) acutalY = -1
        if(x == cellsPerRow-1) acutalX = -1
        if(x == 0) actualX = cellsPerRow
        if(y == 0) actualY = cellsPerRow
    }
    chunk[x][y].hit(actualX, acutalY)
}

function getChunkNeighbor(dx, dy){
    if(dx == 0 && dy == 1) return chunkUp
    if(dx == 0 && dy == -1) return chunkDown
    if(dx == 1 && dy == 0) return chunkRight
    if(dx == -1 && dy == 0) return chunkLeft
}

function moveToChunk(dx, dy){
    updateExploredMinimap()
    const neighborChunk = getChunkNeighbor(dx, dy);
    transitionToChunk(neighborChunk);
    
    saveChunk(currentChunk, currentChunkPos.x, currentChunkPos.y);
    saveChunk(chunkLeft, currentChunkPos.x-1, currentChunkPos.y);
    saveChunk(chunkRight, currentChunkPos.x+1, currentChunkPos.y);
    saveChunk(chunkUp, currentChunkPos.x, currentChunkPos.y+1);
    saveChunk(chunkDown, currentChunkPos.x, currentChunkPos.y-1);
    
}



function isThereAwall(chunk, x, y){
    return chunk[x][y].hp > 0 ? true : false
}

function willBeMaterial(i, j, cx, cy){
    let offsetX = cx * deltaMat1 * cellsPerRow
    let offsetY = cy * deltaMat1 * cellsPerRow
    let noiseVal = noise(i * deltaMat1 + offsetX, j * deltaMat1 + offsetY)
    let material = noiseVal > 0.55 && noiseVal < 0.59 ? true : false
    if(material) return 1

    offsetX = cx * deltaMat2 * cellsPerRow + offsetMat2
    offsetY = cy * deltaMat2 * cellsPerRow + offsetMat2
    noiseVal = noise(i * deltaMat2 + offsetX, j * deltaMat2 + offsetY)
    material = noiseVal > 0.725 && noiseVal < 0.95 ? true : false
    if(material) return 2

    offsetX = cx * deltaMat3 * cellsPerRow
    offsetY = cy * deltaMat3 * cellsPerRow
    noiseVal = noise(i * deltaMat3 + offsetX, j * deltaMat3 + offsetY)
    material = noiseVal > 0.75 ? true : false
    if(material) return 3

    return 0
}

function willBeAir(i, j, cx, cy){
    let offsetX = cx * deltaAir * cellsPerRow
    let offsetY = cy * deltaAir * cellsPerRow
    let noiseVal = noise(i * deltaAir + offsetX, j * deltaAir + offsetY)
    let noiseVal2 = noise(i * deltaAir + offsetX + offsetAir2, j * deltaAir + offsetY + offsetAir2)
    let isAir = (noiseVal > 0.5 && noiseVal < 0.5+airWidth) || (noiseVal2 > 0.5 && noiseVal2 < 0.5+airWidth) ? 0 : maxHealthCell
    //|| (noiseVal > 0.5+airSeparation && noiseVal < 0.5+airWidth+airSeparation) ||
    //(noiseVal > 0.5-airSeparation && noiseVal < 0.5+airWidth-airSeparation)? 1 : 0
    return isAir
}

//sets transitionChunkPos based on what neighbor chunk is being transitioned to
function transitionToChunk(chunk){
    transitioning = true
    transitionChunk = chunk
    transitionLightMap.chunk = chunk
    computeLightingGrid(transitionLightMap)
    computeLightingGrid(curLightMap, true)
    switch(chunk){
        case chunkLeft:
            transitionChunkPos = createVector(-1, 0)
            break
        case chunkRight:
            transitionChunkPos = createVector(1, 0)
            break
        case chunkUp:
            transitionChunkPos = createVector(0, 1)
            break
        case chunkDown:
            transitionChunkPos = createVector(0, -1)
            break
        default: console.log('error')
    }
}

function showChunk() {
    push()
    if (transitioning) {
        let progress = 1 - transitionFramesCounter / transitionFrames;
        let smoothFactor = 1 - Math.pow(1 - progress, 3);

        push();
        translate(
            (1 - smoothFactor) * transitionChunkPos.x * WIDTH,
            -(1 - smoothFactor) * transitionChunkPos.y * HEIGHT
        );
        for (let i = 0; i < transitionChunk.length; i++) {
            for (let j = 0; j < transitionChunk[i].length; j++) {
                transitionChunk[i][j].show(transitionLightMap.lightingGrid);
            }
        }
        pop();

        push();
        translationPlayer = createVector(
            (1 - smoothFactor) * transitionChunkPos.x * WIDTH,
            -(1 - smoothFactor) * transitionChunkPos.y * HEIGHT
        );
        translate(
            -smoothFactor * transitionChunkPos.x * WIDTH,
            smoothFactor * transitionChunkPos.y * HEIGHT
        );
        for (let i = 0; i < currentChunk.length; i++) {
            for (let j = 0; j < currentChunk[i].length; j++) {
                currentChunk[i][j].show(curLightMap.lightingGrid);
            }
        }
        pop();

        transitionFramesCounter--;
        if (transitionFramesCounter <= 0) {
           
            transitioning = false;
            transitionFramesCounter = transitionFrames;
            currentChunkPos.x += transitionChunkPos.x;
            currentChunkPos.y += transitionChunkPos.y;
            loadChunks(
                currentChunkPos.x,
                currentChunkPos.y
            );
            curLightMap.chunk = currentChunk
            translationPlayer = createVector(0, 0)
            player.oldPos = undefined
        }
    } 
    else {
        for (let i = 0; i < currentChunk.length; i++) {
            for (let j = 0; j < currentChunk[i].length; j++) {
                if(SHOW_DEBUG) currentChunk[i][j].showDebug();
                else currentChunk[i][j].show(curLightMap.lightingGrid);
            }
        }
    }
    pop()
}


//saves the chunk in the map as a string
function saveChunk(chunk, x, y){
    console.log('saving chunk' + ' x: ' + x + ' y: ' + y)
    let csv = ''
    for(let i = 0; i < chunk.length; i++){
        for(let j = 0; j < chunk[i].length; j++){
            let illuminated = chunk[i][j].illuminated ? 1 : 0
            csv += chunk[i][j].material + ',' + chunk[i][j].hp + ',' + illuminated +  ',' + chunk[i][j].rnd + '\n'
        }
    }
    chunks.set(x + ',' + y, csv)
}

function loadChunks(x, y){
    let offset = 1
    console.log('left')
    if(!chunks.has((x-offset) + ',' + y)){
        chunkLeft = generateChunk(x-offset, y)
        saveChunk(chunkLeft, x-offset, y)
    }
    else chunkLeft = loadChunk(x-offset, y)
    console.log('right')
    if(!chunks.has((x+offset) + ',' + y)){
        chunkRight = generateChunk(x+offset, y)
        saveChunk(chunkRight, x+offset, y)
    }
    else chunkRight = loadChunk(x+offset, y)
    console.log('up')
    if(!chunks.has(x + ',' + (y+offset))){
        chunkUp = generateChunk(x, y+offset)
        saveChunk(chunkUp, x, y+offset)
    }
    else chunkUp = loadChunk(x, y+offset)
    console.log('down')
    if(!chunks.has(x + ',' + (y-offset))){
        chunkDown = generateChunk(x, y-offset)
        saveChunk(chunkDown, x, y-offset)
    }
    else chunkDown = loadChunk(x, y-offset)
    console.log('cur')
    if (!chunks.has(x + ',' + y)) {
        currentChunk = generateChunk(x, y)
        saveChunk(currentChunk, x, y)
    } 
    else {
        currentChunk = loadChunk(x, y)
    }
    
}

//generates a circle of air in the middle of the chunk
function prepareSpawn(){
    translationPlayer = createVector(0, 0)
    currentChunkPos = createVector(0, 0)
    let radius = 5
    for(let i = 0; i < currentChunk.length; i++){
        for(let j = 0; j < currentChunk[i].length; j++){
            let distance = dist(i, j, floor(cellsPerRow/2), floor(cellsPerRow/2))
            if(distance < radius){
                currentChunk[i][j].convertIntoAir()
            }
        }
    }
}

// randomly sets a material to the current chunk
function debug(){
    for(let i = 0; i < currentChunk.length; i++){
        for(let j = 0; j < currentChunk[i].length; j++){
            let material = floor(random(1, 4))
            currentChunk[i][j].material = material
        }
    }
}

function eraseAllMaterials(){
    for(let i = 0; i < currentChunk.length; i++){
        for(let j = 0; j < currentChunk[i].length; j++){
            currentChunk[i][j].material = 0
        }
    }
}