//Easy Animation
//Miguel Rodríguez
//12-02-2024

p5.disableFriendlyErrors = true
const WIDTH_canvas = 1410
const HEIGHT_canvas = 1030
const tamCell = 3
const cols = WIDTH_canvas/tamCell
const rows = HEIGHT_canvas/tamCell

const WIDTH_UI = 1650 - WIDTH_canvas
const HEIGHT = 1080

const col_dark = "#2b2d42"
const col_dark_medium = "#5C6378"
const col_medium = "#8d99ae"
const col_light_medium = "#BDC6D1"
const col_light = "#edf2f4"

const col_layern1 = "#aaf683"
const col_layer1 = "#E4B5FF"
const col_layer2 = "#8E8E8E"

const col_dark_RGB = hexToRgb("#2b2d42")
const col_dark_medium_RGB = hexToRgb("#5C6378")
const col_medium_RGB = hexToRgb("#8d99ae")
const col_light_medium_RGB = hexToRgb("#BDC6D1")
const col_light_RGB = hexToRgb("#edf2f4")

const col_layern1_RGB = hexToRgb("#aaf683")
const col_layer1_RGB = hexToRgb("#E4B5FF")
const col_layer2_RGB = hexToRgb("#8E8E8E")

let panel, brshSizeSel

let brushes, brush
let prevMouseX, prevMouseY
let curColor
let shade
let onion
let copyPasteBuffer

const bayerMatrix = [
    [0,  8,  2, 10],
    [12, 4, 14,  6],
    [3, 11,  1,  9],
    [15, 7, 13,  5]
];
const shadeThresholds = [16, 15, 12, 8, 4, 1];

let timeline_UI

let dubugfps

function mouseReleased(){
    prevMouseX = undefined
    prevMouseY = undefined
    if(mouseX < WIDTH_canvas) timeline_UI.pushToUndoStack()
}

function setup(){
    createCanvas(WIDTH_canvas + WIDTH_UI, HEIGHT)
    density = pixelDensity()
    adjustedWidth = width * density
    w_den = (tamCell * density) | 0
    h_den = (tamCell * density) | 0

    timeline_UI = new Timeline_UI()
    initBrushes()

    panel = new Panel({
        title: 'Easy Animation',
        x: WIDTH_canvas,
        w: WIDTH_UI,
        h: HEIGHT,
        lightCol: col_dark,
        darkCol: col_light,
        automaticHeight: false
    })
    panel.createSeparator()
    panel.createButton('+', timeline_UI.addFrame.bind(timeline_UI))
    panel.createButton('-', timeline_UI.removeFrame.bind(timeline_UI))
    panel.createButton('Clear', timeline_UI.clear.bind(timeline_UI))
    panel.createButton('Duplicate', timeline_UI.duplicate.bind(timeline_UI))
    panel.createButton('Undo', timeline_UI.undo.bind(timeline_UI))
    panel.createButton('Copy', timeline_UI.copy.bind(timeline_UI))
    panel.createButton('Paste', timeline_UI.paste.bind(timeline_UI))
    brshSizeSel = panel.createNumberPicker('Brush Size', 0, 10, 1, 10, 
        () => brush = brushes[brshSizeSel.getValue()])
    brush = brushes[brshSizeSel.getValue()]
    let c1 = panel.createButton('  ', () => curColor = 1)
    c1.w = 20
    c1.darkCol = col_dark
	c1.transCol = col_dark
    let c2 = panel.createButton('  ', () => curColor = 2)
    c2.w = 20
    c2.darkCol = col_medium
	c2.transCol = col_medium
    let c3 = panel.createButton('  ', () => curColor = 3)
    c3.w = 20
    c3.darkCol = col_light
	c3.transCol = col_light
    curColor = 1
    let shadePick = panel.createNumberPicker('Shade', 0, 5, 1, 0, () => {
        shade = shadePick.getValue()
    })
    shade = 0
    let onionSel = panel.createCheckbox('Onion Skin', false, () => onion = onionSel.isChecked())
    onion = false
    panel.createButton('Play', timeline_UI.play.bind(timeline_UI))
    let fpsPick = panel.createNumberPicker('FPS', 1, 60, 1, 8,
        () => timeline_UI.setFps(fpsPick.getValue())
    )
    //debugfps = panel.createText('', false, () => {return Math.round(frameRate())})
}

function mouseClicked(){
    timeline_UI.setPrevCanvas()
}

function draw(){
    background(0)

    if (mouseIsPressed) {
        if (inBoundsCanvas() && timeline_UI.selected !== undefined) {
            timeline_UI.checkExistingCanvas();
            
            let x1 = Math.floor(mouseX / tamCell);
            let y1 = Math.floor(mouseY / tamCell);
            
            if (x1 >= 0 && x1 < cols && y1 >= 0 && y1 < rows) {
                timeline_UI.paint(x1, y1)

                if(prevMouseX != undefined && prevMouseY != undefined){
                    let x0 = Math.floor(prevMouseX / tamCell);
                    let y0 = Math.floor(prevMouseY / tamCell);

                    let dx = Math.abs(x1 - x0);
                    let dy = Math.abs(y1 - y0);
                    let sx = (x0 < x1) ? 1 : -1;
                    let sy = (y0 < y1) ? 1 : -1;
                    let err = dx - dy;

                    while (true) {
                        timeline_UI.paint(x0, y0);
                        if (x0 === x1 && y0 === y1) break;
                        let e2 = err * 2;
                        if (e2 > -dy) {
                            err -= dy;
                            x0 += sx;
                        }
                        if (e2 < dx) {
                            err += dx;
                            y0 += sy;
                        }
                    }
                }
            }
        }
    }
    
    timeline_UI.update()
    timeline_UI.show_timeline()
    timeline_UI.show()
    timeline_UI.showHoveredCell()
    

    push()
    panel.show()
    panel.update()
    pop()

    if(mouseIsPressed && inBoundsCanvas()){
        prevMouseX = constrain(mouseX, 0, WIDTH_canvas);
        prevMouseY = constrain(mouseY, 0, WIDTH_canvas);
    }
}

function initBrushes() {
    brushes = []
    for(let r = 0; r <= 10; r++) {
        let b = []
        for(let x = -r; x <= r; x++) {
            for(let y = -r; y <= r; y++) {
                if(x * x + y * y <= r * r) b.push([x, y])
            }
        }
        brushes.push(b)
    }
}

function initCanvas(){
    let canvas = []
    for(let i = 0; i < cols; i++){
        canvas.push([])
        for(let j = 0; j < rows; j++){
            canvas[i].push(0)
        }
    }
    return canvas
}

function inBoundsCanvas(){
    return mouseX >= 0 && mouseX < WIDTH_canvas && mouseY >= 0 && mouseY < HEIGHT_canvas
}

function sameCanvas(can1, can2) {
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            if(can1[i][j] != can2[i][j]) return false
        }
    }
    return true
}