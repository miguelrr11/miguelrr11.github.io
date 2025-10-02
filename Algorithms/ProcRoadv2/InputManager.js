let state = {
    mode: 'creatingLane',
    prevNodeID: -1,

    draggingNodeID: -1,
    offsetDraggingNode: {x: 0, y: 0}
}

function mouseClicked(){
    if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return

    const mousePosGridX = Math.floor(mouseX / GRID_CELL_SIZE) * GRID_CELL_SIZE
    const mousePosGridY = Math.floor(mouseY / GRID_CELL_SIZE) * GRID_CELL_SIZE

    //not following a previous node
    if(state.mode == 'creatingLane' && state.prevNodeID == -1){
        //resumes creating a segment from the clicked node
        let hoverNode = road.findHoverNode()
        if(hoverNode != undefined){
            state.prevNodeID = hoverNode.id
            return
        }
        //creates a new node on top of a segment, it splits it and creates a new node
        let closestPosToSegment = road.findClosestSegmentAndPos(mouseX, mouseY)
        if(closestPosToSegment.closestSegment && 
            closestPosToSegment.minDist < NODE_RAD * 1.25){
                console.log('splitting segment FROM')
            let segment = closestPosToSegment.closestSegment
            let newNodeAndSegments = road.splitSegmentAtPos(segment.id, closestPosToSegment.closestPoint.x, closestPosToSegment.closestPoint.y)
            state.prevNodeID = newNodeAndSegments.newNode.id
            return
        }
        //creates a node from an empty space
        let newNode = road.addNode(mousePosGridX, mousePosGridY)
        state.prevNodeID = newNode.id
    }
    //following a previous node: create a segment that follows the previous node
    else if(state.mode == 'creatingLane' && state.prevNodeID != -1){
        //connects it to an existing node if hovering one
        let hoverNode = road.findHoverNode()
        if(hoverNode != undefined){
            let newSegment = road.addSegment(state.prevNodeID, hoverNode.id)
            state.prevNodeID = hoverNode.id
            //state.prevNodeID = -1
            return
        }
        //creates a new node on top of a segment, it splits it and creates a new node
        let closestPosToSegment = road.findClosestSegmentAndPos(mouseX, mouseY)
        if(closestPosToSegment.closestSegment && 
            closestPosToSegment.minDist < NODE_RAD * 1.25){
                console.log('splitting segment TO')
            let segment = closestPosToSegment.closestSegment
            let newNodeAndSegments = road.splitSegmentAtPos(segment.id, closestPosToSegment.closestPoint.x, closestPosToSegment.closestPoint.y)
            let newSegment = road.addSegment(state.prevNodeID, newNodeAndSegments.newNode.id)
            state.prevNodeID = newNodeAndSegments.newNode.id
            return
        }
        //creates a node from an empty space connected to the previous node and
        //checks if it collides with any other segment
        let newNode = road.addNode(mousePosGridX, mousePosGridY)
        let newSegment = road.addSegment(state.prevNodeID, newNode.id)
        checkSegmentCollisionsAndSplit(newSegment)
        state.prevNodeID = newNode.id
        console.log(newNode.id)
    }
    //deletes a node or segment
    else if(state.mode == 'deleting'){
        let hoverNode = road.findHoverNode()
        if(hoverNode != undefined){
            road.deleteNode(hoverNode.id)
            return
        }
        let closestPosToSegment = road.findClosestSegmentAndPos(mouseX, mouseY)
        if(closestPosToSegment.closestSegment && 
            closestPosToSegment.minDist < NODE_RAD * 1.25){
                road.deleteSegment(closestPosToSegment.closestSegment.id)
                return
        }
    }
}

function mouseReleased(){
    if(state.mode == 'movingNode'){
        state.draggingNodeID = -1
        state.offsetDraggingNode = {x: 0, y: 0}
        checkForAllSegmentCollisions()
        return
    }
}

