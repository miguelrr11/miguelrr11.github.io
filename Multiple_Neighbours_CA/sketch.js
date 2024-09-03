//Multiple Neighbours Cellular Automata
//Miguel Rodríguez
//03-09-2024

const WIDTH = 600
const HEIGHT = 600
const colCell = "#6fff93"
let N = 200

let code = 10
let codesBin = []
let codes = []
let Ncodes = 3

let minMult = -5
let maxMult = 5

let grid = []
let next_grid = []

let spacing = WIDTH/N

let codeGrid = []
let spacingCodeGrid = (WIDTH/10)/5

let p

let regenerateRulesButton
let clearButton
let pickRandomPresetButton
let populateGridButton

const coords = [
    [[-2, -2], [2, -2], [2, 2], [-2, 2]], 
    [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [2, -1], [1, 2], [2, 1]], 
    [[-1, -1], [1, -1], [1, 1], [-1, 1]], 
    [[-2, 0], [0, -2], [2, 0], [0, 2]],  
    [[-1, 0], [0, -1], [1, 0], [0, 1]], 
    [[0, 0]] 
];

const presets = [
    [{code: 8, mult: -0.4906}, {code: 10, mult: 0.6388}, {code: 52, mult: -0.2007}],
    [{code: 4, mult: -0.6501}, {code: 2, mult: 1.0833}, {code: 40, mult: -0.8017}],
    [{code: 7, mult: 9.2236}, {code: 45, mult: -5.9358}, {code: 23, mult: -3.2924}],
    [{code: 39, mult: 4.6417}, {code: 43, mult: -4.5101}, {code: 10, mult: -2.0620}],
    [{code: 46, mult: 4.0619}, {code: 1, mult: -8.3949}, {code: 37, mult: -6.6861}],
    [{code: 5, mult: 4.2663}, {code: 33, mult: 8.0}, {code: 28, mult: -7.8630}],
    [{code: 36, mult: 6.2957}, {code: 6, mult: 2.4483}, {code: 63, mult: -3.2667}],
    [{code: 9, mult: 2.4581}, {code: 45, mult: 8.0132}, {code: 54, mult: -9.9713}],
    [{code: 12, mult: 3.6924}, {code: 56, mult: 1.3617}, {code: 26, mult: -2.3751}],
    [{code: 43, mult: -8.0604}, {code: 15, mult: -3.7538}, {code: 60, mult: 6.4769}],
    [{code: 46, mult: -2.0969}, {code: 57, mult: -3.9684}, {code: 22, mult: 2.8761}],
    [{code: 45, mult: -6.5260}, {code: 42, mult: -4.7482}, {code: 59, mult: 8.6948}],
    [{code: 8, mult: -0.4906}, {code: 10, mult: 0.6388}, {code: 52, mult: -0.2007}],
    [{code: 9, mult: -0.9350}, {code: 53, mult: -1.4832}, {code: 46, mult: 1.0811}]
]; 

function populateGrid(){
    setSquareGrid(10, floor(random(N)), floor(random(N)))
    setSquareGrid(10, floor(random(N)), floor(random(N)), true)
    setSquareGrid(4, floor(random(N)), floor(random(N)))
    setSquareGrid(4, floor(random(N)), floor(random(N)), true)
    for(let i = 0; i < 30; i++){
        let x = floor(random(N))
        let y = floor(random(N))
        grid[x][y] = 1
    }
}

function pickRandomCode(){
    clearGrid()
    let index = floor(random(presets.length))
    codes = presets[index]
    populateGrid()
}

function newCode(){
    clearGrid()
    let r = random()
    codes = []
    let rem = floor(Ncodes/2)
    for(let i = 0; i < Ncodes-rem; i++){
        if(r > 0.5) codes.push({code: floor(random(64)), mult: random(0, maxMult)})
        else codes.push({code: floor(random(64)), mult: random(minMult, 0)})
    }
    for(let i = 0; i < rem; i++){
        if(r < 0.5) codes.push({code: floor(random(64)), mult: random(0, maxMult)})
        else codes.push({code: floor(random(64)), mult: random(minMult, 0)})
    }
    
    populateGrid()
}

function setSquareGrid(n, cx, cy, half = false){
    cx = round(cx)
    cy = round(cy)
    if(n % 2 != 0) n++
    if(cx % 2 != 0) cx++
    if(cy % 2 != 0) cy++
    if(cx >= N) cx = N-2
    if(cy >= N) cy = N-2

    for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
            if(half && (i+j) % 2 == 0) continue
            let x = cx - n/2 + i
            let y = cy - n/2 + j
            if(x >= N || x < 0 || y >= N || y < 0) continue
            grid[x][y] = 1
        }
    }
}

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function getTotalSum(x, y){
    let sum = 0
    for(let c of codes){
        sum += getNext(x, y, codesBin[c.code])*c.mult
    }
    return sum
}

