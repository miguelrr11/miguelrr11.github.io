//Rigid Body Simulation
//Miguel Rodríguez
//13-02-2026

/*
static body: infinite mass, immovable
dynamic body: finite mass, affected by forces, collisions
spring: connects two anchor points on bodies (or world), 
        applies force based on displacement from rest length
bridge: special dynamic body that is very thin and meant to connect two points,
        they do not collide with each other to allow building structures
*/

p5.disableFriendlyErrors = true
let WIDTH = 600
let HEIGHT = 600

const gravity = 0.1
const airFriction = 0.005
let MAXSTEPS = 20

const percent = 0.8   // correction strength
const slop = 0.01     // penetration allowed before correction

let bodies = []
let springs = []

let gridMouseX = 0
let gridMouseY = 0
let cellSize = 15
let nCells = 30

let grid = null

// Editor state
let dragStart = null  // {x, y} for body creation drag
let springStart = null // {body, anchor} for spring first click
let fpsArr = Array(30).fill(60)
let collisionPoints = []

let simState = {
    staticDynamicMode: 'dynamic',
    createMode: 'drag',
    running: true,
    snapGrid: false,
    showDebug: false,
    autoLengthSpring: false,
    lengthSpring: 10,  //in cells
    selectedBody: null
}

let panel
let cteAngVelSlider, cteAngVelCB

function windowResized(){
    WIDTH = windowWidth
    HEIGHT = windowHeight
    nCells = Math.floor(Math.max(WIDTH, HEIGHT) / cellSize)
    resizeCanvas(WIDTH, HEIGHT)
}

async function setup(){
    let fontPanel = await loadFont("migUI/main/bnr.ttf")

    grid = new SpatialHash(cellSize)

    WIDTH = windowWidth
    HEIGHT = windowHeight
    nCells = Math.floor(Math.max(WIDTH, HEIGHT) / cellSize)
    createCanvas(WIDTH, HEIGHT)

    panel = new Panel({
        x: 10,
        y: 10,
        w: 200,
        retractable: true,
        font: fontPanel,
        title: "Rigid Body Sim"
    })
    panel.darkCol[3] = 175

    panel.createSeparator()
    let staticDynamicSelect = panel.createSelect(["Static", "Dynamic"], "Dynamic")
    staticDynamicSelect.setFunc((arg) => {simState.staticDynamicMode = arg.toLowerCase()}, true)
    panel.createSeparator()
    let createSelect = panel.createSelect(["Rect", "Circle", "Bridge", "Spring", "Delete", "Drag"], "Drag")
    createSelect.setFunc((arg) => {
        simState.createMode = arg.toLowerCase()
        springStart = null
        dragStart = null
    }, true)

    panel.createSeparator()
    let automaticLengthToggle = panel.createCheckbox("Auto-length Springs", false)
    automaticLengthToggle.setFunc((arg) => {simState.autoLengthSpring = arg})
    let lengthSlider = panel.createSlider(1, 30, 10, 'Length', true)
    lengthSlider.setFunc((arg) => {simState.lengthSpring = arg})
    panel.createSeparator()

    cteAngVelCB = panel.createCheckbox("Constant Angular Velocity", false)
    cteAngVelCB.setFunc((arg) => {
        if(simState.selectedBody){
            simState.selectedBody.cteAngVelToggle = arg
        }
    })
    cteAngVelSlider = panel.createSlider(-0.5, 0.5, 0, 'Const. Ang. Vel.', true)
    cteAngVelSlider.setFunc((arg) => {
        if(simState.selectedBody){
            simState.selectedBody.cteAngVel = arg
        }
    })
    panel.createSeparator()

    let buttonPause = panel.createButton("Pause Simulation")
    buttonPause.w += 15
    buttonPause.setFunc(() => {
        simState.running = !simState.running
        buttonPause.setText(simState.running ? "Pause Simulation" : "Resume Simulation")
    })
    panel.createSeparator()
    let snapToggle = panel.createCheckbox("Snap to Grid", false)
    snapToggle.setFunc((arg) => {simState.snapGrid = arg})
    let debugToggle = panel.createCheckbox("Show Debug", false)
    debugToggle.setFunc((arg) => {simState.showDebug = arg})
    createBodyFromRect(100, height - 50, width - 100, height - 30, true) // floor
    createBodyFromRect(30, height/2, 50, height - 30, true) // left wall
    createBodyFromRect(width - 50, height/2, width - 30, height - 30, true) // right wall

    //random bodies
    for(let i = 0; i < 1; i++){
        let x1 = random(100, width - 200)
        let y1 = random(100, height - 200)
        let x2 = x1 + random(30, 80)
        let y2 = y1 + random(30, 80)
        createBodyFromRect(x1, y1, x2, y2, false)
    }

    //random circles
    for(let i = 0; i < 1; i++){
        let x = random(100, width - 100)
        let y = random(100, height - 200)
        let r = random(15, 30)
        createBodyFromCircle(x, y, r, false)
    }

    //connect random springs
    // for(let i = 0; i < 4; i++){
    //     let bodyA = random(bodies)
    //     let bodyB = random(bodies)
    //     if(bodyA === bodyB) continue
    //     let anchorA = floor(random(4))
    //     let anchorB = floor(random(4))
    //     connectSpring(bodyA, anchorA, bodyB, anchorB)
    // }
}

