//Particulate
//Miguel Rodríguez
//20-08-2025

// TODO: hacer un node con 2 entradas y su ouput sea la entrada que no sea undefined

p5.disableFriendlyErrors = true
const WIDTH = 1300
const HEIGHT = 800

let graph, partMan
let playing = false

let font

async function setup(){
    createCanvas(WIDTH, HEIGHT)
    font = await loadFont('DSfont.ttf')
    textFont(font)
    graph = new Graph();
    partMan = new ParticleManager();

    createBar()
}


function draw(){
    background(240)

    fill(0)
    noStroke()
    if(state) text(state, 10, 20)

    graph.show();
    if(playing) graph.evaluate();
    partMan.updateParticles();
    partMan.drawParticles();
    showBar()
    showInputManager()
}

let buttons = []
function createBar(){
    let buttonConst = new Button(createVector(0, HEIGHT - H_BUTTON), 'Constant', () => {
        graph.addNode(new NodeConstant(floor(random(10))));
    });
    let buttonVar = new Button(createVector(W_BUTTON * 1, HEIGHT - H_BUTTON), 'Variable', () => {
        graph.addNode(new NodeVariable());
    });
    let buttonSum = new Button(createVector(W_BUTTON * 2, HEIGHT - H_BUTTON), '+', () => {
        graph.addNode(new NodeSum());
    });
    let buttonSub = new Button(createVector(W_BUTTON * 3, HEIGHT - H_BUTTON), '-', () => {
        graph.addNode(new NodeSubtract());
    });
    let buttonMul = new Button(createVector(W_BUTTON * 4, HEIGHT - H_BUTTON), '*', () => {
        graph.addNode(new NodeMultiply());
    });
    let buttonDiv = new Button(createVector(W_BUTTON * 5, HEIGHT - H_BUTTON), '/', () => {
        graph.addNode(new NodeDivide());
    });
    let buttonSqrt = new Button(createVector(W_BUTTON * 6, HEIGHT - H_BUTTON), '√', () => {
        graph.addNode(new NodeSqrt());
    });
    let buttonLog = new Button(createVector(W_BUTTON * 7, HEIGHT - H_BUTTON), 'log', () => {
        graph.addNode(new NodeLog());
    });
    let buttonExp = new Button(createVector(W_BUTTON * 8, HEIGHT - H_BUTTON), 'exp', () => {
        graph.addNode(new NodeExp());
    });
    let buttonCondEq = new Button(createVector(W_BUTTON * 9, HEIGHT - H_BUTTON), '==', () => {
        graph.addNode(new NodeCondEqual(floor(random(10))));
    });
    let buttonCondLess = new Button(createVector(W_BUTTON * 10, HEIGHT - H_BUTTON), '<', () => {
        graph.addNode(new NodeCondLess(floor(random(10))));
    });
    let buttonCondMore = new Button(createVector(W_BUTTON * 11, HEIGHT - H_BUTTON), '>', () => {
        graph.addNode(new NodeCondMore(floor(random(10))));
    });
    let buttonRnd = new Button(createVector(W_BUTTON * 12, HEIGHT - H_BUTTON), 'Random', () => {
        graph.addNode(new NodeRnd());
    });
    let buttonParticulate = new Button(createVector(W_BUTTON * 13, HEIGHT - H_BUTTON), 'Properties', () => {
        graph.addNode(new NodeParticulate());
    });
    let buttonEmitter = new Button(createVector(W_BUTTON * 14, HEIGHT - H_BUTTON), 'Emitter', () => {
        graph.addNode(new NodeEmitter());
    });
    let buttonChooser = new Button(createVector(W_BUTTON * 15, HEIGHT - H_BUTTON), 'Chooser', () => {
        graph.addNode(new NodeChooser());
    });

    let buttonsNodes = [buttonConst, buttonVar, buttonSum, buttonSub, buttonMul, buttonDiv, buttonSqrt, buttonLog, buttonExp, buttonCondEq, buttonCondLess, buttonCondMore, buttonRnd, buttonParticulate, buttonEmitter, buttonChooser];

    let acum = buttonsNodes[0].w;
    for(let i = 1; i < buttonsNodes.length; i++){
        buttonsNodes[i].pos.x = acum;
        acum += buttonsNodes[i].w;
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
    buttonSim.label = 'Play'
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

    acum = buttonsControl[0].w;
    for(let i = 1; i < buttonsControl.length; i++){
        buttonsControl[i].pos.x = acum;
        acum += buttonsControl[i].w;
    }

    buttons.push(...buttonsControl);
    
}

function showBar(){
    for(let button of buttons){
        button.show();
    }
}

