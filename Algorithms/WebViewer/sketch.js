//WebViewer
//Miguel Rodríguez
//12-03-2025

p5.disableFriendlyErrors = true
let scl = 0.7
let WIDTH = 1920*scl
let HEIGHT = 1080*scl
let canvas, ctx

const MIN_ZOOM = 0.05
const MAX_ZOOM = 5

const MAX_PARTICLE_COUNT = 2500

let hoveredParticle = null
let draggedParticle = null

let parentParticles = []

let constraints = []
let particles = []
let primordials = []
let firstParents = [] //particles that are parents and have no parent

let animConn = []

let xOff = 0
let yOff = 0
let prevMouseX, prevMouseY
let zoom = 1
let currentEdges

let framesPerAnimation = 60 * 1.5

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
    dimm: 0,
    hovering: false,
    func: drawResetIcon,
    bool: false,
    str: 'Reset [R]',
    canBeShowed: () => {
        return started
    }
}
let btnCenter = {
    x: WIDTH - 20,
    y: HEIGHT - 40,
    size: 20,
    dimm: 0,
    hovering: false,
    func: drawCenterIcon,
    bool: false,
    str: 'Center [C]',
    canBeShowed: () => {
        return started
    }
}
let btnGit = {
    x: 20,
    y: HEIGHT - 20,
    size: 20,
    svgData: undefined,
    paths: [],
    dimm: 0,
    hovering: false,
    func: drawGitSvg,
    bool: false,
    str: 'Source code',
    canBeShowed: () => {
        return true
    }
}
let btnGame = {
    x: 20,
    y: 20,
    size: 20,
    dimm: 0,
    hovering: false,
    func: drawGame,
    bool: false,
    str: 'Start Game',
    canBeShowed: () => {
        return true
    }
}
let btnColorMode = {
    x: WIDTH - 20,
    y: HEIGHT - 60,
    size: 20,
    dimm: 0,
    hovering: false, 
    func: drawColorMode,
    bool: false,
    str: 'Light Mode',
    counter: 0,
    canBeShowed: () => {
        return true
    }
}

let buttons = [
    btnReset,
    btnCenter,
    btnGit,
    btnGame,
    btnColorMode]

let goalSvg = {
    data: undefined,
    paths: [],
    centerX: 0,
    centerY: 0
}


function resetState(){
    hoveredParticle = null
    draggedParticle = null
    winningParticle = null

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

    framesPerAnimation = 60 * 1.5

    started = false
    errorFrames = 0

    dimmingLines = 1       
    transLines = 255

    btnReset.bool = false

    resetGame()

    input.removeText()
}

function preload(){
    font = loadFont('bnr.ttf')
    btnGit.svgData = loadXML('github.svg')
    //goalSvg.data = loadXML('Untitled-2.svg')
}

function mouseClicked(){
    if(hoveredParticle) console.log(hoveredParticle)
}

function mouseReleased(){
    prevMouseX = undefined
    prevMouseY = undefined
    draggedParticle = undefined
    if(hoveredParticle && hoveredParticle.isParent){
        for(let child of hoveredParticle.children) child.removeInertia()
    }
    if(btnColorMode.hovering) changeColorMode()
    if(btnGame.hovering && !btnGame.bool) startGame()
    else if(btnGame.hovering && btnGame.bool) window.open(currentGame.to)
    
}

function mouseWheel(event) {
    if (!started) return;
    btnCenter.bool = false;
    
    let worldX = (mouseX - xOff) / zoom;
    let worldY = (mouseY - yOff) / zoom;
    
    zoom += event.delta / 1000;
    zoom = Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM));
    
    xOff = mouseX - worldX * zoom;
    yOff = mouseY - worldY * zoom;
    
    return false;
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
        }
        else{
            if(currentGame) currentGame.score++
            createGraph(hoveredParticle.link, getP(hoveredParticle))
            //remove from first parents hoveredParticle.parent
            for(let i = 0; i < firstParents.length; i++){
                if(firstParents[i] == hoveredParticle.parent){
                    firstParents.splice(i, 1)
                    break
                }
            }
        }
        if(hoveredParticle == winningParticle) endGame()
        removeChild(hoveredParticle)
        hoveredParticle = undefined
    }
    if(hoveredParticle && hoveredParticle.isParent && hoveredParticle.children.length > 0){
        window.open(hoveredParticle.link, '_blank')
    }
    else if(hoveredParticle && hoveredParticle.isParent && hoveredParticle.children.length == 0){
        createGraph(hoveredParticle.link, hoveredParticle)
        hoveredParticle = undefined
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
            //let links = categories[i].links.splice(0, floor(random(10, 100)));
            let links = categories[i].links;
            initFirstGraphCategorized(links, categories[i].title, primordial, categories.length == 1);
        }
        btnCenter.bool = true
        checkEndGame()
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
    //remove from childrens array of parent
    for(let i = 0; i < p.parent.children.length; i++){
        if(p.parent.children[i] == p){
            p.parent.children.splice(i, 1)
            break
        }
    }
}

