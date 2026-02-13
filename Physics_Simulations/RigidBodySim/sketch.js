//Rigid Body Simulation
//Miguel Rodríguez
//13-02-2026

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

const gravity = 0.1
const MAXSTEPS = 20

let bodies = []
let springs = []

let gridMouseX = 0
let gridMouseY = 0
let nCells = 50
let cellSize = WIDTH / nCells

// Editor state
let editorMode = null // 'static', 'dynamic', 'spring', 'bridge'
let dragStart = null  // {x, y} for body creation drag
let springStart = null // {body, anchor} for spring first click
let simRunning = true
let buttonSimRunning = null
let buttons = []

function setup(){
    createCanvas(WIDTH, HEIGHT)

    // Dynamic box
    let massB = 1
    let wB = 100
    let hB = 50
    let iner = (1/12)*massB*(wB*wB + hB*hB)
    bodies.push({
        w: wB,
        h: hB,
        pos: {x: width/2, y: height/2},
        vel: {x: 0, y: 0},
        angle: 0.3,
        angVel: 0,
        mass: massB,
        invMass: 1/massB,
        inertia: iner,
        invInertia: 1 / iner,
        isStatic: false,
        friction: 0.3
    })

    bodies.push({
        w: wB,
        h: hB,
        pos: {x: width/2 - 50, y: height/2 - 150},
        vel: {x: 0, y: 0},
        angle: 0.5,
        angVel: 0,
        mass: massB,
        invMass: 1/massB,
        inertia: iner,
        invInertia: 1 / iner,
        isStatic: false,
        friction: 0.3
    })

    // Static thin body (former segment)
    bodies.push({
        w: 400,
        h: 4,
        pos: {x: 300, y: 400},
        vel: {x: 0, y: 0},
        angle: 0,
        angVel: 0,
        mass: Infinity,
        invMass: 0,
        inertia: Infinity,
        invInertia: 0,
        isStatic: true,
        friction: 0.5
    })

    for(let b of bodies) updateCornerLocations(b)

    // Spring: fixed ceiling point → first box (anchor 3 = left)
    springs.push({
        bodyA: null,
        bodyB: bodies[0],
        anchorA: 0,
        anchorB: 3,
        worldAnchorA: {x: width/2, y: 50},
        worldAnchorB: {x: 0, y: 0},
        restLength: 150,
        stiffness: 5,
        damping: 0.5
    })

    // Spring: first box (anchor 1 = right) → second box (anchor 3 = left)
    springs.push({
        bodyA: bodies[0],
        bodyB: bodies[1],
        anchorA: 1,
        anchorB: 3,
        worldAnchorA: {x: 0, y: 0},
        worldAnchorB: {x: 0, y: 0},
        restLength: 100,
        stiffness: 1,
        damping: 0.3
    })

    // Editor buttons
    let modes = ['static', 'dynamic', 'spring', 'bridge']
    for(let m of modes){
        let btn = createButton(m)
        btn.mousePressed(() => {
            editorMode = editorMode === m ? null : m
            springStart = null
            dragStart = null
        })
        buttons.push({el: btn, mode: m})
    }
    buttonSimRunning = createButton('Pause')
    buttonSimRunning.mousePressed(() => {
        simRunning = !simRunning
        buttonSimRunning.html(simRunning ? 'Pause' : 'Resume')
    })
}

function createBodyFromRect(x1, y1, x2, y2, isStatic){
    let cx = (x1 + x2) / 2
    let cy = (y1 + y2) / 2
    let w = Math.abs(x2 - x1)
    let h = Math.abs(y2 - y1)
    if(w < 5 || h < 5) return
    let m = isStatic ? Infinity : Math.max(1, w * h / 5000)
    let inv = isStatic ? 0 : 1 / m
    let iner = (1/12) * m * (w*w + h*h)
    let invI = isStatic ? 0 : 1 / iner
    let body = {
        w: w, h: h,
        pos: {x: cx, y: cy},
        vel: {x: 0, y: 0},
        angle: 0, angVel: 0,
        mass: m, invMass: inv,
        inertia: iner, invInertia: invI,
        isStatic: isStatic,
        friction: 0.3
    }
    updateCornerLocations(body)
    bodies.push(body)
}

