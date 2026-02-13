//Rigid Body Simulation
//Miguel Rodríguez
//13-02-2026

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

const gravity = 0.1

let bodies = []

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
}

function draw(){
    background(0)

    for(let b of bodies){
        b.oldPos = {x: b.pos.x, y: b.pos.y}
        if(pointInRect({x: mouseX, y: mouseY}, b) && mouseIsPressed && !b.isStatic){
            b.pos.x = mouseX
            b.pos.y = mouseY
            b.vel.x = 0
            b.vel.y = 0
        }
    }

    const STEPS = 50
    for(let step = 0; step < STEPS; step++){
        let dt = 1 / STEPS

        // Apply gravity
        for(let b of bodies){
            if(!b.isStatic) b.vel.y += gravity * dt
        }

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

    // Draw
    for(let b of bodies) drawBody(b)
}


// SAT collision between two rectangles
// Returns {normal, depth, contact} with normal pointing from bodyB toward bodyA
function satRectRect(bodyA, bodyB){
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

function linelineIntersect(p1, p2, p3, p4){
    let den = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y)
    if(den == 0) return null // Parallel lines
    let t = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / den
    let u = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / den
    if(t >= 0 && t <= 1 && u >= 0 && u <= 1){
        return {
            x: p1.x + t * (p2.x - p1.x),
            y: p1.y + t * (p2.y - p1.y)
        }
    }
    return null
}

function normalizeVec(v){
    let mag = sqrt(v.x * v.x + v.y * v.y)
    if(mag > 0){
        v.x /= mag
        v.y /= mag
    }
}

function drawBody(body){
    push()
    translate(body.pos.x, body.pos.y)
    rotate(body.angle)
    rectMode(CENTER)
    fill(100)
    rect(0, 0, body.w, body.h)
    pop()
    drawDebugBody(body)
    
}

function drawDebugBody(body){
    //draw vectors, normals, etc for debugging  
    push()
    // Example: draw velocity vector
    stroke(0, 0, 255)
    line(body.pos.x, body.pos.y, body.pos.x + body.vel.x * 10, body.pos.y + body.vel.y * 10)
    pop()

    push()
    fill(255, 0, 0)
    for(let c of body.corners){
        ellipse(c.x, c.y, 7, 7)
    }
    stroke(0, 255, 0)
    for(let e of body.edges){
        line(e.start.x, e.start.y, e.end.x, e.end.y)
    }
    pop()
}
