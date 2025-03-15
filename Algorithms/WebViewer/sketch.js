//WebViewer
//Miguel Rodríguez
//12-03-2025

p5.disableFriendlyErrors = true
let scl = 0.7
const WIDTH = 1920*scl
const HEIGHT = 1080*scl

let hoveredParticle = null
let draggedParticle = null

let parentParticles = []

let constraints = []
let particles = []

let initialLink = 'https://es.wikipedia.org/wiki/Tool'
//let initialLink = 'https://es.wikipedia.org/wiki/The_Legend_of_Zelda:_Breath_of_the_Wild'
//let initialLink = 'https://es.wikipedia.org/wiki/Segunda_Guerra_Mundial'
//let initialLink = 'https://en.wikipedia.org/wiki/History_of_France'

let xOff = 0
let yOff = 0
let prevMouseX, prevMouseY
let zoom = 1

let framesPerAnimation = 60 * 2

let colors  

function mouseClicked(){
    console.log(hoveredParticle)
}

function mouseReleased(){
    prevMouseX = undefined
    prevMouseY = undefined
    draggedParticle = null
}

function mouseWheel(event) {
    zoom += event.delta / 1000
    zoom = constrain(zoom, 0.1, 5)
    return false
}

function mouseDragged(){
    if(hoveredParticle || draggedParticle) return
    if(!prevMouseX) prevMouseX = mouseX
    if(!prevMouseY) prevMouseY = mouseY
    let dx = mouseX - prevMouseX; // Change in mouse X
    let dy = mouseY - prevMouseY; // Change in mouse Y
    xOff += dx;
    yOff += dy;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

function doubleClicked(){
    if(hoveredParticle && !hoveredParticle.isParent && hoveredParticle.link){
        createGraph(hoveredParticle.link, hoveredParticle)
    }
    if(hoveredParticle && hoveredParticle.isParent){
        window.open(hoveredParticle.link, '_blank')
    }
}

function createGraph(link, p){
    extractAndFilterLinksCategorized(link)
    .then(categories => {
        console.log('Categories:', categories)
        let primordial = getP(p)
        primordial.isParent = true
        for(let i = 0; i < categories.length; i++){
            let links = categories[i].links.splice(0, floor(random(10, 100)))
            let exists = parentExists(categories[i].title, primordial)
            initFirstGraphCategorized(links, categories[i].title, primordial, categories.length == 1)
        }
    })
    .catch(err => console.error(err));
}

let animations = []

function getP(p){
    REST_DISTANCE = 250
    let parent = p.parent
    let a = atan2(p.pos.y - parent.pos.y, p.pos.x - parent.pos.x)

    let sep = (REST_DISTANCE + absoluteSeparationDistance)
    let x = p.pos.x + Math.cos(a) * sep
    let y = p.pos.y + Math.sin(a) * sep
    let pos = getFinalPos(createVector(cos(a), sin(a)), createVector(x, y), 0, REST_DISTANCE)
    let pCopy = new Particle(p.pos.x, p.pos.y, true, -1, p.link, p)
    

    let color
    if(Math.random() < 0.5){
        color = random(colors)
    }
    else{
        let auxColor = random(colors)
        color = lerpColor(auxColor, p.color, 0.5)
    }

    pCopy.color = color

    animations.push({
        particle: pCopy,
        finalPos: pos
    })

    particles.push(pCopy)
    let constraint = new Constraint(parent, pCopy)
    constraints.push(constraint)
    parent.constraint = constraint
    pCopy.constraint = constraint

    //remove p from parentParticles with indexOf
    for(let i = 0; i < particles.length; i++){
        if(particles[i] == p){
            particles.splice(i, 1)
            break
        }
    }
    //remove the constraint with p
    for(let i = 0; i < constraints.length; i++){
        if(constraints[i].p1 == p || constraints[i].p2 == p){
            constraints.splice(i, 1)
            break
        }
    }
    return pCopy
}

const absoluteSeparationDistance = 70
function initFirstGraphCategorized(links, title, primordial, fromPrimordial = false){
    REST_DISTANCE = getRadiusFromCircumference(links.length * RADIUS_PARTICLE*2)
    let rAngle = random(TWO_PI)
    let finalPos = primordial.pos.copy()
    for(let anim of animations){
        if(anim.particle == primordial){
            finalPos = anim.finalPos.copy()
            break
        }
    }
    let x, y
    if(!fromPrimordial){
        x = Math.cos(rAngle) * (REST_DISTANCE + 300) + finalPos.x
        y = Math.sin(rAngle) * (REST_DISTANCE + 300) + finalPos.y
    }
    else{
        x = finalPos.x
        y = finalPos.y
    }

    let pos = getFinalPos(createVector(Math.cos(rAngle), Math.sin(rAngle)), createVector(x, y), 0, REST_DISTANCE)
    parentParticles.push({
        pos: pos,
        radius: REST_DISTANCE
    })

    let p1
    if(!fromPrimordial){
        p1 = new Particle(primordial.pos.x, primordial.pos.y, true, -1, primordial.link)
        let constraint = new Constraint(primordial, p1)
        constraints.push(constraint)
        p1.str = title
        p1.isParent = true
        p1.color = color(255)
        p1.constraint = constraint
        primordial.constraint = constraint

        animations.push({
            particle: p1,
            finalPos: pos
        })
    }
    else p1 = primordial

    let deltaAngle = TWO_PI / links.length
    let col = randomizeColor(primordial.color, 50)
    let siblings = []
    let newParticles = []

    

    let radius = (REST_DISTANCE + 5)
    let deltaFrames = Math.floor(framesPerAnimation / links.length)
    for(let i = 0; i < links.length; i++){
        let pLink = findParticleByLink(links[i])
        if(true){   //if(pLink == undefined)
            let x2 = pos.x + Math.cos(deltaAngle * i) * radius
            let y2 = pos.y + Math.sin(deltaAngle * i) * radius
            let particle = new Particle(p1.pos.x, p1.pos.y, true, particles.length, links[i], p1)
            particle.color = col
            newParticles.push(particle)
            let constraint = new Constraint(p1, particle, radius)
            constraints.push(constraint)
            siblings.push(particle)
            particle.constraint = constraint

            animations.push({
                particle: particle,
                finalPos: createVector(x2, y2),
                parent: p1,
                framesTillStart: -(i * deltaFrames)
            })
        }
        else{
            siblings.push(pLink)
            let constraint = new Constraint(p1, pLink, radius)
            constraints.push(constraint)
            pLink.constraint = constraint
            pLink.siblings.push(p1)
            pLink.siblings.push(pLink)
        }
    }
    for(let p of newParticles){
        p.siblings = siblings
        particles.push(p)
    }
    particles.push(p1)
}
  

function setup(){
    createCanvas(WIDTH, HEIGHT)
    textFont('Arial')

    colors = [
        color(255, 133, 133),
        color(255, 200, 133),
        color(252, 255, 153),
        color(170, 255, 153),
        color(133, 245, 255),
        color(153, 192, 255),
        color(186, 173, 255),
        color(255, 173, 255)
    ]

    extractAndFilterLinksCategorized(initialLink)
    .then(categories => {
        let primordial = new Particle(width/2, height/2, true, -1, initialLink)
        primordial.isParent = true
        primordial.color = random(colors)
        for(let i = 0; i < categories.length; i++){
            let links = categories[i].links.splice(0, floor(random(10, 100)))
            initFirstGraphCategorized(links, categories[i].title, primordial)
        }
        particles.push(primordial)
    })
    .catch(err => console.error(err));

    initTopo()
}

function draw(){
    background(25)

    updateTopo()
    showTopo()

    translate(xOff, yOff)
    scale(zoom)

    updateAnimations()
    udpateGraph()
    showGraph()
    showHovered()


    // push()
    // noFill()
    // stroke(255, 100)
    // for(let p of parentParticles) ellipse(p.pos.x, p.pos.y, p.radius*2)
    // pop()
}

function showHovered(){
    if(hoveredParticle){
        hoveredParticle.show(true)
    }
}

function updateAnimations(){
    for(let i = animations.length - 1; i >= 0; i--){
        let anim = animations[i]
        let p = anim.particle
        if(anim.parent && animations.some(a => a.particle == anim.parent)){
            p.pos = anim.parent.pos.copy()
            continue
        }
        let finalPos = anim.finalPos
        if(anim.framesTillStart == undefined || anim.framesTillStart > 0) p.pos.lerp(finalPos, 0.05)
        if(anim.framesTillStart != undefined) anim.framesTillStart++
        let d = dist(p.pos.x, p.pos.y, finalPos.x, finalPos.y)
        if(d < 1){
            if(anim.parent) p.isPinned = false
            p.removeInertia()
            animations.splice(i, 1)
        }
    }
}



function showGraph(){
    for(let c of constraints) c.show()
    for(let p of particles) p.show()
}

function udpateGraph(){
    for(let p of particles){
        if(p.isParent){
            let n = noise(p.pos.x, p.pos.y, frameCount*10)
            n = mapp(n, 0, 1, -1, 1)
            let force = createVector(Math.cos(n), Math.sin(n))
            force.rotate(p.angle)
            force.mult(0.2)
            p.applyForce(force)
            p.isPinned = false
        }
        
        
        p.repel(p.siblings)
        p.update(0.1)

        if(p.isParent){
            p.isPinned = true
        }
    }
    for(let i = 0; i < 5; i++){
        for(let c of constraints) c.satisfy()
    }
}

function getRadiusFromCircumference(length) {
    const radius = length / (2 * Math.PI);
    return radius;
}

//TODO: try the direction and the opposite direction, choose the smaller one
function getFinalPos(direction, start, minDistance, radius, randomSep = Math.random() * 50 + 20){
    //this function tries to position a circle of a fixed radius. this circle can only be placed in a line that goes from start and has a direction.
    //It will do this checking if it collides with any of the circles of parentParticles
    //kind of like a raycast
    let pos1 = getFinalPosAux(direction, start, minDistance, radius, randomSep)
    let pos2 = getFinalPosAux(direction.mult(-1), start, minDistance, radius, randomSep)
    let d1 = dist(pos1.x, pos1.y, start.x, start.y)
    let d2 = dist(pos2.x, pos2.y, start.x, start.y)
    if(d1 < d2) return pos1
    return pos2
}

function getFinalPosAux(direction, start, minDistance, radius, randomSep){
    let pos = start.copy()
    let distance = minDistance
    let dir = direction.copy()
    dir.normalize()
    dir.mult(distance)
    pos.add(dir)
    let collision = false
    for(let p of parentParticles){
        let d = dist(pos.x, pos.y, p.pos.x, p.pos.y)
        if(d < (radius + p.radius + randomSep)){
            collision = true
            break
        }
    }
    if(collision){
        distance += 10
        return getFinalPosAux(direction, start, distance, radius, randomSep)
    }
    return pos
}

function removeBarrabaja(str){
    //this function replaces any _ with a space
    if(str == undefined) return ''
    let newStr = ''
    for(let i = 0; i < str.length; i++){
        if(str[i] == '_') newStr += ' '
        else newStr += str[i]
    }
    return newStr
}

function getAllStr(){
    let str = ""
    for(let p of particles){
        if(p.str == undefined) continue
        str += p.str + ', '
    }
    return str
}

function parentExists(str, avoid){
    for(let p of particles){
        if(p != avoid && p.isParent && p.str == str) return true
    }
    return false
}

function findParticleByLink(link){
    for(let p of particles){
        if(p.link == link) return p
    }
    return undefined
}

