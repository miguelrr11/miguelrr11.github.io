function clearSim(){
    bodies = []
    springs = []
    bridgeJoints = []
    ropes = []
    tree = new DynamicAABBTree(5)
    simState.selectedBody = null
    simState.hoveredBody = null
    simState.hoveredSpring = null
    simState.draggingBody = null
    simState.portalA = null
    simState.portalB = null
    simState.settingPortals = false
}

function setUIfromSimState(){
    cteAngVelSlider.setValue(simState.selectedBody ? simState.selectedBody.cteAngVel : 0)
    cteAngVelCB.setValue(simState.selectedBody ? simState.selectedBody.cteAngVelToggle : false)
    automaticLengthToggle.setValue(simState.automaticLength)
    lengthSlider.setValue(simState.lengthSpring)
    createSelect.setValue(simState.createMode.charAt(0).toUpperCase() + simState.createMode.slice(1))
    unbreakJointsCB.setValue(simState.unbreakableJoints)
    gravityCB.setValue(simState.gravityEnabled)
    staticDynamicSelect.setValue(simState.staticDynamicMode.charAt(0).toUpperCase() + simState.staticDynamicMode.slice(1))
}

function saveStateToLocal(){
    let savedBodies = bodies.map(b => {
        if(b.shape === 'rect' || b.shape === 'bridge') {
            return {
            id: b.id,
            pos: {x: b.pos.x - b.w/2, y: b.pos.y - b.h/2},
            w: b.w,
            h: b.h,
            shape: b.shape,
            radius: b.radius,
            isStatic: b.isStatic,
            cteAngVel: b.cteAngVel,
            cteAngVelToggle: b.cteAngVelToggle,
            angle: b.angle,
            isRope: b.isRope,
            thrusters: b.thrusters ? b.thrusters : null
        }}
        if(b.shape === 'circle') {
            return {
            id: b.id,
            pos: b.pos,
            r: b.r,
            shape: b.shape,
            radius: b.radius,
            isStatic: b.isStatic,
            cteAngVel: b.cteAngVel,
            cteAngVelToggle: b.cteAngVelToggle,
            angle: b.angle
        }}
    })
    let savedSprings = springs.map(s => {
        return {
            id: s.id,
            bodyA: s.bodyA != null ? s.bodyA.id : null,
            bodyB: s.bodyB != null ? s.bodyB.id : null,
            anchorA: s.anchorA,
            anchorB: s.anchorB,
            restLength: s.restLength,
            worldAnchorA: s.worldAnchorA,
            worldAnchorB: s.worldAnchorB,
        }
    })
    let savedBridgeJoints = bridgeJoints.map(j => {
        return {
            id: j.id,
            bodyA: j.bodyA != null ? j.bodyA.id : null,
            bodyB: j.bodyB != null ? j.bodyB.id : null,
            anchorA: j.anchorA,
            anchorB: j.anchorB,
        }
    })
    let savedRopes = ropes.map(r => {
        return {
            start: r.start ? {
                bodyID: r.start.body ? r.start.body.id : null,
                anchor: r.start.anchor
            } : null,
            end: r.end ? {
                bodyID: r.end.body ? r.end.body.id : null,
                anchor: r.end.anchor
            } : null,
            segments: r.segments.map(s => s.id),
            id: r.id
        }
    })
    let copyOfSimState = {...simState}
    copyOfSimState.hoveredBody = null
    copyOfSimState.selectedBody = null
    copyOfSimState.hoveredSpring = null
    copyOfSimState.draggingBody = null
    copyOfSimState.centerCameraOnBody = null
    copyOfSimState.portalA = simState.portalA ? {bodyID: simState.portalA.body.id, edgeIndex: simState.portalA.edgeIndex} : null
    copyOfSimState.portalB = simState.portalB ? {bodyID: simState.portalB.body.id, edgeIndex: simState.portalB.edgeIndex} : null
    console.log(copyOfSimState)
    localStorage.setItem("rigidBodySimState", JSON.stringify({simState: copyOfSimState, bodies: savedBodies, springs: savedSprings, bridgeJoints: savedBridgeJoints, ropes: savedRopes}))
}

