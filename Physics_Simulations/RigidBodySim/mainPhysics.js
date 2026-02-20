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

function handleCollision(bodyA, bodyB){
    let a = bodyA
    let b = bodyB
    if(isBridge(a) && isBridge(b)) return
    if(jointConnectionSet.has(`${a.id}-${b.id}`) || jointConnectionSet.has(`${b.id}-${a.id}`)) return
    let collision = null
    if((a.shape === 'rect' || a.shape === 'bridge') && (b.shape === 'rect' || b.shape === 'bridge')){
        collision = satRectRect(a, b)
    }
    else if(a.shape === 'circle' && b.shape === 'circle'){ 
        collision = satCircleCircle(a, b)
    }
    else if((a.shape === 'rect' || a.shape === 'bridge') && b.shape === 'circle') collision = satRectCircle(a, b)
    else if(a.shape === 'circle' && (b.shape === 'rect' || b.shape === 'bridge')) {
        collision = satRectCircle(b, a)
        if(collision) {
            collision.normal.x *= -1
            collision.normal.y *= -1
        }
    }

    if(collision && !(isBridge(a) && isBridge(b))){
        collisionPoints.add(`${roundToNearest(collision.contact.x, 10)},${roundToNearest(collision.contact.y, 10)}`)
        nCollisionsFrame++

        if (
            (isRectOrBridge(a) && b.shape === 'circle') ||
            (a.shape === 'circle' && isRectOrBridge(b))  // fix 1: added parentheses
        ) {
            if (
                (simState.portalA && (simState.portalA.body === a || simState.portalA.body === b)) ||  // fix 2
                (simState.portalB && (simState.portalB.body === a || simState.portalB.body === b))
            ) {
                let rectWithPortal = isRectOrBridge(a) ? a : b;
                let circle       = a.shape === 'circle' ? a : b;

                // fix 3: cleanly find which portal is on this rect
                let portalOnRect =
                    (simState.portalA && simState.portalA.body === rectWithPortal) ? simState.portalA :
                    (simState.portalB && simState.portalB.body === rectWithPortal) ? simState.portalB :
                    null;

                if (!portalOnRect) return;

                let e = rectWithPortal.edges[portalOnRect.edgeIndex];  // fix 6

                if (circleLineCollision({ pos: circle.pos, r: circle.r }, { start: e.start, end: e.end })) {
                    let centerOfMassInside = pointInRect({ x: circle.pos.x, y: circle.pos.y }, rectWithPortal);

                    if (centerOfMassInside && (circle.canTransportThroughPortal || circle.canTransportThroughPortal === undefined)) {
                        let fromPortal = portalOnRect;
                        let toPortal   = fromPortal === simState.portalA ? simState.portalB : simState.portalA;

                        if (!toPortal) return;  // fix 7: destination portal may not exist yet

                        let fromEdge = rectWithPortal.edges[fromPortal.edgeIndex];
                        let toEdge   = toPortal.body.edges[toPortal.edgeIndex];

                        let fromAngle = Math.atan2(fromEdge.end.y - fromEdge.start.y, fromEdge.end.x - fromEdge.start.x);
                        let toAngle   = Math.atan2(toEdge.end.y   - toEdge.start.y,   toEdge.end.x   - toEdge.start.x) - Math.PI
                        let angleDiff = toAngle - fromAngle;

                        // fix 4: actually apply the velocity rotation
                        let cos = Math.cos(angleDiff);
                        let sin = Math.sin(angleDiff);
                        let vx = circle.vel.x;
                        let vy = circle.vel.y;
                        circle.vel.x = vx * cos - vy * sin;
                        circle.vel.y = vx * sin + vy * cos;

                        let fromEdgeCenter = {
                            x: (fromEdge.start.x + fromEdge.end.x) / 2,
                            y: (fromEdge.start.y + fromEdge.end.y) / 2
                        };
                        let toEdgeCenter = {
                            x: (toEdge.start.x + toEdge.end.x) / 2,
                            y: (toEdge.start.y + toEdge.end.y) / 2
                        };

                        let relPos = {
                            x: circle.pos.x - fromEdgeCenter.x,
                            y: circle.pos.y - fromEdgeCenter.y
                        };

                        // fix 5: rotate by -fromAngle to enter edge-local space, then +toAngle to leave it
                        let cosFrom = Math.cos(-fromAngle);
                        let sinFrom = Math.sin(-fromAngle);
                        let relPosLocal = {
                            x: relPos.x * cosFrom - relPos.y * sinFrom,
                            y: relPos.x * sinFrom + relPos.y * cosFrom
                        };

                        let cosTo = Math.cos(toAngle);
                        let sinTo = Math.sin(toAngle);
                        let relPosFinal = {
                            x: relPosLocal.x * cosTo - relPosLocal.y * sinTo,
                            y: relPosLocal.x * sinTo + relPosLocal.y * cosTo
                        };
                        circle.pos.x = toEdgeCenter.x + relPosFinal.x;
                        circle.pos.y = toEdgeCenter.y + relPosFinal.y;
                        circle.canTransportThroughPortal = false;
                    }
                    return;
                }
            }
        }

        let normal = collision.normal
        let depth = collision.depth

        // Split separation by inverse mass ratio
        let invMassSum = a.invMass + b.invMass
        if(invMassSum === 0) return

        const percent = 0.8
        const slop = 0.01

        let correctionMag = Math.max(depth - slop, 0) * percent / invMassSum

        let nx = normal.x * correctionMag
        let ny = normal.y * correctionMag

        if(!a.isStatic){
            a.pos.x += nx * a.invMass
            a.pos.y += ny * a.invMass
        }
        if(!b.isStatic){
            b.pos.x -= nx * b.invMass
            b.pos.y -= ny * b.invMass
        }


        updateCornerLocations(a)
        updateCornerLocations(b)
        resolveCollision(a, b, normal, collision.contact)
    }
}

