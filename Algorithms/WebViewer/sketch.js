//WebViewer
//Miguel Rodríguez
//12-03-2025

p5.disableFriendlyErrors = true
let scl = 0.7
let WIDTH = 1920*scl
let HEIGHT = 1080*scl
let canvas, ctx

let hoveredParticle = null
let draggedParticle = null

let parentParticles = []

let constraints = []
let particles = []
let primordials = []

let animConn = []

let xOff = 0
let yOff = 0
let prevMouseX, prevMouseY
let zoom = 1
let currentEdges

let framesPerAnimation = 60 * 2

let colors  

let panelInput, font
let started = false
let errorFrames = 0

let dimmingLines = 1        //1 for increasing, -1 for decreasing
let transLines = 255

let btnReset = {
    x: WIDTH - 20,
    y: HEIGHT - 20,
    size: 20,
    img: undefined,
    dimm: 0,
    hovering: false,
    func: drawResetIcon,
    bool: false
}
let btnCenter = {
    x: WIDTH - 20,
    y: HEIGHT - 40,
    size: 20,
    img: undefined,
    dimm: 0,
    hovering: false,
    func: drawCenterIcon,
    bool: false
}

function resetState(){
    hoveredParticle = null
    draggedParticle = null

    parentParticles = []

    constraints = []
    particles = []
    primordials = []

    animConn = []

    xOff = 0
    yOff = 0
    prevMouseX, prevMouseY
    zoom = 1
    currentEdges

    framesPerAnimation = 60 * 2

    started = false
    errorFrames = 0

    dimmingLines = 1       
    transLines = 255

    btnReset.bool = false
}

function preload(){
    font = loadFont('bnr.ttf')
    btnReset.img = loadImage('reiniciar.png')
}

function mouseClicked(){
    if(hoveredParticle) console.log(hoveredParticle)
}

function mouseReleased(){
    prevMouseX = undefined
    prevMouseY = undefined
    draggedParticle = undefined
}

function mouseWheel(event) {
    if(!started) return
    btnCenter.bool = false
    zoom += event.delta / 1000
    zoom = constrain(zoom, 0.1, 5)
    return false
}

function mouseDragged(){
    if(hoveredParticle || draggedParticle || !started) return
    if(!prevMouseX) prevMouseX = mouseX
    if(!prevMouseY) prevMouseY = mouseY
    let dx = mouseX - prevMouseX; // Change in mouse X
    let dy = mouseY - prevMouseY; // Change in mouse Y
    xOff += dx;
    yOff += dy;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

function removeChild(child){
    let parent = child.parent
    for(let i = 0; i < parent.children.length; i++){
        if(parent.children[i] == child){ 
            parent.children.splice(i, 1)
            return
        }
    }
}

function existsPrimordial(link){
    for(let pri of primordials){
        if(pri.link == link) return pri
    }
    return undefined
}

function createConnection(p1, p2){
    constraints.push(new Constraint(p1, p2, dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y)))
}

function doubleClicked(){
    if(hoveredParticle && !hoveredParticle.isParent && hoveredParticle.link){
        let existingPri = existsPrimordial(hoveredParticle.link)
        if(existingPri != undefined){
            hoveredParticle.isPinned = true
            animConn.push({
                from: hoveredParticle,
                to: existingPri
            })
            //createConnection(hoveredParticle.parent, existingPri)
        }
        else{
            createGraph(hoveredParticle.link, getP(hoveredParticle))
        }
        removeChild(hoveredParticle)
    }
    if(hoveredParticle && hoveredParticle.isParent){
        window.open(hoveredParticle.link, '_blank')
    }
}

function createGraph(link, p){
    return extractAndFilterLinksCategorized(link)
    .then(categories => {
        let primordial = p
        primordial.isParent = true;
        primordial.isPinned = true;
        console.log(primordial)
        primordials.push(primordial);
        for (let i = 0; i < categories.length; i++){
            let links = categories[i].links.splice(0, floor(random(10, 100)));
            initFirstGraphCategorized(links, categories[i].title, primordial, categories.length == 1);
        }
    })
    .catch(err => {
        throw err;
    });
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
    parentParticles.push({
        pos: pos.copy(),
        radius: 50
    })
    let constraint = new Constraint(parent, pCopy)
    constraints.push(constraint)
    parent.constraint = constraint
    pCopy.constraint = constraint

    removeParticle(p)
    removeConstraint(p)

    return pCopy
}

