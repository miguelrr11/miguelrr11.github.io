//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let plot

function setup(){
    createCanvas(WIDTH, HEIGHT)
    plot = new MigPLOT(0, 0, 600, 600)
}

function draw(){
    background(0)
    plot.feed(noise(frameCount/100) * 50)
    plot.show()
}