function mouseDragged(){
    if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return

    const mousePosGridX = Math.floor(mouseX / GRID_CELL_SIZE) * GRID_CELL_SIZE
    const mousePosGridY = Math.floor(mouseY / GRID_CELL_SIZE) * GRID_CELL_SIZE

    //dragging nodes
    if(state.mode == 'movingNode'){
        if(state.draggingNodeID != -1){
            let node = road.findNode(state.draggingNodeID)
            node.pos.x = mousePosGridX + state.offsetDraggingNode.x
            node.pos.y = mousePosGridY + state.offsetDraggingNode.y
            return
        }
        let hoverNode = road.findHoverNode()
        if(hoverNode != undefined){
            state.draggingNodeID = hoverNode.id
            state.offsetDraggingNode.x = hoverNode.pos.x - mousePosGridX
            state.offsetDraggingNode.y = hoverNode.pos.y - mousePosGridY
            return
        }
    }
}

function keyPressed(){
    if(keyCode == 32 && state.mode == 'creatingLane'){
        state.prevNodeID = -1
    }
    if(key == 'h' && state.prevNodeID == -1){
        state.mode = 'movingNode'
        state.prevNodeID = -1
        cursor(HAND)
    }
    if(key == 'c'){
        state.mode = 'creatingLane'
        state.prevNodeID = -1
        cursor(CROSS)
    }
    if(key == 'd'){
        state.mode = 'deleting'
        state.prevNodeID = -1
        cursor('not-allowed')
    }
}

//if a segment intersects another segment
function checkSegmentCollisionsAndSplit(newSegment){
    let fromNode = road.findNode(newSegment.fromNodeID)
    let toNode = road.findNode(newSegment.toNodeID)
    let a = fromNode.pos
    let b = toNode.pos


    road.segments.forEach(s => {
        if(s.id == newSegment.id) return
        let sFromNode = road.findNode(s.fromNodeID)
        let sToNode = road.findNode(s.toNodeID)
        let c = sFromNode.pos
        let d = sToNode.pos

        if(a.x == c.x && a.y == c.y) return
        if(a.x == d.x && a.y == d.y) return
        if(b.x == c.x && b.y == c.y) return
        if(b.x == d.x && b.y == d.y) return

        let intersec = lineIntersection(a, b, c, d)

        if(intersec){
            let newNodeAndSegments = split2SegmentsAtPos(s, newSegment, intersec.x, intersec.y)
            if(!newNodeAndSegments) return
            checkSegmentCollisionsAndSplit(newNodeAndSegments.segment1)
            checkSegmentCollisionsAndSplit(newNodeAndSegments.segment2)
        }
    })

}

function checkForAllSegmentCollisions() {
    let segments = road.segments;
    for (let i = 0; i < segments.length; i++) {
        for (let j = i + 1; j < segments.length; j++) {
            let intersec = checkSegmentPairAndSplit(segments[i], segments[j]);
            if(intersec) {
                checkForAllSegmentCollisions()
                return
            }
        }
    }
}

function checkSegmentPairAndSplit(segment1, segment2) {
    let fromNode1 = road.findNode(segment1.fromNodeID)
    let toNode1 = road.findNode(segment1.toNodeID)
    let a = fromNode1.pos
    let b = toNode1.pos

    let fromNode2 = road.findNode(segment2.fromNodeID)
    let toNode2 = road.findNode(segment2.toNodeID)
    let c = fromNode2.pos
    let d = toNode2.pos

    if(a.x == c.x && a.y == c.y) return
    if(a.x == d.x && a.y == d.y) return
    if(b.x == c.x && b.y == c.y) return
    if(b.x == d.x && b.y == d.y) return

    let intersec = lineIntersection(a, b, c, d)

    if(intersec){
        split2SegmentsAtPos(segment1, segment2, intersec.x, intersec.y)
        if(!intersec) return
        return intersec
    }   
}

//Split both segments and creates a node at the given intersection point
function split2SegmentsAtPos(segment1, segment2, x, y){
    let newNodeAndSegmentsAux = road.splitSegmentAtPos(segment1.id, x, y)
    if(!newNodeAndSegmentsAux) return
    let newNodeAndSegments = road.splitSegmentAtPos(segment2.id, x, y, newNodeAndSegmentsAux.newNode)
    return newNodeAndSegments
}

