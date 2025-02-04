//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let state = 'painting'

// A canvas is composed of NxN cells that are composed of MxM pixels
let canvas = []         //canvas where you paint
let numberOfCells = 3   //numberOfCells x numberOfCells
let pixelsPerCell = 3
let canvasSize = numberOfCells * pixelsPerCell  //number of pixels
let pixelSize = WIDTH / canvasSize
let cellSize = WIDTH / numberOfCells

let curColor
let curSize = 0

let panel, pColPick, pSizeSel, pSelCanvSize, pBucket, pEraser

let brushes = []

let tiles = []

let wfcSize = 50 //the result will be wfcSize x wfcSize
let GRID_SIZE = wfcSize
let grid = []

const TILE_SIZE_RENDER = WIDTH/wfcSize
const TILE_SIZE = 3
let MAX_RECURSION_DEPTH = 10;

function initCanvasDebug(){
    canvas = [
        [
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ]
        ],
        [
            [
                255,
                255,
                255,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                255,
                255,
                255,
                255
            ]
        ],
        [
            [
                255,
                255,
                255,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                255,
                255,
                255,
                255
            ]
        ],
        [
            [
                255,
                255,
                255,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                255,
                255,
                255,
                255
            ]
        ],
        [
            [
                255,
                255,
                255,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                255,
                255,
                255,
                255
            ]
        ],
        [
            [
                255,
                255,
                255,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                255,
                255,
                255,
                255
            ]
        ],
        [
            [
                255,
                255,
                255,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                253,
                46,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                255,
                255,
                255,
                255
            ]
        ],
        [
            [
                255,
                255,
                255,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                0,
                0,
                0,
                255
            ],
            [
                255,
                255,
                255,
                255
            ]
        ],
        [
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ],
            [
                255,
                255,
                255,
                255
            ]
        ]
    ]
}

function initCanvas(){
    grid = []
    tiles = []
    state = 'painting'

    numberOfCells = pSelCanvSize.getValue()
    canvasSize = numberOfCells * pixelsPerCell
    pixelSize = WIDTH / canvasSize
    cellSize = WIDTH / numberOfCells

    for(let i = 0; i < canvasSize; i++){
        canvas[i] = []
        for(let j = 0; j < canvasSize; j++){
            canvas[i][j] = [0,0,0,0]
        }
    }
}

function initBrushes(){
    for (let radius = 0; radius <= 10; radius++) {
        let brush = [];
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                if (x * x + y * y <= radius * radius) {
                    brush.push([x, y]);
                }
            }
        }
        brushes.push(brush);
    }
}

function setup(){
    createCanvas(WIDTH+300, HEIGHT)
    
    
    panel = new Panel({
        title: 'Wave Function Collapse',
        x: WIDTH,
        w: 300,
        automaticHeight: false
    })
    panel.createText('First paint, then generate')
    panel.createSeparator()
    pSelCanvSize = panel.createNumberPicker('Size of canvas', 1, 10, 1, 3, initCanvas, initCanvas) //slider para number of cells
    panel.createSeparator()
    pColPick = panel.createColorPicker('Color of brush', () => {curColor = pColPick.getColor()})
    pSizeSel = panel.createSlider(0, 10, 0, 'Size of brush', true, () => {curSize = Math.floor(Math.round(pSizeSel.getValue()))})
    pBucket = panel.createCheckbox('Paint bucket', false)
    pEraser = panel.createCheckbox('Eraser', false)
    panel.createSeparator()
    panel.createButton('Clear', initCanvas)
    panel.createSeparator()
    panel.createButton('Generate', generateWFC)

    initBrushes()
    //initCanvas()
    initCanvasDebug()
}

function keyPressed(){
    redraw()
}

function draw(){
    background(0)
    if(state == 'painting'){
        drawCanvas()
        drawPixelGrid()
        //drawGrid()
        drawCursor()
        if(mouseIsPressed && mouseX < WIDTH && mouseY < HEIGHT){
            let i = Math.floor(mouseX / pixelSize)
            let j = Math.floor(mouseY / pixelSize)
            if(!panel.isInteracting) paint(i, j)
        }
    }
    if(state == 'generating'){
        //debugRenderTiles()
        //rendergrid()
        for (let i = 0; i < grid.length; i++) {
            if(grid[i] == undefined) continue
            grid[i].show();
            grid[i].checked = false;
        }
        wfc()
    }
    if(state == 'done'){
        for (let i = 0; i < grid.length; i++) {
            grid[i].show();
        } 
    }
    push()
    panel.update()
    panel.show()
    pop()
}

