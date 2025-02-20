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

function moveToChunk(dx, dy){
    saveChunk(currentChunk, currentChunkPos.x, currentChunkPos.y)
    loadChunks(currentChunkPos.x + dx, currentChunkPos.y + dy)
    currentChunkPos.x += dx
    currentChunkPos.y += dy
    console.log('--------------------------------')
    console.log('moved to chunk' + ' x: ' + currentChunkPos.x + ' y: ' + currentChunkPos.y)
    console.log('--------------------------------')
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

function showChunk(){
    for(let i = 0; i < currentChunk.length; i++){
        for(let j = 0; j < currentChunk[i].length; j++){
            currentChunk[i][j].show()
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