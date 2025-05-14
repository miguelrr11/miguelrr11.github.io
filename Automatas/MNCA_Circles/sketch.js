//MNCA function generator (2 Circle Neighbourhoods)
//Miguel Rodríguez
//03-09-2024

const WIDTH = 750
const HEIGHT = 750
const colCell = "#ff632a"
const colBack = "#ffbf00"
let N = 150

let grid = []
let next_grid = []

let spacing = WIDTH/N


let panel

let clearButton
let populateGridButton
let select
let resetRandomValButton

let skipFrames = 0


const coords1 = [
    [-3, -1], [-3, 0], [-3, 1],
    [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2],
    [-1, -3], [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2], [-1, 3],
    [0, -3], [0, -2], [0, -1], [0, 1], [0, 2], [0, 3],
    [1, -3], [1, -2], [1, -1], [1, 0], [1, 1], [1, 2], [1, 3],
    [2, -2], [2, -1], [2, 0], [2, 1], [2, 2],
    [3, -1], [3, 0], [3, 1]
];

const coords2 = [
    [-7, -2], [-7, -1], [-7, 0], [-7, 1], [-7, 2],
    [-6, -4], [-6, -3], [-6, -2], [-6, -1], [-6, 0], [-6, 1], [-6, 2], [-6, 3], [-6, 4],
    [-5, -5], [-5, -4], [-5, -3], [-5, -2], [-5, -1], [-5, 0], [-5, 1], [-5, 2], [-5, 3], [-5, 4], [-5, 5],
    [-4, -6], [-4, -5], [-4, -4], [-4, -3], [-4, 3], [-4, 4], [-4, 5], [-4, 6],
    [-3, -6], [-3, -5], [-3, -4], [-3, 4], [-3, 5], [-3, 6],
    [-2, -7], [-2, -6], [-2, -5], [-2, 5], [-2, 6], [-2, 7],
    [-1, -7], [-1, -6], [-1, -5], [-1, 5], [-1, 6], [-1, 7],
    [0, -7], [0, -6], [0, -5], [0, 5], [0, 6], [0, 7],
    [1, -7], [1, -6], [1, -5], [1, 5], [1, 6], [1, 7],
    [2, -7], [2, -6], [2, -5], [2, 5], [2, 6], [2, 7],
    [3, -6], [3, -5], [3, -4], [3, 4], [3, 5], [3, 6],
    [4, -6], [4, -5], [4, -4], [4, -3], [4, 3], [4, 4], [4, 5], [4, 6],
    [5, -5], [5, -4], [5, -3], [5, -2], [5, -1], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5],
    [6, -4], [6, -3], [6, -2], [6, -1], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4],
    [7, -2], [7, -1], [7, 0], [7, 1], [7, 2]
];

let randomVal = []

let sumAllNeigh = 0

function preload(){
    text_Font = loadFont("dogicapixel.ttf")
}


