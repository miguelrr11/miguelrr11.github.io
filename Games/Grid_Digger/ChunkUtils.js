//it loads a chunk reconstructing each cell from a csv string
function loadChunk(x, y){
    let chunk = []
    let biome = getBiome(x, y)
    if(chunks.has(x + ',' + y)){
        console.log('loading chunk' + ' x: ' + x + ' y: ' + y)
        let csvCells = chunks.get(x + ',' + y).split('\n')
        for(let i = 0; i < cellsPerRow; i++){
            chunk[i] = []
            for(let j = 0; j < cellsPerCol; j++){
                let cell = csvCells[i*cellsPerCol + j]
                let properties = cell.split(',')
                //material, hp, illuminated
                let material = parseInt(properties[0])
                let hp = properties[1] == 'i' ? Infinity : parseInt(properties[1])
                let illuminated = parseInt(properties[2]) == 1 ? true : false
                let rnd = parseFloat(properties[3])
                if(material == 5) chunk[i][j] = new Cell_exp(i, j, material, hp, illuminated, rnd, getBiome(x, y))
                else if(biome == 1) chunk[i][j] = new Cell_1(i, j, material, hp, illuminated, rnd)
                else if(biome == 2) chunk[i][j] = new Cell_2(i, j, material, hp, illuminated, rnd)
                else if(biome == 3) chunk[i][j] = new Cell_3(i, j, material, hp, illuminated, rnd)
                else if(biome == 4) chunk[i][j] = new Cell_4(i, j, material, hp, illuminated, rnd)
                else if(biome == 5) chunk[i][j] = new Cell_5(i, j, material, hp, illuminated, rnd)
            }
        }
    }
    return chunk
}