function removeParticle(p){
    for(let i = 0; i < particles.length; i++){
        if(particles[i] == p){
            particles.splice(i, 1)
            break
        }
    }
}

function removeConstraint(p){
    for(let i = 0; i < constraints.length; i++){
        if(constraints[i].p1 == p || constraints[i].p2 == p){
            constraints.splice(i, 1)
            break
        }
    }
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
        radius: REST_DISTANCE + RADIUS_PARTICLE * 2
    })

    let p1
    if(!fromPrimordial){
        p1 = new Particle(primordial.pos.x, primordial.pos.y, true, -1, primordial.link)
        p1.link = primordial.link + '#' + replaceBlankWithBarraBaja(title)
        let constraint = new Constraint(primordial, p1)
        constraints.push(constraint)
        p1.str = (title)
        p1.isParent = true
        p1.parent = primordial
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
        let sameLinks = findAllParticlesByLink(links[i])
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
            particle.relations = sameLinks

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
    p1.children = siblings
    particles.push(p1)
}
  

function setup(){
    WIDTH = windowWidth
    HEIGHT = windowHeight
    canvas = createCanvas(WIDTH, HEIGHT)
    ctx = drawingContext
    btnReset.x = WIDTH - 20
    btnReset.y = HEIGHT - 20
    btnCenter.x = WIDTH - 20
    btnCenter.y = HEIGHT - 45
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

    textFont(font)

    input = new Input(
        width/2,
        height/2,
        'Enter a Wikipedia URL',
        () => {
            let link = input.getText();
            let primordial = new Particle(width / 2, height / 2, true, -1, link);
            primordial.color = random(colors);
            particles.push(primordial);
            parentParticles.push({
                pos: primordial.pos.copy(),
                radius: 50
            })
            
            createGraph(link, primordial)
            .then(() => {
                started = true;
            })
            .catch(() => {
                errorFrames = 6 * 3;
            });
        },
        true,
        [255, 255, 255],
        [0, 0, 0]
    )
    textFont(font)
    initTopo()
}

function draw(){
    background(25)

    if(btnCenter.bool){
        // xOff = lerp(xOff, 0, 0.1)
        // yOff = lerp(yOff, 0, 0.1)
        zoom = lerp(zoom, getTargetZoom(), 0.1)
        let [finalxOff, finalyOff] = centerGraph()
        xOff = lerp(xOff, finalxOff, 0.1)
        yOff = lerp(yOff, finalyOff, 0.1)
        
        
        if(dist(xOff, yOff, finalxOff, finalyOff) < .1){
            btnCenter.bool = false
        }
        if(mouseIsPressed) btnCenter.bool = false
    }

    if(keyIsPressed && keyCode == 32){
        push()
        fill(255, 255, 0)
        text(Math.round(frameRate()), width - 20, 20)
        pop()
    }

    manageDimming()

    updateTopo()
    showTopo()

    

    push()
    translate(xOff, yOff)
    scale(zoom)

    currentEdges = getEdges()

    updateAnimations()
    udpateGraph()
    updateReset()

    showRelationsHovered()
    showGraph()
    showHovered()
    manageInput()
    manageAnimConn()

    //show parent particles
    push()
    for(let p of parentParticles){
        stroke(255, 0, 0)
        noFill()
        ellipse(p.pos.x, p.pos.y, p.radius * 2)
    }
    pop()

    pop()
    
    updateAndShowButton(btnReset)
    updateAndShowButton(btnCenter)

    
}

function manageInput(){
    if(!started){
        if(errorFrames > 0){
            errorFrames -= 0.75
            let mul = mapp(errorFrames, 6 * 3, 0, 15, 1)
            let dx = Math.cos(errorFrames) * mul
            input.pos.x = input.initialPos.x + dx
        }
        input.update()
        input.show()
    }
}