function setSelectedBody(body){
    simState.selectedBody = body
    cteAngVelSlider.setValue(body ? body.angVel : 0)
    cteAngVelCB.setValue(body ? body.cteAngVelToggle : false)
}

function connectSpring(bodyA, anchorA, bodyB, anchorB){
    let posA = getAnchorWorldPos(bodyA, anchorA) || { x: gridMouseX, y: gridMouseY }
    let posB = getAnchorWorldPos(bodyB, anchorB) || { x: gridMouseX, y: gridMouseY }
    let d = simState.autoLengthSpring ? Math.hypot(posB.x - posA.x, posB.y - posA.y) : simState.lengthSpring * cellSize 
    springs.push({
        bodyA, bodyB, anchorA, anchorB,
        worldAnchorA: posA,
        worldAnchorB: posB,
        restLength: d,
        stiffness: 3,
        damping: 0.3
    })
}

function createBodyFromCircle(x, y, r, isStatic){
    if(r < 3) return

    let area = Math.PI * r * r
    let m = isStatic ? Infinity : area / (cellSize * cellSize)
    let inv = isStatic ? 0 : 1 / m

    // Inertia of solid disk
    let iner = (1/2) * m * r * r
    let invI = isStatic ? 0 : 1 / iner

    let body = {
        shape: 'circle',
        area: area,
        r: r,
        pos: {x, y},
        vel: {x: 0, y: 0},
        angle: 0,
        angVel: 0,
        mass: m,
        invMass: inv,
        inertia: iner,
        invInertia: invI,
        isStatic: isStatic,
        friction: 1,
        cteAngVel: 0
    }

    bodies.push(body)
}

function createBodyFromRect(x1, y1, x2, y2, isStatic){
    let cx = (x1 + x2) / 2
    let cy = (y1 + y2) / 2
    let w = Math.abs(x2 - x1)
    let h = Math.abs(y2 - y1)
    if(w < 5 || h < 5) return
    let m = isStatic ? Infinity : w * h / (cellSize * cellSize)
    let inv = isStatic ? 0 : 1 / m
    let iner = (1/12) * m * (w*w + h*h)
    let invI = isStatic ? 0 : 1 / iner
    let body = {
        area: w * h,
        shape: 'rect',
        w: w, h: h,
        pos: {x: cx, y: cy},
        vel: {x: 0, y: 0},
        angle: 0, angVel: 0,
        mass: m, invMass: inv,
        inertia: iner, invInertia: invI,
        isStatic: isStatic,
        friction: 1,
        cteAngVel: 0,
        cteAngVelToggle: false
    }
    updateCornerLocations(body)
    bodies.push(body)
    return body
}

function createBridgeElement(x1, y1, x2, y2, isStatic = false){
    let cx = (x1 + x2) / 2
    let cy = (y1 + y2) / 2
    let w = Math.hypot(x2 - x1, y2 - y1)
    let h = 6

    let rx1 = cx - w/2
    let ry1 = cy - h/2
    let rx2 = cx + w/2
    let ry2 = cy + h/2

    let bridge = createBodyFromRect(rx1, ry1, rx2, ry2, isStatic)
    if(!bridge) return null
    bridge.isBridge = true
    bridge.angle = atan2(y2 - y1, x2 - x1)
    return bridge
}


