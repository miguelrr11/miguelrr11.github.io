p5.disableFriendlyErrors = true
const WIDTH = 600,
    HEIGHT = 600,
    WIDTH_UI = 370
let state = 'painting',
    undoStack = [],
    edited = true
let canvas = [],
    prevCanvas = []
let numberOfCells = 3,
    pixelsPerCell = 3,
    canvasSize = numberOfCells * pixelsPerCell
let pixelSize = WIDTH / canvasSize,
    cellSize = WIDTH / numberOfCells
let curColor, curSize = 0
let panel, pColPick, pSizeSel, pSelCanvSize, pBucket, pEraser, pSelGridSize, pSelTileSize, pStatus, pSimmetry, pExamples, pGround, pFreq
let cooldownStatus = 0,
    animGenerating = 300
let brushes = []
let tiles = []
let wfcSize = 50,
    GRID_SIZE = wfcSize,
    grid = []
let TILE_SIZE_RENDER = WIDTH / wfcSize,
    TILE_SIZE = 3,
    MAX_RECURSION_DEPTH = 20

function initCanvas() {
    grid = []
    tiles = []
    state = 'painting'
    numberOfCells = pSelCanvSize.getValue()
    canvasSize = numberOfCells * pixelsPerCell
    pixelSize = WIDTH / canvasSize
    cellSize = WIDTH / numberOfCells
    canvas = []
    for(let i = 0; i < canvasSize; i++) {
        canvas[i] = []
        for(let j = 0; j < canvasSize; j++) {
            canvas[i][j] = [0, 0, 0, 0]
        }
    }
    prevCanvas = JSON.parse(JSON.stringify(canvas))
}

function initBrushes() {
    brushes = []
    for(let r = 0; r <= 10; r++) {
        let brush = []
        for(let x = -r; x <= r; x++) {
            for(let y = -r; y <= r; y++) {
                if(x * x + y * y <= r * r) brush.push([x, y])
            }
        }
        brushes.push(brush)
    }
}

function setup() {
    createCanvas(WIDTH + WIDTH_UI, HEIGHT)
    panel = new Panel({
        title: 'Wave Function Collapse',
        x: WIDTH,
        w: WIDTH_UI,
        automaticHeight: false
    })
    panel.createText('First paint, then generate')
    panel.createSeparator()
    panel.createText('Paint', true)
    pSelCanvSize = panel.createNumberPicker('Size of canvas', 1, 20, 1, 3, initCanvas, initCanvas)
    pSizeSel = panel.createSlider(0, 10, 0, 'Size of brush', true, () => {
        curSize = Math.floor(Math.round(pSizeSel.getValue()))
    })
    pColPick = panel.createColorPicker('Color of brush', () => {
        curColor = pColPick.getColor()
    })
    pColPick.finalCol = [0, 0, 0, 255]
    curColor = pColPick.getColor()
    pBucket = panel.createCheckbox('Paint bucket', false)
    pEraser = panel.createCheckbox('Eraser', false)
    panel.createButton('Clear', initCanvas)
    panel.createButton('Undo', undo)
    panel.createButton('Color picker', pickColor)
    panel.createSeparator()
    panel.createText('Generate', true)
    pSelGridSize = panel.createNumberPicker('Size of grid', 10, 200, 10, 30, setSizeGrid, setSizeGrid)
    pSelTileSize = panel.createNumberPicker('Tile Size', 2, 5, 1, 3, setTileSize, setTileSize)
    pSimmetry = panel.createCheckbox('Simmetry', false, () => edited = true)
    pGround = panel.createCheckbox('Ground', false, () => edited = true)
    pFreq = panel.createCheckbox('Frequency', false)
    panel.createButton('Generate', generateWFC)
    panel.createButton('Edit', editCanvas)
    pStatus = panel.createText('Status: not generating')
    panel.createSeparator()
    panel.createText('Load examples', true)
    pExamples = panel.createSelect(['Red Dot', 'Cactus', 'Loop', 'Rooms', 'Office'], undefined, loadExample)
    initBrushes()
    initCanvas()
}

function loadExample() {
    state = 'painting'
    let exampleIndex = pExamples.getSelectedIndex()
    let ex = examples[exampleIndex]
    pSelCanvSize.setValue(ex.size)
    initCanvas()
    pSimmetry.setChecked(ex.simmetry)
    pGround.setChecked(ex.ground)
    pSelTileSize.setValue(3)
    canvas = JSON.parse(JSON.stringify(ex.canvas))
    setSizeGrid()
    setTileSize()
    prevCanvas = JSON.parse(JSON.stringify(canvas))
}

