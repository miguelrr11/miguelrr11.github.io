class Path{
    constructor(nodeA, nodeB, segmentIDs){
        if(nodeA == undefined || nodeB == undefined || segmentIDs == undefined)
            console.warn('Invalid arguments while creating Path:\nnodeA = ' + nodeA + ' | nodeB = ' + nodeB + ' | segmentIDs = ' + segmentIDs)
        // a Set of segment IDs that form this path
        this.segmentsIDs = segmentIDs
        this.segments = [] //filled with setSegmentsIDs - Direct object references
        this.road = undefined

        this.nodeA = nodeA
        this.nodeB = nodeB
        this.nodeAObj = undefined  // Direct object reference
        this.nodeBObj = undefined  // Direct object reference

        this.id = nodeA + '_' + nodeB

        this.name = undefined

        this.corners = []  
        this.corners16 = []  
    }

    outOfBounds(){
        let fromPos = this.nodeAObj ? this.nodeAObj.pos : this.road.findNode(this.nodeA).pos
        let toPos = this.nodeBObj ? this.nodeBObj.pos : this.road.findNode(this.nodeB).pos
        if(!inBoundsCorners(fromPos.x, fromPos.y, GLOBAL_EDGES) && 
        !inBoundsCorners(toPos.x, toPos.y, GLOBAL_EDGES) &&
        !lineIntersection(fromPos, toPos, {x: GLOBAL_EDGES[0], y: GLOBAL_EDGES[2]}, {x: GLOBAL_EDGES[1], y: GLOBAL_EDGES[2]}) &&
        !lineIntersection(fromPos, toPos, {x: GLOBAL_EDGES[1], y: GLOBAL_EDGES[2]}, {x: GLOBAL_EDGES[0], y: GLOBAL_EDGES[3]}) &&
        !lineIntersection(fromPos, toPos, {x: GLOBAL_EDGES[0], y: GLOBAL_EDGES[3]}, {x: GLOBAL_EDGES[1], y: GLOBAL_EDGES[3]}) &&
        !lineIntersection(fromPos, toPos, {x: GLOBAL_EDGES[1], y: GLOBAL_EDGES[3]}, {x: GLOBAL_EDGES[0], y: GLOBAL_EDGES[2]})) return true
        return false
    }

    /*
      
        c0 ------- c1
        |           |
        |           |
        |           |
        c2--------- c3

     */

    getSegmentsEndingAtNode(nodeID){
        let res = []
        this.segments.forEach(segment => {
            if(segment.toNodeID == nodeID) res.push(segment)
        })
        return res
    }


    setSegmentsIDs(segmentIDs){
        //a set
        this.segmentsIDs = segmentIDs
        this.segments = Array.from(this.segmentsIDs).map(id => this.road.findSegment(id))

        // Populate node object references immediately when road is available
        if(this.road) {
            this.nodeAObj = this.road.findNode(this.nodeA)
            this.nodeBObj = this.road.findNode(this.nodeB)
        }

        let name = undefined
        this.segments.forEach(segment => {
            if(segment.name != undefined){
                name = segment.name
            }
        })
        this.name = name
    }

    // gets the outline of all the lanes
    //not used
    constructCorners(){
        if(this.segmentsIDs.size == 0) return
        let corners = []
        let corners16 = []
        let first = this.segments[0]
        let last = this.segments[this.segments.length - 1]
        if(first.fromNodeID == this.nodeA){
            corners.push(first.corners[0], first.corners[3])
            corners16.push(first.corners16[0], first.corners16[3])
        }
        else{
            corners.push(first.corners[2], first.corners[1])
            corners16.push(first.corners16[2], first.corners16[1])
        }
        if(last.fromNodeID != this.nodeA){
            corners.push(last.corners[0], last.corners[3])
            corners16.push(last.corners16[0], last.corners16[3])
        }
        else{
            corners.push(last.corners[2], last.corners[1])
            corners16.push(last.corners16[2], last.corners16[1])
        }
        this.corners = corners
        this.corners16 = corners16
    }

    //not used
    getRealPos(segID){
        let segment = this.road.findSegment(segID)
        if(!segment) return null
        let nodeA = this.nodeAObj || this.road.findNode(this.nodeA)
        let nodeB = this.nodeBObj || this.road.findNode(this.nodeB)

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
        let nodeFrom = segment.fromNode || this.road.findNode(segment.fromNodeID)
        let nodeTo = segment.toNode || this.road.findNode(segment.toNodeID)
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
        //let fromNodeID = reverse ? this.nodeB : this.nodeA
        let fromNodeID = this.nodeA
        for(let i = 0; i < segArr.length; i++){
            if(segArr[i].fromNodeID == fromNodeID) res.push(segArr[i])
        }
        for(let i = 0; i < segArr.length; i++){
            if(segArr[i].fromNodeID != fromNodeID) res.push(segArr[i])
        }
        if(reverse) res.reverse()
        let segs = new Set(res.map(s => s.id))
        this.setSegmentsIDs(segs)
    }
 

    // Coje la posicion de los nodos, y el numero de lanes y construye sus propios carriles reales con posiciones calculadas
    // funcion extremadamente importante
    constructRealLanes(){
        let nodeA = this.nodeAObj || this.road.findNode(this.nodeA)
        let nodeB = this.nodeBObj || this.road.findNode(this.nodeB)
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
            let nodeFrom = segment.fromNode || this.road.findNode(segment.fromNodeID)
            let nodeTo = segment.toNode || this.road.findNode(segment.toNodeID)
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

    //nope
    constructRealLanesCurved(controlPoint = this.controlPoint){
        let nodeA = this.nodeAObj || this.road.findNode(this.nodeA)
        let nodeB = this.nodeBObj || this.road.findNode(this.nodeB)
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

            // Offset the control point for this lane so curves remain parallel
            let laneControlPoint = {x: controlPoint.x + Math.cos(angle) * offset, y: controlPoint.y + Math.sin(angle) * offset}

            let segment = this.road.findSegment(segmentID)
            let nodeFrom = segment.fromNode || this.road.findNode(segment.fromNodeID)
            let nodeTo = segment.toNode || this.road.findNode(segment.toNodeID)
            let dir = Math.atan2(nodeTo.pos.y - nodeFrom.pos.y, nodeTo.pos.x - nodeFrom.pos.x) - PI

            let dirfromControl = Math.atan2(laneControlPoint.y - laneFromPos.y, laneControlPoint.x - laneFromPos.x) - PI
            let dirtoControl = Math.atan2(laneControlPoint.y - laneToPos.y, laneControlPoint.x - laneToPos.x) - PI
            let d = dist(fromPos.x, fromPos.y, toPos.x, toPos.y)
            let anchor1 = {x: laneFromPos.x + Math.cos(dirfromControl) * d, y: laneFromPos.y + Math.sin(dirfromControl) * d}
            let anchor2 = {x: laneToPos.x + Math.cos(dirtoControl) * d, y: laneToPos.y + Math.sin(dirtoControl) * d}

            let segBezierPoints = bezierPoints(anchor1, laneFromPos, laneToPos, anchor2, 3, .5)

            segment.curve = segBezierPoints

            //also we modify the segment to have the new calculated positions
            segment.fromPos = segment.fromNodeID == nodeA.id ? laneFromPos : laneToPos
            segment.toPos = segment.toNodeID == nodeB.id ? laneToPos : laneFromPos
            segment.dir = dir
            segment.len = dist(segment.fromPos.x, segment.fromPos.y, segment.toPos.x, segment.toPos.y)
            segment.originalFromPos = {x: segment.fromPos.x, y: segment.fromPos.y}
            segment.originalToPos = {x: segment.toPos.x, y: segment.toPos.y}

            segment.constructCorners()
            i++
        })
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
            let indexOfSeg = Array.from(this.segmentsIDs).indexOf(segmentID)
            let segment = this.road.findSegment(segmentID)
            if(segment) segment.showPath(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID, indexOfSeg)
        })
        push()
        if(this.controlPoint){
            noFill()
            strokeWeight(1.5)
            stroke(255, 200)
            ellipse(this.controlPoint.x, this.controlPoint.y, NODE_RAD * 2)
        }
        pop()
    }

    showSimple(){
        let fromPos = this.nodeAObj ? this.nodeAObj.pos : this.road.findNode(this.nodeA).pos
        let toPos = this.nodeBObj ? this.nodeBObj.pos : this.road.findNode(this.nodeB).pos
        line(fromPos.x, fromPos.y, toPos.x, toPos.y)
    }

    _drawWayShape(cornersType){
        if(this.outOfBounds()) return
        if(this.segments.size == 0) return
        beginShape()
        let first = this.segments[0]
        let last = this.segments[this.segments.length - 1]
        let corners = cornersType === 'base' ? 'corners16' : 'corners'

        if(first.fromNodeID == this.nodeA){
            vertex(first[corners][0].x, first[corners][0].y)
            vertex(first[corners][3].x, first[corners][3].y)
        }
        else{
            vertex(first[corners][2].x, first[corners][2].y)
            vertex(first[corners][1].x, first[corners][1].y)
        }
        if(last.fromNodeID != this.nodeA){
            vertex(last[corners][0].x, last[corners][0].y)
            vertex(last[corners][3].x, last[corners][3].y)
        }
        else{
            vertex(last[corners][2].x, last[corners][2].y)
            vertex(last[corners][1].x, last[corners][1].y)
        }
        endShape(CLOSE)
    }

    // type: showWays
    showWayBase(){
        this._drawWayShape('base')
        // this.segments.forEach(segment => {
        //     segment.showCustomLanes(SIDE_WALK_COL, BIG_LANE_WIDTH)
        // })
    }

    // type: showWays
    showWayTop(hoveredID = undefined){
        this._drawWayShape('top')
        // this.segments.forEach(segment => {
        //     segment.showCustomLanes(ROAD_COL, LANE_WIDTH, hoveredID)
        // })
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

    showName(){
        if(this.name == undefined) return
        let nodeA = this.nodeAObj || this.road.findNode(this.nodeA)
        let nodeB = this.nodeBObj || this.road.findNode(this.nodeB)
        if(!nodeA || !nodeB) return
        let seg = this.segments[0]
        if(!seg || seg.len < 300) return
        let angle = seg.dir
        push()
        let fromPos = nodeA.pos
        let toPos = nodeB.pos
        let midPos = {x: (fromPos.x + toPos.x) / 2, y: (fromPos.y + toPos.y) / 2}
        translate(midPos.x, midPos.y)
        rotate(angle)
        text(this.name, 0, 0)
        pop()
    }
}