function calculateStressBodies(){
    for(let b of bodies){
        b.stress = 0
        for(let sp of springs){
            if(sp.bodyA === b || sp.bodyB === b){
                let posA = getSpringEndPos(sp, 'A')
                let posB = getSpringEndPos(sp, 'B')
                let dx = posB.x - posA.x
                let dy = posB.y - posA.y
                let currentLength = Math.hypot(dx, dy)
                let displacement = currentLength - sp.restLength
                let forceMag = sp.stiffness * abs(displacement)
                b.stress += forceMag / b.area
            }   
        }
        b.stress *= 10
    }
}

// Find the closest anchor point to the mouse within a threshold
function findNearestAnchor(mx, my, threshold){
    let best = null
    let bestDist = threshold
    for(let b of bodies){
        for(let a = 0; a < 5; a++){
            let p = getAnchorWorldPos(b, a)
            let d = Math.hypot(mx - p.x, my - p.y)
            if(d < bestDist){
                bestDist = d
                best = {body: b, anchor: a, pos: p}
            }
        }
    }
    return best
}

function mousePressed(){
    if(gridMouseY < 0 || gridMouseX < 0 || gridMouseX > WIDTH || gridMouseY > HEIGHT || panel.isMouseInside()) return

    if(simState.createMode === 'rect' || simState.createMode === 'bridge' || simState.createMode === 'circle'){
        dragStart = {x: gridMouseX, y: gridMouseY}
    } 
    else if(simState.createMode === 'spring'){
        let hit = findNearestAnchor(gridMouseX, gridMouseY, 20)
        if(hit){
            if(!springStart){
                springStart = hit
            } 
            else {
                if(hit.body !== springStart.body || hit.anchor !== springStart.anchor){
                    connectSpring(springStart.body, springStart.anchor, hit.body, hit.anchor)
                }
                springStart = null
            }
        }
        else{
            if(springStart){
                connectSpring(springStart.body, springStart.anchor, null, null)
            }
            springStart = null
        }
    } 
    else if(simState.createMode === 'delete'){
        // Check springs
        for(let i = springs.length - 1; i >= 0; i--){
            let sp = springs[i]
            let posA = getSpringEndPos(sp, 'A')
            let posB = getSpringEndPos(sp, 'B')
            let midX = (posA.x + posB.x) / 2
            let midY = (posA.y + posB.y) / 2
            let dx = posB.x - posA.x
            let dy = posB.y - posA.y
            let len = Math.hypot(dx, dy)
            let angle = atan2(dy, dx)
            let localMouseX = Math.cos(-angle) * (mouseX - midX) - Math.sin(-angle) * (mouseY - midY)
            let localMouseY = Math.sin(-angle) * (mouseX - midX) + Math.cos(-angle) * (mouseY - midY)
            if(localMouseX > -len/2 - 5 && localMouseX < len/2 + 5 && localMouseY > -10 && localMouseY < 10){
                springs.splice(i, 1)
            }
        }
        // Check bodies
        for(let i = bodies.length - 1; i >= 0; i--){
            let body = bodies[i]
            if(body.shape === 'rect' && pointInRect({x: mouseX, y: mouseY}, body)){
                bodies.splice(i, 1)
                break
            }
            if(body.shape === 'circle' && pointInCircle({x: mouseX, y: mouseY}, body)){
                bodies.splice(i, 1)
                break
            }
        }
    } 
    else {
        // No mode: drag bodies
        for(let b of bodies){
            if(b.shape === 'rect' && pointInRect({x: gridMouseX, y: gridMouseY}, b)){
                b.dragging = true
                b.offsetDrag = {x: gridMouseX - b.pos.x, y: gridMouseY - b.pos.y}
                setSelectedBody(b)
                return
            }
            if(b.shape === 'circle' && pointInCircle({x: gridMouseX, y: gridMouseY}, b)){
                b.dragging = true
                b.offsetDrag = {x: gridMouseX - b.pos.x, y: gridMouseY - b.pos.y}
                setSelectedBody(b)
                return
            }
        }
        setSelectedBody(null)
    }
}