function manageAnimConn(){
    for(let i = animConn.length - 1; i >= 0; i--){
        let conn = animConn[i]
        conn.from.pos.lerp(conn.to.pos, 0.1)
        if(dist(conn.from.pos.x, conn.from.pos.y, conn.to.pos.x, conn.to.pos.y) < 1){
            let parent = conn.from.parent
            let to = conn.to
            constraints.push(new Constraint(parent, to, dist(parent.pos.x, parent.pos.y, to.pos.x, to.pos.y)))
            removeParticle(conn.from)
            removeConstraint(conn.from)
            animConn.splice(i, 1)
        }
    }
}

function manageDimming(){
    if((dimmingLines == 1 || dimmingLines == 0) && hoveredParticle && (hoveredParticle.relations.length > 1 || hoveredParticle.isParent)){
        dimmingLines = -1
    }
    if(hoveredParticle == undefined || (hoveredParticle && hoveredParticle.relations.length <= 1 && !hoveredParticle.isParent)){ 
        dimmingLines = 1
    }
    if(dimmingLines == -1 && transLines <= 51){
        dimmingLines = 0
        transLines = 50
    }
    if(dimmingLines == 1 && transLines >= 254){
        dimmingLines = 0
        transLines = 255
    }
}

function worldToCanvas(x, y) {
    return {
      x: (x - xOff) / zoom,
      y: (y - yOff) / zoom
    };
}

function getEdges(){
    let minX = (0 - xOff) / zoom
    let maxX = (WIDTH - xOff) / zoom
    let minY = (0 - yOff) / zoom
    let maxY = (HEIGHT - yOff) / zoom
    return [
        minX,
        maxX,
        minY,
        maxY
    ]
}

function showRelationsHovered(){
    let part = draggedParticle || hoveredParticle
    if(part){
        part.showRelations()
    }
}

function showHovered(){
    let part = draggedParticle || hoveredParticle
    if(part){
        part.show(true)
        part.showRelationsCircles()
    }
}

function updateAnimations(){
    if(btnReset.bool) return
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
        if(d < 0.1){
            if(anim.parent) p.isPinned = false
            p.removeInertia()
            animations.splice(i, 1)
        }
    }
}

function showGraph(){
    for(let c of constraints) c.show()
    for(let p of particles) {
        if(hoveredParticle == p) continue
        if(hoveredParticle && (hoveredParticle.relations.length > 1 || hoveredParticle.isParent)){
            if(hoveredParticle.relations.includes(p)) p.show()
            else p.show(false, true)
        }
        else{ 
            p.show()
        }
    }
}

function updateReset(){
    let aux = worldToCanvas(width/2, height/2)
    let mid = createVector(aux.x, aux.y)
    if(btnReset.bool){
        for(let part of particles){
            part.isPinned = true
            part.pos.lerp(mid, 0.1)
            part.color.levels[3] = lerp(part.color.levels[3], 0, 0.99)
        }
        if(dist(particles[1].pos.x, particles[1].pos.y, mid.x, mid.y) < 1){
            resetState()
        }
    }
}

function udpateGraph(){
    for(let p of particles){
        p.repel(p.siblings)
        p.update(0.1)
    }
    for(let i = 0; i < 2; i++){
        for(let c of constraints) c.satisfy()
    }
}

function getRadiusFromCircumference(length) {
    const radius = length / (2 * Math.PI);
    return radius;
}