function removeConstraint(p){
    let c ;
    for(let i = 0; i < constraints.length; i++){
        if(constraints[i].p1 == p || constraints[i].p2 == p){
            c = constraints[i]
            constraints.splice(i, 1)
        }
    }
    if(c){
        for(let p of particles){
            if(p.constraint == c){
                p.constraint = undefined
                break
            }
        }
    }
}

const absoluteSeparationDistance = 70
function initFirstGraphCategorized(links, title, primordial, fromPrimordial = false){
    REST_DISTANCE = Math.max(getRadiusFromCircumference(links.length * RADIUS_PARTICLE*2), RADIUS_PARTICLE * 2)
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
        x = Math.cos(rAngle) * (REST_DISTANCE + 150) + finalPos.x
        y = Math.sin(rAngle) * (REST_DISTANCE + 150) + finalPos.y
    }
    else{
        x = finalPos.x
        y = finalPos.y
    }

    let pos = fromPrimordial ? primordial.pos.copy() : 
              getFinalPos(createVector(Math.cos(rAngle), Math.sin(rAngle)), createVector(x, y), 0, REST_DISTANCE)
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

        firstParents.push(p1)
    }
    else p1 = primordial

    primordial.children.push(p1)

    let deltaAngle = TWO_PI / links.length
    let col = randomizeColor(primordial.color, 50)
    let siblings = []
    let newParticles = []

    

    let radius = (REST_DISTANCE + 5)
    let deltaFrames = Math.max(Math.floor(framesPerAnimation / links.length), 1)
    for(let i = 0; i < links.length; i++){
        let sameLinks = findAllParticlesByLink(links[i])
    
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
    for(let p of newParticles){
        p.siblings = siblings
        particles.push(p)
    }
    p1.children = siblings
    particles.push(p1)
}
 
let darkModeColors
let lightModeColors
let curCol
let curColMode