function mouseReleased(){
    if(dragStart && simState.createMode === 'rect'){
        createBodyFromRect(dragStart.x, dragStart.y, gridMouseX, gridMouseY, simState.staticDynamicMode === 'static')
        dragStart = null
    }
    if(dragStart && simState.createMode === 'circle'){
        let r = Math.hypot(gridMouseX - dragStart.x, gridMouseY - dragStart.y)
        createBodyFromCircle(dragStart.x, dragStart.y, r, simState.staticDynamicMode === 'static')
        dragStart = null
    }
    if(dragStart && simState.createMode === 'bridge'){
        createBridgeElement(dragStart.x, dragStart.y, gridMouseX, gridMouseY, simState.staticDynamicMode === 'static')
        dragStart = null
    }
    for(let b of bodies) b.dragging = false
}

function draw(){
    background(0)

    grid.clear()

    push()

    fpsArr.shift()
    fpsArr.push(frameRate())

    let gridMouseXFloor = Math.floor(mouseX / cellSize) * cellSize
    let gridMouseYFloor = Math.floor(mouseY / cellSize) * cellSize
    let gridMouseXCeil = Math.ceil(mouseX / cellSize) * cellSize
    let gridMouseYCeil = Math.ceil(mouseY / cellSize) * cellSize
    gridMouseX = simState.snapGrid ? (Math.abs(mouseX - gridMouseXFloor) < Math.abs(mouseX - gridMouseXCeil) ? 
        gridMouseXFloor : gridMouseXCeil) : mouseX
    gridMouseY = simState.snapGrid ? (Math.abs(mouseY - gridMouseYFloor) < Math.abs(mouseY - gridMouseYCeil) ? 
        gridMouseYFloor : gridMouseYCeil) : mouseY

    //draw grid
    stroke(50)
    for(let i = 0; i <= nCells; i++){
        line(i * cellSize, 0, i * cellSize, HEIGHT)
        line(0, i * cellSize, WIDTH, i * cellSize)
    }

    for(let b of bodies){
        b.oldPos = {x: b.pos.x, y: b.pos.y}
        b.oldPosFree = b.posFree ? {x: b.posFree.x, y: b.posFree.y} : {x: b.pos.x, y: b.pos.y}
        if(b.dragging && mouseIsPressed){
            b.pos = {x: gridMouseX - b.offsetDrag.x, y: gridMouseY - b.offsetDrag.y}
            b.posFree = {x: mouseX, y: mouseY}
            b.vel = {x: 0, y: 0}
        }
    }

    for(let b of bodies) updateCornerLocations(b)

    const STEPS = simState.running ? MAXSTEPS : 0
    for(let step = 0; step < STEPS; step++){
        let dt = 1 / STEPS

        // Apply gravity
        for(let b of bodies){
            if(!b.isStatic) b.vel.y += gravity * dt
        }

        // Apply spring forces
        applySpringForces(dt)

        // Integrate
        for(let b of bodies){
            if(b.cteAngVelToggle){
                b.angVel = b.cteAngVel
            }
            b.angle += b.angVel * dt

            if(b.isStatic) continue

            b.pos.x += b.vel.x * dt
            b.pos.y += b.vel.y * dt
            
            let air = airFriction * dt

            b.vel.x -= b.vel.x * air
            b.vel.y -= b.vel.y * air
            b.angVel -= b.angVel * air

        }

        // Update geometry
        for(let b of bodies) updateCornerLocations(b)

        // Collisions
        for(let iter = 0; iter < 3; iter++){
            for(let i = 0; i < bodies.length; i++){
                for(let j = i + 1; j < bodies.length; j++){
                    let a = bodies[i]
                    let b = bodies[j]
                    let collision = null
                    if(a.shape === 'rect' && b.shape === 'rect'){ 
                        // if(Math.abs(a.pos.x - b.pos.x) > a.w/2 + b.w/2) continue
                        // if(Math.abs(a.pos.y - b.pos.y) > a.h/2 + b.h/2) continue
                        collision = satRectRect(a, b)
                    }
                    else if(a.shape === 'circle' && b.shape === 'circle'){ 
                        collision = satCircleCircle(a, b)
                    }
                    else if(a.shape === 'rect' && b.shape === 'circle') collision = satRectCircle(a, b)
                    else if(a.shape === 'circle' && b.shape === 'rect') {
                        collision = satRectCircle(b, a)
                        if(collision) {
                            collision.normal.x *= -1
                            collision.normal.y *= -1
                        }
                    }

                    if(collision && !(a.isBridge && b.isBridge)){
                        collisionPoints.push(collision.contact)

                        let normal = collision.normal
                        let depth = collision.depth

                        // Split separation by inverse mass ratio
                        let invMassSum = a.invMass + b.invMass
                        if(invMassSum === 0) continue

                        const percent = 0.8
                        const slop = 0.01

                        let correctionMag = Math.max(depth - slop, 0) * percent / invMassSum

                        let nx = normal.x * correctionMag
                        let ny = normal.y * correctionMag

                        a.pos.x += nx * a.invMass
                        a.pos.y += ny * a.invMass
                        b.pos.x -= nx * b.invMass
                        b.pos.y -= ny * b.invMass


                        updateCornerLocations(a)
                        updateCornerLocations(b)
                        resolveCollision(a, b, normal, collision.contact)
                    }
                }
            }
        }
    }

    calculateStressBodies()

    for(let b of bodies){
        if(b.dragging && !b.isStatic){
            b.vel.x = b.posFree.x - b.oldPosFree.x
            b.vel.y = b.posFree.y - b.oldPosFree.y
        }
    }

    // Draw
    for(let sp of springs) drawSpring(sp)
    for(let b of bodies){
        if(b.shape == 'rect') drawBody(b)
        if(b.shape == 'circle') drawBodyCircle(b)
    }

    for(let i = bodies.length - 1; i >= 0; i--){
        let body = bodies[i]
        if(body.pos.y > HEIGHT + 200){
            bodies.splice(i, 1)
        }
        if(body.pos.x < -200 || body.pos.x > WIDTH + 200){
            bodies.splice(i, 1)
        }
    }

    // Editor overlays
    drawEditor()

    let fpsMean = round(fpsArr.reduce((a, b) => a + b, 0) / fpsArr.length)
    fill(255)
    noStroke()
    textSize(14)
    textAlign(RIGHT, TOP)
    textLeading(8)
    text(`FPS: ${fpsMean}\n
          N Bodies: ${bodies.length}`, width - 10, 10)

    if(simState.showDebug){
        push()
        noFill()
        strokeWeight(1.5)
        stroke(255, 255, 0)
        for(let colPoint of collisionPoints){
            ellipse(colPoint.x, colPoint.y, 5, 5)
        }
        pop()
    }

    collisionPoints = []

    pop()

    panel.update();
    panel.show();

}


