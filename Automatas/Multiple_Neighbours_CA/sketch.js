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
let spacingCodeGrid = (WIDTH/15)/5

let p

let regenerateRulesButton
let clearButton
let pickRandomPresetButton
let populateGridButton
let skipFramesButton

let nNeihP
let nNeihSlider

let minMultP
let minMultSlider

let maxMultP
let maxMultSlider

let skipFrames = 0

let variableValues = false

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
    Ncodes = 3
    minMult = -10
    maxMult = 10
    nNeihSlider.value(3)
    minMultSlider.value(-10)
    maxMultSlider.value(10)
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

    regenerateRulesButton = createButton("Regenerate Rules")
    regenerateRulesButton.mousePressed(newCode)
    pickRandomPresetButton = createButton("Load Random Preset")
    pickRandomPresetButton.mousePressed(pickRandomCode)
    populateGridButton = createButton("Populate Grid")
    populateGridButton.mousePressed(populateGrid)
    clearButton = createButton("Clear Grid")
    clearButton.mousePressed(clearGrid)
    skipFramesButton = createButton("Skip Even Frames")
    skipFramesButton.mousePressed(toggleSkipFrames)
    nNeihP = createP("Neighbourhoods")
    nNeihSlider = createSlider(1, 7, 3, 1)
    minMultP = createP("Min Mult: ")
    minMultP.position(145, HEIGHT + 33)
    minMultSlider = createSlider(-10, 0, -5, 1)
    maxMultP = createP("Max Mult: ")
    maxMultP.position(145*2-15, HEIGHT + 33)
    maxMultSlider = createSlider(0, 10, 5, 1)

    let varB = createCheckbox("Chainging Values")
    varB.position(145*3-30, HEIGHT + 48)
    varB.changed(() => {
        variableValues = varB.checked()
    })

    textAlign(CENTER)
    textSize(15)
    textFont("Gill Sans")
}

function toggleSkipFrames(){
    if(skipFrames == 0){ 
        skipFrames = 1
        skipFramesButton.elt.innerHTML ="Skip Odd Frames"
    }
    else if(skipFrames == 1){ 
        skipFrames = 0
        skipFramesButton.elt.innerHTML = "Skip Even Frames"
    }
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
    if(frameCount % 2 == skipFrames) background("#090044")

    if(variableValues){
        for(let i = 0; i < codes.length; i++){
            codes[i].mult += Math.sin(frameCount/100 + i) * 0.05
        }
    }

    if(nNeihSlider.value() != Ncodes){
        Ncodes = nNeihSlider.value()
        newCode()
    }
    if(minMultSlider.value() != minMult){
        minMult = minMultSlider.value()
        newCode()
    }
    if(maxMultSlider.value() != maxMult){
        maxMult = maxMultSlider.value()
        newCode()
    }

    noStroke()
    fill(colCell)

    //Pintar en grid
    if(mouseIsPressed && mouseX < WIDTH && mouseY < HEIGHT){
        let x = floor(mapp(mouseX, 0, WIDTH, 0, N, true))
        let y = floor(mapp(mouseY, 0, HEIGHT, 0, N, true))
        setSquareGrid(10, x, y, frameCount % 60 == 0)
       
    }

    //Dibujar grid
    if(frameCount % 2 == skipFrames){
        loadPixels()
        for(let i = 0; i < N; i++){ 
            for(let j = 0; j < N; j++){ 
                if(grid[i][j] == 1) drawFastRect(i * spacing, j * spacing, spacing, spacing, 111, 255, 147)
            }
        }
        updatePixels() 
    }
    

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

    nNeihP.html("Neighbourhoods: " + Ncodes)
    minMultP.html("Min Mult: " + minMult)
    maxMultP.html("Max Mult: " + maxMult)

    //Dibujar reglas
    fill(colCell)
    translate(20, (WIDTH/10)*9+5)
    rect(-20, -25, WIDTH, (WIDTH/10)*9-25)
    stroke("#090044")
    strokeWeight(2.5)

    for(let i = 0; i < Ncodes; i++){
        setRule(codes[i].code)
        fill(colCell)
        stroke("#090044")
        strokeWeight(2.5)
        drawRule()
        noStroke()
        fill("#090044")
        text(round(codes[i].mult, 1), 20, -8)
        translate((WIDTH/10)+25, 0)
    }
    
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
