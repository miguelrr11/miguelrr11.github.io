let GLOBAL_EDGES = [0, 1400, 0, 700]
const COL_PATHS = [200]
const COL_LANE_1 = [40, 40, 255, 90]
const COL_LANE_2 = [255, 40, 40, 90]

/*
state.modes:
    creating
    movingNode
    deleting
    selecting
    settingStart
    settingEnd
*/



class Tool{
    constructor(){
        this.showOptions = {
            SHOW_ROAD: false,
            SHOW_PATHS: false,
            SHOW_NODES: true,
            SHOW_CONNECTORS: false,
            SHOW_INTERSECSEGS: false,
            SHOW_TAGS: false,
            SHOW_SEGS_DETAILS: false,
            SHOW_LANES: false,
            SHOW_WAYS: true,
            SHOW_CONVEXHULL: false
        }
        this.road = new Road(this)
        this.state = this.getInitialState()
        this.buttons = []
        this.menu = new Menu(this)
        this.dragging = false
        document.addEventListener("click", () => this.onClick())
        document.addEventListener("mouseup", () => { this.dragging = false; this.onMouseRelease()})
        document.addEventListener("mousedown", () => {this.dragging = true})
        document.addEventListener("mousemove", () => {if(this.dragging) this.onMouseDragged()})
        document.addEventListener("keydown", (e) => this.onKeyPressed(e));
        document.addEventListener("wheel", (e) => {e.preventDefault(); this.onMouseWheel(e)}, {passive: false});
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.finishSegment()
        });
        //on window resize
        window.addEventListener('resize', () => {
            WIDTH = windowWidth
            HEIGHT = windowHeight
            resizeCanvas(windowWidth, windowHeight);
            this.menu = new Menu(this);
        });

        this.xOff = 0
        this.yOff = 0
        this.prevMouseX = 0
        this.prevMouseY = 0
        this.zoom = 0.7


        this.cursor = CROSS
        cursor(this.cursor)
    }

    getInitialState(){
        return {
            mode: 'creating',
            prevNodeID: -1,

            draggingNodeID: -1,
            offsetDraggingNode: {x: 0, y: 0},

            nForLanes: 1,
            nBackLanes: 1,
            snapToGrid: true,

            changed: false,

            //pathfinding
            settingStart: false,
            settingEnd: false,
            startNodeID: -1,
            endNodeID: -1,
            foundPath: [],

            edges: undefined,

            fpsAcum: [],

            hoverNode: undefined,
            hoverSeg: undefined,

            menuCollapsed: false,

            //selecting
            firstCorner: undefined,
            secondCorner: undefined,
            firstCornerSelected: undefined,
            secondCornerSelected: undefined,
            selectedNodes: []
        }
    }

    getMousePositions(){
        // Get mouse position in world space
        let mousePos = this.getRelativePos(mouseX, mouseY)

        // Snap to grid in world space (not screen space)
        let mousePosGridX = Math.round(mousePos.x / GRID_CELL_SIZE) * GRID_CELL_SIZE
        let mousePosGridY = Math.round(mousePos.y / GRID_CELL_SIZE) * GRID_CELL_SIZE

        if(this.state.snapToGrid) return [mousePosGridX, mousePosGridY, mousePos]
        else return [mousePos.x, mousePos.y, mousePos]
    }

    onClick(){
        if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height || this.menu.inBounds() || keyIsPressed || this.menuInteracting) return

        let [mousePosGridX, mousePosGridY, mousePos] = this.getMousePositions()

        //not following a previous node, so just create a new node
        if(this.state.mode == 'creating' && this.state.prevNodeID == -1){
            //resumes creating a segment from the clicked node
            let hoverNode = this.road.findHoverNode(mousePos.x, mousePos.y)
            if(hoverNode != undefined){
                this.state.prevNodeID = hoverNode.id
                return
            }
            //creates a new node on top of a segment, it splits it and creates a new node which becomes the previous node (anchor)
            let closestPosToSegment = this.road.findClosestSegmentAndPos(mousePosGridX, mousePosGridY)
            if(closestPosToSegment.closestSegment && closestPosToSegment.minDist < NODE_RAD * 1.25){
                let allSegmentsBetween = this.road.getAllSegmentsBetweenNodes(closestPosToSegment.closestSegment.fromNodeID, closestPosToSegment.closestSegment.toNodeID)
                let newNode = this.road.addNode(closestPosToSegment.closestPointMain.x, closestPosToSegment.closestPointMain.y)
                for(let s of allSegmentsBetween){
                    this.road.splitSegmentAtPos(s.id, closestPosToSegment.closestPointMain.x, closestPosToSegment.closestPointMain.y, newNode)
                }
                this.state.prevNodeID = newNode.id
                return
            }
            //creates a node from an empty space
            let newNode = this.road.addNode(mousePosGridX, mousePosGridY)
            this.state.prevNodeID = newNode.id
        }

        //following a previous node: create a segment that follows the previous node and creates a new node
        else if(this.state.mode == 'creating' && this.state.prevNodeID != -1){
            //connects it to an existing node if hovering one
            let hoverNode = this.road.findHoverNode(mousePos.x, mousePos.y)
            if(hoverNode != undefined && hoverNode.id != this.state.prevNodeID){
                this.createSegmentBetweenTwoNodes(this.state.prevNodeID, hoverNode.id)
                this.state.prevNodeID = hoverNode.id
                return
            }
            if(hoverNode != undefined && hoverNode.id == this.state.prevNodeID) return
            //creates a new node on top of a segment, it splits it and creates a new node
            let closestPosToSegment = this.road.findClosestSegmentAndPos(mousePosGridX, mousePosGridY)
            if(closestPosToSegment.closestSegment && closestPosToSegment.minDist < NODE_RAD * 1.25){
                let newNode = this.road.addNode(closestPosToSegment.closestPointMain.x, closestPosToSegment.closestPointMain.y)
                let allSegmentsBetween = this.road.getAllSegmentsBetweenNodes(closestPosToSegment.closestSegment.fromNodeID, closestPosToSegment.closestSegment.toNodeID)
                for(let s of allSegmentsBetween){
                    this.road.splitSegmentAtPos(s.id, closestPosToSegment.closestPointMain.x, closestPosToSegment.closestPointMain.y, newNode)
                }
                //connects the new node to the previous node
                this.createSegmentBetweenTwoNodes(this.state.prevNodeID, newNode.id)
                this.state.prevNodeID = newNode.id
                return
            }
            //creates a node from an empty space connected to the previous node and
            //checks if it collides with any other segment
            let newNode = this.road.addNode(mousePosGridX, mousePosGridY)
            //let newSegment = this.road.addSegment(this.state.prevNodeID, newNode.id)
            this.createSegmentBetweenTwoNodes(this.state.prevNodeID, newNode.id)
            //checkSegmentCollisionsAndSplit(newSegment)
            this.state.prevNodeID = newNode.id
        }
        //deletes a node or segment
        else if(this.state.mode == 'deleting'){
            let hoverNode = this.road.findHoverNode(mousePos.x, mousePos.y)
            if(hoverNode != undefined){
                this.road.deleteNode(hoverNode.id)
                return
            }
            let closestPosToSegment = this.road.findClosestSegmentAndPosRealPos(mousePosGridX, mousePosGridY)
            if(closestPosToSegment.closestSegment && closestPosToSegment.minDist < LANE_WIDTH * 0.5){
                this.road.deleteSegment(closestPosToSegment.closestSegment.id)
                return
            }
        }
        else if(this.state.mode == 'settingStart' || this.state.mode == 'settingEnd'){
            let hoverNode = this.road.findHoverNode(mousePos.x, mousePos.y)
            if(hoverNode != undefined){
                if(this.state.mode == 'settingStart') {
                    this.state.startNodeID = hoverNode.id;
                    if(this.state.endNodeID != -1) this.executePathfinding();
                }
                if(this.state.mode == 'settingEnd') {
                    this.state.endNodeID = hoverNode.id;
                    if(this.state.startNodeID != -1) this.executePathfinding();
                }
                this.state.prevNodeID = -1
                this.setCursor(CROSS)
                return
            }
        }
    }

    setCursor(newCursor){
        if(newCursor != undefined) this.cursor = newCursor
        cursor(this.cursor)
    }

    executePathfinding(){
        this.state.foundPath = Astar(this.state.startNodeID, this.state.endNodeID, this.road) ?? []
    }

    onMouseDragged(){
        if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height || this.menuInteracting != false) return

        let [mousePosGridX, mousePosGridY, mousePos] = this.getMousePositions()

        if((this.state.mode == 'movingNode' || (keyIsPressed && keyCode == 32)) && this.state.draggingNodeID == -1){
            if(!this.prevMouseX) this.prevMouseX = mouseX
            if(!this.prevMouseY) this.prevMouseY = mouseY
            let dx = mouseX - this.prevMouseX; // Change in mouse X
            let dy = mouseY - this.prevMouseY; // Change in mouse Y
            this.xOff += dx;
            this.yOff += dy;
            this.prevMouseX = mouseX;
            this.prevMouseY = mouseY;
        }

        //dragging nodes
        if(this.state.mode == 'movingNode'){
            if(this.state.draggingNodeID != -1){
                let node = this.road.findNode(this.state.draggingNodeID)
                node.moveTo(mousePosGridX + this.state.offsetDraggingNode.x, mousePosGridY + this.state.offsetDraggingNode.y)
                this.road.moveNode(this.state.draggingNodeID)
                return
            }
            let hoverNode = this.road.findHoverNode(mousePos.x, mousePos.y)
            if(hoverNode != undefined){
                this.state.draggingNodeID = hoverNode.id
                this.state.offsetDraggingNode.x = hoverNode.pos.x - mousePosGridX
                this.state.offsetDraggingNode.y = hoverNode.pos.y - mousePosGridY
                return
            }
        }

        //selecting
        if(this.state.mode == 'selecting'){
            if(!this.state.firstCorner){
                this.state.firstCorner = this.getRelativePos(mouseX, mouseY)
            } 
            else {
                this.state.secondCorner = this.getRelativePos(mouseX, mouseY)
            }
        }
    }

    onMouseRelease(){
        this.prevMouseX = undefined
        this.prevMouseY = undefined
        if(this.state.mode == 'movingNode'){
            this.state.draggingNodeID = -1
            this.state.offsetDraggingNode = {x: 0, y: 0}
            this.checkForAllSegmentCollisions()
            return
        }
        if(this.state.firstCorner != undefined){
            this.state.secondCorner = this.getRelativePos(mouseX, mouseY)
            this.selectObjectsInSelectionBox()
        }
        this.state.firstCorner = undefined
        this.state.secondCorner = undefined
    }

    finishSegment(){
        this.state.prevNodeID = -1
    }

    onKeyPressed(event){
        let kC = event.keyCode
        let k = event.key.toLowerCase()
        if(kC == 13 && this.state.mode == 'creating'){   //ENTER
            this.state.prevNodeID = -1
        }
        if(k == 'h'){
            this.handState()
        }
        if(k == 'c'){
            this.createState()
        }
        if(k == 'd'){
            this.deleteState()
        }
        if(k == 'a'){
            this.selectState()
        }
    }

    onMouseWheel(event) {
        let worldX = (mouseX - this.xOff) / this.zoom;
        let worldY = (mouseY - this.yOff) / this.zoom;
        let oldZoom = this.zoom;
        this.zoom += event.deltaY / 1000;
        this.zoom = Math.max(0.1, Math.min(this.zoom, 8));
        this.xOff = mouseX - worldX * this.zoom;
        this.yOff = mouseY - worldY * this.zoom;

        // Only update bezier segments if zoom changed significantly
        this.state.changed = true
    }

    createState(){
        if(this.state.mode == 'creating') return
        this.state.mode = 'creating'
        this.state.prevNodeID = -1
        this.setCursor(CROSS)
    }

    handState(){
        if(this.state.mode == 'movingNode') return
        this.state.mode = 'movingNode'
        this.state.prevNodeID = -1
        this.setCursor(HAND)
    }

    deleteState(){
        if(this.state.mode == 'deleting') return
        this.state.mode = 'deleting'
        this.state.prevNodeID = -1
        this.setCursor('not-allowed')
    }

    selectState(){
        if(this.state.mode == 'selecting') return
        this.state.mode = 'selecting'
        this.state.prevNodeID = -1
        this.setCursor(CROSS)
    }
    
    showCurrent(){
        this.showCurrentSegment()
    }

    showGridPoints(){
        
        push()
        let edges = this.getEdges()
        let minX = edges[0]
        let maxX = edges[1]
        let minY = edges[2]
        let maxY = edges[3]
        let startX = Math.floor(minX / GRID_CELL_SIZE) * GRID_CELL_SIZE
        let startY = Math.floor(minY / GRID_CELL_SIZE) * GRID_CELL_SIZE

        strokeWeight((1 / this.zoom) * 1.5)
        
        let fadeDistance = (maxX - minX) * 0.1  //10% of the screen dims
        
        for(let x = startX; x <= maxX; x += GRID_CELL_SIZE){
            for(let y = startY; y <= maxY; y += GRID_CELL_SIZE){
                let distFromLeft = x - minX
                let distFromRight = maxX - x
                let distFromTop = y - minY
                let distFromBottom = maxY - y
                let minDistToEdge = Math.min(distFromLeft, distFromRight, distFromTop, distFromBottom)
                let fadeFactor = Math.min(minDistToEdge / fadeDistance, 1)
                let baseAlpha = map(this.zoom, 0.2, 0.4, 0, 150, true)
                let alpha = baseAlpha * fadeFactor
                stroke(255, alpha)
                point(x, y)
            }
        }
        pop()
    }


    showCurrentSegment(){
        if(this.state.prevNodeID != -1){
            let node = this.road.findNode(this.state.prevNodeID)
            let pos = node.pos

            let mousePosGridXnotscaled = Math.floor(mouseX / GRID_CELL_SIZE) * GRID_CELL_SIZE
            let mousePosGridYnotscaled = Math.floor(mouseY / GRID_CELL_SIZE) * GRID_CELL_SIZE

            let scaled = this.getRelativePos(mousePosGridXnotscaled, mousePosGridYnotscaled)

            let mousePosGridX = scaled.x
            let mousePosGridY = scaled.y

            let mousePos = this.getRelativePos(mouseX, mouseY)

            let closestPosToSegment = this.road.findClosestSegmentAndPos(mousePosGridX, mousePosGridY)
            let closestPoint = closestPosToSegment.closestPoint != undefined && closestPosToSegment.minDist < NODE_RAD * 1.25 ? closestPosToSegment.closestPoint : {x: mousePosGridX, y: mousePosGridY}

            let hoverNode = this.road.findHoverNode(mousePos.x, mousePos.y)
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

            
            if(closestPosToSegment.closestSegment && this.state.mode == 'creating' && closestPosToSegment.minDist < NODE_RAD * 1.25 && !hoverNode){
                this.showClosestSegmentAndPos(closestPosToSegment.closestPoint)
            }
            else{
                noFill()
                stroke(255, 150)
                ellipse(mousePosGridX, mousePosGridY, NODE_RAD * 2)
            }

            this.checkCurrentSegmentCollisions()
            
            pop()
        }
        else if(this.state.mode == 'creating' && this.state.prevNodeID == -1){
            let mousePosGridXnotscaled = Math.floor(mouseX / GRID_CELL_SIZE) * GRID_CELL_SIZE
            let mousePosGridYnotscaled = Math.floor(mouseY / GRID_CELL_SIZE) * GRID_CELL_SIZE

            let scaled = this.getRelativePos(mousePosGridXnotscaled, mousePosGridYnotscaled)

            let mousePosGridX = scaled.x
            let mousePosGridY = scaled.y
            
            let closestPosToSegment = this.road.findClosestSegmentAndPos(mousePosGridX, mousePosGridY)
            if(closestPosToSegment.closestSegment && this.state.mode == 'creating' && closestPosToSegment.minDist < NODE_RAD * 1.25){
                this.showClosestSegmentAndPos(closestPosToSegment.closestPoint)
            }
            this.checkCurrentSegmentCollisions()
        }
    }

    checkCurrentSegmentCollisions(){
        return
    }

    checkForAllSegmentCollisions(){
        return
    }

    createSegmentBetweenTwoNodes(nodeAID, nodeBID){
        for(let i = 0; i < this.state.nForLanes; i++){
            this.road.addSegment(nodeAID, nodeBID, 'for')
        }
        for(let i = 0; i < this.state.nBackLanes; i++){
            this.road.addSegment(nodeBID, nodeAID, 'back')
        }
    }

    showClosestSegmentAndPos(pos){
        push()

        let [mousePosGridX, mousePosGridY, mousePos] = this.getMousePositions()

        let ellipsePos = pos ? pos : this.road.findClosestSegmentAndPos(mousePosGridX, mousePosGridY).closestPoint
        if(ellipsePos == undefined) return
        stroke(255, 150)
        noFill()
        strokeWeight(1.5)
        ellipse(ellipsePos.x, ellipsePos.y, NODE_RAD * 2)
        pop()
    }

    createCurrentLanes(){
        if(this.state.prevNodeID == -1) return

        let [mousePosGridX, mousePosGridY, mousePos] = this.getMousePositions()

        let segments = []
        let newNode = new Node(-1, mousePosGridX, mousePosGridY)
        for(let i = 0; i < this.state.nForLanes; i++){
            segments.push(new Segment(i, this.state.prevNodeID, -1))
        }
        for(let i = 0; i < this.state.nBackLanes; i++){
            segments.push(new Segment(i + this.state.nForLanes, -1, this.state.prevNodeID))
        }

        let nodeA = this.road.findNode(this.state.prevNodeID)
        let nodeB = newNode
        
        let fromPos = nodeA.pos
        let toPos = nodeB.pos
        let angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) - PI / 2
        let numLanes = segments.length
        let totalWidth = numLanes * LANE_WIDTH
        let startOffset = -totalWidth / 2 + LANE_WIDTH / 2

        let i = 0
        segments.forEach(seg => {
            let offset = startOffset + i * LANE_WIDTH
            let laneFromPos = {x: fromPos.x + Math.cos(angle) * offset, y: fromPos.y + Math.sin(angle) * offset}
            let laneToPos = {x: toPos.x + Math.cos(angle) * offset, y: toPos.y + Math.sin(angle) * offset}
            let nodeFrom = seg.fromNodeID == -1 ? nodeB : nodeA
            let nodeTo = seg.fromNodeID == -1 ? nodeA : nodeB
            let dir = Math.atan2(nodeTo.pos.y - nodeFrom.pos.y, nodeTo.pos.x - nodeFrom.pos.x) - PI

            //also we modify the segment to have the new calculated positions
            seg.fromPos = seg.fromNodeID == nodeB.id ? laneFromPos : laneToPos
            seg.toPos = seg.toNodeID == nodeA.id ? laneToPos : laneFromPos
            seg.dir = dir

            i++
        })

        return segments
    }

    showCurSegs(segs) {
        push()
        for(let seg of segs) {
            let fromPos = seg.fromPos
            let toPos = seg.toPos
            stroke(255)
            strokeWeight(1)
            line(seg.fromPos.x, seg.fromPos.y, seg.toPos.x, seg.toPos.y)
            let midPos = {x: (seg.fromPos.x + seg.toPos.x) / 2, y: (seg.fromPos.y + seg.toPos.y) / 2}
            drawArrowTip(midPos.x, midPos.y, seg.dir, 7)
            let corners = getCornersOfLine(fromPos, toPos, LANE_WIDTH)
            rectMode(CORNERS)
            stroke(255, 0, 0, 200)
            strokeWeight(1)
            fill(255, 100)
            beginShape()
            vertex(corners[0].x, corners[0].y)
            vertex(corners[1].x, corners[1].y)
            vertex(corners[2].x, corners[2].y)
            vertex(corners[3].x, corners[3].y)
            endShape(CLOSE)
        }
        pop()
    }

    showStartEndPathfinding(){
        push()
        strokeWeight(2.5)
        let startNode = this.road.findNode(this.state.startNodeID)
        let endNode = this.road.findNode(this.state.endNodeID)
        if(startNode){
            fill('#7dd56bff')
            stroke('#5d9d50ff')
            ellipse(startNode.pos.x, startNode.pos.y, NODE_RAD * 1.2)
        }
        if(endNode){
            fill('#e15735ff')
            stroke('#dc2f02')
            ellipse(endNode.pos.x, endNode.pos.y, NODE_RAD * 1.2)
        }
        if(this.state.mode == 'settingStart' || this.state.mode == 'settingEnd'){
            if(this.state.hoverNode){
                fill(255, 150)
                noStroke()
                ellipse(this.state.hoverNode.pos.x, this.state.hoverNode.pos.y, NODE_RAD * 1.2)
            }
        }
        pop()
    }

    showFoundPath(){
        if(this.state.foundPath.length == 0) return
        push()
        noFill()
        stroke('#9d4eddd1')
        strokeWeight(12)
        drawBezierPath(this.state.foundPath.map(id => createVector(this.road.findNode(id).pos.x, this.road.findNode(id).pos.y)), 20, 20)
        pop()
    }

    getEdges() {
        let minX = (0 - this.xOff) / this.zoom
        let maxX = (WIDTH - this.xOff) / this.zoom
        let minY = (0 - this.yOff) / this.zoom
        let maxY = (HEIGHT - this.yOff) / this.zoom
        return [
            minX,
            maxX,
            minY,
            maxY
        ]
    }

    showMousePosition(){
        if(this.state.mode != 'creating') return
        let [mousePosGridX, mousePosGridY, mousePos] = this.getMousePositions()
        blendMode(ADD)
        noFill()
        stroke(255, 200)
        strokeWeight(1.5)
        ellipse(mousePosGridX, mousePosGridY, NODE_RAD * 2)
        blendMode(BLEND)
    }

    showSelectionBox(){
        if(this.state.firstCorner == undefined) return
        let secondCorner = this.state.secondCorner ? this.state.secondCorner : this.getRelativePos(mouseX, mouseY)
        let x1 = this.state.firstCorner.x
        let y1 = this.state.firstCorner.y
        let x2 = secondCorner.x
        let y2 = secondCorner.y
        push()
        noFill()
        stroke(255, 200)
        strokeWeight(1.5)
        rectMode(CORNERS)
        rect(x1, y1, x2, y2)
        blendMode(ADD)
        fill(255, 50)
        rect(x1, y1, x2, y2)
        blendMode(BLEND)
        pop()
    }

    showSelectionBoxSelected(){
        if(this.state.firstCornerSelected == undefined) return
        let x1 = this.state.firstCornerSelected.x
        let y1 = this.state.firstCornerSelected.y
        let x2 = this.state.secondCornerSelected.x
        let y2 = this.state.secondCornerSelected.y
        push()
        noFill()
        stroke(255, 200)
        strokeWeight(1.5)
        rectMode(CORNERS)
        rect(x1, y1, x2, y2)
        blendMode(ADD)
        fill(255, 50)
        rect(x1, y1, x2, y2)
        blendMode(BLEND)
        pop()
    }

    selectObjectsInSelectionBox(){
        let margin = NODE_RAD * 2
        let inBoundsNodes = this.road.findAllNodesInArea(this.state.firstCorner, this.state.secondCorner)
        if(inBoundsNodes.length > 0){ 
            this.state.selectedNodes = inBoundsNodes
            let corners = getBoundingBoxCorners(inBoundsNodes.map(n => n.pos))
            this.state.firstCornerSelected = {x: corners[0].x - margin, y: corners[0].y - margin}
            this.state.secondCornerSelected = {x: corners[2].x + margin, y: corners[2].y + margin}
        }
        else{
            this.state.selectedNodes = []
            this.state.firstCornerSelected = undefined
            this.state.secondCornerSelected = undefined
        }
    }

    update(){
        this.state.edges = this.getEdges()
        GLOBAL_EDGES = this.state.edges
        this.road.updateConvexHullsIncremental()
        // Note: setPaths() is no longer called here - updates are done incrementally
        // when nodes/segments are added/removed/modified
        if(this.state.changed) {
            if(this.state.startNodeID != -1 && this.state.endNodeID != -1){
                this.executePathfinding();
            }
        }
        this.state.changed = false
        this.menuInteracting = this.menu.update()
        let inB = this.menu.inBounds()
        if(this.menuInteracting != 'slider' && !inB) this.setCursor()

        let mousePos = this.getRelativePos(mouseX, mouseY)
        
        this.state.hoverNode = this.road.findHoverNode(mousePos.x, mousePos.y)
        let closestPosToSegment = this.road.findClosestSegmentAndPosRealPos(mousePos.x, mousePos.y)
        if(closestPosToSegment.closestSegment && closestPosToSegment.minDist < LANE_WIDTH * 0.5){
            this.state.hoverSeg = closestPosToSegment.closestSegment.id
        }
        else this.state.hoverSeg = undefined
    }

    show(){
        push()

        translate(this.xOff, this.yOff)
        scale(this.zoom)

        if(this.zoom > 0.2 && this.state.snapToGrid) this.showGridPoints()

        
        // only showWays is optimized
        if(this.showOptions.SHOW_WAYS) this.road.showWays(this)

        if(this.showOptions.SHOW_LANES){ 
            this.road.showLanes(this.state.hoverSeg)
        }
        if(this.showOptions.SHOW_ROAD) this.road.showMain(this.showOptions.SHOW_TAGS)
        if(this.showOptions.SHOW_PATHS) this.road.showPaths(this.showOptions.SHOW_TAGS, 
                                                            this.showOptions.SHOW_SEGS_DETAILS,
                                                            this.state.hoverSeg)
        
        if(this.showOptions.SHOW_INTERSECSEGS) this.road.showIntersecSegs(this.showOptions.SHOW_TAGS)
        if(this.showOptions.SHOW_CONVEXHULL) this.road.showConvexHulls()
        
        blendMode(DIFFERENCE)
        if(this.showOptions.SHOW_NODES) this.road.showNodes()
        blendMode(BLEND)
        if(this.showOptions.SHOW_CONNECTORS) this.road.showConnectors(this.showOptions.SHOW_TAGS)
        if(this.showOptions.SHOW_TAGS && this.showOptions.SHOW_NODES) this.road.showNodesTags()

        let curSegs = this.createCurrentLanes()
        if(curSegs) this.showCurSegs(curSegs)

        

        this.showFoundPath()
        this.showStartEndPathfinding()
        this.showHover()
        this.showMousePosition()

        this.showSelectionBox()
        this.showSelectionBoxSelected()
        

        pop()

        this.menu.show()
    }

    showHover(){
        let [mousePosGridX, mousePosGridY, mousePos] = this.getMousePositions()
        let hoverNode = this.road.findHoverNode(mousePos.x, mousePos.y)
        let _hoverSegment = this.road.findClosestSegmentAndPos(mousePos.x, mousePos.y)
        let hoverSegment = (_hoverSegment.closestSegment && _hoverSegment.minDist < LANE_WIDTH * .5) ? _hoverSegment.closestSegment : false
        if(this.state.mode == 'movingNode' && hoverNode != undefined){
            blendMode(ADD)
            hoverNode.show(true)
            blendMode(BLEND)
        }
        else if(this.state.mode == 'deleting' || this.state.mode == 'creating'){
            if(hoverNode){
                blendMode(ADD)
                hoverNode.show(true)
                blendMode(BLEND)
            }
            else if(hoverSegment && this.showOptions.SHOW_ROAD){
                hoverSegment.showHover()
            }
        }
    }

    getRelativePos(x, y){
        let worldX = (x - this.xOff) / this.zoom;
        let worldY = (y - this.yOff) / this.zoom;
        return {x: worldX, y: worldY}
    }

    getCurrentRoad(){
        let res = {}
        res.nodes = this.road.nodes.map(n => n.export())
        res.segments = this.road.segments.map(s => s.export())
        res.nodeIDcounter = this.road.nodeIDcounter
        res.segmentIDcounter = this.road.segmentIDcounter
        return res
    }

    setStateToRoad(roadData){
        this.road = new Road(this)
        this.road.nodeIDcounter = roadData.nodeIDcounter
        this.road.segmentIDcounter = roadData.segmentIDcounter
        for(let n of roadData.nodes){
            let newNode = new Node(n.id, n.pos.x, n.pos.y)
            newNode.road = this.road
            newNode.incomingSegmentIDs = n.incomingSegmentIDs
            newNode.outgoingSegmentIDs = n.outgoingSegmentIDs
            this.road.nodes.push(newNode)
        }
        for(let s of roadData.segments){
            let newSegment = new Segment(s.id, s.fromNodeID, s.toNodeID, s.visualDir)
            newSegment.road = this.road
            this.road.segments.push(newSegment)
        }
        this.road.setPaths()
        this.state = this.getInitialState()
        this.handState()
        cars = []
    }
}