// SAT collision between two rectangles
// Returns {normal, depth, contact} with normal pointing from bodyB toward bodyA
function satRectRect(bodyA, bodyB){
    if(bodyA.isStatic && bodyB.isStatic) return null

    let axes = [bodyA.axis1, bodyA.axis2, bodyB.axis1, bodyB.axis2]

    let minOverlap = Infinity
    let smallestAxis = null
    let smallestAxisIndex = -1

    for(let i = 0; i < 4; i++){
        let axis = axes[i]
        let projA = projectPoints(bodyA.corners, axis)
        let projB = projectPoints(bodyB.corners, axis)

        let overlap = Math.min(projA.max, projB.max)
                     - Math.max(projA.min, projB.min)

        if(overlap <= 0) return null

        if(overlap < minOverlap){
            minOverlap = overlap
            smallestAxis = {x: axis.x, y: axis.y}
            smallestAxisIndex = i
        }
    }

    // Orient normal from B toward A
    let BtoA = {
        x: bodyA.pos.x - bodyB.pos.x,
        y: bodyA.pos.y - bodyB.pos.y
    }
    if(BtoA.x * smallestAxis.x + BtoA.y * smallestAxis.y < 0){
        smallestAxis.x *= -1
        smallestAxis.y *= -1
    }

    // Contact point: corner of incident body penetrating reference body
    let contactPoint
    if(smallestAxisIndex < 2){
        // Axis from A (reference face): B's corner penetrates A
        contactPoint = bodyB.corners[0]
        let maxProj = -Infinity
        for(let c of bodyB.corners){
            let proj = c.x * smallestAxis.x + c.y * smallestAxis.y
            if(proj > maxProj){
                maxProj = proj
                contactPoint = c
            }
        }
    } else {
        // Axis from B (reference face): A's corner penetrates B
        contactPoint = bodyA.corners[0]
        let minProj = Infinity
        for(let c of bodyA.corners){
            let proj = c.x * smallestAxis.x + c.y * smallestAxis.y
            if(proj < minProj){
                minProj = proj
                contactPoint = c
            }
        }
    }

    return {
        normal: smallestAxis,
        depth: minOverlap,
        contact: contactPoint
    }
}

