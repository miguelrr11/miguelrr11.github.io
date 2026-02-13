//Rigid Body Simulation
//Miguel Rodríguez
//13-02-2026

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

const gravity = 0.1

let bodies = []
let segments = []

function setup(){
    createCanvas(WIDTH, HEIGHT)
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
        angVel: 0.03,
        mass: massB,
        invMass: 1/massB,
        inertia: iner,
        invInertia: 1 / iner
    })

    let newSeg = {
        start: {x: 100, y: 400},
        end: {x: 500, y: 400}
    }
    newSeg.normal = calcutateSegNormal(newSeg)
    segments.push(newSeg)
}

function calcutateSegNormal(seg){
    let dx = seg.end.x - seg.start.x
    let dy = seg.end.y - seg.start.y

    let length = Math.hypot(dx, dy)
    dx /= length
    dy /= length

    let segNormal = { x: -dy, y: dx }
    return segNormal
}

function draw(){
    background(0)

    for(let b of bodies){
        b.oldPos = {x: b.pos.x, y: b.pos.y}
    }

    if(pointInRect({x: mouseX, y: mouseY}, bodies[0]) && mouseIsPressed){
        bodies[0].pos.x = mouseX
        bodies[0].pos.y = mouseY
    }

    segments[0].end.y = mouseY
    segments[0].normal = calcutateSegNormal(segments[0])

    const STEPS = 50
    for(let step = 0; step < STEPS; step++){
        let dt = 1 / STEPS

        // Apply gravity
        for(let b of bodies){
            b.vel.y += gravity * dt
        }

        // Integrate
        for(let b of bodies){
            b.pos.x += b.vel.x * dt
            b.pos.y += b.vel.y * dt
            b.angle += b.angVel * dt
        }

        // Update geometry
        for(let b of bodies) updateCornerLocations(b)

        // Collisions (you can still use iterations here)
        for(let iter = 0; iter < 3; iter++){
            for(let b of bodies){
                for(let seg of segments){
                    let collision = satRectSegment(b, seg)
                    if(collision){
                        let normal = collision.normal
                        let depth = collision.depth
                        let centerToSeg = {
                            x: b.pos.x - seg.start.x,
                            y: b.pos.y - seg.start.y
                        }
                        if(centerToSeg.x * normal.x + centerToSeg.y * normal.y < 0){
                            normal.x *= -1
                            normal.y *= -1
                        }
                        b.pos.x += normal.x * depth / 3
                        b.pos.y += normal.y * depth / 3
                        updateCornerLocations(b)
                        resolveCollision(b, seg, normal, collision.contact)
                    }
                }
            }
        }
    }


    // 5️⃣ Draw
    for(let b of bodies) drawBody(b)
    for(let s of segments) drawSegment(s)
}



function satRectSegment(body, segment){

    let axes = []

    // rectangle axes
    axes.push({ x: cos(body.angle), y: sin(body.angle) })
    axes.push({ x: -sin(body.angle), y: cos(body.angle) })

    // segment normal
    let dx = segment.end.x - segment.start.x
    let dy = segment.end.y - segment.start.y
    let len = Math.hypot(dx, dy)
    dx /= len
    dy /= len
    axes.push({ x: -dy, y: dx })

    let minOverlap = Infinity
    let smallestAxis = null

    for(let axis of axes){

        let projRect = projectPoints(body.corners, axis)
        let projSeg = projectSegment(segment, axis)

        let overlap = Math.min(projRect.max, projSeg.max)
                     - Math.max(projRect.min, projSeg.min)

        if(overlap <= 0){
            return null
        }

        if(overlap < minOverlap){
            minOverlap = overlap
            smallestAxis = axis
        }
    }

    let contactPoint = body.corners[0]
    let maxPenetration = -Infinity
    for(let c of body.corners){
        let penetration = (c.x - segment.start.x) * smallestAxis.x + (c.y - segment.start.y) * smallestAxis.y
        if(penetration > maxPenetration){
            maxPenetration = penetration
            contactPoint = c
        }
    }

    return {
        normal: smallestAxis,
        depth: minOverlap,
        contact: contactPoint
    }
}

function resolveCollision(body, seg, normal, contact){

    // vector from center to contact
    let r = {
        x: contact.x - body.pos.x,
        y: contact.y - body.pos.y
    }

    // relative velocity at contact point along normal
    let velAtPoint = {
        x: body.vel.x - body.angVel * r.y,
        y: body.vel.y + body.angVel * r.x
    }
    let velAlongNormal = velAtPoint.x * normal.x + velAtPoint.y * normal.y

    if(velAlongNormal > 0) return // separating

    let e = 0.2 // restitution

    // impulse scalar
    let rCrossN = r.x * normal.y - r.y * normal.x
    let j = -(1 + e) * velAlongNormal / (body.invMass + rCrossN * rCrossN * body.invInertia)

    // apply linear and angular impulse
    body.vel.x += normal.x * j * body.invMass
    body.vel.y += normal.y * j * body.invMass
    body.angVel += rCrossN * j * body.invInertia
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

function projectSegment(seg, axis){
    const thickness = 0.1
    let dots = [
        seg.start.x * axis.x + seg.start.y * axis.y,
        seg.end.x * axis.x + seg.end.y * axis.y
    ]
    let min = Math.min(dots[0], dots[1]) - thickness
    let max = Math.max(dots[0], dots[1]) + thickness
    return {min, max}
}

function detectCollBodySeg(body, segment){
    for(let edge of body.edges){
        let collPoint = linelineIntersect(edge.start, edge.end, segment.start, segment.end)
        if(collPoint){
            fill(0, 0, 255)
            ellipse(collPoint.x, collPoint.y, 10, 10)
            return collPoint
        }
    }
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

function drawSegment(seg){
    push()
    stroke(255)
    line(seg.start.x, seg.start.y, seg.end.x, seg.end.y)
    pop()
}