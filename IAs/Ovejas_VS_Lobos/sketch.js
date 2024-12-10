//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true

let sim

function setup(){
    createCanvas(WIDTH + WIDTH_UI, HEIGHT)
    sim = new Simulation()
}

function draw(){
    sim.update()
    sim.show()
}
