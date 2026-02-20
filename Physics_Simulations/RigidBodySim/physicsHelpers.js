function pointInRect(point, body, increaseHitBox = false){
    let effectiveHeight = increaseHitBox ? body.h + 15 : body.h
    let effectiveWidth = increaseHitBox ? body.w + 15 : body.w
    let localX = point.x - body.pos.x
    let localY = point.y - body.pos.y
    let c = Math.cos(-body.angle)
    let s = Math.sin(-body.angle)
    let rotatedX = localX * c - localY * s
    let rotatedY = localX * s + localY * c
    return Math.abs(rotatedX) <= effectiveWidth / 2 && Math.abs(rotatedY) <= effectiveHeight / 2
}

function pointInCircle(point, body, increaseHitBox = false){
    let dx = point.x - body.pos.x
    let dy = point.y - body.pos.y
    let effectiveRadius = increaseHitBox ? body.r + 7 : body.r
    return dx*dx + dy*dy <= effectiveRadius * effectiveRadius
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
    let hw = body.w * .5
    let hh = body.h * .5
    let c = Math.cos(body.angle)
    let s = Math.sin(body.angle)
    let hhc = hh * c
    let hhs = hh * s
    let hwc = hw * c
    let hws = hw * s
    body.corners = [
        {x: body.pos.x + (-hwc + hhs), y: body.pos.y + (-hws - hhc)},
        {x: body.pos.x + ( hwc + hhs), y: body.pos.y + ( hws - hhc)},
        {x: body.pos.x + ( hwc -  hhs), y: body.pos.y + ( hws +  hhc)},
        {x: body.pos.x + (-hwc -  hhs), y: body.pos.y + (-hws +  hhc)}
    ]
    body.edges = [
        {start: body.corners[0], end: body.corners[1]},
        {start: body.corners[1], end: body.corners[2]},
        {start: body.corners[2], end: body.corners[3]},
        {start: body.corners[3], end: body.corners[0]}
    ]
    body.axis1 = { x: c, y: s }
    body.axis2 = { x: -s, y: c }
}

// Get the world position of either end of a spring
function getSpringEndPos(spring, side){
    let body = side === 'A' ? spring.bodyA : spring.bodyB
    let anchor = side === 'A' ? spring.anchorA : spring.anchorB
    let worldAnchor = side === 'A' ? spring.worldAnchorA : spring.worldAnchorB
    if(body === null || body === undefined) return {x: worldAnchor.x, y: worldAnchor.y}
    return getAnchorWorldPos(body, anchor)
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

// Returns the world position of a body's anchor point
// 4 anchors at midpoints of all edges: 0=top, 1=right, 2=bottom, 3=left, 4=center
function getAnchorWorldPos(body, anchorIndex){
    if(!body || anchorIndex < 0 || anchorIndex > 4) return null
    if(anchorIndex === 4 || anchorIndex === null || anchorIndex === undefined){
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
    else if(body.shape === 'rect' || body.shape === 'bridge'){
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

function handleBreakingJoints(){
    ACTIVE_MAX_STRESS_JOINT = simState.unbreakableJoints ? Infinity : MAX_STRESS_JOINT
    for(let i = bridgeJoints.length - 1; i >= 0; i--){
        let joint = bridgeJoints[i]
        if(joint.stress > ACTIVE_MAX_STRESS_JOINT){
            divideRope(joint.bodyA, joint.bodyB)
            removeJoint(joint)
        }
    }
}

function circleLineCollision(circle, line){
    let ac = {x: circle.pos.x - line.start.x, y: circle.pos.y - line.start.y}
    let ab = {x: line.end.x - line.start.x, y: line.end.y - line.start.y}
    let abLen = Math.sqrt(ab.x * ab.x + ab.y * ab.y)
    let abNorm = {x: ab.x / abLen, y: ab.y / abLen}
    let proj = ac.x * abNorm.x + ac.y * abNorm.y
    proj = Math.max(0, Math.min(abLen, proj))
    let closest = {x: line.start.x + abNorm.x * proj, y: line.start.y + abNorm.y * proj}
    let distSq = (circle.pos.x - closest.x) ** 2 + (circle.pos.y - closest.y) ** 2
    return distSq <= circle.r ** 2
}