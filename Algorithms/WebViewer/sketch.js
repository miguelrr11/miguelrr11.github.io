//WebViewer
//Miguel Rodríguez
//12-03-2025

p5.disableFriendlyErrors = true
let scl = 0.7
const WIDTH = 1920*scl
const HEIGHT = 1080*scl

let hoveredParticle = null

let parentParticles = []

let constraints = []
let particles = []

let initialLink = 'https://en.wikipedia.org/wiki/Hollow_Knight'

function doubleClicked(){
    if(hoveredParticle && hoveredParticle.link){
        createGraph(hoveredParticle.link, hoveredParticle)
    }
}

function createGraph(link, p){
    extractAndFilterLinks(link)
    .then(links => {
        initSecondaryGraph(links.splice(30, floor(random(10, 100))), p)
    })
    .catch(err => console.error(err));
}

const absoluteSeparationDistance = 70
function initSecondaryGraph(links, p){
    REST_DISTANCE = getRadiusFromCircumference(links.length * RADIUS_PARTICLE*2) * 1.1
    p.isPinned = true   //importante
    let deltaAngle = TWO_PI / links.length
    let parent = p.parent
    let a = atan2(p.pos.y - parent.pos.y, p.pos.x - parent.pos.x)
    let sep = (REST_DISTANCE + absoluteSeparationDistance)
    let x = p.pos.x + cos(a) * sep
    let y = p.pos.y + sin(a) * sep
    let pos = getFinalPos(createVector(cos(a), sin(a)), createVector(x, y), 0, REST_DISTANCE)
    let pCopy = new Particle(pos.x, pos.y, true, -1, p.link, p)
    particles.push(pCopy)
    constraints.push(new Constraint(p, pCopy))

    for(let i = 0; i < links.length; i++){
        let x = pCopy.pos.x + cos(deltaAngle * i) * REST_DISTANCE
        let y = pCopy.pos.y + sin(deltaAngle * i) * REST_DISTANCE
        let newP = new Particle(x, y, false, particles.length, links[i], pCopy)
        particles.push(newP)
        constraints.push(new Constraint(pCopy, newP))
    }

    parentParticles.push({
        particle: pCopy,
        radius: REST_DISTANCE
    })
}

function initFirstGraph(links){
    REST_DISTANCE = getRadiusFromCircumference(links.length * RADIUS_PARTICLE*2)
    let p1 = new Particle(width/2, height/2, true, -1)
    let deltaAngle = TWO_PI / links.length

    for(let i = 0; i < links.length; i++){
        let x = p1.pos.x + cos(deltaAngle * i) * REST_DISTANCE
        let y = p1.pos.y + sin(deltaAngle * i) * REST_DISTANCE
        particles.push(new Particle(x, y, false, particles.length, links[i], p1))
        constraints.push(new Constraint(p1, particles[i]))
    }
    particles.push(p1)

    parentParticles.push({
        particle: p1,
        radius: REST_DISTANCE
    })
}
  

function setup(){
    createCanvas(WIDTH, HEIGHT)

    extractAndFilterLinks(initialLink)
    .then(links => {
        initFirstGraph(links.splice(30, floor(random(10, 150))))
    })
    .catch(err => console.error(err));
}

function draw(){
    background(0)
    udpateGraph()
    showGraph()
}

function showGraph(){
    for(let c of constraints) c.show()
    for(let p of particles) p.show()
}

function udpateGraph(){
    for(let p of particles){
        let n = noise(p.pos.x, p.pos.y, frameCount*10)
        n = map(n, 0, 1, -1, 1)
        //apply a tangential force to the particle
        let force = createVector(cos(n), sin(n))
        force.rotate(p.angle)
        force.mult(0.2)
        p.applyForce(force)
        p.repel(particles, RADIUS_PARTICLE*2)
        p.repelGroup(particles, RADIUS_PARTICLE*10)
        p.update(deltaTime/50)
        //p.constrainToBounds()
    }
    for(let i = 0; i < 10; i++){
        for(let c of constraints) c.satisfy()
    }
}

function getRadiusFromCircumference(length) {
    const radius = length / (2 * Math.PI);
    return radius;
}

function getFinalPos(direction, start, minDistance, radius, randomSep = Math.random() * 50){
    //this function tries to position a circle of a fixed radius. this circle can only be placed in a line that goes from start and has a direction.
    //It will do this checking if it collides with any of the circles of parentParticles
    //kind of like a raycast
    let pos = start.copy()
    let distance = minDistance
    let dir = direction.copy()
    dir.normalize()
    dir.mult(distance)
    pos.add(dir)
    let collision = false
    for(let p of parentParticles){
        let d = dist(pos.x, pos.y, p.particle.pos.x, p.particle.pos.y)
        if(d < (radius + p.radius + randomSep)){
            collision = true
            break
        }
    }
    if(collision){
        distance += 10
        return getFinalPos(direction, start, distance, radius, randomSep)
    }
    return pos
}
