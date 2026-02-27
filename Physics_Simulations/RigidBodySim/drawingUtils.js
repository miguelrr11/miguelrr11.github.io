function drawBody(body){
    if(body.isRope && !simState.showDebug) return
    let inside = pointInRect({x: freeMouseX, y: freeMouseY}, body)
    push()
    noStroke()
    if(simState.selectedBody === body){
        strokeWeight(1.5)
        stroke(0, 255, 100)
    }
    translate(body.pos.x, body.pos.y)
    rotate(body.angle)
    rectMode(CENTER)
    if(simState.showDebug) fill(lerppColor(colBody, [255, 0, 0], body.stress))
    else fill(colBody)
    if(inside && simState.createMode === 'delete') fill(255, 0, 0)
    if(inside && !simState.createMode) fill(150)
    rect(0, 0, body.w, body.h)
    if(body.shape != 'bridge' && body.isStatic){
        push()
        rotate(-body.angle)
        translate(-body.pos.x, -body.pos.y)
        stroke(150)
        strokeWeight(1)
        for(let c of body.corners){
            line(c.x - 4, c.y - 4, c.x + 4, c.y + 4)
            line(c.x + 4, c.y - 4, c.x - 4, c.y + 4)
        }
        pop()
    }
    if(simState.selectedBody === body && body.isStatic){
        push()
        rotate(-body.angle)
        translate(-body.pos.x, -body.pos.y)
        noFill()
        strokeWeight(1)
        stroke(0, 255, 100)
        for(let c of body.corners){
            ellipse(c.x, c.y, 12, 12)
        }
        pop()
    }
    if(body.thrusters && body.thrusters.length > 0){
        push()
        rotate(-body.angle)
        translate(-body.pos.x, -body.pos.y)
        for(let i = 0; i < body.thrusters.length; i++){
            drawThruster(body, body.thrusters[i])
        }
        pop()
    }
    pop()
    if(simState.showDebug) drawDebugBody(body)


    //debug (draw body id)
    // push()
    // noStroke()
    // fill(255)
    // textSize(12)
    // textAlign(CENTER, CENTER)
    // text(body.id, body.pos.x, body.pos.y)
    // pop()
}

function drawBodyCircle(body){
    let inside = pointInCircle({x: freeMouseX, y: freeMouseY}, body)
    push()
    noStroke()
    if(simState.selectedBody === body){
        strokeWeight(1.5)
        stroke(0, 255, 100)
    }
    translate(body.pos.x, body.pos.y)
    if(simState.showDebug) fill(lerppColor(colBody, [255, 0, 0], body.stress))
    else fill(colBody)
    if(inside && simState.createMode === 'delete') fill(255, 0, 0)
    if(inside && !simState.createMode) fill(150)
    ellipse(0, 0, body.r * 2, body.r * 2)
    if(body.isStatic){
        translate(-body.pos.x, -body.pos.y)
        stroke(150)
        strokeWeight(1)
        let c = {x: body.pos.x, y: body.pos.y}
        line(c.x - 4, c.y - 4, c.x + 4, c.y + 4)
        line(c.x + 4, c.y - 4, c.x - 4, c.y + 4)
    }

    pop()
    if(simState.showDebug) drawDebugBodyCircle(body)
}

function drawDebugBodyCircle(body){
    let px = body.pos.x
    let py = body.pos.y


    // Center of mass
    push()
    noStroke()
    fill(255)
    ellipse(px, py, 4, 4)
    pop()

    // Velocity arrow
    let speed = Math.hypot(body.vel.x, body.vel.y)
    if(speed > 0.01){
        push()
        let scale = 10
        let ex = px + body.vel.x * scale
        let ey = py + body.vel.y * scale
        stroke(0, 120, 255)
        strokeWeight(2)
        line(px, py, ex, ey)
        pop()
    }

    if (Math.abs(body.angVel) > 0.005) {
        push();
        noFill();
        let arcR = 15;
        let arcSpan = constrainn(body.angVel * 20, -PI, PI);
        stroke(255, 0, 255);
        strokeWeight(1.5);

        let startAngle = body.angle;
        let endAngle = body.angle + arcSpan;

        if(body.angVel < 0){
            startAngle = body.angle + arcSpan;
            endAngle = body.angle;
        }

        arc(px, py, arcR * 2, arcR * 2, startAngle, endAngle);
        pop();
    }

    if(simState.selectedBody === body){
        push()
        fill(255)
        stroke(0)
        strokeWeight(1)
        textAlign(CENTER, CENTER)
        textSize(9)
        text('id ' + body.id + '\n' +
            'v: ' + body.vel.x.toFixed(1) + ', ' + body.vel.y.toFixed(1) + '\n' +
            'w: ' + body.angVel.toFixed(2) + '\n' + 
            'm: ' + body.mass.toFixed(1), px, py)
        pop()
    }

}