function emptyChunk(){
    for(let i = 0; i < cellsPerRow; i++){
        for(let j = 0; j < cellsPerCol; j++){
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

function getCurrentFloorColor(){
    let biome = getBiome(currentChunkPos.x, currentChunkPos.y)
    if(biome == 1) return colSueloBioma1
    else if(biome == 2) return colSueloBioma2
    else if(biome == 3) return colSueloBioma3
    else if(biome == 4) return colSueloBioma4
    else if(biome == 5) return colSueloBioma5
}


function generateChunk(x, y){
    let newChunk = []
    console.log('generating chunk' + ' x: ' + x + ' y: ' + y)  
    let biome = getBiome(x, y)
    for(let i = 0; i < cellsPerRow; i++){
        let row = []
        for(let j = 0; j < cellsPerCol; j++){
            let hp = willBeAir(i, j, x, y)
            let material
            if(hp == 0) material = 0
            else material = willBeMaterial(i, j, x, y)
            if(material != 0) hp = maxHealthCellMat
            if(hp == 0 && random() < 0.2) row.push(new Cell_exp(i, j, material, hp, undefined, undefined, biome)) 
            else if(biome == 1) row.push(new Cell_1(i, j, material, hp))
            else if(biome == 2) row.push(new Cell_2(i, j, material, hp))
            else if(biome == 3) row.push(new Cell_3(i, j, material, hp))
            else if(biome == 4) row.push(new Cell_4(i, j, material, hp))
            else if(biome == 5) row.push(new Cell_5(i, j, material, hp))
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

function getAnimationPos(chunk, x, y){
    let actualX = x  
    let acutalY = y
    if(chunk != currentChunk){
        if(y == cellsPerCol-1) acutalY = -1
        if(x == cellsPerRow-1) acutalX = -1
        if(x == 0) actualX = cellsPerRow
        if(y == 0) actualY = cellsPerCol
    }
    return [actualX, acutalY]
}

function hitCell(chunk, x, y){
    let [actualX, acutalY] = getAnimationPos(chunk, x, y)
    chunk[x][y].hit(actualX, acutalY)
}

function getChunkNeighbor(dx, dy){
    if(dx == 0 && dy == 1) return chunkUp
    if(dx == 0 && dy == -1) return chunkDown
    if(dx == 1 && dy == 0) return chunkRight
    if(dx == -1 && dy == 0) return chunkLeft
}

function checkPlayerBoundaries(dx, dy){
    let finalX = currentChunkPos.x + dx
    let finalY = currentChunkPos.y + dy
    if(finalX < -30 || finalX > 30 || finalY < -30 || finalY > 30) return false
    return true
}

function moveToChunk(dx, dy){
    let access = checkPlayerBoundaries(dx, dy)
    if(!access) return
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
    let offsetY = -cy * deltaMat1 * cellsPerCol
    let noiseVal = noise(i * deltaMat1 + offsetX, j * deltaMat1 + offsetY)
    let material = noiseVal > 0.55 && noiseVal < 0.59 ? true : false
    if(material) return 1

    offsetX = cx * deltaMat2 * cellsPerRow + offsetMat2
    offsetY = -cy * deltaMat2 * cellsPerCol + offsetMat2
    noiseVal = noise(i * deltaMat2 + offsetX, j * deltaMat2 + offsetY)
    material = noiseVal > 0.725 && noiseVal < 0.95 ? true : false
    if(material) return 2

    offsetX = cx * deltaMat3 * cellsPerRow
    offsetY = -cy * deltaMat3 * cellsPerCol
    noiseVal = noise(i * deltaMat3 + offsetX, j * deltaMat3 + offsetY)
    material = noiseVal > 0.75 ? true : false
    if(material) return 3

    return 0
}

function willBeAir(i, j, cx, cy){
    let offsetX = cx * deltaAir * cellsPerRow
    let offsetY = -cy * deltaAir * cellsPerCol
    let noiseVal = noise(i * deltaAir + offsetX, j * deltaAir + offsetY)
    let noiseVal2 = noise(i * deltaAir + offsetX + offsetAir2, j * deltaAir + offsetY + offsetAir2)
    let offsetX2 = cx * deltaUnd * cellsPerRow
    let offsetY2 = cy * deltaUnd * cellsPerCol
    let noiseVal3 = noise(i * deltaUnd + offsetX2 + offsetUnd, j * deltaUnd + offsetY2)
    if(noiseVal3 > 0.65 && noiseVal3 < 0.65+undWidth)  return Infinity
    if(noiseVal > 0.5 && noiseVal < 0.5+airWidth) return floor(map(noiseVal, 0.5, 0.5+airWidth, 0, maxHealthCell))
    if(noiseVal2 > 0.5 && noiseVal2 < 0.5+airWidth) return floor(map(noiseVal2, 0.5, 0.5+airWidth, 0, maxHealthCell))
    return maxHealthCell
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
        for (let i = 0; i < transitionChunk.length; i++) {
            for (let j = 0; j < transitionChunk[i].length; j++) {
                transitionChunk[i][j].showLight(transitionLightMap.lightingGrid);
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
        for (let i = 0; i < currentChunk.length; i++) {
            for (let j = 0; j < currentChunk[i].length; j++) {
                currentChunk[i][j].showLight(curLightMap.lightingGrid);
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
        for (let i = 0; i < currentChunk.length; i++) {
            for (let j = 0; j < currentChunk[i].length; j++) {
                if(SHOW_DEBUG) currentChunk[i][j].showDebug();
                else currentChunk[i][j].showLight(curLightMap.lightingGrid);
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
            let hp = chunk[i][j].und ? 'i' : chunk[i][j].hp
            csv += chunk[i][j].material + ',' + 
            hp + ',' + 
            illuminated +  ',' + 
            chunk[i][j].rnd
            //if last, do not add \n
            if(i == chunk.length - 1 && j == chunk[i].length - 1) break
            csv += '\n'
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
            let distance = dist(i, j, floor(cellsPerRow/2), floor(cellsPerCol/2))
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
/* 
type 1 = biome
type 2 = material
type 3 = both
*/
// BUG: solo funciona para mapas con chunks cuadrados
function generateImageMap(type = 1) {
    // Generates an image representation of the entire map
    let imgSizeX = cellsPerRow * mapSize;
    let imgSizeY = cellsPerCol * mapSize;
    let img = createImage(imgSizeX, imgSizeY);
    img.loadPixels();

    for (let j = 0; j < mapSize; j++) {
        for (let i = 0; i < mapSize; i++) {
            let chunk = generateChunk(j-30, i-30);
            for (let l = 0; l < cellsPerRow; l++) {
                for (let k = 0; k < cellsPerCol; k++) {
                    let index = ((i * cellsPerRow + k) + (j * cellsPerCol + l) * imgSizeX) * 4;
                    let bioma = getBiome(j-30, i-30);
                    let color
                    if(type == 1){
                        if(bioma == 1) color = chunk[l][k].hp == maxHealthCell ? colRocaBioma1 : colSueloBioma1;
                            else if(bioma == 2) color = chunk[l][k].hp == maxHealthCell ? colSueloBioma2 : colRocaBioma2;
                            else if(bioma == 3) color = chunk[l][k].hp == maxHealthCell ? colSueloBioma3 : colRocaBioma3;
                            else if(bioma == 4) color = chunk[l][k].hp == maxHealthCell ? colSueloBioma4 : colRocaBioma4;
                            else if(bioma == 5) color = chunk[l][k].hp == maxHealthCell ? colSueloBioma5 : colRocaBioma5;
                    }
                    else if(type == 2){
                        if(chunk[l][k].und) color = colUnd
                        let material = chunk[l][k].material
                        if(material == 0) color = [0, 0, 0]
                        else color = colors[material - 1]
                    }
                    else if(type == 3){
                        if(chunk[l][k].und) color = colUnd
                        let material = chunk[l][k].material
                        if(material == 0) {
                            if(bioma == 1) color = chunk[l][k].hp == maxHealthCell ? colRocaBioma1 : colSueloBioma1;
                            else if(bioma == 2) color = chunk[l][k].hp == maxHealthCell ? colSueloBioma2 : colRocaBioma2;
                            else if(bioma == 3) color = chunk[l][k].hp == maxHealthCell ? colSueloBioma3 : colRocaBioma3;
                            else if(bioma == 4) color = chunk[l][k].hp == maxHealthCell ? colSueloBioma4 : colRocaBioma4;
                            else if(bioma == 5) color = chunk[l][k].hp == maxHealthCell ? colSueloBioma5 : colRocaBioma5;
                        }
                        else color = colors[material - 1]
                    }
                    img.pixels[index] = color[0];     // Red
                    img.pixels[index + 1] = color[1]; // Green
                    img.pixels[index + 2] = color[2]; // Blue
                    img.pixels[index + 3] = 255;      // Alpha
                }
            }
        }
    }
    img.updatePixels();
    save(img, 'map.png');
}