function loadStateFromLocal(){
    let saved = localStorage.getItem("rigidBodySimState")
    if(saved){
        tree = new DynamicAABBTree(5)
        let parsed = JSON.parse(saved)
        simState = parsed.simState
        bodies = []
        springs = []
        bridgeJoints = []
        ropes = []
        parsed.bodies.forEach(b => {
            let newBody = null
            if(b.shape == "rect") newBody = createBodyFromRect(b.pos.x, b.pos.y, b.pos.x + b.w, b.pos.y + b.h, b.isStatic, b.angle)
            if(b.shape == "circle") newBody = createBodyFromCircle(b.pos.x, b.pos.y, b.r, b.isStatic, b.angle)
            if(b.shape == "bridge") newBody = createBridgeElement(b.pos.x, b.pos.y, b.pos.x + b.w, b.pos.y + b.h, b.isStatic, b.angle, false, b.w, b.h, b.isRope)
            if(b.cteAngVelToggle){
                newBody.cteAngVelToggle = b.cteAngVelToggle
                newBody.cteAngVel = b.cteAngVel
            }
            newBody.isRope = b.isRope
            newBody.id = b.id
            if(b.thrusters) newBody.thrusters = b.thrusters
        })
        if(simState.portalA && simState.portalA.bodyID != undefined) simState.portalA.body = bodies.find(b => b.id === simState.portalA.bodyID)
        if(simState.portalB && simState.portalB.bodyID != undefined) simState.portalB.body = bodies.find(b => b.id === simState.portalB.bodyID)
        parsed.springs.forEach(s => {
            let bodyA = bodies.find(b => b.id == s.bodyA)
            let bodyB = bodies.find(b => b.id == s.bodyB)
            let newSpring = createSpring(bodyA, s.anchorA, bodyB, s.anchorB, s.restLength, s.worldAnchorA, s.worldAnchorB)
            newSpring.id = s.id
        })
        parsed.bridgeJoints.forEach(j => {
            let bodyA = bodies.find(b => b.id == j.bodyA)
            let bodyB = bodies.find(b => b.id == j.bodyB)
            let newJoint = createBridgeJoint(bodyA, j.anchorA, bodyB, j.anchorB)
            newJoint.id = j.id
        })
        parsed.ropes.forEach(r => {
            let newRope = {
                start: r.start ? bodies.find(b => b.id == r.start.bodyID) : null,
                end: r.end ? bodies.find(b => b.id == r.end.bodyID) : null,
                segments: r.segments.map(s => bodies.find(b => b.id == s)),
            }
            newRope.id = r.id
            ropes.push(newRope)
        })
        setUIfromSimState()
    }
}

function createSpring(bodyA, anchorA, bodyB, anchorB, restLength = null, worldAnchorA = null, worldAnchorB = null){
    let posA = worldAnchorA || getAnchorWorldPos(bodyA, anchorA) || { x: gridMouseX, y: gridMouseY }
    let posB = worldAnchorB || getAnchorWorldPos(bodyB, anchorB) || { x: gridMouseX, y: gridMouseY }
    let d = restLength !== null ? restLength : (simState.autoLengthSpring ? Math.hypot(posB.x - posA.x, posB.y - posA.y) : simState.lengthSpring * cellSize)
    let id = simState.globalID++
    let newSpring = {
        bodyA, bodyB, anchorA, anchorB,
        worldAnchorA: posA,
        worldAnchorB: posB,
        restLength: d,
        stiffness: 3,
        damping: 0.3,
        id,
        shape: 'spring'
    }
    springs.push(newSpring)
    return newSpring
}

function createBodyFromCircle(x, y, r, isStatic, angle = 0){
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
        angle: angle,
        angVel: 0,
        mass: m,
        invMass: inv,
        inertia: iner,
        invInertia: invI,
        isStatic: isStatic,
        friction: 1,
        cteAngVel: 0,
        cteAngVelToggle: false,
        id: simState.globalID++,
        _pairStamp: -1,
        _pairWith: -1,
        _treeNode: null,
    }

    bodies.push(body)
    tree.insert(body)
    return body
}

