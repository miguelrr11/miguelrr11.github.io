class Tool{
    constructor(){
        this.showOptions = {
            SHOW_ROAD: false,
            SHOW_PATHS: true,
            SHOW_NODES: true,
            SHOW_CONNECTORS: false,
            SHOW_INTERSECSEGS: true,
            SHOW_TAGS: false,
            SHOW_SEGS_DETAILS: false
        }
        this.road = new Road()
        this.state = {
            mode: 'creatingLane',
            prevNodeID: -1,

            draggingNodeID: -1,
            offsetDraggingNode: {x: 0, y: 0},

            nForLanes: 1,
            nBackLanes: 1 
        }
        this.menu = new Menu(this)
        this.dragging = false
        document.addEventListener("click", () => this.onClick())
        document.addEventListener("mouseup", () => { this.dragging = false; this.onMouseRelease()})
        document.addEventListener("mousedown", () => {this.dragging = true})
        document.addEventListener("mousemove", () => {if(this.dragging) this.onMouseDragged()})
        document.addEventListener("keydown", (e) => this.onKeyPressed(e));

        cursor(CROSS)
    }

    onClick(){
        if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height || this.menu.inBounds()) return

        const mousePosGridX = Math.floor(mouseX / GRID_CELL_SIZE) * GRID_CELL_SIZE
        const mousePosGridY = Math.floor(mouseY / GRID_CELL_SIZE) * GRID_CELL_SIZE

        //not following a previous node, so just create a new node
        if(this.state.mode == 'creatingLane' && this.state.prevNodeID == -1){
            //resumes creating a segment from the clicked node
            let hoverNode = this.road.findHoverNode()
            if(hoverNode != undefined){
                this.state.prevNodeID = hoverNode.id
                return
            }
            //creates a new node on top of a segment, it splits it and creates a new node which becomes the previous node (anchor)
            let closestPosToSegment = this.road.findClosestSegmentAndPos(mouseX, mouseY)
            if(closestPosToSegment.closestSegment && closestPosToSegment.minDist < NODE_RAD * 1.25){
                let allSegmentsBetween = this.road.getAllSegmentsBetweenNodes(closestPosToSegment.closestSegment.fromNodeID, closestPosToSegment.closestSegment.toNodeID)
                let newNode = this.road.addNode(closestPosToSegment.closestPoint.x, closestPosToSegment.closestPoint.y)
                for(let s of allSegmentsBetween){
                    this.road.splitSegmentAtPos(s.id, closestPosToSegment.closestPoint.x, closestPosToSegment.closestPoint.y, newNode)
                }
                this.state.prevNodeID = newNode.id
                return
            }
            //creates a node from an empty space
            let newNode = this.road.addNode(mousePosGridX, mousePosGridY)
            this.state.prevNodeID = newNode.id
        }

        //following a previous node: create a segment that follows the previous node and creates a new node
        else if(this.state.mode == 'creatingLane' && this.state.prevNodeID != -1){
            //connects it to an existing node if hovering one
            let hoverNode = this.road.findHoverNode()
            if(hoverNode != undefined){
                this.createSegmentBetweenTwoNodes(this.state.prevNodeID, hoverNode.id)
                this.state.prevNodeID = hoverNode.id
                return
            }
            //creates a new node on top of a segment, it splits it and creates a new node
            let closestPosToSegment = this.road.findClosestSegmentAndPos(mouseX, mouseY)
            if(closestPosToSegment.closestSegment && closestPosToSegment.minDist < NODE_RAD * 1.25){
                let newNode = this.road.addNode(closestPosToSegment.closestPoint.x, closestPosToSegment.closestPoint.y)
                let allSegmentsBetween = this.road.getAllSegmentsBetweenNodes(closestPosToSegment.closestSegment.fromNodeID, closestPosToSegment.closestSegment.toNodeID)
                for(let s of allSegmentsBetween){
                    this.road.splitSegmentAtPos(s.id, closestPosToSegment.closestPoint.x, closestPosToSegment.closestPoint.y, newNode)
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
            let hoverNode = this.road.findHoverNode()
            if(hoverNode != undefined){
                this.road.deleteNode(hoverNode.id)
                return
            }
            let closestPosToSegment = this.road.findClosestSegmentAndPos(mouseX, mouseY)
            if(closestPosToSegment.closestSegment && 
                closestPosToSegment.minDist < NODE_RAD * 1.25){
                    this.road.deleteSegment(closestPosToSegment.closestSegment.id)
                    return
            }
        }
    }

    onMouseDragged(){
        if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return

        const mousePosGridX = Math.floor(mouseX / GRID_CELL_SIZE) * GRID_CELL_SIZE
        const mousePosGridY = Math.floor(mouseY / GRID_CELL_SIZE) * GRID_CELL_SIZE

        //dragging nodes
        if(this.state.mode == 'movingNode'){
            if(this.state.draggingNodeID != -1){
                let node = this.road.findNode(this.state.draggingNodeID)
                node.pos.x = mousePosGridX + this.state.offsetDraggingNode.x
                node.pos.y = mousePosGridY + this.state.offsetDraggingNode.y
                return
            }
            let hoverNode = this.road.findHoverNode()
            if(hoverNode != undefined){
                this.state.draggingNodeID = hoverNode.id
                this.state.offsetDraggingNode.x = hoverNode.pos.x - mousePosGridX
                this.state.offsetDraggingNode.y = hoverNode.pos.y - mousePosGridY
                return
            }
        }
    }

    onMouseRelease(){
        if(this.state.mode == 'movingNode'){
            this.state.draggingNodeID = -1
            this.state.offsetDraggingNode = {x: 0, y: 0}
            this.checkForAllSegmentCollisions()
            return
        }
    }

    onKeyPressed(event){
        let kC = event.keyCode
        let k = event.key.toLowerCase()
        if(kC == 32 && this.state.mode == 'creatingLane'){
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
    }

    createState(){
        if(this.state.mode == 'creatingLane') return
        this.state.mode = 'creatingLane'
        this.state.prevNodeID = -1
        cursor(CROSS)
    }

    handState(){
        if(this.state.mode == 'movingNode') return
        this.state.mode = 'movingNode'
        this.state.prevNodeID = -1
        cursor(HAND)
    }

    deleteState(){
        if(this.state.mode == 'deleting') return
        this.state.mode = 'deleting'
        this.state.prevNodeID = -1
        cursor('not-allowed')
    }
    
    showCurrent(){
        this.showGridPoints()
        this.showCurrentSegment()
    }

    showGridPoints(){
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

    showCurrentSegment(){
        if(this.state.prevNodeID != -1){
            let node = this.road.findNode(this.state.prevNodeID)
            let pos = node.pos

            const mousePosGridX = Math.floor(mouseX / GRID_CELL_SIZE) * GRID_CELL_SIZE
            const mousePosGridY = Math.floor(mouseY / GRID_CELL_SIZE) * GRID_CELL_SIZE

            let closestPosToSegment = this.road.findClosestSegmentAndPos(mouseX, mouseY)
            let closestPoint = closestPosToSegment.closestPoint != undefined && closestPosToSegment.minDist < NODE_RAD * 1.25 ? closestPosToSegment.closestPoint : {x: mousePosGridX, y: mousePosGridY}

            let hoverNode = this.road.findHoverNode()
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

            
            if(closestPosToSegment.closestSegment && this.state.mode == 'creatingLane' && closestPosToSegment.minDist < NODE_RAD * 1.25 && !hoverNode){
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
        else if(this.state.mode == 'creatingLane' && this.state.prevNodeID == -1){
            let closestPosToSegment = this.road.findClosestSegmentAndPos(mouseX, mouseY)
            if(closestPosToSegment.closestSegment && this.state.mode == 'creatingLane' && closestPosToSegment.minDist < NODE_RAD * 1.25){
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
            this.road.addSegment(nodeAID, nodeBID)
        }
        for(let i = 0; i < this.state.nBackLanes; i++){
            this.road.addSegment(nodeBID, nodeAID)
        }
    }

    showClosestSegmentAndPos(pos){
        push()
        let ellipsePos = pos ? pos : this.road.findClosestSegmentAndPos(mouseX, mouseY).closestPoint
        if(ellipsePos == undefined) return
        stroke(255, 150)
        noFill()
        strokeWeight(1.5)
        ellipse(ellipsePos.x, ellipsePos.y, NODE_RAD * 2)
        pop()
    }

    update(){
        this.road.setPaths()
        this.menu.update()
    }

    show(){
        this.showCurrent()
        this.menu.show()

        if(this.showOptions.SHOW_ROAD) this.road.show()
        if(this.showOptions.SHOW_NODES) this.road.showNodes(this.showOptions.SHOW_TAGS)
        if(this.showOptions.SHOW_PATHS) this.road.showPaths(this.showOptions.SHOW_TAGS, this.showOptions.SHOW_SEGS_DETAILS)
        if(this.showOptions.SHOW_CONNECTORS) this.road.showConnectors()
        if(this.showOptions.SHOW_INTERSECSEGS) this.road.showIntersecSegs()
    }
}

//let currentHash = JSON.stringify(this.road, (key, value) => (key === 'this.road' ? undefined : value))