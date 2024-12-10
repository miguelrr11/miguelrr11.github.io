//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true

let sim

function setup(){
    createCanvas(WIDTH + WIDTH_UI, HEIGHT)
    fill(255)

    sim = new Simulation()
    console.log(sim)
}

function draw(){
    background(0)
    sim.update()
    sim.show()
}
