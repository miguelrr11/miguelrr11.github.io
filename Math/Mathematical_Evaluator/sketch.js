//
//Miguel Rodríguez
//

//y = f(x)

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600
let graphs = []
let font 
let colors = ["#669900", "#006699", "#cc3399", "#ffcc00", "#06D6A0", 
              "#99cc33", "#3399cc", "#cc3399", "#ff6600", "#ff9900"]
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
        title: 'GRAPHING CALCULATOR'
    })
    panel.createSeparator()
    panel.createInput("y = f(x)", createGraph, true)

    // createGraph("y = atan2(cos(x), sin(x))")
    // createGraph("y = floor(x)")
    // createGraph("y = ceil(x)")
    // createGraph("y = sign(x)")
    // createGraph("y = abs(x) - 1")
    // createGraph("y = round(x)")
    // createGraph("y = x - floor(x)")
    // createGraph("y = sign(sin(x))")
    // createGraph("y = tan(x)")
}

function createGraph(arg){
    console.log(arg)
    graphs.push(new Graph(arg, colors[graphs.length%(colors.length)]))
}

function draw(){
    background(230)
    showAxis()
    for(let g of graphs) g.show(frameCount*5)
    panel.update()
    panel.show()
}