function populateGrid(){
    for(let i = 0; i < N; i++){ 
        for(let j = 0; j < N; j++){ 
            grid[i][j] = noise(i/10, j/10, frameCount) < 0.5 ? 1 : 0
        }
    }
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

function getSums(cx, cy) {
    let sum1 = 0;
    let sum2 = 0;

    for (let i = 0; i < coords1.length; i++) {
        let x1 = mod(cx + coords1[i][0], N);
        let y1 = mod(cy + coords1[i][1], N);
        if (grid[x1][y1] == 1) {
            sum1++;
        }
    }

    for (let i = 0; i < coords2.length; i++) {
        let x2 = mod(cx + coords2[i][0], N);
        let y2 = mod(cy + coords2[i][1], N);
        if (grid[x2][y2] == 1) {
            sum2++;
        }
        
    }

    let totalSum = sum1 + sum2;
    return totalSum > 0 ? [sum1 / totalSum, sum2 / totalSum] : [0, 0];
}


function decideOutput(NEIGHBORHOOD_AVG, REFERENCE_VAL, func){
    let OUTPUT_VALUE = REFERENCE_VAL
    if(func == 'Random'){
        if( NEIGHBORHOOD_AVG[0] >= randomVal[0] 
        &&  NEIGHBORHOOD_AVG[0] <= randomVal[1] ) { OUTPUT_VALUE = 1.0; }
        if( NEIGHBORHOOD_AVG[0] >= randomVal[2] 
        &&  NEIGHBORHOOD_AVG[0] <= randomVal[3]  ) { OUTPUT_VALUE = 1.0; }
        if( NEIGHBORHOOD_AVG[0] >= randomVal[4] 
        &&  NEIGHBORHOOD_AVG[0] <= randomVal[5] ) { OUTPUT_VALUE = 0.0; }
        if( NEIGHBORHOOD_AVG[0] >= randomVal[6] 
        &&  NEIGHBORHOOD_AVG[0] <= randomVal[7] ) { OUTPUT_VALUE = 1.0; }

        if( NEIGHBORHOOD_AVG[1] >= randomVal[8] 
        &&  NEIGHBORHOOD_AVG[1] <= randomVal[9] ) { OUTPUT_VALUE = 1.0; }
        if( NEIGHBORHOOD_AVG[1] >= randomVal[10] 
        &&  NEIGHBORHOOD_AVG[1] <= randomVal[11] ) { OUTPUT_VALUE = 0.0; }
        if( NEIGHBORHOOD_AVG[1] >= randomVal[12]  
        &&  NEIGHBORHOOD_AVG[1] <= randomVal[13] ) { OUTPUT_VALUE = 0.0; }
        if( NEIGHBORHOOD_AVG[1] >= randomVal[14] 
        &&  NEIGHBORHOOD_AVG[1] <= randomVal[15] ) { OUTPUT_VALUE = 1.0; }
    }
    return OUTPUT_VALUE
}

function setRandomVal(){
    clearGrid()
    populateGrid()
    for(let i = 0; i < 16; i++){ 
        randomVal[i] = random()
        panel.sliders[i].setValue(randomVal[i])
    }
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    panel = new Panel(0, 0, 200, HEIGHT, "MNCA\nCircular\nNeighbours", [255, 191, 0], [255, 99, 42])
    for(let i = 0; i < 16; i++) panel.addSlider(0, 1, 0.5)
    panel.addButton("Populate", populateGrid)
    panel.addButton("Clear", clearGrid)
    panel.addButton("Skip Even", toggleSkipFrames)
    panel.addButton("Randomize", setRandomVal)
    panel.addCheckbox(false, "Dynamic")
    //panel.addText()
    //frameRate(1)
    //noLoop()

    for(let i = 0; i < N; i++){
        grid[i] = []
        next_grid[i] = []
    }

    populateGrid()

    setRandomVal()

}


function toggleSkipFrames(){
    if(skipFrames == 0){ 
        skipFrames = 1
        panel.changeText(3, "Skip Odd")
    }
    else if(skipFrames == 1){ 
        skipFrames = 0
        panel.changeText(3, "Skip Even")
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
    setSquareGrid(10, N/2, N/2)
}



function draw(){
    if(frameCount % 2 == skipFrames) background(colCell)
    dynamic = panel.isChecked('Dynamic')
    
    for(let i = 0; i < 16; i++){
        randomVal[i] = panel.getValue(i)
        if(dynamic){ 
            randomVal[i] += Math.sin(frameCount/(i+1) + i) * 0.01
            panel.setValue(i, randomVal[i])
        }
    }
    //panel.setText(0, "FPS: " + round(frameRate()))

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
                if(grid[i][j] == 1) drawFastRect(i * spacing, j * spacing, spacing, spacing, 255, 191, 0)
            }
        }
        updatePixels() 
    }
    

    //Actualizar grid segun reglas
    let bool = false
    for(let i = 0; i < N; i++){ 
        for(let j = 0; j < N; j++){
            let sums = getSums(i, j)
            next_grid[i][j] = decideOutput(sums, grid[i][j], "Random")
        }
    }

    //Swappear grids
    for(let i = 0; i < N; i++){ 
        for(let j = 0; j < N; j++){ 
            grid[i][j] = next_grid[i][j]
        }
    }

    panel.show()
    panel.update()

}

function mod(n, m) {
    return ((n % m) + m) % m;
}
