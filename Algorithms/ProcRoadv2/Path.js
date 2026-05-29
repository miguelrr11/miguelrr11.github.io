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

        this.length = 0
        this.id = nodeA + '-' + nodeB
        this.OOB = false

        this.polygon = null
        this.polygonBase = null
    }

    getCorners(cornersType){
        // if(cornersType == 'base' && this.outlineBase && this.outlineBase.length != 0) return this.outlineBase
        // if(cornersType == 'top' && this.outline && this.outline.length != 0) return this.outline
        //if(this.segments.length == 0) return []
        let first = this.segments[0]
        let last = this.segments[this.segments.length - 1]
        if(!first || !last) return []
        let corners = cornersType === 'base' ? 'corners16' : 'corners'

        let cornersArr = []

        if(first.fromNodeID == this.nodeA){
            cornersArr.push(first[corners][0], first[corners][1])
            cornersArr.push(first[corners][6], first[corners][7])
        }
        else{
            cornersArr.push(first[corners][4], first[corners][5])
            cornersArr.push(first[corners][2], first[corners][3])
        }
        if(last.fromNodeID != this.nodeA){
            cornersArr.push(last[corners][0], last[corners][1])
            cornersArr.push(last[corners][6], last[corners][7])
        }
        else{
            cornersArr.push(last[corners][4], last[corners][5])
            cornersArr.push(last[corners][2], last[corners][3])
        }
        if(cornersType == 'top') this.outline = cornersArr
        else this.outlineBase = cornersArr
        return cornersArr
    }

    triangulate(cornersType){
        return window.earcut(this.getCorners(cornersType));
    }

    constructPolygon(){
        if(this.polygon) this.road.tool.renderer.removePolygon(this.polygon)
        if(this.polygonBase) this.road.tool.renderer.removePolygon(this.polygonBase)
        let tris = this.triangulate('top')
        let arr = new Float32Array(this.outline)
        this.polygon = this.road.tool.renderer.addPolygon(arr, tris)
        let trisBase = this.triangulate('base')
        let arrBase = new Float32Array(this.outlineBase)
        this.polygonBase = this.road.tool.renderer.addPolygon(arrBase, trisBase)
    }

    // debug para ver que triangulate funciona
    renderTris(){
        if(!this.tris || this.tris.length == 0) this.tris = this.triangulate('top')
        push()
        stroke(0, 255, 0, 150)
        strokeWeight(1)
        noFill()
        beginShape(TRIANGLES)
        for(let i = 0; i < this.tris.length; i+=3){
            let p1 = {x: this.outline[this.tris[i]*2], y: this.outline[this.tris[i]*2 + 1]}
            let p2 = {x: this.outline[this.tris[i+1]*2], y: this.outline[this.tris[i+1]*2 + 1]}
            let p3 = {x: this.outline[this.tris[i+2]*2], y: this.outline[this.tris[i+2]*2 + 1]}
            vertex(p1.x, p1.y)
            vertex(p2.x, p2.y)
            vertex(p3.x, p3.y)
        }
        endShape()
        pop()
        delete this.tris
    }

    setOOB(value){
        this.OOB = value == undefined ? this.outOfBounds() : value
    }

    monoDirectional(){
        if(this.segments.length == 1) return true
        let from = this.segments[0].fromNodeID
        for(let s of this.segments){
            if(s.fromNodeID != from) return false
        }
        return true
    }

    getLength(){
        if(this.segmentsIDs.size == 0) return 0
        //just the length of one segment
        let seg = Array.from(this.segmentsIDs)[0]
        let length = this.road.findSegment(seg).getLen()
        return length || 0
    }

    //unoptimized because its not using graphIndex
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
        segment.len = distt(segment.fromPos.x, segment.fromPos.y, segment.toPos.x, segment.toPos.y)

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
            throw new Error('Invalid nodes in path while constructing real lanes:\nnodeA = ' + nodeA + ' | nodeB = ' + nodeB)
            return
        }


        this.orderSegmentsByDirection()

        let fromPos = nodeA.pos
        let toPos = nodeB.pos
        let angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) - PI / 2
        let cosAngle = Math.cos(angle)
        let sinAngle = Math.sin(angle)
        let numLanes = this.segmentsIDs.size
        let totalWidth = numLanes * LANE_WIDTH
        let startOffset = -totalWidth / 2 + LANE_WIDTH / 2
        let dirToNodeB = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x)
        let dirToNodeA = dirToNodeB + PI
        let len = distt(fromPos.x, fromPos.y, toPos.x, toPos.y)

        let i = 0
        this.segmentsIDs.forEach(segmentID => {
            let offset = startOffset + i * LANE_WIDTH
            let laneFromPos = {x: fromPos.x + cosAngle * offset, y: fromPos.y + sinAngle * offset}
            let laneToPos = {x: toPos.x + cosAngle * offset, y: toPos.y + sinAngle * offset}
            let segment = this.road.findSegment(segmentID)
            let nodeFrom = segment.fromNodeID == nodeA.id ? nodeA : nodeB
            let nodeTo = segment.toNodeID == nodeB.id ? nodeB : nodeA
            let dir = nodeFrom.id != this.nodeA ? dirToNodeB : dirToNodeA

            //also we modify the segment to have the new calculated positions
            segment.fromPos = segment.fromNodeID == nodeA.id ? laneFromPos : laneToPos
            segment.toPos = segment.toNodeID == nodeB.id ? laneToPos : laneFromPos
            segment.dir = dir
            segment.len = len
            segment.originalFromPos = {x: segment.fromPos.x, y: segment.fromPos.y}
            segment.originalToPos = {x: segment.toPos.x, y: segment.toPos.y}

            i++
        })
        //this.setSegmentDrawOuterLinesLogic()
        this.length = this.getLength()
        this.width = totalWidth
        this.road.dirtyPolygons.add(this)
    }

    //we also need to set if each line should be cut or not, conditions:
    // if the path has less or equal than 2 segments, all lines are never cut
    // else:
    // the outer most lines (only 2: the ones that touch the outer sides of the path) are never cut, beacuse they are the outer edges
    // the inner lines are cut only if the segment has the enough length for a crosswalk (220)
    // just realized both endings of a segment might need different cut logic, so we need to check them separately
    // okay I give up, im gonna draw the lines dynamically from path
    // this is not used
    setSegmentDrawOuterLinesLogic(){
        let intersectionA = this.road.findIntersection(this.nodeA)
        let intersectionB = this.road.findIntersection(this.nodeB)
        if(!intersectionA || !intersectionB) return
        let nSegsA = intersectionA.paths.length
        let nSegsB = intersectionB.paths.length
        for(let i = 0; i < this.segments.length; i++){
            let segment = this.segments[i]
            segment.getLen()  // we make sure
            let cutAboveFrom = false
            let cutBelowFrom = false
            let cutAboveTo = false
            let cutBelowTo = false
            let dashedAbove = true
            let dashedBelow = true
            let suffLen = segment.len >= 220
            if(segment.fromNodeID == this.nodeA){
                if(i == 0) {dashedBelow = false; dashedAbove = true; cutAboveFrom = suffLen; cutBelowFrom = suffLen; cutAboveTo = suffLen; cutBelowTo = suffLen}
                if(i == this.segments.length-1) {dashedAbove = false; dashedBelow = true; cutAboveFrom = suffLen; cutBelowFrom = suffLen; cutAboveTo = suffLen; cutBelowTo = suffLen}
            }
            else{
                if(i == 0) {dashedAbove = false; dashedBelow = true; cutAboveTo = suffLen; cutBelowTo = suffLen; cutAboveFrom = suffLen; cutBelowFrom = suffLen}
                if(i == this.segments.length-1) {dashedBelow = false; dashedAbove = true; cutAboveTo = suffLen; cutBelowTo = suffLen; cutAboveFrom = suffLen; cutBelowFrom = suffLen}
            }
            if(segment.fromNodeID == this.nodeA){
                if(nSegsA <= 2){
                    cutAboveFrom = false
                    cutBelowFrom = false
                }
            }
            else{
                if(nSegsB <= 2){
                    cutAboveTo = false
                    cutBelowTo = false
                }
            }
            segment.drawOuterLines = {dashedAbove, dashedBelow, cutAboveFrom, cutBelowFrom, cutAboveTo, cutBelowTo}
        }
    }



    showLanes(hoveredSegID = undefined){
        if(this.OOB) return
        this.segmentsIDs.forEach(segmentID => {
            let segment = this.road.findSegment(segmentID)
            segment.showLanes(hoveredSegID)
        })
        push()
        stroke(255)
        strokeWeight(1)
        let fromPos = this.nodeAObj ? this.nodeAObj.pos : this.road.findNode(this.nodeA).pos
        let toPos = this.nodeBObj ? this.nodeBObj.pos : this.road.findNode(this.nodeB).pos
        let widthOfPath = this.width
        let angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) - PI / 2
        let offsetX = Math.cos(angle) * widthOfPath / 2
        let offsetY = Math.sin(angle) * widthOfPath / 2
        line(fromPos.x + offsetX, fromPos.y + offsetY, toPos.x + offsetX, toPos.y + offsetY)
        line(fromPos.x - offsetX, fromPos.y - offsetY, toPos.x - offsetX, toPos.y - offsetY)
        pop()
    }

    showPath(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID = undefined){
        if(this.OOB) return
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
        if(this.OOB) return
        let fromPos = this.nodeAObj.pos
        let toPos = this.nodeBObj.pos
        line(fromPos.x, fromPos.y, toPos.x, toPos.y)
    }

    _drawWayShape(cornersType){
        if(this.OOB) return
        if(this.segments.size == 0) return
        let ctx = drawingContext
        ctx.beginPath()
        let first = this.segments[0]
        let last = this.segments[this.segments.length - 1]
        let corners = cornersType === 'base' ? 'corners16' : 'corners'

        if(first.fromNodeID == this.nodeA){
            ctx.moveTo(first[corners][0], first[corners][1])
            ctx.lineTo(first[corners][6], first[corners][7])
        }
        else{
            ctx.moveTo(first[corners][4], first[corners][5])
            ctx.lineTo(first[corners][2], first[corners][3])
        }
        if(last.fromNodeID != this.nodeA){
            ctx.lineTo(last[corners][0], last[corners][1])
            ctx.lineTo(last[corners][6], last[corners][7])
        }
        else{
            ctx.lineTo(last[corners][4], last[corners][5])
            ctx.lineTo(last[corners][2], last[corners][3])
        }
        ctx.closePath()
        ctx.fill()
    }

    // type: showWays
    showWayBase(){
        this._drawWayShape('base')
    }

    // type: showWays
    showWayTop(hoveredID = undefined){
        this._drawWayShape('top')
    }

    // type: showWays (lineas continuas/discontinuas de los carriles)
    // showEdges(){
    //     if(this.OOB) return
    //     for(let i = 0; i < this.segments.length; i++){
    //         let segment = this.segments[i]
    //         segment.drawLineAbove()
    //         segment.drawLineBelow()
    //     }
    // }

    getNsegsByDir(){
        let countAtoB = 0
        let countBtoA = 0
        this.segments.forEach(segment => {
            if(segment.fromNodeID == this.nodeA) countAtoB++
            else countBtoA++
        })
        return {countAtoB, countBtoA}
    }

    showEdges(){
        if(this.OOB) return
        //debug
        let hoveredID = this.road.tool.state.hoverSegID
        //if(!hoveredID) return

        let len = this.segments[0].getLen()
        let interA = this.road.findIntersection(this.nodeA)
        let interB = this.road.findIntersection(this.nodeB)
        let nPathsA = interA ? interA.paths.length : 0
        let nPathsB = interB ? interB.paths.length : 0
        let moreThan2A = nPathsA > 2
        let moreThan2B = nPathsB > 2
        let changed = false
        let count = this.getNsegsByDir()
        let doubleLine = count.countAtoB > 1 && count.countBtoA > 1
        for(let i = 0; i < this.segments.length; i++){
            let segment = this.segments[i]
           // if(segment.id !== hoveredID) continue
            let nextSeg = this.segments[i+1]
            let fromHere = segment.fromNodeID == this.nodeA 
            if(this.segments.length == 1){
                segment.drawLineAbove(false, false, false)
                segment.drawLineBelow(false, false, false)
                return
            }
            if(fromHere){
                if(i == 0){
                    segment.drawLineBelow(false, false, false); 
                    segment.drawLineAbove(moreThan2A, moreThan2B, true)
                }
                else if(i == this.segments.length-1){
                    segment.drawLineAbove(false, false, false); 
                    segment.drawLineBelow(moreThan2A, moreThan2B, true)
                }
                else {
                    segment.drawLineAbove(moreThan2A, moreThan2B, true); 
                    segment.drawLineBelow(moreThan2A, moreThan2B, true)}
            }
            else{ 
                if(i == 0){
                    segment.drawLineAbove(moreThan2B, moreThan2A, false); 
                    segment.drawLineBelow(moreThan2B, moreThan2A, true)
                }
                else if(i == this.segments.length-1){
                    segment.drawLineBelow(false, false, false); 
                    segment.drawLineAbove(moreThan2B, moreThan2A, true)
                }
                else {
                    segment.drawLineAbove(moreThan2B, moreThan2A, true); 
                    segment.drawLineBelow(moreThan2B, moreThan2A, true)
                }
            }
        }
    }

    // type: showWays (flechas de los carriles)
    showArrows(){
        if(this.OOB) return
        this.segments.forEach(segment => {
            segment.drawArrows()
        })
    }

    showName(){
        if(this.OOB) return
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

    showCarDebug(){
        for(let s of this.segments) s.showCarDebug()
    }
}