//TODO: try the direction and the opposite direction, choose the smaller one
function getFinalPos(direction, start, minDistance, radius, randomSep = Math.random() * 50 + 50){
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

function findAllParticlesByLink(link){
    let arr = []
    for(let p of particles){
        if(p.link == link) arr.push(p)
    }
    return arr
}

function shortenStr(str, maxLength = 25){
    if(str.length > maxLength){
        return str.substring(0, maxLength) + '...'
    }
    return str
}

function drawResetIcon(x, y, size) {
    arc(x, y, size, size, 0.6981317007977318, 0);
    let tipX = x + (size * 0.5)
    let tipY = y
    let tangentAngle = 1.3962634015954636;
    
    let arrowLength = size * 0.2;       
    let arrowAngleOffset = 0.6981317007977318;  
    
    let leftX  = tipX - arrowLength * Math.cos(tangentAngle - arrowAngleOffset);
    let leftY  = tipY - arrowLength * Math.sin(tangentAngle - arrowAngleOffset);
    let rightX = tipX - arrowLength * Math.cos(tangentAngle + arrowAngleOffset);
    let rightY = tipY - arrowLength * Math.sin(tangentAngle + arrowAngleOffset);
    
    line(tipX, tipY, leftX, leftY);
    line(tipX, tipY, rightX, rightY);
}

function windowResized() {
    WIDTH = windowWidth
    HEIGHT = windowHeight
    input.pos.x = width/2
    input.pos.y = height/2
    btnReset.x = WIDTH - 20
    btnReset.y = HEIGHT - 20
    btnCenter.x = WIDTH - 20
    btnCenter.y = HEIGHT - 45
    initTopo()
    resizeCanvas(windowWidth, windowHeight);
}

function drawCenterIcon(x, y, size){
    ellipse(x, y, size, size)
    let off = size * 0.15
    let st = size*.5
    //draw 4 segments like a crosshair
    line(x+st-off, y, x+st+off, y)
    line(x, y+st-off, x, y+st+off)
    line(x-st-off, y, x-st+off, y)
    line(x, y-st-off, x, y-st+off)
}

function updateAndShowButton(btn){
    if(!started) return
    let hovNow = inBounds(mouseX, mouseY, btn.x - btn.size/2, btn.y - btn.size/2, btn.size, btn.size)
    if(hovNow && !btn.hovering){
        btn.hovering = true
    }
    else if(!hovNow && btn.hovering){
        btn.hovering = false
    }
    let max = mouseIsPressed ? 200 : 100
    btn.hovering ? btn.dimm = lerp(btn.dimm, max, 0.3) : btn.dimm = lerp(btn.dimm, 0, 0.3)
    let strokeCol = (mapp(btn.dimm, 0, 100, 50, 200))
    let strokeWeightCol = mapp(btn.dimm, 0, 100, 1, 1.3)
    let sizeMult = mapp(btn.dimm, 0, 100, 1, 1.08)
    size = btn.size * sizeMult
    stroke(strokeCol)
    strokeWeight(strokeWeightCol)
    rectMode(CENTER)
    noFill()
    btn.func(btn.x, btn.y, size*0.6)
    fill(255, mapp(btn.dimm, 0, 100, 0, 35))
    rect(btn.x, btn.y, size, size, 5)
    if(mouseIsPressed && btn.hovering && !btn.bool){
        btn.bool = true
    }
}

function replaceBlankWithBarraBaja(str){
    //creates a new string with the same characters as str, but replaces any space with a _
    let newStr = ''
    for(let i = 0; i < str.length; i++){
        if(str[i] == ' ') newStr += '_'
        else newStr += str[i]
    }
    return newStr
}

function getMinMaxPos(){
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for(let p of particles){
        if(p.pos.x < minX) minX = p.pos.x
        if(p.pos.y < minY) minY = p.pos.y
        if(p.pos.x > maxX) maxX = p.pos.x
        if(p.pos.y > maxY) maxY = p.pos.y
    }
    return [
        minX,
        maxX,
        minY,
        maxY
    ]
}

function centerGraph(){
    let [minXp, maxXp, minYp, maxYp] = getMinMaxPos()
    let [minXe, maxXe, minYe, maxYe] = getEdges()   
    //sets the zoom to fit the graph in the screen
    let widthP = maxXp - minXp
    let heightP = maxYp - minYp
    let widthE = maxXe - minXe
    let heightE = maxYe - minYe
    let zoomX = widthE / widthP
    let zoomY = heightE / heightP
    //zoom = min(zoomX, zoomY)
    //sets the offset to center the graph
    let centerX = (maxXp + minXp) / 2
    let centerY = (maxYp + minYp) / 2
    let xOffAux = (WIDTH / 2) - centerX * zoom
    let yOffAux = (HEIGHT / 2) - centerY * zoom
    return [
        xOffAux,
        yOffAux
    ]
}
let margin = 50
function getTargetZoom(){
    let [minXp, maxXp, minYp, maxYp] = getMinMaxPos()
    let [minXe, maxXe, minYe, maxYe] = getEdges()   
    let widthP = (maxXp - minXp) + margin
    let heightP = (maxYp - minYp)  + margin
    let widthE = (maxXe - minXe) * zoom
    let heightE = (maxYe - minYe) * zoom
    let zoomX = widthE / widthP
    let zoomY = heightE / heightP
    return Math.min(zoomX, zoomY)
}