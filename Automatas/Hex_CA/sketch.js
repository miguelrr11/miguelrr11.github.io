//Hexagonal CA
//Miguel Rodríguez
//06-05-2025

p5.disableFriendlyErrors = true
let WIDTH = 1400
let HEIGHT = 900

let grid = []
let neighbourLUT = []
let tamCell = 3
let rows = Math.ceil(HEIGHT/tamCell)
let cols = Math.ceil(WIDTH/tamCell)
let offTamCell = tamCell * .5

let gridShader;
let gridTex;
let gridBuffer;

let panel, skipFramesVar = true

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

let horSimVar = false
let vertSimVar = false
let inputs = []
function initInputs() {
    let wInput = 55, hInput = 30, padding = 7
    let baseX = padding * 2, baseY = 145
    
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

    let horSim = panel.createCheckbox('Hor sym')
    horSim.reposition(baseX, baseY + hInput * 2 + padding)
    horSim.setFunc((arg) => {horSimVar = arg}, true)

    let vertSim = panel.createCheckbox('Ver sym')
    vertSim.reposition(baseX + wInput * 1.5 + padding * 2, baseY + hInput * 2 + padding)
    vertSim.setFunc((arg) => {vertSimVar = arg}, true)


    baseY += hInput 
    let btnRnd = panel.createButton('Random')
    btnRnd.reposition(baseX, baseY + hInput * 2 + padding, wInput * 1.5)
    btnRnd.setFunc(() => {
        fillGrid()
        if(!horSimVar && !vertSimVar){
            for (let i = 0; i < 7; i++) {
                filter[i] = round(Math.random() * 2 - 1, 3)
            }
        }
        else if(horSimVar && vertSimVar){
            let rnd = Math.random() * 2 - 1
            for (let i = 0; i < 7; i++) {
                filter[i] = round(rnd, 3)
            }
            filter[1] = round(Math.random() * 2 - 1, 3)
        }
        else if(horSimVar && !vertSimVar){
            filter[0] = round(Math.random() * 2 - 1, 3)
            filter[2] = filter[0]
            filter[3] = round(Math.random() * 2 - 1, 3)
            filter[4] = filter[3]
            filter[5] = round(Math.random() * 2 - 1, 3)
            filter[6] = filter[5]
            filter[1] = round(Math.random() * 2 - 1, 3)

        }
        else if(vertSimVar && !horSimVar){
            filter[3] = round(Math.random() * 2 - 1, 3)
            filter[5] = filter[3]
            filter[4] = round(Math.random() * 2 - 1, 3)
            filter[6] = filter[4]
            filter[0] = round(Math.random() * 2 - 1, 3)
            filter[1] = round(Math.random() * 2 - 1, 3)
            filter[2] = round(Math.random() * 2 - 1, 3)
        }
        for (let i = 0; i < 7; i++) {
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
    {filter: [0.161, 0.354, -0.078, -0.716, -0.207, -0.162, 0.478], activation: 'abs', name: 'sierpinski'},
    {filter: [0.308, -0.313, -0.726, -0.607, 0.036, -0.898, 0.884], activation: 'tanh', name: 'sludge'},
    {filter: [0.681, -0.43, 0.692, -0.252, -0.004, 0.74, 0.027], activation: 'gaussian', name: 'worms'},
];

let presavedMap = Object.fromEntries(presaved.map(p => [p.name, { filter: p.filter, activation: p.activation }]));

const activationFuncs = {
    'x':        { fn: x => x, code: 'x' },
    'x^-1':     { fn: x => Math.pow(x, -1), code: 'Math.pow(x, -1)' },
    'between -1 and 1': { fn: x => constrain(x, -1, 1), code: 'constrain(x, -1, 1)' },
    'sin':      { fn: x => Math.sin(x), code: 'Math.sin(x)' },
    'tanh':     { fn: x => Math.tanh(x), code: 'Math.tanh(x)' },
    'abs':      { fn: x => Math.abs(x), code: 'Math.abs(x)' },
    'gaussian': { fn: x => Math.exp(-Math.pow(x, 2)), code: 'Math.exp(-Math.pow(x, 2))' }
};

function setActivationByName(name, input) {
    const act = activationFuncs[name];
    if (act) {
        activation = act.fn;
        input.setText(act.code);
    }
}


async function setup(){
    let fontPanel = await loadFont("migUI/main/bnr.ttf");
    WIDTH = windowWidth;
    HEIGHT = windowHeight;
    rows = Math.ceil(HEIGHT / tamCell);
    cols = Math.ceil(WIDTH / tamCell);
    createCanvas(WIDTH, HEIGHT);
    frameRate(60);

    panel = new Panel({
        x: 0,
        theme: 'techno',
        title: 'Hexagonal CA',
        font: fontPanel,
        h: 300,
        automaticHeight: true,
        w: 210,
        retractable: true,
    });

    panel.createSeparator();
    panel.createText('Filter', true);
    initInputs();

    panel.createSeparator();
    panel.createText('Activation', true);

    let selAct = panel.createSelect(Object.keys(activationFuncs), 'tanh');
    selAct.w = 170;
    let inputAct = panel.createInput();
    inputAct.w = 170;
    inputAct.setText('Math.tanh(x)');

    selAct.setFunc((arg) => {
        setActivationByName(arg, inputAct);
    }, true);

    inputAct.setFunc((arg) => {
        try {
            activation = new Function('x', `return ${arg};`);
        } catch (e) {
            console.error('Error parsing activation function:', e);
            inputAct.error();
        }
    }, true);

    panel.createSeparator();
    panel.createText('Examples', false, true);
    let selPresaved = panel.createOptionPicker('', Object.keys(presavedMap));
    selPresaved.setFunc((name) => {
        let selected = presavedMap[name];
        if (selected) {
            for (let i = 0; i < 7; i++) {
                filter[i] = selected.filter[i];
                inputs[i].setText(filter[i].toString());
            }
            setActivationByName(selected.activation, inputAct);
            fillGrid();
        }
    }, true);

    panel.createSeparator();
    panel.createText('Settings', false, true);
    let tamCellInput = panel.createSlider(2, 20, tamCell, 'Tam cell', true);
    tamCellInput.reposition(undefined, undefined, 170);
    tamCellInput.integer = true;
    tamCellInput.setFunc((arg) => {
        tamCell = arg;
        rows = Math.ceil(HEIGHT / tamCell);
        cols = Math.ceil(WIDTH  / tamCell);
        offTamCell = tamCell * 0.5;
      
        if (gridBuffer) gridBuffer.remove();

        gridShader = createShader(vert, frag);
        gridTex    = createImage(rows, cols);
        gridBuffer = createGraphics(WIDTH, HEIGHT, WEBGL);
        gridBuffer.noStroke();
      
        fillGrid();
        buildNeighbourLookup();
    }, true);

    let sk = panel.createCheckbox('Skip frames', true);
    sk.setFunc((arg) => {skipFramesVar = arg}, true);

    panel.createSeparator();
    let tx = panel.createText('Warning: Flashing Lights');
    tx.textSize -= 2

    fillGrid();
    buildNeighbourLookup();
    gridShader = createShader(vert, frag);
    gridTex = createImage(rows, cols);
    gridBuffer = createGraphics(WIDTH, HEIGHT, WEBGL);
    gridBuffer.noStroke();
}

function buildNeighbourLookup() {
    for (let i = 0; i < rows; i++) {
        neighbourLUT[i] = [];
        for (let j = 0; j < cols; j++) {
            if (i % 2 === 1 && j === 0) {
                neighbourLUT[i][j] = [];
                continue;
            }
            let neighbours = [];
            let parity = j % 2 === 1;
            let neigOffsets = parity ? neigOffsetsSmall : neigOffsetsLarge;
            for (let off of neigOffsets) {
                let newI = i + off[0];
                let newJ = j + off[1];
                if (newI < 0 || newI >= rows || newJ < 0 || newJ >= cols || (i % 2 === 1 && newJ === 0)) {
                    neighbours.push(undefined);
                } else {
                    neighbours.push([newI, newJ]);
                }
            }
            neighbourLUT[i][j] = neighbours;
        }
    }
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
    if(!skipFramesVar || (skipFramesVar && frameCount % 2 == 0)){
        updateGridTexture();
    }
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
    const R = rows, C = cols;
    const G = grid;               
    const LUT = neighbourLUT;    
    const F = filter;             
    const ACT = activation;       
  
    for(let i = 0; i < R; i++){
        const isOdd = i & 1;  
        const jStart = isOdd ? 1 : 0;
        for(let j = jStart; j < C; j++){
            let sum = 0;
            const neigh = LUT[i][j];
            for(let k = 0; k < 7; k++){
                const n = neigh[k];
                if (n) sum += G[n[0]][n[1]] * F[k];
            }

            G[i][j] = ACT(sum);
        }
    }
}