function editCanvas() {
    state = 'painting'
    edited = true
    pStatus.setText('Status: not generating')
}

function setTileSize(bool) {
    if(state == 'generating') return
    TILE_SIZE = pSelTileSize.getValue()
    TILE_SIZE_RENDER = WIDTH / wfcSize
    if(!bool) edited = true
}

function setSizeGrid(bool) {
    if(state == 'generating') return
    wfcSize = pSelGridSize.getValue()
    GRID_SIZE = wfcSize
    TILE_SIZE_RENDER = WIDTH / wfcSize
    if(!bool) edited = true
}

function mouseReleased() {
    if(state == 'picking color' && mouseX < WIDTH) {
        pColPick.finalCol = get(mouseX, mouseY)
        curColor = pColPick.getColor()
        state = 'painting'
    }
}

function draw() {
    background(0)
    if(state == 'painting' || state == 'picking color') {
        drawCanvas()
        drawPixelGrid()
        drawCursor()
        if(mouseIsPressed && mouseX < WIDTH && mouseY < HEIGHT && !panel.isInteracting && state == 'painting') {
            let i = Math.floor(mouseX / pixelSize)
            let j = Math.floor(mouseY / pixelSize)
            paint(i, j)
        }
    }
    if(state == 'generating') {
        cooldownStatus--
        animGenerating += 3
        if(cooldownStatus <= 0) pStatus.setText('Status: generating...')
        if(cooldownStatus < 0) {
            let points = ['.', '..', '...', '....']
            pStatus.setText('Status: generating' + points[Math.floor(animGenerating / 100) % 4])
        }
        if(animGenerating > 300) animGenerating = 0
        for(let i = 0; i < grid.length; i++) {
            if(!grid[i]) continue
            grid[i].show()
            grid[i].checked = false
        }
        wfc()
    }
    if(state == 'done') {
        pStatus.setText('Status: done')
        for(let i = 0; i < grid.length; i++) grid[i].show()
    }
    push()
    panel.update()
    panel.show()
    pop()
}

function paint(i, j) {
    prevCanvas = JSON.parse(JSON.stringify(canvas))
    let col = pEraser.isChecked() ? [0, 0, 0, 0] : curColor
    if(!pBucket.isChecked()) {
        let brush = brushes[curSize]
        for(let b = 0; b < brush.length; b++) {
            let pixelBrush = brush[b]
            let x = i + pixelBrush[0],
                y = j + pixelBrush[1]
            if(x >= canvasSize || y >= canvasSize || x < 0 || y < 0) continue
            canvas[x][y] = col
        }
        pushToUndo()
    }
    else {
        const targetColor = canvas[i][j]
        if(JSON.stringify(targetColor) === JSON.stringify(col)) return
        const queue = [
            [i, j]
        ]
        const directions = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0]
        ]
        while(queue.length > 0) {
            const [x, y] = queue.shift()
            if(x < 0 || y < 0 || x >= canvasSize || y >= canvasSize) continue
            if(JSON.stringify(canvas[x][y]) !== JSON.stringify(targetColor)) continue
            canvas[x][y] = col
            for(const [dx, dy] of directions) queue.push([x + dx, y + dy])
        }
        pushToUndo()
    }
}

function drawCanvas() {
    push()
    noStroke()
    for(let i = 0; i < canvasSize; i++) {
        for(let j = 0; j < canvasSize; j++) {
            fill(canvas[i][j] ? canvas[i][j] : 0)
            rect(i * pixelSize, j * pixelSize, pixelSize, pixelSize)
        }
    }
    pop()
}

function drawPixelGrid() {
    push()
    stroke(120)
    strokeWeight(0.5)
    for(let i = 0; i < canvasSize + 1; i++) {
        line(0, i * pixelSize, WIDTH, i * pixelSize)
        line(i * pixelSize, 0, i * pixelSize, HEIGHT)
    }
    pop()
}

function drawCursor() {
    push()
    let i = Math.floor(mouseX / pixelSize),
        j = Math.floor(mouseY / pixelSize)
    if(i >= canvasSize || j >= canvasSize) return
    stroke(255)
    strokeWeight(1.5)
    noFill()
    if(!pBucket.isChecked()) {
        let radius = (curSize + 1) * pixelSize
        ellipse(mouseX, mouseY, radius * 2)
    }
    pop()
}

