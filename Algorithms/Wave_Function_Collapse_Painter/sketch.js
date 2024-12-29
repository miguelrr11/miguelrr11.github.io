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
let pixelsPerCell = 10
let canvasSize = numberOfCells * pixelsPerCell  //number of pixels
let pixelSize = WIDTH / canvasSize
let cellSize = WIDTH / numberOfCells

let curColor
let curSize = 0

let panel, pColPick, pSizeSel

let brushes = []

function initCanvas(){
    for(let i = 0; i < canvasSize; i++){
        canvas[i] = []
        for(let j = 0; j < canvasSize; j++){
            canvas[i][j] = undefined
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
    initCanvas()
    initBrushes()
    panel = new Panel({
        title: 'Wave Function Collapse',
        x: WIDTH,
        w: 300,
        automaticHeight: false
    })
    panel.createSeparator()
    panel.createNumberPicekr() //slider para number of cells
    pColPick = panel.createColorPicker('Color of brush', () => {curColor = pColPick.getColor()})
    pSizeSel = panel.createSlider(1, 10, 1, 'Size of brush', true, () => {curSize = Math.max(1, Math.round(pSizeSel.getValue()))})
}

function draw(){
    background(0)
    if(state == 'painting'){
        drawCanvas()
        //drawPixelGrid()
        drawGrid()
        drawCursor()
        if(mouseIsPressed){
            let i = Math.floor(mouseX / pixelSize)
            let j = Math.floor(mouseY / pixelSize)
            if(!panel.isInteracting) paint(i, j)
        }
    }
    push()
    panel.update()
    panel.show()
    pop()
}

function paint(i, j){
    let brush = brushes[curSize]
    for(let b = 0; b < brush.length; b++){
        let pixelBrush = brush[b]
        let x = i + pixelBrush[0]
        let y = j + pixelBrush[1]
        if(x >= canvasSize || y >= canvasSize || x < 0 || y < 0) continue
        canvas[x][y] = curColor
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
    if(i > canvasSize || j > canvasSize) return
    stroke(255)
    strokeWeight(1.5)
    noFill()
    // let brush = brushes[curSize]
    // for(let b = 0; b < brush.length; b++){
    //     let pixelBrush = brush[b]
    //     let x = i + pixelBrush[0]
    //     let y = j + pixelBrush[1]
    //     if(x > canvasSize || y > canvasSize) continue
    //     rect(x*pixelSize, y*pixelSize, pixelSize, pixelSize)
    // }

    // Calculate the brush radius based on the current size
    let radius = (curSize + 1) * pixelSize; // Adjust as necessary for scaling
    
    // Draw the outline of the circle
    ellipse(i * pixelSize + pixelSize / 2, j * pixelSize + pixelSize / 2, radius * 2, radius * 2);
    
    pop()
}