function drawBezierPath(points, curveSize = radCurveConn, resolution = 10) {
  if (points.length < 1) return
  if (points.length < 3) {
    line(points[0].x, points[0].y, points[1].x, points[1].y)
    //console.error("Need at least 3 points to draw a Bezier curve");
    return;
  }

  let drawPoints = [];
  drawPoints.push(points[0]);

  for (let i = 1; i < points.length - 1; i++) {
    let targetPoint = points[i];
    let targetDir = p5.Vector.sub(points[i], points[i - 1]).normalize();
    let dstToTarget = p5.Vector.dist(points[i], points[i - 1]);
    let dstToCurveStart = Math.max(dstToTarget - curveSize, dstToTarget / 2);

    let nextTarget = points[i + 1];
    let nextTargetDir = p5.Vector.sub(points[i + 1], points[i]).normalize();
    let nextLineLength = p5.Vector.dist(points[i + 1], points[i]);

    let curveStartPoint = p5.Vector.add(points[i - 1], targetDir.mult(dstToCurveStart));
    let curveEndPoint = p5.Vector.add(targetPoint, nextTargetDir.mult(Math.min(curveSize, nextLineLength / 2)));

    for (let j = 0; j < resolution; j++) {
      let t = j / (resolution - 1);
      let a = p5.Vector.lerp(curveStartPoint, targetPoint, t);
      let b = p5.Vector.lerp(targetPoint, curveEndPoint, t);
      let p = p5.Vector.lerp(a, b, t);

      if (drawPoints.length === 0 || p.dist(drawPoints[drawPoints.length - 1]) > 0.001) {
        drawPoints.push(p);
      }
    }
  }
  drawPoints.push(points[points.length - 1]);


  beginShape();
  for (let p of drawPoints) {
    vertex(p.x, p.y);
  }
  endShape();
}