function createBridgeElement(x1, y1, x2, y2){
    //thin body from x1y1 to x2y2
    let cx = (x1 + x2) / 2
    let cy = (y1 + y2) / 2
    let w = Math.hypot(x2 - x1, y2 - y1)
    let h = 4 // fixed height for bridge elements
    let angle = Math.atan2(y2 - y1, x2 - x1)

    let m = 1
    let inv = 1 / m
    let iner = (1/12) * m * (w*w + h*h)
    let invI = 1 / iner

    let body = {
        w: w, h: h,
        pos: {x: cx, y: cy},
        vel: {x: 0, y: 0},
        angle: angle, angVel: 0,
        mass: m, invMass: inv,
        inertia: iner, invInertia: invI,
        isStatic: false,
        friction: 0.3
    }
    updateCornerLocations(body)
    bodies.push(body)
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
                b.stress += forceMag / (b.w * b.h)
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
        for(let a = 0; a < 4; a++){
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
    if(gridMouseY < 0 || gridMouseX < 0 || gridMouseX > WIDTH || gridMouseY > HEIGHT) return

    if(editorMode === 'static' || editorMode === 'dynamic' || editorMode === 'bridge'){
        dragStart = {x: gridMouseX, y: gridMouseY}
    } 
    else if(editorMode === 'spring'){
        let hit = findNearestAnchor(gridMouseX, gridMouseY, 20)
        if(hit){
            if(!springStart){
                springStart = hit
            } 
            else {
                if(hit.body !== springStart.body || hit.anchor !== springStart.anchor){
                    let d = Math.hypot(hit.pos.x - springStart.pos.x, hit.pos.y - springStart.pos.y)
                    springs.push({
                        bodyA: springStart.body,
                        bodyB: hit.body,
                        anchorA: springStart.anchor,
                        anchorB: hit.anchor,
                        worldAnchorA: {x: 0, y: 0},
                        worldAnchorB: {x: 0, y: 0},
                        restLength: Math.max(d, 10),
                        stiffness: 3,
                        damping: 0.3
                    })
                }
                springStart = null
            }
        }
        else{
            if(springStart){
                let d = Math.hypot(gridMouseX - springStart.pos.x, gridMouseY - springStart.pos.y)
                springs.push({
                    bodyA: springStart.body,
                    bodyB: null,
                    anchorA: springStart.anchor,
                    anchorB: null,
                    worldAnchorA: {x: 0, y: 0},
                    worldAnchorB: {x: gridMouseX, y: gridMouseY},
                    restLength: Math.max(d, 10),
                    stiffness: 3,
                    damping: 0.3
                })
            }
            springStart = null
        }
    } 
    else {
        // No mode: drag bodies
        for(let b of bodies){
            if(pointInRect({x: gridMouseX, y: gridMouseY}, b)){
                b.dragging = true
            }
        }
    }
}

function mouseReleased(){
    if(dragStart && (editorMode === 'static' || editorMode === 'dynamic')){
        createBodyFromRect(dragStart.x, dragStart.y, gridMouseX, gridMouseY, editorMode === 'static')
        dragStart = null
    }
    if(dragStart && editorMode === 'bridge'){
        createBridgeElement(dragStart.x, dragStart.y, gridMouseX, gridMouseY)
        dragStart = null
    }
    for(let b of bodies) b.dragging = false
}

function draw(){
    background(0)

    let gridMouseXFloor = Math.floor(mouseX / cellSize) * cellSize
    let gridMouseYFloor = Math.floor(mouseY / cellSize) * cellSize
    let gridMouseXCeil = Math.ceil(mouseX / cellSize) * cellSize
    let gridMouseYCeil = Math.ceil(mouseY / cellSize) * cellSize
    gridMouseX = Math.abs(mouseX - gridMouseXFloor) < Math.abs(mouseX - gridMouseXCeil) ? 
        gridMouseXFloor : gridMouseXCeil
    gridMouseY = Math.abs(mouseY - gridMouseYFloor) < Math.abs(mouseY - gridMouseYCeil) ? 
        gridMouseYFloor : gridMouseYCeil

    //draw grid
    stroke(50)
    for(let i = 0; i <= nCells; i++){
        line(i * cellSize, 0, i * cellSize, HEIGHT)
        line(0, i * cellSize, WIDTH, i * cellSize)
    }

    // Style editor buttons
    for(let btn of buttons.concat([ {el: buttonSimRunning, mode: null} ])){
        btn.el.style('background', editorMode === btn.mode ? '#555' : '#222')
        btn.el.style('color', '#fff')
        btn.el.style('border', (editorMode === btn.mode && btn.mode) ? '2px solid #fff' : '1px solid #666')
        btn.el.style('padding', '4px 10px')
        btn.el.style('cursor', 'pointer')
    }

    for(let b of bodies){
        b.oldPos = {x: b.pos.x, y: b.pos.y}
        if(b.dragging && mouseIsPressed){
            b.pos.x = gridMouseX
            b.pos.y = gridMouseY
            b.vel.x = 0
            b.vel.y = 0
        }
    }

    for(let b of bodies) updateCornerLocations(b)

    const STEPS = simRunning ? MAXSTEPS : 0
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
            if(b.isStatic) continue
            b.pos.x += b.vel.x * dt
            b.pos.y += b.vel.y * dt
            b.angle += b.angVel * dt
        }

        // Update geometry
        for(let b of bodies) updateCornerLocations(b)

        // Collisions
        for(let iter = 0; iter < 3; iter++){
            for(let i = 0; i < bodies.length; i++){
                for(let j = i + 1; j < bodies.length; j++){
                    let a = bodies[i]
                    let b = bodies[j]
                    let collision = satRectRect(a, b)
                    if(collision){
                        let normal = collision.normal
                        let depth = collision.depth

                        // Split separation by inverse mass ratio
                        let totalInvMass = a.invMass + b.invMass
                        if(totalInvMass > 0){
                            let aRatio = a.invMass / totalInvMass
                            let bRatio = b.invMass / totalInvMass
                            let correction = depth / 3
                            a.pos.x += normal.x * correction * aRatio
                            a.pos.y += normal.y * correction * aRatio
                            b.pos.x -= normal.x * correction * bRatio
                            b.pos.y -= normal.y * correction * bRatio
                        }

                        updateCornerLocations(a)
                        updateCornerLocations(b)
                        resolveCollision(a, b, normal, collision.contact)
                    }
                }
            }
        }
    }

    calculateStressBodies()

    // Draw
    for(let sp of springs) drawSpring(sp)
    for(let b of bodies) drawBody(b)

    // Editor overlays
    drawEditor()
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
// 4 anchors at midpoints of all edges: 0=top, 1=right, 2=bottom, 3=left
function getAnchorWorldPos(body, anchorIndex){
    let offsets = [
        {x: 0,          y: -body.h/2}, // 0: top
        {x:  body.w/2,  y: 0},         // 1: right
        {x: 0,          y:  body.h/2}, // 2: bottom
        {x: -body.w/2,  y: 0}          // 3: left
    ]
    let lx = offsets[anchorIndex].x
    let ly = offsets[anchorIndex].y
    let c = cos(body.angle)
    let s = sin(body.angle)
    return {
        x: body.pos.x + lx * c - ly * s,
        y: body.pos.y + lx * s + ly * c
    }
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
    let c = cos(-body.angle)
    let s = sin(-body.angle)
    let rotatedX = localX * c - localY * s
    let rotatedY = localX * s + localY * c
    return abs(rotatedX) <= body.w / 2 && abs(rotatedY) <= body.h / 2
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
    let hw = body.w / 2
    let hh = body.h / 2
    let c = cos(body.angle)
    let s = sin(body.angle)
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
    body.axis1 = { x: cos(body.angle), y: sin(body.angle) }
    body.axis2 = { x: -sin(body.angle), y: cos(body.angle) }
}