function solveBridgeJoints(){
    const jointCount = bridgeJoints.length;
    if(jointCount === 0) return;

    const stiffness = JOINT_STIFFNESS;
    const damping = JOINT_DAMPING;
    const minDist = 0.0001;

    for(let iter = 0; iter < JOINT_ITERATIONS; iter++){
        const forward = iter % 2 === 0;
        const start = forward ? 0 : jointCount - 1;
        const end = forward ? jointCount : -1;
        const step = forward ? 1 : -1;

        for(let i = start; i !== end; i += step){
            const joint = bridgeJoints[i];
            const bodyA = joint.bodyA;
            const bodyB = joint.bodyB;
            
            // Early exit conditions
            if(!bodyA || !bodyB) continue;
            const aStatic = bodyA.isStatic;
            const bStatic = bodyB.isStatic;
            //if(aStatic && bStatic) continue;

            // Compute world positions inline to avoid function call overhead
            const localA = joint.localA;
            const localB = joint.localB;
            const cosA = Math.cos(bodyA.angle);
            const sinA = Math.sin(bodyA.angle);
            const cosB = Math.cos(bodyB.angle);
            const sinB = Math.sin(bodyB.angle);
            
            const worldAx = bodyA.pos.x + (localA.x * cosA - localA.y * sinA);
            const worldAy = bodyA.pos.y + (localA.x * sinA + localA.y * cosA);
            const worldBx = bodyB.pos.x + (localB.x * cosB - localB.y * sinB);
            const worldBy = bodyB.pos.y + (localB.x * sinB + localB.y * cosB);

            const dx = worldBx - worldAx;
            const dy = worldBy - worldAy;
            const distSq = dx * dx + dy * dy;
            
            if(distSq < minDist * minDist) continue;
            
            const dist = Math.sqrt(distSq);

            joint.stress = (dist * stiffness) / cellSize
            if(aStatic && bStatic) continue;

            const invDist = 1 / dist;
            const nx = dx * invDist;
            const ny = dy * invDist;

            // Relative positions
            const rAx = worldAx - bodyA.pos.x;
            const rAy = worldAy - bodyA.pos.y;
            const rBx = worldBx - bodyB.pos.x;
            const rBy = worldBy - bodyB.pos.y;

            const rACrossN = rAx * ny - rAy * nx;
            const rBCrossN = rBx * ny - rBy * nx;
            
            const invMassSum = bodyA.invMass + bodyB.invMass
                             + rACrossN * rACrossN * bodyA.invInertia
                             + rBCrossN * rBCrossN * bodyB.invInertia;
            
            if(invMassSum === 0) continue;

            const invMassSumRecip = 1 / invMassSum;
            //const positionImpulse = dist * stiffness * invMassSumRecip

            // Apply position correction

            // XPBD compliance — set to 0 for rigid, small value for slight softness
            const compliance = 0; // try 0.0001 if you want a little give
            const lambda = -dist / (invMassSum + compliance);

            if(!aStatic){
                bodyA.pos.x -= nx * lambda * bodyA.invMass;
                bodyA.pos.y -= ny * lambda * bodyA.invMass;
                bodyA.angle -= rACrossN * lambda * bodyA.invInertia;
            }
            if(!bStatic){
                bodyB.pos.x += nx * lambda * bodyB.invMass;
                bodyB.pos.y += ny * lambda * bodyB.invMass;
                bodyB.angle += rBCrossN * lambda * bodyB.invInertia;
            }

            // Compute velocities inline
            const velAx = bodyA.vel.x - rAy * bodyA.angVel;
            const velAy = bodyA.vel.y + rAx * bodyA.angVel;
            const velBx = bodyB.vel.x - rBy * bodyB.angVel;
            const velBy = bodyB.vel.y + rBx * bodyB.angVel;
            
            const relVelAlongJoint = (velBx - velAx) * nx + (velBy - velAy) * ny;
            const dampingImpulse = relVelAlongJoint * damping * invMassSumRecip;

            // Apply damping
            if(!aStatic){
                const dampA = dampingImpulse * bodyA.invMass;
                bodyA.vel.x += nx * dampA;
                bodyA.vel.y += ny * dampA;
                bodyA.angVel += rACrossN * dampingImpulse * bodyA.invInertia;
            }
            if(!bStatic){
                const dampB = dampingImpulse * bodyB.invMass;
                bodyB.vel.x -= nx * dampB;
                bodyB.vel.y -= ny * dampB;
                bodyB.angVel -= rBCrossN * dampingImpulse * bodyB.invInertia;
            }

            updateCornerLocations(bodyA);
            updateCornerLocations(bodyB); 
        }
    }
    handleBreakingJoints();
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

function integrateBodies(dt){
    let air = airFriction * dt
    for(let b of bodies){
        if(b.cteAngVelToggle){
            b.angVel = b.cteAngVel
        }
        b.angle += b.angVel * dt

        if(b.isStatic) continue

        b.pos.x += b.vel.x * dt
        b.pos.y += b.vel.y * dt

        b.vel.x -= b.vel.x * air
        b.vel.y -= b.vel.y * air
        b.angVel -= b.angVel * air

    }
}

function computeAABB(body){
    if(body.shape != 'circle') {
        const hw = body.w * 0.5;
        const hh = body.h * 0.5;

        const cos = Math.cos(body.angle);
        const sin = Math.sin(body.angle);
        // rotated AABB half extents
        const ex = Math.abs(hw * cos) + Math.abs(hh * sin);
        const ey = Math.abs(hw * sin) + Math.abs(hh * cos);

        body.minX = body.pos.x - ex;
        body.maxX = body.pos.x + ex;
        body.minY = body.pos.y - ey;
        body.maxY = body.pos.y + ey;
    } 
    
    else {
        body.minX = body.pos.x - body.r
        body.maxX = body.pos.x + body.r
        body.minY = body.pos.y - body.r
        body.maxY = body.pos.y + body.r
    }
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
                let forceMag = sp.stiffness * Math.abs(displacement)
                b.stress += forceMag / b.area
            }   
        }
        b.stress *= 10
    }
}