function drawDebugBody(body){
    if(body.isRope) return
    
    let px = body.pos.x
    let py = body.pos.y


    // Edges
    push()
    stroke(0, 255, 0, 120)
    strokeWeight(1)
    for(let e of body.edges){
        line(e.start.x, e.start.y, e.end.x, e.end.y)
    }
    pop()

    // Corner dots
    push()
    noStroke()
    fill(255, 0, 0)
    for(let i = 0; i < body.corners.length; i++){
        let c = body.corners[i]
        ellipse(c.x, c.y, 5, 5)
        //text(i, c.x + 6, c.y - 6)
    }
    pop()

    // Edge normals (outward-facing)
    push()
    stroke(255, 255, 0, 100)
    strokeWeight(1)
    for(let e of body.edges){
        let mx = (e.start.x + e.end.x) / 2
        let my = (e.start.y + e.end.y) / 2
        let dx = e.end.x - e.start.x
        let dy = e.end.y - e.start.y
        let len = Math.hypot(dx, dy)
        // Outward normal: perpendicular pointing away from center
        let nx = -dy / len
        let ny = dx / len
        let toCenter = (px - mx) * nx + (py - my) * ny
        if(toCenter > 0){ nx *= -1; ny *= -1 }
        let nLen = 12
        line(mx, my, mx + nx * nLen, my + ny * nLen)
    }
    pop()

    // Center of mass
    push()
    noStroke()
    fill(255)
    ellipse(px, py, 4, 4)
    pop()

    // Velocity arrow
    let speed = Math.hypot(body.vel.x, body.vel.y)
    if(speed > 0.01){
        push()
        let scale = 10
        let ex = px + body.vel.x * scale
        let ey = py + body.vel.y * scale
        stroke(0, 120, 255)
        strokeWeight(2)
        line(px, py, ex, ey)
        // Arrowhead
        // let ang = atan2(body.vel.y, body.vel.x)
        // let aSize = 5
        // line(ex, ey, ex - aSize * Math.cos(ang - 0.4), ey - aSize * Math.sin(ang - 0.4))
        // line(ex, ey, ex - aSize * Math.cos(ang + 0.4), ey - aSize * Math.sin(ang + 0.4))
        pop()
    }

    // Angular velocity arc
    if (Math.abs(body.angVel) > 0.005) {
        push();
        noFill();
        let arcR = 15;
        let arcSpan = constrainn(body.angVel * 20, -PI, PI);
        stroke(255, 0, 255);
        strokeWeight(1.5);

        let startAngle = body.angle;
        let endAngle = body.angle + arcSpan;

        if(body.angVel < 0){
            startAngle = body.angle + arcSpan;
            endAngle = body.angle;
        }

        arc(px, py, arcR * 2, arcR * 2, startAngle, endAngle);

        // let tipAng = body.angleVel > 0 ? body.angle + arcSpan : body.angle + arcSpan;
        // let tipX = px + arcR * Math.cos(tipAng);
        // let tipY = py + arcR * Math.sin(tipAng);

        // let tangentAng = tipAng + (body.angVel > 0 ? -HALF_PI : HALF_PI);
        // let aSize = 5;

        // line(tipX, tipY, tipX + aSize * Math.cos(tangentAng - 0.6), tipY + aSize * Math.sin(tangentAng - 0.6));
        // line(tipX, tipY, tipX + aSize * Math.cos(tangentAng + 0.6), tipY + aSize * Math.sin(tangentAng + 0.6));

        pop();
    }


}

