class Path{
    constructor(nodeA, nodeB, segmentIDs){
        if(nodeA == undefined || nodeB == undefined || segmentIDs == undefined)
            console.warn('Invalid arguments while creating Path:\nnodeA = ' + nodeA + ' | nodeB = ' + nodeB + ' | segmentIDs = ' + segmentIDs)
        // a Set of segment IDs that form this path
        this.segmentsIDs = segmentIDs
        this.segments = [] //filled with setSegmentsIDs
        this.road = undefined

        this.nodeA = nodeA
        this.nodeB = nodeB

        this.id = nodeA + '_' + nodeB

    }

    /*
      
        c0 ------- c1
        |           |
        |           |
        |           |
        c2--------- c3

     */


    setSegmentsIDs(segmentIDs){
        //a set
        this.segmentsIDs = segmentIDs
        this.segments = Array.from(this.segmentsIDs).map(id => this.road.findSegment(id))
    }

    // gets the outline of all the lanes
    constructWholePoints(){
        if(this.segmentsIDs.size == 0) return
        let fromPos = this.road.findNode(this.nodeA).pos
        let toPos = this.road.findNode(this.nodeB).pos
        let corners = getCornersOfLine(fromPos, toPos, (this.segmentsIDs.size * LANE_WIDTH))
        return corners
    }

    getRealPos(segID){
        let segment = this.road.findSegment(segID)
        if(!segment) return null
        let nodeA = this.road.findNode(this.nodeA)
        let nodeB = this.road.findNode(this.nodeB)

        let fromPos = nodeA.pos
        let toPos = nodeB.pos
        let angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) - PI / 2
        let numLanes = this.segmentsIDs.size
        let totalWidth = numLanes * LANE_WIDTH
        let startOffset = -totalWidth / 2 + LANE_WIDTH / 2

        let segArr = Array.from(this.segmentsIDs)
        let i = segArr.indexOf(segID)
        if(i == -1) return null
        let offset = startOffset + i * LANE_WIDTH
        let laneFromPos = {x: fromPos.x + Math.cos(angle) * offset, y: fromPos.y + Math.sin(angle) * offset}
        let laneToPos = {x: toPos.x + Math.cos(angle) * offset, y: toPos.y + Math.sin(angle) * offset}
        let nodeFrom = this.road.findNode(segment.fromNodeID)
        let nodeTo = this.road.findNode(segment.toNodeID)
        let dir = Math.atan2(nodeTo.pos.y - nodeFrom.pos.y, nodeTo.pos.x - nodeFrom.pos.x) - PI

        //also we modify the segment to have the new calculated positions
        segment.fromPos = segment.fromNodeID == nodeA.id ? laneFromPos : laneToPos
        segment.toPos = segment.toNodeID == nodeB.id ? laneToPos : laneFromPos
        segment.dir = dir
        segment.len = dist(segment.fromPos.x, segment.fromPos.y, segment.toPos.x, segment.toPos.y)