function createBodyFromRect(x1, y1, x2, y2, isStatic, angle = 0, isFromRope = false){
    let cx = (x1 + x2) / 2
    let cy = (y1 + y2) / 2
    let w = Math.abs(x2 - x1)
    let h = Math.abs(y2 - y1)
    if(w < 5 || h < 5) return
    let m = isStatic ? Infinity : w * h / (cellSize * cellSize)
    let inv = isStatic ? 0 : 1 / m
    let iner = (1/12) * m * (w*w + h*h)
    let invI = isStatic ? 0 : 1 / iner
    let id = simState.globalID++
    let body = {
        area: w * h,
        shape: 'rect',
        w: w, h: h,
        pos: {x: cx, y: cy},
        vel: {x: 0, y: 0},
        angle: angle, angVel: 0,
        mass: m, invMass: inv,
        inertia: iner, invInertia: invI,
        isStatic: isStatic,
        friction: 1,
        cteAngVel: 0,
        cteAngVelToggle: false,
        id: id,
        _pairStamp: -1,
        _pairWith: -1,
        _treeNode: null,
    }
    updateCornerLocations(body)
    bodies.push(body)
    tree.insert(body)
    return body
}

function createBridgeElement(x1, y1, x2, y2, isStatic = false, angle = undefined, autoConnect = true, defW = null, defH = null, isFromRope = false){
    let cx = (x1 + x2) / 2
    let cy = (y1 + y2) / 2
    let w = defW || Math.hypot(x2 - x1, y2 - y1)
    let h = defH || 6

    let rx1 = cx - w/2
    let ry1 = cy - h/2
    let rx2 = cx + w/2
    let ry2 = cy + h/2

    let bridge = createBodyFromRect(rx1, ry1, rx2, ry2, isStatic, angle, isFromRope)
    if(!bridge) return null
    bridge.shape = 'bridge'
    if(angle === undefined) bridge.angle = atan2(y2 - y1, x2 - x1)
    if(autoConnect) autoConnectBridgeJoints(bridge)
    updateCornerLocations(bridge)
    return bridge
}

function createRope(bodyA, anchorA, bodyB, anchorB, worldAnchorA = null, worldAnchorB = null){
    let posA = worldAnchorA || getAnchorWorldPos(bodyA, anchorA) || { x: gridMouseX, y: gridMouseY }
    let posB = worldAnchorB || getAnchorWorldPos(bodyB, anchorB) || { x: gridMouseX, y: gridMouseY }
    let x1 = posA.x
    let y1 = posA.y
    let x2 = posB.x
    let y2 = posB.y

    let start = bodyA && anchorA !== null ? {body: bodyA, anchor: anchorA} : null
    let end = bodyB && anchorB !== null ? {body: bodyB, anchor: anchorB} : null

    let rope = {start, end, segments: [], id: simState.globalID++}
    ropes.push(rope)
    
    let segmentSize = ROPE_SEGMENT_LENGTH * cellSize
    let totalLength = Math.hypot(x2 - x1, y2 - y1)
    let numSegments = Math.ceil(totalLength / segmentSize)
    let ropeBodies = []
    //create briges of size segmentSize until we reach the end point and connect them with joints
    for(let i = 0; i < numSegments; i++){
        let t1 = i / numSegments
        let t2 = (i + 1) / numSegments
        let bx1 = lerp(x1, x2, t1)
        let by1 = lerp(y1, y2, t1)
        let bx2 = lerp(x1, x2, t2)
        let by2 = lerp(y1, y2, t2)
        let isStatic = false
        let angle = undefined
        let autoConnect = false
        let defW = null
        let defH = null
        let fromRope = true
        let bridge = createBridgeElement(bx1, by1, bx2, by2, isStatic, angle, autoConnect, defW, defH, fromRope)
        if(!bridge) continue
        bridge.isRope = true
        ropeBodies.push(bridge)
        if(i > 0){
            let prev = ropeBodies[i - 1]
            createBridgeJoint(prev, 1, bridge, 3)
        }
        rope.segments.push(bridge)
    }
    if(bodyA && anchorA !== null){
        createBridgeJoint(bodyA, anchorA, ropeBodies[0], 0)
    }
    if(bodyB && anchorB !== null){
        createBridgeJoint(bodyB, anchorB, ropeBodies[ropeBodies.length - 1], 2)
    }
    if(!bodyA && simState.staticDynamicMode == 'static') ropeBodies[0].isStatic = true
    if(!bodyB && simState.staticDynamicMode == 'static') ropeBodies[ropeBodies.length - 1].isStatic = true
    return ropeBodies.length > 0 ? ropeBodies[0] : null
}