function drawSpring(sp){
    let posA = getSpringEndPos(sp, 'A')
    let posB = getSpringEndPos(sp, 'B')
    let currentLength = Math.hypot(posB.x - posA.x, posB.y - posA.y)

    // Stress: negative = compressed, positive = stretched
    let stress = (currentLength - sp.restLength) / sp.restLength

    // Color: blue (compressed) → green (rest) → red (stretched)
    let r, g, b
    if(stress < 0){
        let t = constrainn(-stress * 3, 0, 1)
        r = lerp(0, 50, t)
        g = lerp(200, 100, t)
        b = lerp(50, 255, t)
    } else {
        let t = constrainn(stress * 3, 0, 1)
        r = lerp(0, 255, t)
        g = lerp(200, 50, t)
        b = lerp(50, 50, t)
    }

    push()
    stroke(r, g, b)
    strokeWeight(2)
    noFill()

    // Draw zigzag coil
    let dx = posB.x - posA.x
    let dy = posB.y - posA.y
    let len = Math.hypot(dx, dy)
    if(len < 0.01){ pop(); return }

    let midX = (posA.x + posB.x) / 2
    let midY = (posA.y + posB.y) / 2
    let angle = atan2(dy, dx)
    let localMouseX = Math.cos(-angle) * (mouseX - midX) - Math.sin(-angle) * (mouseY - midY)
    let localMouseY = Math.sin(-angle) * (mouseX - midX) + Math.cos(-angle) * (mouseY - midY)
    let inside = false
    if(localMouseX > -len/2 - 5 && localMouseX < len/2 + 5 && localMouseY > -10 && localMouseY < 10) inside = true
    if(inside && simState.createMode == 'delete'){ 
        strokeWeight(4)
        stroke(255, 0, 0)
    }

    let dirX = dx / len
    let dirY = dy / len
    let perpX = -dirY
    let perpY = dirX

    let coils = 10
    let amplitude = 6
    let endCap = 0.1 // fraction of length for straight end segments

    let startX = posA.x + dirX * len * endCap
    let startY = posA.y + dirY * len * endCap
    let endX = posA.x + dirX * len * (1 - endCap)
    let endY = posA.y + dirY * len * (1 - endCap)

    // Straight segment from anchor A to coil start
    line(posA.x, posA.y, startX, startY)

    // Zigzag coil
    let coilLen = len * (1 - 2 * endCap)
    let prevX = startX
    let prevY = startY
    for(let i = 1; i <= coils * 2; i++){
        let t = i / (coils * 2)
        let cx = startX + dirX * coilLen * t
        let cy = startY + dirY * coilLen * t
        let side = (i % 2 === 1) ? 1 : -1
        cx += perpX * amplitude * side
        cy += perpY * amplitude * side
        line(prevX, prevY, cx, cy)
        prevX = cx
        prevY = cy
    }
    line(prevX, prevY, endX, endY)

    // Straight segment from coil end to anchor B
    line(endX, endY, posB.x, posB.y)
    pop()

    // Anchor dots
    push()
    noStroke()
    fill(r, g, b)
    ellipse(posA.x, posA.y, 8, 8)
    ellipse(posB.x, posB.y, 8, 8)
    // Fixed anchor gets a cross
    if(sp.bodyA === null){
        stroke(255)
        strokeWeight(1)
        line(posA.x - 4, posA.y - 4, posA.x + 4, posA.y + 4)
        line(posA.x + 4, posA.y - 4, posA.x - 4, posA.y + 4)
    }
    if(sp.bodyB === null){
        stroke(255)
        strokeWeight(1)
        line(posB.x - 4, posB.y - 4, posB.x + 4, posB.y + 4)
        line(posB.x + 4, posB.y - 4, posB.x - 4, posB.y + 4)
    }
    pop()
}

