//Easy Animation
//Miguel Rodríguez
//12-02-2024

p5.disableFriendlyErrors = true
const WIDTH_canvas = 1410
const HEIGHT_canvas = 1030
const tamCell = 10
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

let panel, brshSizeSel

let brushes, brush
let prevMouseX, prevMouseY
let curColor

let timeline_UI

function mouseReleased(){
    prevMouseX = undefined
    prevMouseY = undefined
}

function setup(){
    createCanvas(WIDTH_canvas + WIDTH_UI, HEIGHT)

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
    brshSizeSel = panel.createNumberPicker('Brush Size', 0, 10, 0, 1, 
        () => brush = brushes[brshSizeSel.getValue()])
        brshSizeSel.value = 0
    brush = brushes[0]
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
    panel.createButton('Play', timeline_UI.play.bind(timeline_UI))
    let fpsPick = panel.createNumberPicker('FPS', 1, 60, 1, 8,
        () => timeline_UI.setFps(fpsPick.getValue())
    )
}

function draw(){
    background(0)

    if (mouseIsPressed) {
        if (inBoundsCanvas() && timeline_UI.selected != undefined) {
            timeline_UI.checkExistingCanvas();
            let x = floor(mouseX / tamCell);
            let y = floor(mouseY / tamCell);
    
            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                let d = dist(mouseX, mouseY, prevMouseX, prevMouseY);
    
                if (d > tamCell) {
                    let nOfPaints = Math.floor(d / tamCell);
                    for (let i = 0; i <= nOfPaints; i++) {
                        let interX = lerp(prevMouseX, mouseX, i / nOfPaints);
                        let interY = lerp(prevMouseY, mouseY, i / nOfPaints);
                        let interGridX = Math.floor(interX / tamCell);
                        let interGridY = Math.floor(interY / tamCell);
    
                        timeline_UI.paint(interGridX, interGridY);
                    }
                }
                timeline_UI.paint(x, y);
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