function cleanupBridgeJoints(){
    bridgeJoints = bridgeJoints.filter((joint) => bodies.includes(joint.bodyA) && bodies.includes(joint.bodyB))
}

function findRopeIndexByBody(body){
    return ropes.findIndex((rope) => rope.segments.some((seg) => seg.id === body.id))
}

function addJoint(joint){
    bridgeJoints.push(joint)
    jointConnectionSet.add(`${joint.bodyA.id}-${joint.bodyB.id}`);
    jointConnectionSet.add(`${joint.bodyB.id}-${joint.bodyA.id}`);
}

function removeJoint(joint){
    let index = bridgeJoints.indexOf(joint)
    if(index !== -1) bridgeJoints.splice(index, 1)
    jointConnectionSet.delete(`${joint.bodyA.id}-${joint.bodyB.id}`);
    jointConnectionSet.delete(`${joint.bodyB.id}-${joint.bodyA.id}`);
}

function hasBridgeJoint(bodyA, anchorA, bodyB, anchorB){
    for(let joint of bridgeJoints){
        let sameOrder = joint.bodyA === bodyA
                     && joint.anchorA === anchorA
                     && joint.bodyB === bodyB
                     && joint.anchorB === anchorB
        let reverseOrder = joint.bodyA === bodyB
                        && joint.anchorA === anchorB
                        && joint.bodyB === bodyA
                        && joint.anchorB === anchorA
        if(sameOrder || reverseOrder) return true
    }
    return false
}

function createBridgeJoint(bodyA, anchorA, bodyB, anchorB){
    if(!bodyA || !bodyB || bodyA === bodyB) return null
    //if(!isBridge(bodyA) || !isBridge(bodyB)) return null
    if(hasBridgeJoint(bodyA, anchorA, bodyB, anchorB)) return null

    let worldA = getAnchorWorldPos(bodyA, anchorA)
    let worldB = getAnchorWorldPos(bodyB, anchorB)
    if(!worldA || !worldB) return null

    let joint = {
        bodyA,
        bodyB,
        anchorA,
        anchorB,
        localA: worldPointToLocal(bodyA, worldA),
        localB: worldPointToLocal(bodyB, worldB),
        id: simState.globalID++,
        stress: 0
    }
    addJoint(joint)
    return joint
}

function isItConnectedByJoint(bodyA, bodyB){
    return jointConnectionSet.has(`${bodyA.id}-${bodyB.id}`);
}

function isBridge(body){
    return body.shape === 'bridge'
}

function removeBody(index){
    let body = bodies[index]
    bodies.splice(index, 1)
    tree.remove(body)
    if(simState.portalA && simState.portalA.body === body) simState.portalA = null
    if(simState.portalB && simState.portalB.body === body) simState.portalB = null
}

function handleOutOfBounds(){
    let removedBody = false
    for(let i = bodies.length - 1; i >= 0; i--){
        let body = bodies[i]
        if(body.pos.y > HEIGHT + RANGE_OUT_OF_BOUNDS || body.pos.y < -RANGE_OUT_OF_BOUNDS){
            removeBody(i)
            removedBody = true
        }
        if(body.pos.x < -RANGE_OUT_OF_BOUNDS || body.pos.x > WIDTH + RANGE_OUT_OF_BOUNDS){
            removeBody(i)
            removedBody = true
        }
    }
    if(removedBody) cleanupBridgeJoints()
}

