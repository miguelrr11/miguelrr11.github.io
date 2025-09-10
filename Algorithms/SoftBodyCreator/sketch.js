//Soft Body Creator
//Miguel Rodríguez
//08-04-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let playing = true

let particles = []
let constraints = []

let creatingConstraint = null
let draggingParticle = null

function keyPressed(){
    if(key == 'c'){
        constraints = []
        particles = []
        creatingConstraint = null
        draggingParticle = null
    }
    if(keyCode == 32){
        playing = !playing
    }
}

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

    if(playing){
        for(let c of constraints){
            for(let i = 0; i < 10; i++) c.satisfy()
        }

        for(let i = 0; i < particles.length; i++){
            particles[i].update(deltaTime*10)
            particles[i].constrainToBounds()
        }
    }

    for(let i = 0; i < particles.length; i++){
        particles[i].show()
    }
    

    for(let c of constraints){
        c.show()
    }

    stroke(255)
    if(creatingConstraint) line(creatingConstraint.pos.x, creatingConstraint.pos.y, mouseX, mouseY)

    noStroke()
    fill(255)
    textSize(12)
    text("Double click to create a particle", 10, height - 44)
    text("Click and drag a particle while pressing a key to move it", 10, height - 28)
    text("Click and drag from one particle to another to create a constraint", 10, height - 12)
    text("Press 'c' to clear", 10, height - 60)
    text("Press space to play/pause", 10, height - 76)
    if(!playing){
        text("PAUSED", 10, 20)
    }

}