function generateWFC() {
    state = 'painting'
    setSizeGrid(true)
    setTileSize(true)
    state = 'generating'
    pStatus.setText('Status: generating...')
    if(edited) {
        extractTiles()
        calculateNeighbors()
    }
    initializeGrid()
    edited = false
}

function calculateNeighbors() {
    for(let i = 0; i < tiles.length; i++) {
        tiles[i].calculateNeighbors(tiles)
    }
}

function setGround() {
    let tileGround = new Tile(createImage(TILE_SIZE, TILE_SIZE), tiles.length)
    tileGround.img.loadPixels()
    let groundColor = canvas[0][canvasSize - 1]
    for(let i = 0; i < TILE_SIZE; i++) {
        for(let j = 0; j < TILE_SIZE; j++) {
            tileGround.img.set(i, j, color(groundColor[0], groundColor[1], groundColor[2], groundColor[3]))
        }
    }
    tileGround.img.updatePixels()
    tileGround.isGround = true
    tiles.push(tileGround)
    tileGround.calculateNeighbors(tiles)
    for(let i = 0; i < GRID_SIZE; i++) {
        grid[GRID_SIZE * (GRID_SIZE - 1) + i].options = [tiles.length - 1]
        grid[GRID_SIZE * (GRID_SIZE - 1) + i].collapsed = true
    }
}

function initializeGrid() {
    grid = []
    let count = 0
    for(let j = 0; j < GRID_SIZE; j++) {
        for(let i = 0; i < GRID_SIZE; i++) {
            grid.push(new Cell(tiles, i * TILE_SIZE_RENDER, j * TILE_SIZE_RENDER, TILE_SIZE_RENDER, count))
            count++
        }
    }
    if(pGround.isChecked()) setGround()
}

function extractTiles() {
    tiles = []
    let groundOffset = pGround.isChecked() ? -1 : 0
    for(let i = 0; i < canvasSize; i++) {
        for(let j = 0; j < canvasSize + groundOffset; j++) {
            let img = createImage(TILE_SIZE, TILE_SIZE)
            img.loadPixels()
            for(let x = 0; x < TILE_SIZE; x++) {
                for(let y = 0; y < TILE_SIZE; y++) {
                    let c = canvas[(i + x) % canvasSize][(j + y) % canvasSize]
                    let index = (y * TILE_SIZE + x) * 4
                    img.pixels[index] = c[0]
                    img.pixels[index + 1] = c[1]
                    img.pixels[index + 2] = c[2]
                    img.pixels[index + 3] = c[3]
                }
            }
            img.updatePixels()
            let newTile = new Tile(img, tiles.length)
            let itExists = tileExists(newTile)
            if(itExists) itExists.freq++
            else tiles.push(newTile)
            if(pSimmetry.isChecked()) simmetry(newTile)
        }
    }
}

function tileExists(tile) {
    tile.img.loadPixels()
    for(let i = 0; i < tiles.length; i++) {
        let img = tiles[i].img
        img.loadPixels()
        let same = true
        for(let j = 0; j < img.pixels.length; j++) {
            if(img.pixels[j] !== tile.img.pixels[j]) {
                same = false;
                break
            }
        }
        if(same) return tiles[i]
    }
    return false
}

function wfc() { // Main WFC algorithm
    for(let cell of grid) cell.calculateEntropy()
    let minEntropy = Infinity,
        lowestEntropyCells = []
    for(let cell of grid) {
        if(!cell.collapsed) {
            if(cell.options.length < minEntropy) {
                minEntropy = cell.options.length
                lowestEntropyCells = [cell]
            }
            else if(cell.options.length === minEntropy) {
                lowestEntropyCells.push(cell)
            }
        }
    }
    if(lowestEntropyCells.length == 0) {
        state = 'done';
        return
    }
    const cell = random(lowestEntropyCells)
    cell.collapsed = true
    const pick = pFreq.isChecked() ? chooseRandomOptionWithFrequency(cell.options) : random(cell.options)
    if(pick == undefined) {
        pStatus.setText('Status: conflict, restarting...');
        cooldownStatus = 120;
        initializeGrid();
        return
    }
    cell.options = [pick]
    propagate(grid, [cell])
    let conflict = false
    for(let c of grid) {
        if(!c.collapsed) {
            if(c.options.length === 0) {
                conflict = true;
                break
            }
            else if(c.options.length === 1) {
                c.collapsed = true;
                propagate(grid, [c])
            }
        }
    }
    if(conflict) {
        pStatus.setText('Status: conflict, restarting...');
        cooldownStatus = 120;
        initializeGrid();
        return
    }
}