function setRule(rule){
    let binCode = codesBin[rule]
    for (let k = 0; k < coords.length; k++) {
        if (binCode[k] === '1') {
            for (let n = 0; n < coords[k].length; n++) {
                let i = coords[k][n][0];
                let j = coords[k][n][1];
                let grX = i + 2;
                let grY = j + 2;
                codeGrid[grX][grY] = 1;
            }
        }
    }
}

function getNext(x, y, binCode) {
    let sum = 0;

    for (let k = 0; k < coords.length; k++) {
        if (binCode[k] == '1') {
            for (let n = 0; n < coords[k].length; n++) {
                let i = coords[k][n][0];
                let j = coords[k][n][1];
                let grX = i + x;
                let grY = j + y;
                
                if (grX >= 0 && grX < N && grY >= 0 && grY < N && grid[grX][grY] == 1) {
                    sum++;
                }
            }
        }
    }

    return sum;
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    pixelDensity(1)

    for(let i = 0; i < N; i++){
        grid[i] = []
        next_grid[i] = []
    }

    newCode()

    for(let i = 0; i < 5; i++){
        codeGrid[i] = []
    }

    for(let i = 0; i < 64; i++){
        let binCode = dec2bin(i)
        let len = binCode.length
        for(let i = 0; i < 6-len; i++){ 
            binCode = '0' + binCode
        }
        codesBin.push(binCode)
    }

    p = createP()
    regenerateRulesButton = createButton("Regenerate Rules")
    regenerateRulesButton.mousePressed(newCode)
    pickRandomPresetButton = createButton("Pick Random Preset")
    pickRandomPresetButton.mousePressed(pickRandomCode)
    populateGridButton = createButton("Populate Grid")
    populateGridButton.mousePressed(populateGrid)
    clearButton = createButton("Clear Grid")
    clearButton.mousePressed(clearGrid)
}

function clearGrid(){
    for(let i = 0; i < N; i++){ 
        grid[i] = []
        next_grid[i] = []
        for(let j = 0; j < N; j++){ 
            grid[i][j] = 0
            next_grid[i][j] = 0
        }
    }
}

function draw(){
    background("#090044")
    noStroke()
    fill(colCell)

    //Pintar en grid
    if(mouseIsPressed && mouseX < WIDTH && mouseY < HEIGHT){
        let x = floor(mapp(mouseX, 0, WIDTH, 0, N, true))
        let y = floor(mapp(mouseY, 0, HEIGHT, 0, N, true))
        setSquareGrid(10, x, y, frameCount % 60 == 0)
       
    }

    //Dibujar grid
    loadPixels()
    for(let i = 0; i < N; i++){ 
        for(let j = 0; j < N; j++){ 
            if(grid[i][j] == 1) drawFastRect(i * spacing, j * spacing, spacing, spacing, 111, 255, 147)
        }
    }
    updatePixels()

    //Actualizar grid segun reglas
    let bool = false
    for(let i = 0; i < N; i++){ 
        for(let j = 0; j < N; j++){
            next_grid[i][j] = getTotalSum(i, j) > 0 ? 1 : 0
            if(next_grid[i][j] == 1) bool = true
        }
    }

    //Swappear grids
    for(let i = 0; i < N; i++){ 
        for(let j = 0; j < N; j++){ 
            grid[i][j] = next_grid[i][j]
        }
    }
    p.html("")
    p.html("neighbour types: " + codes[0].code + ", "  + codes[1].code + ", "  + codes[2].code + " fps: " + floor(frameRate()))

    //Dibujar reglas
    fill(colCell)
    stroke("#090044")
    strokeWeight(3)
    translate(15, (WIDTH/10)*9-15)
    setRule(codes[0].code)
    drawRule()
    translate((WIDTH/10)+50, 0)
    setRule(codes[1].code)
    drawRule()
    translate((WIDTH/10)+50, 0)
    setRule(codes[2].code)
    drawRule()
}

function drawRule(){
    for(let i = 0; i < codeGrid.length; i++){
        for(let j = 0; j < codeGrid.length; j++){
            if(codeGrid[i][j] == 1) rect(i * spacingCodeGrid, j * spacingCodeGrid, 
                spacingCodeGrid, spacingCodeGrid)
            codeGrid[i][j] = 0
        }
    }
}
