//Particulate
//Miguel Rodríguez
//20-08-2025

// TODO: hacer un node con 2 entradas y su ouput sea la entrada que no sea undefined

p5.disableFriendlyErrors = true
const WIDTH = GRID_SIZE * 16
const HEIGHT = GRID_SIZE * 10

let graph, partMan
let playing = false

let NodeID = 0;

let font

async function setup(){
    createCanvas(WIDTH, HEIGHT)
    font = await loadFont('DSfont.ttf')
    textFont(font)
    graph = new Graph();
    partMan = new ParticleManager();

    createBar()
    createPropertyButtons()

    spawnConstants()
}


function draw(){
    background(VERY_LIGHT_COL)
    showGrid()

    fill(0)
    noStroke()
    if(state) text(state, 10, 20)

    graph.show();
    if(playing){ 
        graph.evaluate();
    }
    partMan.updateParticles();
    partMan.drawParticles();
    showBar()
    showInputManager()

    fill(VERY_DARK_COL)
    noStroke()
    textSize(15)
    textAlign(LEFT, CENTER)
    text('Add Nodes:', 20, HEIGHT - 65)
}

let buttons = []
function createBar(){
    let buttonConst = new Button(undefined, 'Constant', () => {
        graph.addNode(new NodeConstant(floor(random(10))));
    })
    let buttonVar = new Button(undefined, 'Variable', () => {
        graph.addNode(new NodeVariable());
    });
    let buttonSum = new Button(undefined, '+', () => {
        graph.addNode(new NodeSum());
    });
    let buttonSub = new Button(undefined, '-', () => {
        graph.addNode(new NodeSubtract());
    });
    let buttonMul = new Button(undefined, '*', () => {
        graph.addNode(new NodeMultiply());
    });
    let buttonDiv = new Button(undefined, '/', () => {
        graph.addNode(new NodeDivide());
    });
    let buttonSqrt = new Button(undefined, '√', () => {
        graph.addNode(new NodeSqrt());
    });
    let buttonLog = new Button(undefined, 'log', () => {
        graph.addNode(new NodeLog());
    });
    let buttonExp = new Button(undefined, 'exp', () => {
        graph.addNode(new NodeExp());
    });
    let buttonCondEq = new Button(undefined, '==', () => {
        graph.addNode(new NodeCondEqual(floor(random(10))));
    });
    let buttonCondLess = new Button(undefined, '<', () => {
        graph.addNode(new NodeCondLess(floor(random(10))));
    });
    let buttonCondMore = new Button(undefined, '>', () => {
        graph.addNode(new NodeCondMore(floor(random(10))));
    });
    let buttonRnd = new Button(undefined, 'Random', () => {
        graph.addNode(new NodeRnd());
    });
    let buttonParticulate = new Button(undefined, 'Properties', () => {
        graph.addNode(new NodeParticulate());
    });
    let buttonEmitter = new Button(undefined, 'Emitter', () => {
        graph.addNode(new NodeEmitter());
    });
    let buttonChooser = new Button(undefined, 'Chooser', () => {
        graph.addNode(new NodeChooser());
    });
    let buttonPow = new Button(undefined, 'Power', () => {
        graph.addNode(new NodePow());
    });
    let buttonSin = new Button(undefined, 'Sin', () => {
        graph.addNode(new NodeSin());
    });
    let buttonCos = new Button(undefined, 'Cos', () => {
        graph.addNode(new NodeCos());
    });

    

    let buttonsNodes = [buttonConst, buttonVar, buttonSum, buttonSub, buttonMul, buttonDiv, buttonSqrt, buttonLog, buttonExp, buttonPow, buttonSin, buttonCos, buttonCondEq, buttonCondLess, buttonCondMore, buttonRnd,  buttonChooser,  buttonParticulate, buttonEmitter];

    let nodes = [new NodeConstant(), new NodeVariable(), new NodeSum(), new NodeSubtract(), new NodeMultiply(), new NodeDivide(), new NodeSqrt(), new NodeLog(), new NodeExp(), new NodePow(), new NodeSin(), new NodeCos(), new NodeCondEqual(), new NodeCondLess(), new NodeCondMore(), new NodeRnd(), new NodeChooser(), new NodeParticulate(), new NodeEmitter()];

    for(let i = 0; i < buttonsNodes.length; i++){
        let button = buttonsNodes[i];
        let node = nodes[i]
        button.node = node; 
        node.pos = createVector(45 * i, HEIGHT - H_BUTTON);
        button.setPos(createVector(node.pos.x + node.width / 2, HEIGHT - H_BUTTON));
    }

    buttons.push(...buttonsNodes);

    let buttonSim = new Button(createVector(W_BUTTON * 0, 0), 'Pause', () => {
        if(!playing){ 
            playing = true;
            buttonSim.label = 'Pause';
        }
        else{
            playing = false;
            buttonSim.label = 'Play';
        }

    });
    let buttonStep = new Button(createVector(W_BUTTON * 1, 0), 'Step', () => {
        if(!playing){
            graph.evaluate();
        }
    });
    let buttonReset = new Button(createVector(W_BUTTON * 2, 0), 'Reset', () => {
        graph.reset()
    });
    let buttonClear = new Button(createVector(W_BUTTON * 3, 0), 'Clear', () => {
        graph = new Graph();
    });
    let buttonSave = new Button(createVector(W_BUTTON * 4, 0), 'Save', () => {
        if(graph.nodes.length == 0 && graph.connections.length == 0) return;
        let json = graph.stringify();
        localStorage.setItem('graph', json);
    });
    let buttonLoad = new Button(createVector(W_BUTTON * 5, 0), 'Load', () => {
        let json = localStorage.getItem('graph');
        if(json){
            graph.reconstruct(json);
        }
    });

    let buttonsControl = [buttonSim, buttonStep, buttonReset, buttonClear, buttonSave, buttonLoad];

    acum = 0;
    for(let i = 0; i < buttonsControl.length; i++){
        buttonsControl[i].setWidthByLabel();
        buttonsControl[i].pos.x = acum;
        acum += buttonsControl[i].w;
    }
    buttonSim.label = 'Play';
    buttons.push(...buttonsControl);
    
}

function createPropertyButtons(){
    for(let i = 0; i < propertyTags.length; i++){
        let tag = propertyTags[i];
        let button = new Button(undefined, tag, () => {
            if(button.check()){
                selected.addProperty(tag);
            }
        }, 
        () => { return selected != undefined && selected instanceof NodeParticulate });
        let newPos = createVector(WIDTH - 50, i * 25 + 10);
        button.setPos(newPos);
        button.txsize = 15
        button.w = 40
        button.h = 20
        buttons.push(button);
    }
}

function showBar(){
    for(let button of buttons){
        button.show();
    }
}

function showGrid(){
    stroke(LIGHT_COL);
    strokeWeight(2);
    for(let x = 0; x < width; x += GRID_SIZE){
        line(x, 0, x, height);
    }
    for(let y = 0; y < height; y += GRID_SIZE){
        line(0, y, width, y);
    }
}

function spawnConstants(){
    for(let i = 0; i < 10; i++){
        let node = new NodeConstant(i);
        node.pos = createVector(20, 50 + i * 70);
        graph.addNode(node);
    }
}