function setup(){
    WIDTH = windowWidth
    HEIGHT = windowHeight
    canvas = createCanvas(WIDTH, HEIGHT)
    ctx = drawingContext
    btnReset.x = WIDTH - 20
    btnReset.y = HEIGHT - 20
    btnCenter.x = WIDTH - 20
    btnCenter.y = HEIGHT - 45
    btnGit.x = 20
    btnGit.y = HEIGHT - 20
    btnColorMode.x = 20
    btnColorMode.y = HEIGHT - 45
    let [pathsGit, cxGit, cyGit] = parseSVG(btnGit.svgData)
    btnGit.paths = pathsGit
    btnGit.centerX = cxGit
    btnGit.centerY = cyGit
    // let [pathsGoal, cxGoal, cyGoal] = parseSVG(goalSvg.data)
    // goalSvg.paths = pathsGoal
    // goalSvg.centerX = cxGoal
    // goalSvg.centerY = cyGoal
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

    darkModeColors = {
        background: (25),
        topographic: "rgb(50, 50, 50)",
        btnStrokeStart: (50),
        btnStrokeStop: (200),
        btnFill: 255,
        btnTextMax: 200,
        partFillRectText: 50,
        partTextStroke: color(255),
        partStroke: [50, 50, 50, 1],
        lineStroke: 170,
        lineTrans: 0
    }

    lightModeColors = {
        background: (230),
        topographic: "rgb(212, 211, 211)",
        btnStrokeStart: (200),
        btnStrokeStop: (120),
        btnFill: 0,
        btnTextMax: 50,
        partFillRectText: 200,
        partTextStroke: color(0),
        partStroke: [100, 100, 100, 1],
        lineStroke: 85,
        lineTrans: 255
    }
    
    curCol = darkModeColors
    curColMode = 'dark'
    //curCol = darkModeColors

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
            firstParents.push(primordial)
            
            createGraph(link, primordial)
            .then(() => {
                started = true;
            })
            .catch(() => {
                particles = []
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

function updateAndShowButton(btn){
    if(!btn.canBeShowed()) return
    let hovNow = inBounds(mouseX, mouseY, btn.x - btn.size/2, btn.y - btn.size/2, btn.size, btn.size)
    if(hovNow && !btn.hovering){
        btn.hovering = true
    }
    else if(!hovNow && btn.hovering){
        btn.hovering = false
    }
    let max = mouseIsPressed ? 200 : 100
    btn.hovering ? btn.dimm = lerpp(btn.dimm, max, 0.3) : btn.dimm = lerpp(btn.dimm, 0, 0.3)
    let strokeCol = (mapp(btn.dimm, 0, 100, curCol.btnStrokeStart, curCol.btnStrokeStop))
    let textTrans = (mapp(btn.dimm, 0, 100, 0, 200))
    let strokeWeightCol = mapp(btn.dimm, 0, 100, 1, 1.3)
    let sizeMult = mapp(btn.dimm, 0, 100, 1, 1.08)
    size = btn.size * sizeMult
    stroke(strokeCol)
    strokeWeight(strokeWeightCol)
    rectMode(CENTER)
    noFill()
    let col = color(curCol.btnFill, mapp(btn.dimm, 0, 100, 0, 35))
    btn.func(btn.x, btn.y, size*0.6, btn, color(curCol.btnTextMax, textTrans), strokeCol)
    fill(col)
    rect(btn.x, btn.y, size, size, 5)
}

function keyPressed(){
    if(keyCode == 82){
        btnReset.bool = true
    }
    if(keyCode == 67){
        btnCenter.bool = true
    }
    if(keyCode == 32 && started){
        changeColorMode()
    }
}

function changeColorMode(){
    if(curColMode == 'light'){
        curCol = darkModeColors
        curColMode = 'dark'
        input.setColors([255, 255, 255], [0, 0, 0])
        btnColorMode.str = 'Light Mode'
        btnColorMode.bool = false
    }
    else{
        curCol = lightModeColors
        curColMode = 'light'
        input.setColors([0, 0, 0], [255, 255, 255])
        btnColorMode.str = 'Dark Mode'
        btnColorMode.bool = true
    }
}

let offsetsText = []
let mousePos
function draw(){
    background(curCol.background)

    if(particles.length > MAX_PARTICLE_COUNT && removeAnimations.length == 0) removeCluster()

    if(btnCenter.bool){
        // xOff = lerpp(xOff, 0, 0.1)
        // yOff = lerpp(yOff, 0, 0.1)
        zoom = lerpp(zoom, getTargetZoom(), 0.05)
        let [finalxOff, finalyOff] = centerGraph()
        xOff = lerpp(xOff, finalxOff, 0.1)
        yOff = lerpp(yOff, finalyOff, 0.1)
        
        
        if(squaredDistance(xOff, yOff, finalxOff, finalyOff) < .1 && animations.length == 0){
            btnCenter.bool = false
        }
        if(mouseIsPressed) btnCenter.bool = false
    }

    offsetsText[0] = 10/zoom
    offsetsText[1] = 7/zoom

    if(keyIsPressed && keyCode == 32){
        push()
        fill(255, 255, 0)
        //text(Math.round(frameRate()), width - 20, 20)
        pop()
    }

    mousePos = this.getRelativePos(mouseX, mouseY)

    manageDimming()

    updateTopo()
    showTopo()

    

    push()
    translate(xOff, yOff);
    scale(zoom);
    


    currentEdges = getEdges()

    updateAnimations()
    updateGraph()
    updateReset()

    showRelationsHovered()
    if(started) showGraph()
    showHovered()
    manageInput()
    manageAnimConn()

    if(mouseIsPressed && hoveredParticle && hoveredParticle.isParent){
        let forceMult = (Math.log(hoveredParticle.children.length * 100) * 300) / Math.pow(zoom, 2)
        for(let child of hoveredParticle.children){
            child.showText(false, true)
            let forceOutward = p5.Vector.sub(child.pos, hoveredParticle.pos)
            forceOutward.normalize()
            forceOutward.mult(forceMult)
            child.applyForce(forceOutward)
        }
    }

    if(winningParticle) winningParticle.showWin()

    pop()
    
    push()
    for(let btn of buttons) updateAndShowButton(btn)
    pop()
    
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
        if(squaredDistance(conn.from.pos.x, conn.from.pos.y, conn.to.pos.x, conn.to.pos.y) < 1){
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
    let p = draggedParticle || hoveredParticle
    if(dimmingLines == 1 && p && (p.relations.length > 1 || p.isParent)){
        dimmingLines = -1
    }
    if(p == undefined || (p && p.relations.length <= 1 && !p.isParent)){ 
        dimmingLines = 1
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
    if (btnReset.bool) return;

    const activeParticles = new Set(animations.map(anim => anim.particle));

    for (let i = animations.length - 1; i >= 0; i--){
        let anim = animations[i];
        let p = anim.particle;

        if(!p){
            animations.splice(i, 1);
            continue;
        }

        if (anim.parent && activeParticles.has(anim.parent)) {
            p.pos = anim.parent.pos.copy();
            continue;
        }
        let finalPos = anim.finalPos;
        if (anim.framesTillStart === undefined || anim.framesTillStart > 0)
            p.pos.lerp(finalPos, 0.05);
        if (anim.framesTillStart !== undefined)
            anim.framesTillStart++;
        let d = squaredDistance(p.pos.x, p.pos.y, finalPos.x, finalPos.y);
        if (d < 0.1) {
            if (anim.parent) p.isPinned = false;
            p.removeInertia();
            animations.splice(i, 1);
            if(anim.remove){
                removeParticle(p)
                removeConstraint(p)
            }
        }
    }

    for (let i = removeAnimations.length - 1; i >= 0; i--){
        let anim = removeAnimations[i];
        let p = anim.particle;

        if(!p){
            removeAnimations.splice(i, 1);
            continue;
        }

        let finalPos = anim.finalPos.pos.copy()
        p.pos.lerp(finalPos, 0.02);
        let d = squaredDistance(p.pos.x, p.pos.y, finalPos.x, finalPos.y);
        if (d < 0.1) {
            removeAnimations.splice(i, 1);
            removeParticle(p)
            removeConstraint(p)
        }
    }
} 

let removeAnimations = []


function removeCluster(){
    //choose random particle that is not a parent or, if it is it cant have children
    if(firstParents.length == 0) return
    //else get the first one
    let parentToRemove = firstParents.shift()

    for(let child of parentToRemove.children){
        child.isPinned = true
        let anim = {
            particle: child,
            finalPos: child.parent
        }
        removeAnimations.push(anim)
    }
    let finalAnim = {
        particle: parentToRemove,
        finalPos: parentToRemove.parent
    }
    removeAnimations.push(finalAnim)

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
            part.color.levels[3] = lerpp(part.color.levels[3], 0, 0.99)
        }
        if(squaredDistance(particles[1].pos.x, particles[1].pos.y, mid.x, mid.y) < 1){
            resetState()
        }
    }
}

function updateGraph(){
    let bool = zoom > 0.2
    for(let p of particles){
        p.setOut()
        if(bool){
            p.repel(p.siblings)
            p.update(0.01)
        }
        p.updateHovering()
    }
    for(let c of constraints){
        c.satisfy()
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
    let d1 = squaredDistance(pos1.x, pos1.y, start.x, start.y)
    let d2 = squaredDistance(pos2.x, pos2.y, start.x, start.y)
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

function windowResized() {
    WIDTH = windowWidth
    HEIGHT = windowHeight
    input.pos.x = width/2
    input.pos.y = height/2
    btnReset.x = WIDTH - 20
    btnReset.y = HEIGHT - 20
    btnCenter.x = WIDTH - 20
    btnCenter.y = HEIGHT - 45
    btnGit.x = 20
    btnGit.y = HEIGHT - 20
    btnGame.x = 20
    btnGame.y = 20
    btnColorMode.x = 20
    btnColorMode.y = HEIGHT - 45
    initTopo()
    resizeCanvas(windowWidth, windowHeight);
}



function drawResetIcon(x, y, size, btn, col) {
    if(mouseIsPressed && btn.hovering && !btn.bool) btn.bool = true
    let str = btn.str
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

    textAlign(RIGHT, CENTER)
    textSize(10.5)
    noStroke()
    fill(col)
    text(str, x - size * 0.5 - 10, y)
}

function drawCenterIcon(x, y, size, btn, col){
    if(mouseIsPressed && btn.hovering && !btn.bool) btn.bool = true
    let str = btn.str
    ellipse(x, y, size, size)
    let off = size * 0.15
    let st = size*.5
    //draw 4 segments like a crosshair
    line(x+st-off, y, x+st+off, y)
    line(x, y+st-off, x, y+st+off)
    line(x-st-off, y, x-st+off, y)
    line(x, y-st-off, x, y-st+off)

    textAlign(RIGHT, CENTER)
    textSize(10.5)
    noStroke()
    fill(col)
    text(str, x - size * 0.5 - 10, y)
}

function drawGitSvg(x, y, size, btn, col){
    if(mouseIsPressed && btn.hovering && !btn.bool) window.open('https://github.com/miguelrr11/miguelrr11.github.io/tree/main/Algorithms/WebViewer')
    let str = btn.str
    drawPaths(btnGit.paths, x, y, size*0.055, btnGit.centerX, btnGit.centerY)

    textAlign(LEFT, CENTER)
    textSize(10.5)
    noStroke()
    fill(col)
    text(str, x + size * 0.5 + 10, y)
}

function drawGame(x, y, size, btn, col, fillCol){
    push()
    translate(x, y)
    rotate(Math.PI * .5)
    translate(-x, -y)
    if(btn.bool) fill(fillCol)
    let triSize = size * 0.375
    let h = Math.sqrt(3) * triSize
    let x1 = x - triSize
    let y1 = y + h / 2
    let x2 = x + triSize
    let y2 = y + h / 2
    let x3 = x
    let y3 = y - h / 2
    triangle(x1, y1, x2, y2, x3, y3)
    pop()

    let str = btn.str
    // btnGame.secondStr = 'Goal: ' + removeBarrabaja(getLastPartOfLink(decodeURIComponent(currentGame.to))) 
    //                   + '\nArticles visited: ' + currentGame.score
    btnGame.secondStr = 'Find the article: "' + removeBarrabaja(getLastPartOfLink(decodeURIComponent(currentGame.to))) + '"\nvisiting the fewest articles possible' +
                        '\nArticles visited: ' + currentGame.score + '\n\nClick on the button to take a look'
    let str2 = btn.bool ? btn.secondStr : ''

    drawPaths(goalSvg.paths, x - size * .5, y + size * 0.5 + 10, size*0.055, goalSvg.centerX, goalSvg.centerY)

    textAlign(LEFT, CENTER)
    textSize(11.5)
    noStroke()
    fill(col)
    text(str, x + size * 0.5 + 10, y)
    textAlign(LEFT, TOP)
    textSize(9)
    text(str2, x - size * .5, y + size * 0.5 + 10)
}

function drawColorMode(x, y, size, btn, col){
    //if(mouseIsPressed && btn.hovering) changeColorMode()
    let str = btn.str
    ellipse(x, y, size*.5)

    btn.counter = btn.bool ? lerp(btn.counter, 100, 0.1) : lerp(btn.counter, 0, 0.1)
    let lengthMult = mapp(btn.counter, 0, 100, 0.45, 0.6)

    for(let i = 0; i < 8; i++){
        let angle = map(i, 0, 8, 0, TWO_PI)
        
        let x1 = x + cos(angle) * size * 0.45
        let y1 = y + sin(angle) * size * 0.45
        let x2 = x + cos(angle) * size * lengthMult
        let y2 = y + sin(angle) * size * lengthMult
        line(x1, y1, x2, y2)
    }

    textAlign(LEFT, CENTER)
    textSize(10.5)
    noStroke()
    fill(col)
    text(str, x + size * 0.5 + 10, y)
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
    return constrain(Math.min(zoomX, zoomY), MIN_ZOOM, MAX_ZOOM)
}

let currentGame = {
    from: undefined,
    to: undefined,
    score: 0
}

function startGame(){
    resetState()
    btnGame.bool = true
    started = true
    currentGame = {
        from: random(articles),
        to: random(articles),
        score: 1
    }

    btnGame.str = 'Game started'
    btnGame.secondStr = 'Goal: ' + removeBarrabaja(getLastPartOfLink(decodeURIComponent(currentGame.to))) 
                      + '\nArticles visited: ' + currentGame.score

    let link = currentGame.from
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
        console.log('Error loading game')
    });
}

function resetGame(){
    currentGame = {
        from: undefined,
        to: undefined,
        score: 1
    }
    btnGame.str = 'Start Game'
    btnGame.secondStr = ''
    btnGame.bool = false
}

let winningParticle = undefined
function checkEndGame(){
    for(let p of particles){
        if(p.link == currentGame.to){
            btnGame.str = 'You found the article, open it to end the game!'
            winningParticle = p
            return
        }
    }
}

function endGame(){
    btnGame.str = 'Game finished!\nArticles visited: ' + currentGame.score 
    btnGame.bool = false
    winningParticle = undefined
}