        return {fromPos: segment.fromPos, toPos: segment.toPos}
    }

    // orders segments in the direction from nodeA to nodeB
    orderSegmentsByDirection(reverse = false){
        let res = []
        let segArr = Array.from(this.segmentsIDs).map(id => this.road.findSegment(id))
        let fromNodeID = reverse ? this.nodeB : this.nodeA
        for(let i = 0; i < segArr.length; i++){
            if(segArr[i].fromNodeID == fromNodeID) res.push(segArr[i])
        }
        for(let i = 0; i < segArr.length; i++){
            if(segArr[i].fromNodeID != fromNodeID) res.push(segArr[i])
        }
        let segs = new Set(res.map(s => s.id))
        this.setSegmentsIDs(segs)
    }
 

    // Coje la posicion de los nodos, y el numero de lanes y construye sus propios carriles reales con posiciones calculadas
    // funcion extremadamente importante
    constructRealLanes(){
        let nodeA = this.road.findNode(this.nodeA)
        let nodeB = this.road.findNode(this.nodeB)
        if(!nodeA || !nodeB) {
            console.warn('Invalid nodes in path while constructing real lanes:\nnodeA = ' + nodeA + ' | nodeB = ' + nodeB)
            return
        }

        this.orderSegmentsByDirection()
        
        let fromPos = nodeA.pos
        let toPos = nodeB.pos
        let angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) - PI / 2
        let numLanes = this.segmentsIDs.size
        let totalWidth = numLanes * LANE_WIDTH
        let startOffset = -totalWidth / 2 + LANE_WIDTH / 2

        let i = 0
        this.segmentsIDs.forEach(segmentID => {
            let offset = startOffset + i * LANE_WIDTH
            let laneFromPos = {x: fromPos.x + Math.cos(angle) * offset, y: fromPos.y + Math.sin(angle) * offset}
            let laneToPos = {x: toPos.x + Math.cos(angle) * offset, y: toPos.y + Math.sin(angle) * offset}
            let segment = this.road.findSegment(segmentID)
            let nodeFrom = this.road.findNode(segment.fromNodeID)
            let nodeTo = this.road.findNode(segment.toNodeID)
            let dir = Math.atan2(nodeTo.pos.y - nodeFrom.pos.y, nodeTo.pos.x - nodeFrom.pos.x) - PI

            //also we modify the segment to have the new calculated positions
            segment.fromPos = segment.fromNodeID == nodeA.id ? laneFromPos : laneToPos
            segment.toPos = segment.toNodeID == nodeB.id ? laneToPos : laneFromPos
            segment.dir = dir
            segment.len = dist(segment.fromPos.x, segment.fromPos.y, segment.toPos.x, segment.toPos.y)
            segment.originalFromPos = {x: segment.fromPos.x, y: segment.fromPos.y}
            segment.originalToPos = {x: segment.toPos.x, y: segment.toPos.y}

            i++
        })
        this.setSegmentDrawOuterLinesLogic()
    }

    setSegmentDrawOuterLinesLogic(){
        for(let i = 0; i < this.segments.length; i++){
            let segment = this.segments[i]
            let dashedAbove = undefined
            let dashedBelow = undefined
            if(segment.fromNodeID == this.nodeA){
                if(i - 1 < 0 || this.segments[i-1].fromNodeID != this.segments[i].fromNodeID) dashedBelow = false
                else dashedBelow = true
                if(i + 1 > this.segments.length-1 || this.segments[i+1].fromNodeID != this.segments[i].fromNodeID) dashedAbove = false
                else dashedAbove = true
            }
            else{
                if(i - 1 < 0 || this.segments[i-1].fromNodeID != this.segments[i].fromNodeID) dashedAbove = false
                else dashedAbove = true
                if(i + 1 > this.segments.length-1 || this.segments[i+1].fromNodeID != this.segments[i].fromNodeID) dashedBelow = false
                else dashedBelow = true
            }
            segment.drawOuterLinesAboveDashed = dashedAbove
            segment.drawOuterLinesBelowDashed = dashedBelow
        }
    }

    showLanes(hoveredSegID = undefined){
        this.segmentsIDs.forEach(segmentID => {
            let segment = this.road.findSegment(segmentID)
            segment.showLanes(hoveredSegID)
        })
    }

    showPath(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID = undefined){
        this.segmentsIDs.forEach(segmentID => {
            let segment = this.road.findSegment(segmentID)
            if(segment) segment.showPath(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID)
        })
    }

    // gets all points of all lanes and draws the full road
    // the render bug when intersegs are touching each other is because the calculation of corners fails because we dont get the correct direction
    // we should force segments to have a minimum length, or we should calculate the corners in a different way

    // type: showWays
    showWayBase(){
        this.segments.forEach(segment => {
            segment.showCustomLanes([200], LANE_WIDTH*1.6)
        })
    }

    // type: showWays
    showWayTop(hoveredID = undefined){
        this.segments.forEach(segment => {
            segment.showCustomLanes([100], LANE_WIDTH, hoveredID)
        })
    }

    // type: showWays
    showEdges(){
        for(let i = 0; i < this.segments.length; i++){
            let segment = this.segments[i]
            segment.drawLineAbove(segment.drawOuterLinesAboveDashed)
            segment.drawLineBelow(segment.drawOuterLinesBelowDashed)
        }
    }

    // type: showWays
    showArrows(){
        this.segments.forEach(segment => {
            segment.drawArrows()
        })
    }
}

