//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let plotSin, plotCos

function setup(){
    createCanvas(WIDTH, HEIGHT)
    plotSin = new MigPLOT(0, 0, 600, 600, [], 'Fitness', 'Generation')
    plotCos = new MigPLOT(0, 0, 600, 600, [], 'Fitness', 'Generation')
}

function draw(){
    background(0)
    plotSin.feed(sin(frameCount/150) * 50)
    plotSin.show()
    // plotCos.feed(cos(frameCount/150) * 50)
    // plotCos.show()
}
