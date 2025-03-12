//WebViewer
//Miguel Rodríguez
//12-03-2025

p5.disableFriendlyErrors = true
let scl = 0.7
const WIDTH = 1920*scl
const HEIGHT = 1080*scl

let hoveredParticle = null

let constraints = []
let particles = []

let initialLink = 'https://en.wikipedia.org/wiki/Hollow_Knight'

function doubleClicked(){
    if(hoveredParticle && hoveredParticle.link){
        createSecondaryGraph(hoveredParticle.link, hoveredParticle)
    }
}

function createSecondaryGraph(link, p){
    extractAndFilterLinks(link)
    .then(links => {
        initSecondaryGraph(links.splice(30, floor(random(10, 150))), p)
    })
    .catch(err => console.error(err));
}

function initSecondaryGraph(links, p){
    REST_DISTANCE = getRadiusFromCircumference(links.length * RADIUS_PARTICLE*2)
    p.isPinned = true   //importante
    let deltaAngle = TWO_PI / links.length

    for(let i = 0; i < links.length; i++){
        let x = p.pos.x + cos(deltaAngle * i) * REST_DISTANCE
        let y = p.pos.y + sin(deltaAngle * i) * REST_DISTANCE
        let newP = new Particle(x, y, false, particles.length, links[i])
        particles.push(newP)
        constraints.push(new Constraint(p, newP))
    }
}

function initFirstGraph(links){
    REST_DISTANCE = getRadiusFromCircumference(links.length * RADIUS_PARTICLE*2)
    let p1 = new Particle(width/2, height/2, true, -1)
    let deltaAngle = TWO_PI / links.length

    for(let i = 0; i < links.length; i++){
        let x = p1.pos.x + cos(deltaAngle * i) * REST_DISTANCE
        let y = p1.pos.y + sin(deltaAngle * i) * REST_DISTANCE
        particles.push(new Particle(x, y, false, particles.length, links[i]))
        constraints.push(new Constraint(p1, particles[i]))
    }
    particles.push(p1)
}

function setup(){
    createCanvas(WIDTH, HEIGHT)

    extractAndFilterLinks(initialLink)
    .then(links => {
        initFirstGraph(links)
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
        //p.applyForce(createVector(cos(noise(p.pos.x, p.pos.y, frameCount)) * 10, sin(noise(p.pos.x, p.pos.y, frameCount)) * 10 ))
        p.repel(particles, RADIUS_PARTICLE*2)
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