function satCircleCircle(a, b){
    let dx = a.pos.x - b.pos.x
    let dy = a.pos.y - b.pos.y
    let rSum = a.r + b.r

    if(Math.abs(dx) > rSum) return null
    if(Math.abs(dy) > rSum) return null

    let distSq = dx*dx + dy*dy
    if(distSq >= rSum*rSum) return null
    
    let dist = Math.sqrt(distSq)


    let normal = {
        x: dx / dist,
        y: dy / dist
    }

    let depth = rSum - dist

    let contact = {
        x: b.pos.x + normal.x * b.r,
        y: b.pos.y + normal.y * b.r
    }

    return { normal, depth, contact }
}

function satRectCircle(rect, circle){

    let sinA = Math.sin(rect.angle)
    let cosA = Math.cos(rect.angle)

    // Transform circle center to rectangle local space
    let dx = circle.pos.x - rect.pos.x
    let dy = circle.pos.y - rect.pos.y

    let localX =  dx * cosA + dy * sinA
    let localY = -dx * sinA + dy * cosA

    let hw = rect.w * .5
    let hh = rect.h * .5

    // Check if circle center is inside rectangle
    let inside = Math.abs(localX) <= hw && Math.abs(localY) <= hh

    let closestX = localX < -hw ? -hw : (localX > hw ? hw : localX)
    let closestY = localY < -hh ? -hh : (localY > hh ? hh : localY)

    let normalLocal = {x: 0, y: 0}
    let depth = 0

    if(inside){
        // Circle center is inside rectangle
        // Push toward nearest face
        // Normal should point FROM circle TO rect (inward to rect)

        let dxFace = hw - Math.abs(localX)
        let dyFace = hh - Math.abs(localY)

        if(dxFace < dyFace){
            normalLocal.x = localX > 0 ? -1 : 1  // Flipped: points inward to rect
            depth = circle.r + dxFace
            // Set contact to the nearest vertical edge
            closestX = (localX > 0 ? hw : -hw)
            closestY = localY
        } else {
            normalLocal.y = localY > 0 ? -1 : 1  // Flipped: points inward to rect
            depth = circle.r + dyFace
            // Set contact to the nearest horizontal edge
            closestX = localX
            closestY = (localY > 0 ? hh : -hh)
        }
    }
    else {
        // Outside case
        // Normal should point FROM circle TO rect (toward closest point on rect)
        let diffX = localX - closestX
        let diffY = localY - closestY
        let distSq = diffX*diffX + diffY*diffY

        if(distSq > circle.r * circle.r) return null

        let dist = Math.sqrt(distSq)

        normalLocal.x = -diffX / dist  // Flipped: points from circle to rect
        normalLocal.y = -diffY / dist  // Flipped: points from circle to rect
        depth = circle.r - dist
    }

   

    // Convert normal back to world space
    let normal = {
        x: normalLocal.x * cosA - normalLocal.y * sinA,
        y: normalLocal.x * sinA + normalLocal.y * cosA
    }

    // Contact point on rectangle surface
    let contactLocal = {
        x: closestX,
        y: closestY
    }

    let contact = {
        x: rect.pos.x + contactLocal.x * cosA - contactLocal.y * sinA,
        y: rect.pos.y + contactLocal.x * sinA + contactLocal.y * cosA
    }

    return {
        normal,
        depth,
        contact
    }
}

