//Particulate
//Miguel Rodríguez
//20-08-2025

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 800

let graph



function setup(){
    createCanvas(WIDTH, HEIGHT)
    graph = new Graph();

    createBar()
}


function draw(){
    background(255)

    fill(0)
    noStroke()
    if(state) text(state, 10, 20)

    graph.show();
    showBar()
    showInputManager()
}

let buttons = []
function createBar(){
    let buttonConst = new Button(createVector(0, HEIGHT - H_BUTTON), 'N', () => {
        graph.addNode(new NodeConstant(floor(random(10))));
    });
    let buttonVar = new Button(createVector(W_BUTTON * 1, HEIGHT - H_BUTTON), 'Var', () => {
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

    buttons.push(buttonConst);
    buttons.push(buttonVar);
    buttons.push(buttonSum);
    buttons.push(buttonSub);
    buttons.push(buttonMul);
    buttons.push(buttonDiv);
    buttons.push(buttonSqrt);
    buttons.push(buttonLog);
    buttons.push(buttonExp);
    buttons.push(buttonCondEq);
    buttons.push(buttonCondLess);
    buttons.push(buttonCondMore);

    let buttonSim = new Button(createVector(W_BUTTON * 0, 0), 'Sim', () => {
        graph.evaluate()
    });
    let buttonReset = new Button(createVector(W_BUTTON * 1, 0), 'Reset', () => {
        graph.reset()
    });

    buttons.push(buttonSim);
    buttons.push(buttonReset);
}

function showBar(){
    for(let button of buttons){
        button.show();
    }
}