function drawBridgeJoint(joint){
    if(joint.bodyA && joint.bodyA.isRope) return
    if(joint.bodyB && joint.bodyB.isRope) return
    let posA = localPointToWorld(joint.bodyA, joint.localA)
    let posB = localPointToWorld(joint.bodyB, joint.localB)
    

    //debug: draw stress value
    // push()
    //let midPos = {x: (posA.x + posB.x) / 2, y: (posA.y + posB.y) / 2}
    // noStroke()
    // fill(joint.stress > MAX_STRESS_JOINT ? [255, 0, 0] : [255, 255, 255])
    // textSize(12)
    // textAlign(CENTER, CENTER)
    // text(joint.stress.toFixed(1), midPos.x, midPos.y - 10)
    // pop()

    push()
    stroke(255, 220, 120, 180)
    strokeWeight(2)
    line(posA.x, posA.y, posB.x, posB.y)
    if(joint.bodyA && joint.bodyA.isRope) {pop(); return}
    if(joint.bodyB && joint.bodyB.isRope) {pop(); return}
    noStroke()
    fill(255, 220, 120, 180)
    ellipse(posA.x, posA.y, 10, 10)
    ellipse(posB.x, posB.y, 10, 10)
    pop()
}

function drawRope(rope){
    if(simState.showDebug) return
    if(rope.segments.length == 0) return
    push()
    noFill()
    noStroke()
    stroke(colBody)
    strokeWeight(5)
    if(rope.segments.length == 1){
        let p = rope.segments[0]
        let c0 = p.corners[0]
        let c1 = p.corners[1]
        let c2 = p.corners[2]
        let c3 = p.corners[3]
        let mid1 = {x: (c0.x + c3.x) / 2, y: (c0.y + c3.y) / 2}
        let mid2 = {x: (c2.x + c1.x) / 2, y: (c2.y + c1.y) / 2}
        line(mid1.x, mid1.y, mid2.x, mid2.y)
    }

    beginShape()
    // let startPos = rope.start ? getAnchorWorldPos(rope.start.body, rope.start.anchor) : null
    // let endPos = rope.end ? getAnchorWorldPos(rope.end.body, rope.end.anchor) : null
    //if(startPos) vertex(startPos.x, startPos.y)
    for(let p of rope.segments){
        // let c0 = p.corners[0]
        // let c1 = p.corners[1]
        // let c2 = p.corners[2]
        // let c3 = p.corners[3]
        // let mid1 = {x: (c0.x + c3.x) / 2, y: (c0.y + c3.y) / 2}
        // let mid2 = {x: (c2.x + c1.x) / 2, y: (c2.y + c1.y) / 2}
        // vertex(mid1.x, mid1.y)
        // vertex(p.pos.x, p.pos.y)
        // vertex(mid2.x, mid2.y)

        vertex(p.pos.x, p.pos.y)
    }
    //if(endPos) vertex(endPos.x, endPos.y)
    endShape()
    pop()

    //debug
    // push()
    // noStroke()
    // for(let bj of bridgeJoints){
    //     let posA = localPointToWorld(bj.bodyA, bj.localA)
    //     let posB = localPointToWorld(bj.bodyB, bj.localB)
    //     let midX = (posA.x + posB.x) / 2
    //     let midY = (posA.y + posB.y) / 2
    //     textSize(map(bj.stress, 0, 2, 8, 16))
    //     fill(bj.stress > MAX_STRESS_JOINT ? [255, 0, 0] : [255, 255, 255])
    //     text(bj.stress.toFixed(1), midX, midY)
    // }
    // pop()
}