// Two-body impulse resolution
// Normal must point from bodyB toward bodyA
function resolveCollision(bodyA, bodyB, normal, contact){
    // Moment arms from centers to contact
    let rA = {
        x: contact.x - bodyA.pos.x,
        y: contact.y - bodyA.pos.y
    }
    let rB = {
        x: contact.x - bodyB.pos.x,
        y: contact.y - bodyB.pos.y
    }

    // Velocity at contact for each body
    let velA = {
        x: bodyA.vel.x - bodyA.angVel * rA.y,
        y: bodyA.vel.y + bodyA.angVel * rA.x
    }
    let velB = {
        x: bodyB.vel.x - bodyB.angVel * rB.y,
        y: bodyB.vel.y + bodyB.angVel * rB.x
    }

    // Relative velocity along normal (A relative to B)
    let relVelAlongNormal = (velA.x - velB.x) * normal.x + (velA.y - velB.y) * normal.y

    if(relVelAlongNormal > 0) return // separating

    let e = 0.2 // restitution

    let rACrossN = rA.x * normal.y - rA.y * normal.x
    let rBCrossN = rB.x * normal.y - rB.y * normal.x

    let denominator = bodyA.invMass + bodyB.invMass
                    + rACrossN * rACrossN * bodyA.invInertia
                    + rBCrossN * rBCrossN * bodyB.invInertia

    let j = -(1 + e) * relVelAlongNormal / denominator

    // Apply normal impulse to A (positive direction)
    bodyA.vel.x  += normal.x * j * bodyA.invMass
    bodyA.vel.y  += normal.y * j * bodyA.invMass
    bodyA.angVel += rACrossN * j * bodyA.invInertia

    // Apply normal impulse to B (negative direction)
    bodyB.vel.x  -= normal.x * j * bodyB.invMass
    bodyB.vel.y  -= normal.y * j * bodyB.invMass
    bodyB.angVel -= rBCrossN * j * bodyB.invInertia

    // Friction impulse (Coulomb model)
    let tangent = {
        x: (velA.x - velB.x) - relVelAlongNormal * normal.x,
        y: (velA.y - velB.y) - relVelAlongNormal * normal.y
    }
    let tangentLen = Math.hypot(tangent.x, tangent.y)
    if(tangentLen < 0.0001) return // no sliding
    tangent.x /= tangentLen
    tangent.y /= tangentLen

    let rACrossT = rA.x * tangent.y - rA.y * tangent.x
    let rBCrossT = rB.x * tangent.y - rB.y * tangent.x
    let frictionDenom = bodyA.invMass + bodyB.invMass
                      + rACrossT * rACrossT * bodyA.invInertia
                      + rBCrossT * rBCrossT * bodyB.invInertia

    let jt = -tangentLen / frictionDenom

    // Clamp by Coulomb's law: |jt| <= mu * |j|
    let mu = Math.sqrt(bodyA.friction * bodyB.friction)
    if(Math.abs(jt) > mu * j){
        jt = -mu * j
    }

    // Apply friction impulse
    bodyA.vel.x  += tangent.x * jt * bodyA.invMass
    bodyA.vel.y  += tangent.y * jt * bodyA.invMass
    bodyA.angVel += rACrossT * jt * bodyA.invInertia

    bodyB.vel.x  -= tangent.x * jt * bodyB.invMass
    bodyB.vel.y  -= tangent.y * jt * bodyB.invMass
    bodyB.angVel -= rBCrossT * jt * bodyB.invInertia
}

// Returns the world position of a body's anchor point
// 4 anchors at midpoints of all edges: 0=top, 1=right, 2=bottom, 3=left, 4=center
function getAnchorWorldPos(body, anchorIndex){
    if(!body || anchorIndex < 0 || anchorIndex > 4) return null
    if(anchorIndex === 4){
        return {
            x: body.pos.x,
            y: body.pos.y
        }
    }
    if(body.shape === 'circle'){
        let angle = anchorIndex * (Math.PI/2) + body.angle
        return {
            x: body.pos.x + Math.cos(angle) * body.r,
            y: body.pos.y + Math.sin(angle) * body.r
        }
    }
    else if(body.shape === 'rect'){
        let offsets = [
            {x: 0,          y: -body.h/2}, // 0: top
            {x:  body.w/2,  y: 0},         // 1: right
            {x: 0,          y:  body.h/2}, // 2: bottom
            {x: -body.w/2,  y: 0}          // 3: left
        ]
        let lx = offsets[anchorIndex].x
        let ly = offsets[anchorIndex].y
        let c = Math.cos(body.angle)
        let s = Math.sin(body.angle)
        return {
            x: body.pos.x + lx * c - ly * s,
            y: body.pos.y + lx * s + ly * c
        }
    }
    console.log('Unknown shape in getAnchorWorldPos')
    return null
}

// Returns the velocity at a body's anchor point (linear + angular contribution)
function getAnchorVelocity(body, anchorWorldPos){
    let rx = anchorWorldPos.x - body.pos.x
    let ry = anchorWorldPos.y - body.pos.y
    return {
        x: body.vel.x - body.angVel * ry,
        y: body.vel.y + body.angVel * rx
    }
}

// Get the world position of either end of a spring
function getSpringEndPos(spring, side){
    let body = side === 'A' ? spring.bodyA : spring.bodyB
    let anchor = side === 'A' ? spring.anchorA : spring.anchorB
    let worldAnchor = side === 'A' ? spring.worldAnchorA : spring.worldAnchorB
    if(body === null) return {x: worldAnchor.x, y: worldAnchor.y}
    return getAnchorWorldPos(body, anchor)
}