function propagate(grid, startCells) { // Propagation of constraints
    let queue = [...startCells]
    while(queue.length > 0) {
        let current = queue.shift()
        let index = current.index,
            i = index % GRID_SIZE,
            j = Math.floor(index / GRID_SIZE)
        if(i + 1 < GRID_SIZE) {
            let neighbor = grid[i + 1 + j * GRID_SIZE]
            if(!neighbor.collapsed && updateNeighbor(current, neighbor, EAST)) queue.push(neighbor)
        }
        if(i - 1 >= 0) {
            let neighbor = grid[i - 1 + j * GRID_SIZE]
            if(!neighbor.collapsed && updateNeighbor(current, neighbor, WEST)) queue.push(neighbor)
        }
        if(j + 1 < GRID_SIZE) {
            let neighbor = grid[i + (j + 1) * GRID_SIZE]
            if(!neighbor.collapsed && updateNeighbor(current, neighbor, SOUTH)) queue.push(neighbor)
        }
        if(j - 1 >= 0) {
            let neighbor = grid[i + (j - 1) * GRID_SIZE]
            if(!neighbor.collapsed && updateNeighbor(current, neighbor, NORTH)) queue.push(neighbor)
        }
    }
}

function chooseRandomOptionWithFrequency(options) {
    let total = options.reduce((sum, opt) => sum + tiles[opt].freq, 0)
    let r = Math.random() * total,
        count = 0
    for(let opt of options) {
        count += tiles[opt].freq
        if(count >= r) return opt
    }
}

function updateNeighbor(cell, neighbor, direction) {
    let validOptions = []
    for(let option of cell.options) validOptions = validOptions.concat(tiles[option].neighbors[direction])
    const originalLength = neighbor.options.length
    neighbor.options = neighbor.options.filter(opt => validOptions.includes(opt))
    return neighbor.options.length < originalLength
}

function debugRenderTiles() {
    let x = 0,
        y = 0
    for(let i = 0; i < tiles.length; i++) {
        let img = tiles[i].img
        for(let sx = 0; sx < TILE_SIZE; sx++) {
            for(let sy = 0; sy < TILE_SIZE; sy++) {
                let c = img.get(sx, sy)
                let dx = x + Math.floor(sx * (TILE_SIZE_RENDER / TILE_SIZE))
                let dy = y + Math.floor(sy * (TILE_SIZE_RENDER / TILE_SIZE))
                let size = Math.ceil(TILE_SIZE_RENDER / TILE_SIZE)
                fill(c)
                noStroke()
                rect(dx, dy, size, size)
            }
        }
        x += TILE_SIZE_RENDER
        if(x >= WIDTH) {
            x = 0;
            y += TILE_SIZE_RENDER
        }
        push()
        noFill()
        stroke(0, 0, 255)
        strokeWeight(2)
        rect(x, y, TILE_SIZE_RENDER, TILE_SIZE_RENDER)
        pop()
    }
}

function rendergrid() {
    for(let i = 0; i < wfcSize; i++) {
        for(let j = 0; j < wfcSize; j++) {
            let index = i + j * wfcSize
            let cell = grid[index]
            if(!cell) continue
            if(cell.options.length === 1) {
                let img = tiles[cell.options[0]].img
                for(let x = 0; x < TILE_SIZE; x++) {
                    for(let y = 0; y < TILE_SIZE; y++) {
                        let c = img.get(x, y)
                        let dx = i * TILE_SIZE_RENDER + Math.floor(x * (TILE_SIZE_RENDER / TILE_SIZE))
                        let dy = j * TILE_SIZE_RENDER + Math.floor(y * (TILE_SIZE_RENDER / TILE_SIZE))
                        let size = Math.ceil(TILE_SIZE_RENDER / TILE_SIZE)
                        fill(c)
                        noStroke()
                        rect(dx, dy, size, size)
                    }
                }
            }
            else {
                let avgColor = [0, 0, 0, 0]
                for(let indexTile of cell.options) {
                    let img = tiles[indexTile].img
                    let c = img.get(0, 0)
                    avgColor[0] += c[0]
                    avgColor[1] += c[1]
                    avgColor[2] += c[2]
                    avgColor[3] += c[3]
                }
                avgColor = avgColor.map(v => v / cell.options.length)
                fill(avgColor)
                noStroke()
                rect(i * TILE_SIZE_RENDER, j * TILE_SIZE_RENDER, TILE_SIZE_RENDER, TILE_SIZE_RENDER)
            }
            push()
            noFill()
            stroke(0, 0, 255)
            strokeWeight(2)
            rect(i * TILE_SIZE_RENDER, j * TILE_SIZE_RENDER, TILE_SIZE_RENDER, TILE_SIZE_RENDER)
            pop()
        }
    }
}