function paint(i, j){
    let col = pEraser.isChecked() ? [0,0,0,0] : curColor;
    if(!pBucket.isChecked()){
        let brush = brushes[curSize];
        for(let b = 0; b < brush.length; b++){
            let pixelBrush = brush[b];
            let x = i + pixelBrush[0];
            let y = j + pixelBrush[1];
            if(x >= canvasSize || y >= canvasSize || x < 0 || y < 0) continue;
            canvas[x][y] = col;
        }
    }
    //floodfill
    else{
        const targetColor = canvas[i][j];
        if (JSON.stringify(targetColor) === JSON.stringify(col)) return; 

        const queue = [];
        queue.push([i, j]);
        const directions = [[0, 1],[1, 0],  [0, -1],  [-1, 0]];
        while (queue.length > 0) {
            const [x, y] = queue.shift();

            if (x < 0 || y < 0 || x >= canvasSize || y >= canvasSize) continue;
            if (JSON.stringify(canvas[x][y]) !== JSON.stringify(targetColor)) continue;

            canvas[x][y] = col;

            for (const [dx, dy] of directions) queue.push([x + dx, y + dy]);
        }
    }
}


function drawCanvas(){
    push()
    noStroke()
    for(let i = 0; i < canvasSize; i++){
        for(let j = 0; j < canvasSize; j++){
            if(canvas[i][j] == undefined) fill(0)
            else fill(canvas[i][j])
            rect(i*pixelSize, j*pixelSize, pixelSize, pixelSize)
        }
    }
    pop()
}

function drawGrid(){
    push()
    stroke(215)
    strokeWeight(1)
    for(let i = 0; i < numberOfCells+1; i++){
        line(0, i*cellSize, WIDTH, i*cellSize)
        line(i*cellSize, 0, i*cellSize, HEIGHT)
    }
    pop()
}

function drawPixelGrid(){
    push()
    stroke(120)
    strokeWeight(.5)
    for(let i = 0; i < canvasSize+1; i++){
        line(0, i*pixelSize, WIDTH, i*pixelSize)
        line(i*pixelSize, 0, i*pixelSize, HEIGHT)
    }
    pop()
}

function drawCursor(){
    push()
    let i = Math.floor(mouseX / pixelSize)
    let j = Math.floor(mouseY / pixelSize)
    if(i >= canvasSize || j >= canvasSize) return
    stroke(255)
    strokeWeight(1.5)
    noFill()
    if(!pBucket.isChecked()){
        let radius = (curSize + 1) * pixelSize
        //ellipse(i * pixelSize + pixelSize / 2, j * pixelSize + pixelSize / 2, radius * 2)
        ellipse(mouseX, mouseY, radius * 2)
    }
    pop()
}



function generateWFC(){
    state = 'generating'
    extractTiles()
    initializeGrid()
    calculateNeighbors()
}

function calculateNeighbors(){
    for(let i = 0; i < tiles.length; i++){
        tiles[i].calculateNeighbors(tiles)
    }
}

function initializeGrid() {
    grid = [];
    // Initialize the grid with cells
    let count = 0;
    for (let j = 0; j < GRID_SIZE; j++) {
      for (let i = 0; i < GRID_SIZE; i++) {
        grid.push(new Cell(tiles, i * TILE_SIZE_RENDER, j * TILE_SIZE_RENDER, TILE_SIZE_RENDER, count));
        count++;
      }
    }
  }

function extractTiles(){
    tiles = []
    //extract all possible 3x3 tiles from the canvas as tile objects, use createImage to create the tile
    for(let i = 0; i < canvasSize; i++){
        for(let j = 0; j < canvasSize; j++){
            let img = createImage(TILE_SIZE, TILE_SIZE)
            img.loadPixels()
            for(let x = 0; x < TILE_SIZE; x++){
                for(let y = 0; y < TILE_SIZE; y++){
                    let c = canvas[(i+x)%canvasSize][(j+y)%canvasSize]
                    img.set(x, y, color(c[0], c[1], c[2], c[3]))
                }
            }
            img.updatePixels()
            tiles.push(new Tile(img, tiles.length))
        }
    }
}

function wfc() {
    // Find cells with the lowest entropy (simplified as fewest options left)
    // Thie refactored method to find the lowest entropy cells avoids sorting
    let minEntropy = Infinity;
    let lowestEntropyCells = [];
  
    for (let cell of grid) {
      if (!cell.collapsed) {
        if (cell.options.length < minEntropy) {
          minEntropy = cell.options.length;
          lowestEntropyCells = [cell];
        } else if (cell.options.length === minEntropy) {
          lowestEntropyCells.push(cell);
        }
      }
    }

    if(lowestEntropyCells.length == 0){
        state = 'done'
        return
    }
  
    // Randomly select one of the lowest entropy cells to collapse
    const cell = random(lowestEntropyCells);
    cell.collapsed = true;
  
    // Choose one option randomly from the cell's options
    const pick = random(cell.options);
  
    // If there are no possible tiles that fit there!
    if (pick == undefined) {
      console.log("ran into a conflict");
      initializeGrid();
      return;
    }
  
    // Set the final tile
    cell.options = [pick];
  
    // Propagate entropy reduction to neighbors
    reduceEntropy(grid, cell, 0);
}
  