function drawEditor(){
    // Body creation preview
    if(dragStart && mouseIsPressed && simState.createMode === 'rect'){
        push()
        noFill()
        stroke(simState.staticDynamicMode === 'static' ? '#f80' : '#0af')
        strokeWeight(1)
        drawingContext.setLineDash([5, 5])
        let x1 = Math.min(dragStart.x, gridMouseX)
        let y1 = Math.min(dragStart.y, gridMouseY)
        let w = Math.abs(gridMouseX - dragStart.x)
        let h = Math.abs(gridMouseY - dragStart.y)
        rect(x1, y1, w, h)
        pop()
    }

    if(dragStart && mouseIsPressed && simState.createMode === 'circle'){
        push()
        noFill()
        stroke(simState.staticDynamicMode === 'static' ? '#f80' : '#0af')
        strokeWeight(1)
        drawingContext.setLineDash([5, 5])
        let r = Math.hypot(gridMouseX - dragStart.x, gridMouseY - dragStart.y)
        ellipse(dragStart.x, dragStart.y, r * 2, r * 2)
        pop()
    }

    if(dragStart && mouseIsPressed && simState.createMode === 'bridge'){
        push()
        noFill()
        stroke('#0ff')
        strokeWeight(3)
        drawingContext.setLineDash([7, 7])
        line(dragStart.x, dragStart.y, gridMouseX, gridMouseY)
        pop()
    }

    // Anchor points (always visible, highlighted in spring mode)
    let inSpringMode = simState.createMode === 'spring' || simState.createMode === 'rope' || simState.createMode === 'bridge'
    let hovered = inSpringMode ? findNearestAnchorGivenBody(gridMouseX, gridMouseY, simState.hoveredBody, 20) : null

    if(inSpringMode){
        push()
        noStroke()
        fill(colAnchor)
        for(let b of bodies){
            if(b.isRope) continue
            for(let a = 0; a < 5; a++){
                let p = getAnchorWorldPos(b, a)
                ellipse(p.x, p.y, 6, 6)
            }
        }
        if(hovered){
            let isHovered = hovered
            let isSelected = springRopeStart
            let p = getAnchorWorldPos(hovered.body, hovered.anchor)
            if(isSelected){
                fill(0, 255, 100)
                ellipse(p.x, p.y, 12, 12)
            } 
            else if(isHovered){
                fill(255, 255, 0)
                ellipse(p.x, p.y, 10, 10)
            } 
        }
        pop()
    }

    // Spring creation preview line
    if(springRopeStart && inSpringMode){
        let startPos = springRopeStart.body ? getAnchorWorldPos(springRopeStart.body, springRopeStart.anchor) : {x: springRopeStart.x, y: springRopeStart.y}
        push()
        stroke(0, 255, 100, 150)
        strokeWeight(1)
        drawingContext.setLineDash([4, 4])
        line(startPos.x, startPos.y, gridMouseX, gridMouseY)
        pop()
    }

    if(simState.showDebug){
        push()
        noFill()
        strokeWeight(1.5)
        stroke(255, 255, 0)
        let collArr = Array.from(collisionPoints).map(str => {
            let [x, y] = str.split(',').map(Number)
            return {x, y}
        })
        for(let colPoint of collArr){
            ellipse(colPoint.x, colPoint.y, 8, 8)
        }
        pop()
    }

    push()
    if(simState.settingPortals){
        setHoveredBody()
        let HB = simState.hoveredBody

        if(!HB || isRectOrBridge(HB) === false) {pop(); return}
        let [edge, index] = getClosestEdgeOfBodyToPoint(freeMouseX, freeMouseY, HB)
        if(!edge) return
        if(simState.portalSettingStage === 'A'){
            stroke(0, 255, 255)
            strokeWeight(7)
            line(edge.start.x, edge.start.y, edge.end.x, edge.end.y)
        }
        else if(simState.portalSettingStage === 'B'){
            stroke(255, 100, 0)
            strokeWeight(7)
            line(edge.start.x, edge.start.y, edge.end.x, edge.end.y)
        }
        
    }

    if(simState.portalA){
        let p = simState.portalA
        if(!p.body.edges) return
        if(p.edgeIndex === undefined) {pop(); return}
        let edge = p.body.edges[p.edgeIndex]
        stroke(0, 255, 255)
        strokeWeight(7)
        line(edge.start.x, edge.start.y, edge.end.x, edge.end.y)
    }
    
    if(simState.portalB){
        let p = simState.portalB
        if(!p.body.edges) return
        if(p.edgeIndex === undefined) {pop(); return}
        let edge = p.body.edges[p.edgeIndex]
        stroke(255, 100, 0)
        strokeWeight(7)
        line(edge.start.x, edge.start.y, edge.end.x, edge.end.y)
    }

    if(simState.settingThruster){
        setHoveredBody()
        let HB = simState.hoveredBody

        if(!HB || isRectOrBridge(HB) === false) {pop(); return}
        let [edge, index] = getClosestEdgeOfBodyToPoint(freeMouseX, freeMouseY, HB)
        drawThruster(HB, index)
    }

    pop()
    
}

