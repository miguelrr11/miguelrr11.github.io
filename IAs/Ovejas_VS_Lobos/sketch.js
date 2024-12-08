//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true

let sim

function setup(){
    createCanvas(WIDTH, HEIGHT)
    fill(255)

    sim = new Simulation()
    console.log(sim)
}

function zzz(){
    found = entorno.findClosest(createVector(mouseX, mouseY), 50, 'food')
    if(found) entorno.eat(found)
    pos = createVector(mouseX, mouseY)
}

function draw(){
    background(0)
    sim.update()
    sim.show()
}