function checkOptions(cell, neighbor, direction) {
    if(neighbor && !neighbor.collapsed) {
        let validOptions = []
        for(let option of cell.options) validOptions = validOptions.concat(tiles[option].neighbors[direction])
        neighbor.options = neighbor.options.filter(elt => validOptions.includes(elt))
        return true
    }
    return false
}

function renderCell(img, x, y, w) {
    let i = floor(img.width / 2),
        j = floor(img.width / 2)
    let index = (i + j * img.width) * 4
    fill(img.pixels[index], img.pixels[index + 1], img.pixels[index + 2])
    noStroke()
    square(x, y, w + 1)
}

function undo() {
    if(undoStack.length == 0) return
    canvas = undoStack.pop()
}

function pushToUndo() {
    if(sameCanvas(prevCanvas, canvas)) return
    if(undoStack.length > 25) undoStack.shift()
    undoStack.push(JSON.parse(JSON.stringify(canvas)))
}

function sameCanvas(can1, can2) {
    for(let i = 0; i < canvasSize; i++) {
        for(let j = 0; j < canvasSize; j++) {
            for(let k = 0; k < 4; k++) {
                if(can1[i][j][k] != can2[i][j][k]) return false
            }
        }
    }
    return true
}

function pickColor() {
    if(state != 'painting') return
    state = 'picking color'
}

function simmetry(tile) {
    let modifications = getAllModifications(tile.img)
    for(let mod of modifications) {
        let newTile = new Tile(mod, tiles.length)
        let itExists = tileExists(newTile)
        if(!itExists) tiles.push(newTile)
    }
}

// Returns all 8 simmetries
function getAllModifications(img) {
    let modifications = []

    function copyImage(src) {
        let cpy = createImage(src.width, src.height)
        cpy.copy(src, 0, 0, src.width, src.height, 0, 0, src.width, src.height)
        return cpy
    }

    function flipHorizontal(src) {
        let result = copyImage(src)
        result.loadPixels()
        for(let y = 0; y < result.height; y++) {
            for(let x = 0; x < result.width / 2; x++) {
                let i1 = 4 * (x + y * result.width)
                let i2 = 4 * ((result.width - 1 - x) + y * result.width)
                for(let i = 0; i < 4; i++)[result.pixels[i1 + i], result.pixels[i2 + i]] = [result.pixels[i2 + i], result.pixels[i1 + i]]
            }
        }
        result.updatePixels()
        return result
    }

    function flipVertical(src) {
        let result = copyImage(src)
        result.loadPixels()
        for(let y = 0; y < result.height / 2; y++) {
            for(let x = 0; x < result.width; x++) {
                let i1 = 4 * (x + y * result.width)
                let i2 = 4 * (x + (result.height - 1 - y) * result.width)
                for(let i = 0; i < 4; i++)[result.pixels[i1 + i], result.pixels[i2 + i]] = [result.pixels[i2 + i], result.pixels[i1 + i]]
            }
        }
        result.updatePixels()
        return result
    }

    function rotate90(src) {
        let result = createImage(src.height, src.width)
        src.loadPixels()
        result.loadPixels()
        for(let y = 0; y < src.height; y++) {
            for(let x = 0; x < src.width; x++) {
                let i1 = 4 * (x + y * src.width)
                let i2 = 4 * ((src.height - 1 - y) + x * src.height)
                for(let i = 0; i < 4; i++) result.pixels[i2 + i] = src.pixels[i1 + i]
            }
        }
        result.updatePixels()
        return result
    }

    function rotate180(src) {
        return flipHorizontal(flipVertical(src))
    }

    function rotate270(src) {
        return rotate90(rotate180(src))
    }
    modifications.push(flipHorizontal(img))
    modifications.push(flipVertical(img))
    modifications.push(rotate90(img))
    modifications.push(rotate180(img))
    modifications.push(rotate270(img))
    modifications.push(flipHorizontal(rotate90(img)))
    modifications.push(flipVertical(rotate90(img)))
    return modifications
}