function drawThruster(body, edgeIndex){
    if(edgeIndex === undefined) return
    let edge = body.edges[edgeIndex]
    if(!edge) return
    push()
    stroke(255, 0, 0)
    strokeWeight(5)
    line(edge.start.x, edge.start.y, edge.end.x, edge.end.y)
    let midX = (edge.start.x + edge.end.x) / 2
    let midY = (edge.start.y + edge.end.y) / 2
    let dx = edge.end.x - edge.start.x
    let dy = edge.end.y - edge.start.y
    let len = Math.hypot(dx, dy)
    let nx = -dy / len
    let ny = dx / len
    let normalLen = -20
    line(midX, midY, midX + nx * normalLen, midY + ny * normalLen)
    pop()
}

function drawFPSandINFO(){
    push()
    fpsArr.shift()
    fpsArr.push(frameRate())
    let fpsMean = round(fpsArr.reduce((a, b) => a + b, 0) / fpsArr.length)
    fill(255)
    noStroke()
    textSize(14)
    textAlign(RIGHT, TOP)
    textLeading(8)
    text(`FPS: ${fpsMean}\n
        N Bodies: ${bodies.length}\n
        N Springs: ${springs.length}\n
        N Ropes: ${ropes.length}\n
        N Collisions: ${nCollisionsFrame}\n
        N Leafs: ${tree.nLeafs}\n
        Dragging Body: ${simState.draggingBody ? simState.draggingBody.id : 'None'}\n
        Dragging Corner: ${simState.draggingCornerIndex !== null ? simState.draggingCornerIndex : 'None'}\n
        Zoom: ${zoom.toFixed(2)}\n
        Physics Time: ${simState.physicsTime.toFixed(1)} ms\n
        Render Time: ${simState.renderTime.toFixed(1)} ms
          `, width - 10, 10)
    pop()
}

//not used
function drawGrid(){
    push()
    stroke(40)
    strokeWeight(1)
    for(let i = 0; i <= nCells; i++){
        line(i * cellSize, 0, i * cellSize, HEIGHT)
        line(0, i * cellSize, WIDTH, i * cellSize)
    }
    pop()
}

function showGridPoints(){
    push()
    let edges = getEdges()
    let minX = edges[0]
    let maxX = edges[1]
    let minY = edges[2]
    let maxY = edges[3]
    let startX = Math.floor(minX / cellSize) * cellSize
    let startY = Math.floor(minY / cellSize) * cellSize

    strokeWeight((1 / zoom) * 2)
    
    let fadeDistance = (maxX - minX) * 0.1  //10% of the screen dims

    let baseAlpha = map(zoom, 0.8, 0.95, 0, 180, true)
    
    for(let x = startX; x <= maxX; x += cellSize){
        for(let y = startY; y <= maxY; y += cellSize){
            let distFromLeft = x - minX
            let distFromRight = maxX - x
            let distFromTop = y - minY
            let distFromBottom = maxY - y
            let minDistToEdge = Math.min(distFromLeft, distFromRight, distFromTop, distFromBottom)
            let fadeFactor = Math.min(minDistToEdge / fadeDistance, 1)
            let alpha = baseAlpha * fadeFactor
            stroke(255, alpha)
            point(x, y)
        }
    }
    pop()
}

function drawDebugAux(){
    return
    push()
    let body = simState.hoveredBody
    if(!body) return
    let edge = getClosestEdgeOfBodyToPoint(freeMouseX, freeMouseY, body)
    if(edge){
        stroke(255, 0, 0)
        strokeWeight(2)
        line(edge.start.x, edge.start.y, edge.end.x, edge.end.y)
    }
    pop()
}
