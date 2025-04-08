//Soft Body Creator
//Miguel Rodríguez
//08-04-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let particles = []
let constraints = []

let creatingConstraint = null
let draggingParticle = null

function doubleClicked() {
    particles.push(new Particle(mouseX, mouseY, false, particles.length))
}

function mouseDragged(){
    if(creatingConstraint) return
    if(draggingParticle){
        draggingParticle.pos.x = mouseX
        draggingParticle.pos.y = mouseY
        return
    }
    for(let p of particles){
        if(p.inBounds(mouseX, mouseY)){
            if(!keyIsPressed){
                creatingConstraint = p
                return
            }
            else{
                draggingParticle = p
                return
            }
        }
    }
}

function mouseReleased(){
    if(creatingConstraint){
        for(let p of particles){
            if(p == creatingConstraint) continue
            if(p.inBounds(mouseX, mouseY)){
                constraints.push(new Constraint(creatingConstraint, p, dist(p.pos.x, p.pos.y, creatingConstraint.pos.x, creatingConstraint.pos.y)))
                creatingConstraint = null
                return
            }
        }
        creatingConstraint = null
    }
    draggingParticle = null
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
}

function draw(){
    background(0)

    for(let c of constraints){
       for(let i = 0; i < 10; i++) c.satisfy()
    }

    for(let i = 0; i < particles.length; i++){
        particles[i].update(deltaTime)
        particles[i].constrainToBounds()
        particles[i].show()
    }

    for(let c of constraints){
        c.show()
    }

    stroke(255)
    if(creatingConstraint) line(creatingConstraint.pos.x, creatingConstraint.pos.y, mouseX, mouseY)
}