function applySpringForces(dt){
    for(let sp of springs){
        let posA = getSpringEndPos(sp, 'A')
        let posB = getSpringEndPos(sp, 'B')

        let dx = posB.x - posA.x
        let dy = posB.y - posA.y
        let currentLength = Math.hypot(dx, dy)
        if(currentLength < 0.0001) continue

        // Unit direction A → B
        let dirX = dx / currentLength
        let dirY = dy / currentLength

        // Spring force: pulls together when stretched, pushes apart when compressed
        let displacement = currentLength - sp.restLength
        let forceMag = sp.stiffness * displacement

        // Damping: project relative velocity onto spring axis
        let velA = sp.bodyA ? getAnchorVelocity(sp.bodyA, posA) : {x: 0, y: 0}
        let velB = sp.bodyB ? getAnchorVelocity(sp.bodyB, posB) : {x: 0, y: 0}
        let relVelAlongSpring = (velB.x - velA.x) * dirX + (velB.y - velA.y) * dirY
        forceMag += sp.damping * relVelAlongSpring

        let fx = forceMag * dirX
        let fy = forceMag * dirY

        // Apply to body A (force toward B)
        if(sp.bodyA && !sp.bodyA.isStatic){
            let rAx = posA.x - sp.bodyA.pos.x
            let rAy = posA.y - sp.bodyA.pos.y
            sp.bodyA.vel.x += fx * sp.bodyA.invMass * dt
            sp.bodyA.vel.y += fy * sp.bodyA.invMass * dt
            sp.bodyA.angVel += (rAx * fy - rAy * fx) * sp.bodyA.invInertia * dt
        }

        // Apply to body B (force toward A, opposite)
        if(sp.bodyB && !sp.bodyB.isStatic){
            let rBx = posB.x - sp.bodyB.pos.x
            let rBy = posB.y - sp.bodyB.pos.y
            sp.bodyB.vel.x -= fx * sp.bodyB.invMass * dt
            sp.bodyB.vel.y -= fy * sp.bodyB.invMass * dt
            sp.bodyB.angVel -= (rBx * fy - rBy * fx) * sp.bodyB.invInertia * dt
        }
    }
}

function pointInRect(point, body){
    let localX = point.x - body.pos.x
    let localY = point.y - body.pos.y
    let c = Math.cos(-body.angle)
    let s = Math.sin(-body.angle)
    let rotatedX = localX * c - localY * s
    let rotatedY = localX * s + localY * c
    return abs(rotatedX) <= body.w / 2 && abs(rotatedY) <= body.h / 2
}

function pointInCircle(point, body){
    let dx = point.x - body.pos.x
    let dy = point.y - body.pos.y
    return dx*dx + dy*dy <= body.r * body.r
}

function projectPoints(points, axis){
    let min = Infinity
    let max = -Infinity

    for(let p of points){
        let dot = p.x * axis.x + p.y * axis.y
        min = Math.min(min, dot)
        max = Math.max(max, dot)
    }

    return {min, max}
}

function updateCornerLocations(body){
    if(body.shape === 'circle') return
    let hw = body.w / 2
    let hh = body.h / 2
    let c = Math.cos(body.angle)
    let s = Math.sin(body.angle)
    body.corners = [
        {x: body.pos.x + (-hw * c - -hh * s), y: body.pos.y + (-hw * s + -hh * c)},
        {x: body.pos.x + ( hw * c - -hh * s), y: body.pos.y + ( hw * s + -hh * c)},
        {x: body.pos.x + ( hw * c -  hh * s), y: body.pos.y + ( hw * s +  hh * c)},
        {x: body.pos.x + (-hw * c -  hh * s), y: body.pos.y + (-hw * s +  hh * c)}
    ]
    body.edges = [
        {start: body.corners[0], end: body.corners[1]},
        {start: body.corners[1], end: body.corners[2]},
        {start: body.corners[2], end: body.corners[3]},
        {start: body.corners[3], end: body.corners[0]}
    ]
    body.axis1 = { x: Math.cos(body.angle), y: Math.sin(body.angle) }
    body.axis2 = { x: -sin(body.angle), y: Math.cos(body.angle) }
}