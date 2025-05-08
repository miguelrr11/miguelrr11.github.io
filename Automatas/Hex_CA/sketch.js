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

let panel

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
    return Math.tanh(x)
}

function mouseClicked(){
    sel = getRandomPos()
}

let inputs = []
function initInputs() {
    let wInput = 55, hInput = 30, padding = 7
    let baseX = padding * 2, baseY = 145
    let inputs = []
    
    let positions = [
        createVector(baseX, baseY),
        createVector(baseX + wInput + padding, baseY),
        createVector(baseX + 2 * (wInput + padding), baseY),
        createVector(baseX + wInput * 0.22 + padding * 2.5, baseY - hInput),
        createVector(baseX + 1.5 * wInput + padding * 2.2, baseY - hInput),
        createVector(baseX + wInput * 0.22 + padding * 2.5, baseY + hInput),
        createVector(baseX + 1.5 * wInput + padding * 2.2, baseY + hInput)
    ]
    
    for (let i = 0; i < 7; i++) {
        let inp = panel.createInput()
        inp.reposition(positions[i].x, positions[i].y, wInput)
        inp.setFunc((arg) => {
            let val = parseFloat(arg)
            if (!isNaN(val)) filter[i] = val
            else inp.error()
        }, true)
        inp.setText(round(filter[i], 3).toString())
        inputs.push(inp)
    }

    let btnRnd = panel.createButton('Random')
    btnRnd.reposition(baseX, baseY + hInput * 2 + padding, wInput * 1.5)
    btnRnd.setFunc(() => {
        fillGrid()
        for (let i = 0; i < 7; i++) {
            filter[i] = round(Math.random() * 2 - 1, 3)
            inputs[i].setText(filter[i].toString())
        }
        col = [Math.random(), Math.random(), Math.random()]
    })
    
    let btnFill = panel.createButton('Fill')
    btnFill.reposition(baseX + wInput * 1.5 + padding * 2, baseY + hInput * 2 + padding, wInput * 1.5)
    btnFill.setFunc(fillGrid)

    panel.lastElementPos.y = btnRnd.pos.y + btnRnd.h + padding
}

function fillGrid(){
    for(let i = 0; i < rows; i++){
        grid[i] = []
        for(let j = 0; j < cols; j++){
            let val = noise(i*0.1, j*0.1)
            if(i%2 == 1 && j == 0) grid[i][j] = null
            else grid[i][j] = val
        }
    }
}

let presaved = [
    {filter: [
        0.161,
        0.354,
        -0.078,
        -0.716,
        -0.207,
        -0.162,
        0.478
    ], activation: 'abs', name: 'sierpinski'},
    {filter: [
        0.308,
        -0.313,
        -0.726,
        -0.607,
        0.036,
        -0.898,
        0.884
    ], activation: 'tanh', name: 'sludge'},
    {filter: [
        0.681,
        -0.43,
        0.692,
        -0.252,
        -0.004,
        0.74,
        0.027
    ], activation: 'gaussian', name: 'worms'},
]

async function setup(){
    let fontPanel = await loadFont("migUI/main/bnr.ttf")
    WIDTH = windowWidth
    HEIGHT = windowHeight
    rows = Math.ceil(HEIGHT/tamCell)
    cols = Math.ceil(WIDTH/tamCell)
    createCanvas(WIDTH, HEIGHT)
    frameRate(60)

    panel = new Panel({
        x: 0,
        theme: 'techno',
        title: 'Hexagonal CA',
        font: fontPanel,
        h: 300,
        automaticHeight: true,
        w: 210,
        retractable: true,
    })
    panel.createSeparator()
    panel.createText('Filter', true)
    initInputs()
    panel.createSeparator()
    panel.createText('Activation', true)
    let selAct = panel.createSelect(['x', 'x^-1', 'between -1 and 1', 'sin', 'tanh', 'abs', 'gaussian'], 'tanh')
    selAct.w = 170
    selAct.setFunc((arg) => {
        if(arg == 'between -1 and 1') {activation = (x) => constrainn(x, -1, 1); inputAct.setText('constrain(x, -1, 1)')}
        else if(arg == 'tanh') {activation = (x) => Math.tanh(x); inputAct.setText('Math.tanh(x)')}
        else if(arg == 'sin') {activation = (x) => Math.sin(x); inputAct.setText('Math.sin(x)')}
        else if(arg == 'x') {activation = (x) => x; inputAct.setText('x')}
        else if(arg == 'x^-1') {activation = (x) => Math.pow(x, -1); inputAct.setText('Math.pow(x, -1)')}
        else if(arg == 'abs') {activation = (x) => Math.abs(x); inputAct.setText('Math.abs(x)')}
        else if(arg == 'gaussian') {activation = (x) => Math.exp(-Math.pow(x, 2)); inputAct.setText('Math.exp(-Math.pow(x, 2))')}
        //fillGrid()
    }, true)
    let inputAct = panel.createInput()
    inputAct.w = 170
    inputAct.setText('Math.tanh(x)')
    
    inputAct.setFunc((arg) => {
        try {
            activation = new Function('x', `return ${arg};`)
        } catch (e) {
            console.error('Error parsing activation function:', e)
            inputAct.error()
        }
    }, true)

    panel.createSeparator()
    panel.createText('Warning: Flashing Lights')
    


    fillGrid()

    for(let i = 0; i < rows; i++){
        neighbourLUT[i] = []
        for(let j = 0; j < cols; j++){
            if(i % 2 == 1 && j == 0){
                neighbourLUT[i][j] = []
                continue
            }
            let neighbours = []
            let parity = j % 2 === 1;
            let neigOffsets = parity ? neigOffsetsSmall : neigOffsetsLarge;
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

    panel.update()
    panel.show()
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

