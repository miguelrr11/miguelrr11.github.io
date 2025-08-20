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
    let nodeCons1 = new NodeConstant(5);
    graph.addNode(nodeCons1);
    let nodeCons2 = new NodeConstant(10);
    graph.addNode(nodeCons2);
    let nodeSum = new NodeSum();
    graph.addNode(nodeSum);
    graph.addConnection(new Connection(nodeCons1, 0, nodeSum, 0));
   //graph.addConnection(new Connection(nodeCons2, 0, nodeSum, 1));
    let nodeSum2 = new NodeSum();
    graph.addNode(nodeSum2);
    graph.addConnection(new Connection(nodeSum, 0, nodeSum2, 0));
    graph.addConnection(new Connection(nodeCons1, 0, nodeSum2, 1));

    graph.addNode(new NodeConstant(30))
}


function draw(){
    background(255)

    fill(0)
    noStroke()
    if(state) text(state, 10, 20)

    graph.show();
    showInputManager()
}