// Find the closest anchor point to the mouse within a threshold
function findNearestAnchor(mx, my, threshold, availableAnchors = null){
    let best = null
    let bestDist = threshold
    for(let b of bodies){
        for(let a = 0; a < 5; a++){
            let p = getAnchorWorldPos(b, a)
            let d = Math.hypot(mx - p.x, my - p.y)
            if(d < bestDist){
                if(availableAnchors && !availableAnchors.includes(a)) continue
                bestDist = d
                best = {body: b, anchor: a, pos: p}
            }
        }
    }
    return best
}

function findNearestAnchorGivenBody(mx, my, body, threshold, availableAnchors = null){
    if(!body) return null
    let best = null
    let bestDist = threshold
    for(let a = 0; a < 5; a++){
        let p = getAnchorWorldPos(body, a)
        let d = Math.hypot(mx - p.x, my - p.y)
        if(d < bestDist){
            if(availableAnchors && !availableAnchors.includes(a)) continue
            bestDist = d
            best = {body: body, anchor: a, pos: p}
        }
    }
    return best
}

function divideRope(bodyA, bodyB){
    if(!bodyA.isRope || !bodyB.isRope) return
    let ropeIndex = findRopeIndexByBody(bodyA)
    if(ropeIndex === -1) ropeIndex = findRopeIndexByBody(bodyB)
    if(ropeIndex === -1) return
    let rope = ropes[ropeIndex]
    let segments = rope.segments
    let indexBodyA = segments.findIndex((seg) => seg.id === bodyA.id)
    let indexBodyB = segments.findIndex((seg) => seg.id === bodyB.id)
    let segmentsA = segments.slice(0, indexBodyA + 1)
    let segmentsB = segments.slice(indexBodyB)
    rope.segments = segmentsA
    let newRope = {
        start: (segmentsB[0] && segmentsB[0].body) ? segmentsB[0].body : null,
        end: (segmentsB[segmentsB.length - 1] && segmentsB[segmentsB.length - 1].body) ? segmentsB[segmentsB.length - 1].body : null,
        segments: segmentsB,
        id: simState.globalID++
    }
    ropes.push(newRope)
}

function autoConnectBridgeJoints(newBridge){
    if(!newBridge || !isBridge(newBridge)) return

    let usedTargets = []

    for(let anchorA of ENDPOINT_ANCHORS){
        let posA = getAnchorWorldPos(newBridge, anchorA)
        if(!posA) continue

        let best = null
        let bestDist = JOINT_CONNECT_DIST

        for(let bodyB of bodies){
            if(bodyB === newBridge) continue

            for(let anchorB of ENDPOINT_ANCHORS){
                let targetAlreadyUsed = usedTargets.some((target) => target.body === bodyB && target.anchor === anchorB)
                if(targetAlreadyUsed) continue
                if(hasBridgeJoint(newBridge, anchorA, bodyB, anchorB)) continue

                let posB = getAnchorWorldPos(bodyB, anchorB)
                let d = Math.hypot(posB.x - posA.x, posB.y - posA.y)

                if(d <= bestDist){
                    bestDist = d
                    best = {bodyB, anchorB}
                }
            }
        }

        if(best){
            createBridgeJoint(newBridge, anchorA, best.bodyB, best.anchorB)
            usedTargets.push({body: best.bodyB, anchor: best.anchorB})
        }
    }
}

function startSettingPortals(){
    removePortals()
    simState.settingThruster = false
    simState.settingPortals = true
    simState.portalSettingStage = 'A'
    simState.portalA = null
    simState.portalB = null
}

function startSettingThruster(){
    simState.settingPortals = false
    simState.settingThruster = true
}

function removePortals(){
    let portalA = simState.portalA
    let portalB = simState.portalB
    if(portalA){
        if(portalA.body) portalA.body.edges.forEach(edge => edge.portal = undefined)
        simState.portalA = null
    }
    if(portalB){
        if(portalB.body) portalB.body.edges.forEach(edge => edge.portal = undefined)
        simState.portalB = null
    }
}

function isRectOrBridge(body){
    return body.shape === 'rect' || body.shape === 'bridge'
}