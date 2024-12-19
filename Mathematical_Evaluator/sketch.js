//
//Miguel Rodríguez
//

//y = f(x)

p5.disableFriendlyErrors = true
const WIDTH = 900
const HEIGHT = 900
let graphs = []
let font 
let colors = ["#ef476f", "#ffbe0b", "#06d6a0", "#118ab2", "#0C637F"]
let panel


function preload(){
    font = loadFont('Roboto-Light.ttf')
}

function setup(){
    createCanvas(WIDTH+300, HEIGHT)
    textFont(font)
    panel = new Panel({
        x: WIDTH,
        w: 300,
        automaticHeight: false,
        lightCol: [100, 100, 100],
        darkCol: [230, 230, 230],
        title: 'GRAPHING CALCULATOR',
        stackable: false
    })
    panel.createSeparator()
    panel.createText("Enter a function in the form y = f(x) and press enter. You may introduce variables A, B, C, etc and common mathematical functions like sin, cos, tan, sqrt, etc.")
    panel.createSeparator()
    panel.createInput("y = f(x)", createGraph, true)
    panel.createSeparator()

    // createGraph("y = atan2(cos(x), sin(x))")
    // createGraph("y = floor(x)")
    // createGraph("y = ceil(x)")
    // createGraph("y = sign(x)")
    // createGraph("y = abs(x) - 7")
    // createGraph("y = round(x)")
    // createGraph("y = x - floor(x)")
    // createGraph("y = sign(sin(x))")
    // createGraph("y = tan(x)")
    // createGraph("y = sqrt(9-pow(x,2))")
    // createGraph("y = -sqrt(9-pow(x,2))")
    // createGraph("y = Ax")
    // createGraph("y = sin(pow(A,x))")
    // createGraph("y = Bx")
    //createGraph("y*sin(y)=x*sin(x)")
    //createGraph("pow(y,2)=pow(x,2)*((sin(x)+y)/(sin(y)+x))")

    createGraph("y = A/x + B")


}

function updateGraphs(){
    for(let g of graphs){
        g.graph.update()
    }
}


function createGraph(arg){
    graphs.push({
        cb: panel.createCheckbox(arg, true),
        graph: new Graph(arg, colors[graphs.length%(colors.length)])
    })
    graphs[graphs.length-1].cb.lightCol = graphs[graphs.length-1].graph.col
}

function draw(){
    background(230)
    let val = 1
    // if(keyIsPressed){
    //     if(keyCode == DOWN_ARROW){
    //         min += val
    //         max -= val
    //         updateGraphs()
    //     }
    //     if(keyCode == UP_ARROW){
    //         min -= val
    //         max += val
    //         updateGraphs()
    //     }
    // }
    
    showAxis()
    //textFont(font)
    for(let g of graphs){ 
        if(g.cb.isChecked()) g.graph.show(frameCount*5)
    }
    panel.update()
    panel.show()
}
