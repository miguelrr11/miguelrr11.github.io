function mousePressed(){
    if(panel.isMouseInside()) return

    setHoveredBody()
    let HB = simState.hoveredBody || simState.hoveredSpring

    if(simState.settingPortals){
        if(!HB || isRectOrBridge(HB) === false) return
        let [edge, index] = getClosestEdgeOfBodyToPoint(freeMouseX, freeMouseY, HB)
        if(!edge) return
        if(simState.portalSettingStage === 'A'){
            simState.portalA = {body: HB, edgeIndex: index}
            simState.portalSettingStage = 'B'
        }
        else if(simState.portalSettingStage === 'B'){
            simState.portalB = {body: HB, edgeIndex: index}
            simState.settingPortals = false
        }
        return
    }

    if(simState.createMode === 'rect' || simState.createMode === 'bridge' || simState.createMode === 'circle'){
        dragStart = {x: gridMouseX, y: gridMouseY}
    } 
    else if(simState.createMode === 'spring'){
        let hit = findNearestAnchorGivenBody(gridMouseX, gridMouseY, simState.hoveredBody, 20)
        if(hit){
            if(!springRopeStart){
                springRopeStart = hit
            } 
            else {
                if((hit.body !== springRopeStart.body || hit.anchor !== springRopeStart.anchor) && springRopeStart.body){
                    createSpring(springRopeStart.body, springRopeStart.anchor, hit.body, hit.anchor)
                }
                else if(hit.body !== springRopeStart.body || hit.anchor !== springRopeStart.anchor){
                    createSpring(null, null, hit.body, hit.anchor, null, springRopeStart, null)
                }
                springRopeStart = null
            }
        }
        else{
            if(springRopeStart && springRopeStart.body){
                createSpring(springRopeStart.body, springRopeStart.anchor, null, null)
                springRopeStart = null
            }
            else if(!springRopeStart){
                springRopeStart = {x: gridMouseX, y: gridMouseY}
            }
            else springRopeStart = null
        }
        return
    }
    else if(simState.createMode === 'rope'){
        let hit = findNearestAnchor(gridMouseX, gridMouseY, 20)
        if(hit){
            if(!springRopeStart){
                springRopeStart = hit
            } 
            else {
                if((hit.body !== springRopeStart.body || hit.anchor !== springRopeStart.anchor) && springRopeStart.body){
                    createRope(springRopeStart.body, springRopeStart.anchor, hit.body, hit.anchor)
                }
                else if(hit.body !== springRopeStart.body || hit.anchor !== springRopeStart.anchor){
                    createRope(null, null, hit.body, hit.anchor, springRopeStart, null)
                }
                springRopeStart = null
            }
        }
        else{
            if(springRopeStart && springRopeStart.body){
                createRope(springRopeStart.body, springRopeStart.anchor, null, null)
                springRopeStart = null
            }
            else if(springRopeStart){
                createRope(null, null, null, null, springRopeStart.start ? springRopeStart.start.pos : springRopeStart, {x: gridMouseX, y: gridMouseY})
                springRopeStart = null
            }
            else if(!springRopeStart){
                springRopeStart = {x: gridMouseX, y: gridMouseY}
            }
            else springRopeStart = null
        }
        return
    }
    
    if(!HB){
        simState.hoveredSpring = null
        simState.draggingBody = null
        simState.hoveredBody = null
        return
    }
    let HBindex = HB.shape == 'spring' ? springs.indexOf(HB) : bodies.indexOf(HB)

    if(simState.createMode === 'delete'){
        // Check springs
        if(HB.shape === 'spring'){
            springs.splice(HBindex, 1)
            cleanupBridgeJoints()
            return
        }
        // Check bodies
        let segsToRemove = []
        let ropeIndexToRemove = null
        
        if((HB.shape === 'rect' || HB.shape === 'bridge')){
            removeBody(HBindex)
            if(HB.isRope){
                for(let j = ropes.length - 1; j >= 0; j--){
                    if(ropeIndexToRemove !== null){
                        break
                    }
                    let rope = ropes[j]
                    rope.segments.forEach((seg, index) => {
                        if(seg === HB) {
                            console.log("Found rope segment to remove at index", index)
                            segsToRemove.push(seg)
                            ropeIndexToRemove = j
                        }
                    })
                }
            }
        }
        else if(HB.shape === 'circle'){
            removeBody(HBindex)
        }

        //removes the rope associated with the segment if we removed a rope segment, and all its segments and joints
        if(segsToRemove.length > 0 && ropeIndexToRemove !== null){
            let rope = ropes[ropeIndexToRemove]
            for(let seg of rope.segments){
                segsToRemove.push(seg)
            }
            
            for(let seg of segsToRemove){
                for(let j of bridgeJoints){
                    if(j.bodyA === seg || j.bodyB === seg){
                        removeJoint(j)
                    }
                }
            }
            //and also remove the bodies
            bodies = bodies.filter(b => !segsToRemove.includes(b))
        }
        if(ropeIndexToRemove !== null) ropes.splice(ropeIndexToRemove, 1)
        cleanupBridgeJoints()
        return
    } 
    else if(simState.createMode === 'drag'){
        let dragBody = simState.draggingBody
        if(!dragBody) dragBody = HB
        // No mode: drag bodies
        if((HB.shape === 'rect' || HB.shape === 'bridge')){
            HB.dragging = true
            HB.offsetDrag = {x: gridMouseX - HB.pos.x, y: gridMouseY - HB.pos.y}
            setSelectedBody(HB)
            return
        }
        if(HB.shape === 'circle'){
            HB.dragging = true
            HB.offsetDrag = {x: gridMouseX - HB.pos.x, y: gridMouseY - HB.pos.y}
            setSelectedBody(HB)
            return
        }
        
        setSelectedBody(null)

        return
    }

}