function checkCurrentSegmentCollisions(){
    if(state.prevNodeID == -1) return
    let node = road.findNode(state.prevNodeID)
    let pos = node.pos

    const mousePosGridX = Math.floor(mouseX / GRID_CELL_SIZE) * GRID_CELL_SIZE
    const mousePosGridY = Math.floor(mouseY / GRID_CELL_SIZE) * GRID_CELL_SIZE

    let closestPosToSegment = road.findClosestSegmentAndPos(mouseX, mouseY)
    let closestPoint = closestPosToSegment.closestPoint != undefined && closestPosToSegment.minDist < NODE_RAD * 1.25 ? closestPosToSegment.closestPoint : {x: mousePosGridX, y: mousePosGridY}

    let hoverNode = road.findHoverNode()
    if(hoverNode != undefined) closestPoint = hoverNode.pos

    let tempSegment = {id: -1, fromNodeID: node.id, toNodeID: -1}
    let tempToNode = {id: -1, pos: closestPoint}
    road.segments.forEach(s => {
        if(s.id == tempSegment.id) return
        let sFromNode = road.findNode(s.fromNodeID)
        let sToNode = road.findNode(s.toNodeID)
        let a = node.pos
        let b = tempToNode.pos
        let c = sFromNode.pos
        let d = sToNode.pos

        if(a.x == c.x && a.y == c.y) return
        if(a.x == d.x && a.y == d.y) return
        if(b.x == c.x && b.y == c.y) return
        if(b.x == d.x && b.y == d.y) return

        let intersec = lineIntersection(a, b, c, d)

        if(intersec){
            showClosestSegmentAndPos(intersec)
            return intersec
        }
    })
}

function showCurrent(){
    showGridPoints()
    showCurrentSegment()
}

function showCurrentSegment(){
    if(state.prevNodeID != -1){
        let node = road.findNode(state.prevNodeID)
        let pos = node.pos

        const mousePosGridX = Math.floor(mouseX / GRID_CELL_SIZE) * GRID_CELL_SIZE
        const mousePosGridY = Math.floor(mouseY / GRID_CELL_SIZE) * GRID_CELL_SIZE

        let closestPosToSegment = road.findClosestSegmentAndPos(mouseX, mouseY)
        let closestPoint = closestPosToSegment.closestPoint != undefined && closestPosToSegment.minDist < NODE_RAD * 1.25 ? closestPosToSegment.closestPoint : {x: mousePosGridX, y: mousePosGridY}

        let hoverNode = road.findHoverNode()
        if(hoverNode != undefined) closestPoint = hoverNode.pos

        push()
        strokeWeight(1.5)
        stroke(255)
        
        line(pos.x, pos.y, closestPoint.x, closestPoint.y)
        let fromPos = pos
        let toPos = {x: closestPoint.x, y: closestPoint.y}
        let midPos1 = lerppos(fromPos, toPos, 0.33)
        let midPos2 = lerppos(fromPos, toPos, 0.66)
        let angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) - PI
        drawArrowTip(midPos1.x, midPos1.y, angle, 10)
        drawArrowTip(midPos2.x, midPos2.y, angle, 10)

        
        if(closestPosToSegment.closestSegment && state.mode == 'creatingLane' && closestPosToSegment.minDist < NODE_RAD * 1.25 && !hoverNode){
            showClosestSegmentAndPos(closestPosToSegment.closestPoint)
        }
        else{
            noFill()
            stroke(255, 150)
            ellipse(mousePosGridX, mousePosGridY, NODE_RAD * 2)
        }

        checkCurrentSegmentCollisions()
        
        pop()
    }
    else if(state.mode == 'creatingLane' && state.prevNodeID == -1){
        let closestPosToSegment = road.findClosestSegmentAndPos(mouseX, mouseY)
        if(closestPosToSegment.closestSegment && state.mode == 'creatingLane' && closestPosToSegment.minDist < NODE_RAD * 1.25){
            showClosestSegmentAndPos(closestPosToSegment.closestPoint)
        }
        checkCurrentSegmentCollisions()
    }
}

function showClosestSegmentAndPos(pos){
    push()
    let ellipsePos = pos ? pos : road.findClosestSegmentAndPos(mouseX, mouseY).closestPoint
    if(ellipsePos == undefined) return
    stroke(255, 150)
    noFill()
    strokeWeight(1.5)
    ellipse(ellipsePos.x, ellipsePos.y, NODE_RAD * 2)
    pop()
}

function showGridPoints(){
    push()
    stroke(255, 200)
    strokeWeight(1.25)
    let off = GRID_CELL_SIZE / 2
    for(let x = 0; x < width; x += GRID_CELL_SIZE){
        for(let y = 0; y < height; y += GRID_CELL_SIZE){
            point(x + off, y + off)
        }
    }
    pop()
}

