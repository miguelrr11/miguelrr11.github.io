function drawBody(body){
    push()
    translate(body.pos.x, body.pos.y)
    rotate(body.angle)
    rectMode(CENTER)
    fill(lerppColor([75, 75, 57], [255, 0, 0], body.stress))
    rect(0, 0, body.w, body.h)
    pop()
    drawDebugBody(body)
}

function drawDebugBody(body){
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
    for(let c of body.corners){
        ellipse(c.x, c.y, 5, 5)
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
        let ang = atan2(body.vel.y, body.vel.x)
        let aSize = 5
        line(ex, ey, ex - aSize * cos(ang - 0.4), ey - aSize * sin(ang - 0.4))
        line(ex, ey, ex - aSize * cos(ang + 0.4), ey - aSize * sin(ang + 0.4))
        pop()
    }

    // Angular velocity arc
    if(Math.abs(body.angVel) > 0.001){
        push()
        noFill()
        let arcR = 15
        let arcSpan = constrain(body.angVel * 20, -PI, PI)
        stroke(255, 0, 255)
        strokeWeight(1.5)
        arc(px, py, arcR * 2, arcR * 2, body.angle, body.angle + arcSpan)
        // Arc arrowhead
        let tipAng = body.angle + arcSpan
        let tipX = px + arcR * cos(tipAng)
        let tipY = py + arcR * sin(tipAng)
        let perpAng = tipAng + (arcSpan > 0 ? HALF_PI : -HALF_PI)
        let aSize = 4
        line(tipX, tipY, tipX - aSize * cos(perpAng - 0.4), tipY - aSize * sin(perpAng - 0.4))
        line(tipX, tipY, tipX - aSize * cos(perpAng + 0.4), tipY - aSize * sin(perpAng + 0.4))
        pop()
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
        let t = constrain(-stress * 3, 0, 1)
        r = lerp(0, 50, t)
        g = lerp(200, 100, t)
        b = lerp(50, 255, t)
    } else {
        let t = constrain(stress * 3, 0, 1)
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

function drawEditor(){
    // Body creation preview
    if(dragStart && mouseIsPressed && (editorMode === 'static' || editorMode === 'dynamic')){
        push()
        noFill()
        stroke(editorMode === 'static' ? '#f80' : '#0af')
        strokeWeight(1)
        drawingContext.setLineDash([5, 5])
        let x1 = Math.min(dragStart.x, gridMouseX)
        let y1 = Math.min(dragStart.y, gridMouseY)
        let w = Math.abs(gridMouseX - dragStart.x)
        let h = Math.abs(gridMouseY - dragStart.y)
        rect(x1, y1, w, h)
        pop()
    }

    if(dragStart && mouseIsPressed && editorMode === 'bridge'){
        push()
        noFill()
        stroke('#0ff')
        strokeWeight(3)
        drawingContext.setLineDash([7, 7])
        line(dragStart.x, dragStart.y, gridMouseX, gridMouseY)
        pop()
    }

    // Anchor points (always visible, highlighted in spring mode)
    let inSpringMode = editorMode === 'spring'
    let hovered = inSpringMode ? findNearestAnchor(gridMouseX, gridMouseY, 20) : null

    for(let b of bodies){
        for(let a = 0; a < 4; a++){
            let p = getAnchorWorldPos(b, a)
            let isHovered = hovered && hovered.body === b && hovered.anchor === a
            let isSelected = springStart && springStart.body === b && springStart.anchor === a
            push()
            noStroke()
            if(isSelected){
                fill(0, 255, 100)
                ellipse(p.x, p.y, 12, 12)
            } else if(isHovered){
                fill(255, 255, 0)
                ellipse(p.x, p.y, 10, 10)
            } else {
                fill(255, 255, 255, inSpringMode ? 180 : 60)
                ellipse(p.x, p.y, 6, 6)
            }
            pop()
        }
    }

    // Spring creation preview line
    if(springStart && inSpringMode){
        let startPos = getAnchorWorldPos(springStart.body, springStart.anchor)
        push()
        stroke(0, 255, 100, 150)
        strokeWeight(1)
        drawingContext.setLineDash([4, 4])
        line(startPos.x, startPos.y, gridMouseX, gridMouseY)
        pop()
    }
}