function mouseReleased(){
    prevMouseX = undefined
    prevMouseY = undefined

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

function mouseWheel(event) {
    let worldX = (mouseX - xOff) / zoom;
    let worldY = (mouseY - yOff) / zoom;
    zoom += event.delta / 1000;
    zoom = Math.max(0.1, Math.min(zoom, 3));
    xOff = mouseX - worldX * zoom;
    yOff = mouseY - worldY * zoom;
    return false;
}

function mouseDragged() {
    //drag only if were in drag or delete mode AND if we are not hovering a body
    if(simState.hoveredBody || (simState.createMode !== 'drag' && simState.createMode !== 'delete') || simState.draggingBody || panel.isMouseInside()) return
    if(!prevMouseX) prevMouseX = mouseX
    if(!prevMouseY) prevMouseY = mouseY
    let dx = mouseX - prevMouseX;
    let dy = mouseY - prevMouseY; 
    xOff += dx;
    yOff += dy;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

function getRelativePos(x, y){
    let worldX = (x - xOff) / zoom;
    let worldY = (y - yOff) / zoom;
    return {x: worldX, y: worldY}
}

function setGridMousePos(){
    let world = getRelativePos(mouseX, mouseY)
    let gridMouseXFloor = Math.floor(world.x / cellSize) * cellSize
    let gridMouseYFloor = Math.floor(world.y / cellSize) * cellSize
    gridMouseX = simState.snapGrid ? gridMouseXFloor : world.x
    gridMouseY = simState.snapGrid ? gridMouseYFloor : world.y
    freeMouseX = world.x
    freeMouseY = world.y
}

function doubleClicked(){
    if(panel.isMouseInside()) return
    if(simState.createMode === 'delete') return
    if(simState.createMode === 'rect') createBodyFromRect(gridMouseX - 15, gridMouseY - 15, gridMouseX + 15, gridMouseY + 15, simState.staticDynamicMode === 'static')
    if(simState.createMode === 'circle') createBodyFromCircle(gridMouseX, gridMouseY, 15, simState.staticDynamicMode === 'static')
    if(simState.createMode === 'bridge') createBridgeElement(gridMouseX - 30, gridMouseY - 5, gridMouseX + 30, gridMouseY + 5, simState.staticDynamicMode === 'static')
}

function windowResized(){
    WIDTH = windowWidth
    HEIGHT = windowHeight
    nCells = Math.floor(Math.max(WIDTH, HEIGHT) / cellSize)
    resizeCanvas(WIDTH, HEIGHT)
}

function getEdges() {
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

function localPointToWorld(body, localPoint){
    let c = Math.cos(body.angle)
    let s = Math.sin(body.angle)
    return {
        x: body.pos.x + localPoint.x * c - localPoint.y * s,
        y: body.pos.y + localPoint.x * s + localPoint.y * c
    }
}

function worldPointToLocal(body, worldPoint){
    let dx = worldPoint.x - body.pos.x
    let dy = worldPoint.y - body.pos.y
    let c = Math.cos(body.angle)
    let s = Math.sin(body.angle)
    return {
        x: dx * c + dy * s,
        y: -dx * s + dy * c
    }
}

function logStateAndEverything(){
    console.log('Bodies:', JSON.parse(JSON.stringify(bodies)))
    console.log('Springs:', JSON.parse(JSON.stringify(springs)))
    console.log('Ropes:', JSON.parse(JSON.stringify(ropes)))
    console.log('Bridge Joints:', JSON.parse(JSON.stringify(bridgeJoints)))
}

function setHoveredBody(){
    //iterate through all bodies and springs and find if mouse is hovering over any of them, and set simState.hoveredBody
    simState.hoveredBody = null
    simState.hoveredSpring = null
    for(let b of bodies){
        if((b.shape == 'rect' || b.shape == 'bridge') && pointInRect({x: freeMouseX, y: freeMouseY}, b, true)){
            simState.hoveredBody = b
            return
        }
        if(b.shape === 'circle' && pointInCircle({x: freeMouseX, y: freeMouseY}, b, true)){
            simState.hoveredBody = b
            return
        }
    }
    let hoveredSpring = findHoveredSpring()
    if(hoveredSpring){
        simState.hoveredSpring = hoveredSpring
        return
    }
}

function findHoveredSpring(){
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
        let localMouseX = Math.cos(-angle) * (gridMouseX - midX) - Math.sin(-angle) * (gridMouseY - midY)
        let localMouseY = Math.sin(-angle) * (gridMouseX - midX) + Math.cos(-angle) * (gridMouseY - midY)
        if(localMouseX > -len/2 - 5 && localMouseX < len/2 + 5 && localMouseY > -10 && localMouseY < 10){
            return sp
        }
    }
}

function setSelectedBody(body){
    simState.selectedBody = body
    simState.draggingBody = body
    cteAngVelSlider.setValue(body ? body.angVel : 0)
    cteAngVelCB.setValue(body ? body.cteAngVelToggle : false)
}

function handleDragBody(){
    for(let b of bodies){
        b.oldPos = {x: b.pos.x, y: b.pos.y}
        b.posFree = b.posFree ? {x: b.posFree.x, y: b.posFree.y} : {x: b.pos.x, y: b.pos.y}
        b.oldPosFree = b.posFree ? {x: b.posFree.x, y: b.posFree.y} : {x: b.pos.x, y: b.pos.y}
        if(simState.createMode === 'drag' && b.dragging && mouseIsPressed){
            b.pos = {x: gridMouseX - b.offsetDrag.x, y: gridMouseY - b.offsetDrag.y}
            b.posFree = {x: freeMouseX, y: freeMouseY}
            b.vel = {x: 0, y: 0}
        }
    }
}

function getClosestEdgeOfBodyToPoint(x, y, body){
    if(body.shape === 'circle') return null
    let closestEdge = null
    let minDist = Infinity
    let index = -1
    for(let e of body.edges){
        let dist = pointToLineDistance(x, y, e.start.x, e.start.y, e.end.x, e.end.y)
        if(dist < minDist){
            minDist = dist
            closestEdge = e
            index = body.edges.indexOf(e)
        }
    }
    return [closestEdge, index]
}

function pointToLineDistance(px, py, x1, y1, x2, y2){
    let A = px - x1
    let B = py - y1
    let C = x2 - x1
    let D = y2 - y1

    let dot = A * C + B * D
    let len_sq = C * C + D * D
    let param = -1
    if (len_sq != 0) param = dot / len_sq

    let xx, yy

    if (param < 0) {
        xx = x1
        yy = y1
    }
    else if (param > 1) {
        xx = x2
        yy = y2
    }
    else {
        xx = x1 + param * C
        yy = y1 + param * D
    }

    let dx = px - xx
    let dy = py - yy
    return Math.sqrt(dx * dx + dy * dy)
}