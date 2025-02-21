//if it does not exist, it creates a new chunk, if it does, it loads it (reconstructing the objects)
function loadChunk(x, y){
    let chunk = []
    if(chunks.has(x + ',' + y)){
        console.log('loading chunk' + ' x: ' + x + ' y: ' + y)
        let serializedChunk = JSON.parse(chunks.get(x + ',' + y))
        for(let i = 0; i < cellsPerRow; i++){
            chunk[i] = []
            for(let j = 0; j < cellsPerRow; j++){
                chunk[i][j] = new Cell(i, j, serializedChunk[i][j].material, serializedChunk[i][j].hp)
            }
        }
    }
    return chunk
}

function generateChunk(x, y){
    let newChunk = []
    console.log('generating chunk' + ' x: ' + x + ' y: ' + y)  
    for(let i = 0; i < cellsPerRow; i++){
        let row = []
        for(let j = 0; j < cellsPerRow; j++){
            let air = willBeAir(i, j, x, y)
            let material = (air != 5) && willBeMaterial(i, j, x, y)
            let newCell = new Cell(i, j, material, air)
            row.push(newCell)
        }
        newChunk.push(row)
    }
    return newChunk
}

function hitCell(chunk, x, y){
    if(chunk[x][y].hp > 0){
        chunk[x][y].hp--
    }
}

function getChunkNeighbor(dx, dy){
    if(dx == 0 && dy == 1) return chunkUp
    if(dx == 0 && dy == -1) return chunkDown
    if(dx == 1 && dy == 0) return chunkRight
    if(dx == -1 && dy == 0) return chunkLeft
}

function moveToChunk(dx, dy){
    transitionToChunk(getChunkNeighbor(dx, dy))
    saveChunk(currentChunk, currentChunkPos.x, currentChunkPos.y)
    saveChunk(chunkLeft, currentChunkPos.x-1, currentChunkPos.y)
    saveChunk(chunkRight, currentChunkPos.x+1, currentChunkPos.y)
    saveChunk(chunkUp, currentChunkPos.x, currentChunkPos.y+1)
    saveChunk(chunkDown, currentChunkPos.x, currentChunkPos.y-1)
}

function isThereAwall(chunk, x, y){
    return chunk[x][y].hp > 0 ? true : false
}

function willBeMaterial(i, j, cx, cy){
    let offsetX = cx * deltaMat1 * cellsPerRow
    let offsetY = cy * deltaMat1 * cellsPerRow
    let noiseVal = noise(i * deltaMat1 + offsetX, j * deltaMat1 + offsetY)
    let material = noiseVal > 0.725 && noiseVal < 0.95 ? true : false
    if(material) return 1

    offsetX = cx * deltaMat2 * cellsPerRow + offsetMat2
    offsetY = cy * deltaMat2 * cellsPerRow + offsetMat2
    noiseVal = noise(i * deltaMat2 + offsetX, j * deltaMat2 + offsetY)
    material = noiseVal > 0.725 && noiseVal < 0.95 ? true : false
    if(material) return 2

    offsetX = cx * deltaMat3 * cellsPerRow
    offsetY = cy * deltaMat3 * cellsPerRow
    noiseVal = noise(i * deltaMat3 + offsetX, j * deltaMat3 + offsetY)
    material = noiseVal > 0.8 ? true : false
    if(material) return 3

    return material
}

function willBeAir(i, j, cx, cy){
    let offsetX = cx * deltaAir * cellsPerRow
    let offsetY = cy * deltaAir * cellsPerRow
    let noiseVal = noise(i * deltaAir + offsetX, j * deltaAir + offsetY)
    let noiseVal2 = noise(i * deltaAir + offsetX + offsetAir2, j * deltaAir + offsetY + offsetAir2)
    let isAir = (noiseVal > 0.5 && noiseVal < 0.5+airWidth) || (noiseVal2 > 0.5 && noiseVal2 < 0.5+airWidth) ? 0 : 5
    //|| (noiseVal > 0.5+airSeparation && noiseVal < 0.5+airWidth+airSeparation) ||
    //(noiseVal > 0.5-airSeparation && noiseVal < 0.5+airWidth-airSeparation)? 1 : 0
    return isAir
}


function transitionToChunk(chunk){
    transitioning = true
    transitionChunk = chunk
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
                transitionChunk[i][j].show();
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
                currentChunk[i][j].show();
            }
        }
        pop();

        transitionFramesCounter--;
        if (transitionFramesCounter <= 0) {
            transitioning = false;
            transitionFramesCounter = transitionFrames;
            loadChunks(
                currentChunkPos.x + transitionChunkPos.x,
                currentChunkPos.y + transitionChunkPos.y
            );
            currentChunkPos.x += transitionChunkPos.x;
            currentChunkPos.y += transitionChunkPos.y;
            translationPlayer = createVector(0, 0)
        }
    } 
    else {
        for (let i = 0; i < currentChunk.length; i++) {
            for (let j = 0; j < currentChunk[i].length; j++) {
                currentChunk[i][j].show();
            }
        }
    }
}


//saves the chunk in the map as a string
function saveChunk(chunk, x, y){
    console.log('saving chunk' + ' x: ' + x + ' y: ' + y)
    chunks.set(x + ',' + y, JSON.stringify(chunk))
}

function loadChunks(x, y){
    let offset = 1
    if(!chunks.has((x-offset) + ',' + y)){
        chunkLeft = generateChunk(x-offset, y)
        saveChunk(chunkLeft, x-offset, y)
    }
    else chunkLeft = loadChunk(x-offset, y)

    if(!chunks.has((x+offset) + ',' + y)){
        chunkRight = generateChunk(x+offset, y)
        saveChunk(chunkRight, x+offset, y)
    }
    else chunkRight = loadChunk(x+offset, y)

    if(!chunks.has(x + ',' + (y+offset))){
        chunkUp = generateChunk(x, y+offset)
        saveChunk(chunkUp, x, y+offset)
    }
    else chunkUp = loadChunk(x, y+offset)

    if(!chunks.has(x + ',' + (y-offset))){
        chunkDown = generateChunk(x, y-offset)
        saveChunk(chunkDown, x, y-offset)
    }
    else chunkDown = loadChunk(x, y-offset)

    if(!chunks.has(x + ',' + y)){
        currentChunk = generateChunk(x, y)
    }
    else currentChunk = loadChunk(x, y)
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