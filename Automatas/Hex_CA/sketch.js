//Hexagonal CA
//Miguel Rodríguez
//06-05-2025

p5.disableFriendlyErrors = true
let WIDTH = 1400
let HEIGHT = 900

let grid = []
let neighbourLUT = []
let tamCell = 2
let rows = Math.ceil(HEIGHT/tamCell)
let cols = Math.ceil(WIDTH/tamCell)
let offTamCell = tamCell * .5

let gridShader;
let gridTex;
let gridBuffer;

let col = [
    Math.random(),
    Math.random(),
    Math.random()
]

// [y, x]
let neigOffsetsLarge = [
    [-1,0],
    [-1,1],
    [0, 1],
    [1, 1],
    [1, 0],
    [0, -1],
    [0, 0]
]
let neigOffsetsSmall = [
    [-1,-1],
    [-1,0],
    [0, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [0, 0]
]
let filter = [
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
]
function activation(x){
    //return constrainn(x, 0, 1)
    //return Math.sin(x)
    //return x
    return Math.tanh(x)
    //return -1/Math.pow(2, (Math.pow(x, 2)))+1;
    //return Math.pow(x, 2)
}

function mouseClicked(){
    sel = getRandomPos()
}

function setup(){
    WIDTH = windowWidth
    HEIGHT = windowHeight
    rows = Math.ceil(HEIGHT/tamCell)
    cols = Math.ceil(WIDTH/tamCell)
    createCanvas(WIDTH, HEIGHT)
    frameRate(60)

    for(let i = 0; i < rows; i++){
        grid[i] = []
        for(let j = 0; j < cols; j++){
            let val = noise(i*0.1, j*0.1)
            if(i%2 == 1 && j == 0) grid[i][j] = null
            else grid[i][j] = val
        }
    }

    for(let i = 0; i < rows; i++){
        neighbourLUT[i] = []
        for(let j = 0; j < cols; j++){
            if(i % 2 == 1 && j == 0){
                neighbourLUT[i][j] = []
                continue
            }
            let neighbours = []
            let neigOffsets = (i % 2 == 0) ? neigOffsetsLarge : neigOffsetsSmall
            for(let off of neigOffsets){
                let newI = i + off[0]
                let newJ = j + off[1]
                if(newI < 0 || newI >= rows || 
                    newJ < 0 || newJ >= cols || 
                    (i % 2 == 1 && newJ == 0)
                ){
                    neighbours.push(undefined)
                } else {
                    neighbours.push([newI, newJ])
                }
            }
            neighbourLUT[i][j] = neighbours
        }
    }
    
    gridShader = createShader(vert, frag)
    gridTex = createImage(rows, cols);
    gridBuffer = createGraphics(WIDTH, HEIGHT, WEBGL);
    gridBuffer.noStroke();

}

function updateGridTexture() {
    gridTex.loadPixels();
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let idx = (j * rows + i) * 4;
            let val = grid[i][j] * 255
            gridTex.pixels[idx + 0] = val * col[0]
            gridTex.pixels[idx + 1] = val * col[1]
            gridTex.pixels[idx + 2] = val * col[2]
            gridTex.pixels[idx + 3] = 255
        }
    }
    gridTex.updatePixels();
}


function draw(){
    background(0)

    update()    
    updateGridTexture();
    gridBuffer.shader(gridShader);
    gridShader.setUniform('uGrid', gridTex);
    gridShader.setUniform('uTamCell', tamCell);
    gridShader.setUniform('uNRows', cols);
    gridShader.setUniform('uNCols', rows);
    gridShader.setUniform('uCanvasSize', [WIDTH, HEIGHT]);
    gridBuffer.rect(0, 0, WIDTH, HEIGHT);
    image(gridBuffer, 0,0);
}

function update(){
    for(let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++){
            if(i%2 == 1 && j == 0) continue
            let neighbours = neighbourLUT[i][j]
            let val = 0
            for(let k = 0; k < 7; k++){
                if(neighbours[k] == undefined) continue
                let x = neighbours[k][0]
                let y = neighbours[k][1]
                let neighbour = grid[x][y]
                val += neighbour * filter[k]
            }
            grid[i][j] = activation(val)
        }
    }
}

function drawGrid(){
    push()
    noStroke()
    //strokeWeight(tamCell*.75)
    for(let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++){
            if((i%2 == 1) && j == 0) continue
            //stroke(255 * grid[i][j])
            fill(255 * grid[i][j])
            drawPos([i, j])
        }
    }
    pop()
}

function drawPos(pos){
    let [x, y] = getRealPosition(pos[0], pos[1])
    //point(x, y)
    rect(x, y, tamCell, tamCell)
}

function getRealPosition(i, j){
    let xOff = (i%2 == 1) ? -offTamCell : 0
    let x = ((j % cols) * tamCell) + xOff
    let y = (i % rows) * tamCell
    return [x+offTamCell, y+offTamCell]
}

function getRandomPos(){
    let i = Math.floor(Math.random() * rows)
    let j = Math.floor(Math.random() * cols)
    return [i, j]
}

// function getNeighbours(i, j){
//     let neighbours = []
//     let neigOffsets = (i%2 == 0) ? 
//     neigOffsetsLarge : neigOffsetsSmall
//     for(let off of neigOffsets){
//         let newI = i + off[0]
//         let newJ = j + off[1]
//         if(newI < 0 || newI >= rows || 
//             newJ < 0 || newJ >= cols ||
//            grid[newI][newJ] == null
//         ) neighbours.push(undefined)
//         else neighbours.push([newI, newJ])
//     }
//     return neighbours
// }