function reduceEntropy(grid, cell, depth) {
    // Stop propagation if max depth is reached or cell already checked
    if (depth > MAX_RECURSION_DEPTH || cell.checked) return;
  
    // Mark cell as checked
    cell.checked = true;
  
    let index = cell.index;
    let i = floor(index % GRID_SIZE);
    let j = floor(index / GRID_SIZE);
  
    // Update neighboring cells based on adjacency rules
    // RIGHT
    if (i + 1 < GRID_SIZE) {
      let rightCell = grid[i + 1 + j * GRID_SIZE];
      if (checkOptions(cell, rightCell, EAST)) {
        reduceEntropy(grid, rightCell, depth + 1);
      }
    }
  
    // LEFT
    if (i - 1 >= 0) {
      let leftCell = grid[i - 1 + j * GRID_SIZE];
      if (checkOptions(cell, leftCell, WEST)) {
        reduceEntropy(grid, leftCell, depth + 1);
      }
    }
  
    // DOWN
    if (j + 1 < GRID_SIZE) {
      let downCell = grid[i + (j + 1) * GRID_SIZE];
      if (checkOptions(cell, downCell, SOUTH)) {
        reduceEntropy(grid, downCell, depth + 1);
      }
    }
  
    // UP
    if (j - 1 >= 0) {
      let upCell = grid[i + (j - 1) * GRID_SIZE];
      if (checkOptions(cell, upCell, NORTH)) {
        reduceEntropy(grid, upCell, depth + 1);
      }
    }
}

let debugIndex = 20
function debugRenderTiles(){
    let x = 0;
    let y = 0;
    for(let i = 0; i < tiles.length; i++){
        let img = tiles[i].img;
        for(let sx = 0; sx < TILE_SIZE; sx++){
            for(let sy = 0; sy < TILE_SIZE; sy++){
                let c = img.get(sx, sy); 
                let dx = x + Math.floor(sx * (TILE_SIZE_RENDER / TILE_SIZE));
                let dy = y + Math.floor(sy * (TILE_SIZE_RENDER / TILE_SIZE));
                let size = Math.ceil(TILE_SIZE_RENDER / TILE_SIZE);
                fill(c);
                noStroke()
                rect(dx, dy, size, size);
            }
        }
        x += TILE_SIZE_RENDER;
        if(x >= WIDTH){
            x = 0;
            y += TILE_SIZE_RENDER;
        }
        push()
        noFill()
        stroke(0, 0, 255)
        strokeWeight(2)
        if(tiles[i].neighbors[EAST].includes(debugIndex)){ strokeWeight(5); stroke(255, 255, 0)}
        if(i == debugIndex) stroke (0, 255, 0)
        rect(x, y, TILE_SIZE_RENDER, TILE_SIZE_RENDER)
        pop()
    }
}

function rendergrid(){
    for(let i = 0; i < wfcSize; i++){
        for(let j = 0; j < wfcSize; j++){
            let index = i + j * wfcSize;
            let cell = grid[index];
            if(cell == undefined) continue;

            if (cell.options.length === 1) {
                // Draw the exact tile manually if the cell is collapsed
                let img = tiles[cell.options[0]].img;
                for(let x = 0; x < TILE_SIZE; x++){
                    for(let y = 0; y < TILE_SIZE; y++){
                        let c = img.get(x, y);
                        let dx = i * TILE_SIZE_RENDER + Math.floor(x * (TILE_SIZE_RENDER / TILE_SIZE));
                        let dy = j * TILE_SIZE_RENDER + Math.floor(y * (TILE_SIZE_RENDER / TILE_SIZE));
                        let size = Math.ceil(TILE_SIZE_RENDER / TILE_SIZE);
                        fill(c);
                        noStroke();
                        rect(dx, dy, size, size);
                    }
                }
            } else {
                // Calculate average color for non-collapsed cells
                let avgColor = [0, 0, 0, 0];
                let totalPixels = cell.options.length;

                for(let indexTile of cell.options){
                    let img = tiles[indexTile].img;
                    let c = img.get(0, 0); // Use the top-left pixel as a simple color approximation
                    avgColor[0] += c[0];
                    avgColor[1] += c[1];
                    avgColor[2] += c[2];
                    avgColor[3] += c[3];
                }

                avgColor = avgColor.map(v => v / totalPixels);

                fill(avgColor);
                noStroke();
                rect(i * TILE_SIZE_RENDER, j * TILE_SIZE_RENDER, TILE_SIZE_RENDER, TILE_SIZE_RENDER);
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
    // Check if the neighbor is valid and not already collapsed
    if (neighbor && !neighbor.collapsed) {
      // Collect valid options based on the current cell's adjacency rules
      let validOptions = [];
      for (let option of cell.options) {
        validOptions = validOptions.concat(tiles[option].neighbors[direction]);
      }
  
      // Filter the neighbor's options to retain only those that are valid
      neighbor.options = neighbor.options.filter((elt) =>
        validOptions.includes(elt)
      );
      return true;
    } else {
      return false;
    }
  }


function renderCell(img, x, y, w) {
    let i = floor(img.width / 2);
    let j = floor(img.width / 2);
    let index = (i + j * img.width) * 4;
    let r = img.pixels[index + 0];
    let g = img.pixels[index + 1];
    let b = img.pixels[index + 2];
    fill(r, g, b);
    noStroke();
    square(x, y, w);
}