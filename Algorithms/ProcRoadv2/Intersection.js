class Intersection {
    constructor(nodeID){
        this.nodeID = nodeID
        this.nodeObj = undefined
        this.id = nodeID

        //this.connectorsIDs = connectorsIDs            //removed because I dont use it, so memory optimization
        //this.intersecSegsIDs = intersecSegsIDs        //removed because I dont use it, so memory optimization

        this.connectors = []      // Direct object references
        this.intersecSegs = []    // Direct object references
        this.road = undefined     //filled by road.js
        //this.pathsIDs = []      //filled by road.js (removed because I dont use it, so memory optimization)
        this.paths = []           // Direct object references

        this.outline = [] //filled by calculateOutlinesIntersection()  IT IS FLAT (x1, y1, x2, y2, ...)
        this.outline16 = [] //filled by calculateOutlinesIntersection() IT IS FLAT (x1, y1, x2, y2, ...)
        this.edges = []         //filled by calculateOutlinesIntersection()
        this.innerEdges = []    //filled by calculateInnerEdges()
        this.innerLaneEdges = []    //filled by calculateInnerLaneEdges()

        //this.convexHullCalculated = false

    }

        /*
        c0 -------- c1
        |           |
        |           |
        |           |
        c3 -------- c4
    */

        //needs improving
    outOfBounds(){
        return this.nodeObj.OOB
    }

    // returns a map with keys as "fromSegmentID_toSegmentID" and values as true/false depending on whether the intersegment that connects them is active or not
    getActivenessMap(){
        let map = new Map()
        let segs = this.intersecSegs
        for(let seg of segs){
            if(seg){
                let fromConn = seg.fromConnector || this.road.findConnector(seg.fromConnectorID)
                let toConn = seg.toConnector || this.road.findConnector(seg.toConnectorID)
                let fromSegID = fromConn.incomingSegmentIDs[0]
                let toSegID = toConn.outgoingSegmentIDs[0]
                map.set(fromSegID + '_' + toSegID, seg.active)
            }
        }
        return map
    }

    drawOutlineDebug(){
        if(!this.outline) return
        push()
        noFill()
        stroke(0, 255, 0, 200)
        strokeWeight(1.5)
        beginShape()
        for(let i = 0; i < this.outline.length; i+=2){
            vertex(this.outline[i], this.outline[i+1])
        }
        endShape(CLOSE)
        pop()

        //debug
        push()
        for(let p of this.debugpoints){
            stroke(255, 0, 0)
            fill(255, 0, 0)
            ellipse(p.p.x, p.p.y, 5)
            stroke(0, 0, 255)
            fill(0, 0, 255)
            ellipse(p.m.x, p.m.y, 5)
            stroke(255)
            line(p.p.x, p.p.y, p.m.x, p.m.y)
        }
        pop()
    }

    drawIntersectionAreaMarkings(){
        if(this.corners.length != 4) return
        beginShape()
        for(let v of this.corners) vertex(v.x, v.y)
        endShape(CLOSE)
        for(let gridLine of this.grid){
            line(gridLine[0].x, gridLine[0].y, gridLine[1].x, gridLine[1].y)
        }
    }

    showSelected(){
        if(!this.outlineExists()) return
        push()
        noFill()
        stroke(255)
        strokeWeight(2.5)
        beginShape()
        for(let i = 0; i < this.outline.length; i+=2){
            vertex(this.outline[i], this.outline[i+1])
        }
        endShape(CLOSE)
        pop()
    }

    // shows the selected connector and all segments going out from it within this intersection
    // it also shows the connectors connected to those segments with the correct colors to indicate if its active or not
    showSelectedConnectorAndSegments(connID){
        let conn = this.connectors.find(c => c.id == connID) || this.road.findConnector(connID)
        if(conn) conn.showSelected()
        let segs = this.intersecSegs
        for(let seg of segs){
            if(seg.fromConnectorID == connID && !seg.active){
                seg.showBezier(false)
                let outConn = seg.toConnector || this.road.findConnector(seg.toConnectorID)
                if(outConn) {
                    outConn.showActiveness(seg.active)
                }
            }
        }
        for(let seg of segs){
            if(seg.fromConnectorID == connID && seg.active){
                seg.showBezier(false)
                let outConn = seg.toConnector || this.road.findConnector(seg.toConnectorID)
                if(outConn) {
                    outConn.showActiveness(seg.active)
                }
            }
        }
    }

    showConnectorsAndSegments(){
        let conns = this.connectors.length
        for(let conn of conns){
            if(conn) conn.show(false, true)
        }
        let segs = this.intersecSegs
        for(let seg of segs){
            if(seg) seg.showBezier(false)
        }
    }

    findHoverConnector(x, y){
        let conns = this.connectors.length > 0
        for(let conn of conns){
            if(conn && conn.hover(x, y)) return conn
        }
        return undefined
    }

    toggleActivenessOfSeg(fromConnID, toConnID){
        let segs = this.intersecSegs
        for(let seg of segs){
            if(seg.toConnectorID == toConnID && seg.fromConnectorID == fromConnID){
                seg.active = !seg.active
                return
            }
        }
    }

    findHoveredConnectorsOfSelectedConnector(selectedConnID, x, y){
        let possibleConnectors = []
        let segs = this.intersecSegs
        for(let seg of segs){
            if(seg.fromConnectorID == selectedConnID){
                let outConn = seg.toConnector || this.road.findConnector(seg.toConnectorID)
                if(outConn) possibleConnectors.push(outConn)
            }
        }
        for(let conn of possibleConnectors){
            if(conn.hover(x, y)) return conn
        }
        return undefined
    }

    calculateOutlinesIntersection(){
        let outline16 = this.getOutline(true).curves
        let obj = this.getOutline()
        let outline = obj.curves

        this.outline = []
        this.outline16 = []

        // flattening the arrays of points
        for(let p of outline16) this.outline16.push(p.x, p.y)
        for(let p of outline) this.outline.push(p.x, p.y)

        this.corners = obj.corners.corners
        //this.grid = obj.corners.grid
        this.edges = this.getOutline(false, true).curves
        return
    }

    //not used
    extendOutline(points, distance){
        let extendedPoints = []
        let centerPos = getCentroid(points)
        let n = points.length
        for(let i = 0; i < n; i++){
            let p = points[i]
            let dirToCenter = Math.atan2(centerPos.y - p.y, centerPos.x - p.x)
            let newPoint = {
                x: p.x - Math.cos(dirToCenter) * distance,
                y: p.y - Math.sin(dirToCenter) * distance
            }
            extendedPoints.push(newPoint)
        }
        return extendedPoints
    }

    outlineExists(){
        return this.outline.length > 0 && this.outline16.length > 0
    }

    drawOutlineDebug(){
        // this.drawOutlineDebug()
        // return


        if(!this.outlineExists()) return
        push()
        noFill()
        stroke(0, 255, 0, 200)
        strokeWeight(2)
        beginShape()
        for(let i = 0; i < this.outline.length; i+=2){
            vertex(this.outline[i], this.outline[i+1])
        }
        endShape(CLOSE)
        stroke(255, 0, 0, 200)
        beginShape()
        for(let i = 0; i < this.outline16.length; i+=2){
            vertex(this.outline16[i], this.outline16[i+1])
        }
        endShape(CLOSE)
        pop()
    }



    // type: showWays
    showWayBase(){
        if(this.nodeObj.OOB) return
        beginShape()
        for(let i = 0; i < this.outline16.length; i+=2){
            vertex(this.outline16[i], this.outline16[i+1])
        }
        endShape()
    }

    // type: showWays
    showWayTop(){
        if(this.nodeObj.OOB) return
        beginShape()
        for(let i = 0; i < this.outline.length; i+=2){
            vertex(this.outline[i], this.outline[i+1])
        }
        endShape()
    }

    // type: showWays (son las lineas blancas pegadas a la acera)
    showOuterEdges(){
        if(this.nodeObj.OOB) return
        for(let edge of this.edges){
            beginShape()
            for(let v of edge) vertex(v.x, v.y)
            endShape()
        }
    }

    calculateInnerEdges(){
        this.innerEdges = []
        if(this.paths.length < 2) return
        let segs = []
        for(let p of this.paths){
            if(p.segments.length == 1) continue
            if(p.monoDirectional()) continue

            let changingSeg = undefined
            let segments = p.segments[0].toNodeID == this.nodeID ? p.segments : p.segments.toReversed()
            for(let i = 0; i < segments.length; i++){
                let seg = segments[i]
                if(seg.toNodeID != this.nodeID){
                    changingSeg = segments[i-1]
                    break
                }
            }
            segs.push(changingSeg)
        }
    

        let nodePos = this.road.findNode(this.nodeID).pos
        let bpMap = new Map()
        for(let firstSeg of segs){
            for(let secSeg of segs){
                if(firstSeg == secSeg) continue
                if(bpMap.has(firstSeg.id + '_' + secSeg.id) || bpMap.has(secSeg.id + '_' + firstSeg.id)) continue

                let s1, s2
                s1 = firstSeg
                s2 = secSeg
                
                let inSegFromPos = {x: s1.corners[4], y: s1.corners[5]}
                let outSegToPos = {x: s2.corners[4], y: s2.corners[5]}

                let d = dist(inSegFromPos.x, inSegFromPos.y, outSegToPos.x, outSegToPos.y)
                let length = d * LANE_WIDTH * 0.02
                let tension = TENSION_BEZIER_MAX

                let controlPointBez1
                let dir1 = s1.dir 
                controlPointBez1 = {x: inSegFromPos.x + Math.cos(dir1) * length, 
                                    y: inSegFromPos.y + Math.sin(dir1) * length}

                let controlPointBez2
                let dir2 = s2.dir
                controlPointBez2 = {x: outSegToPos.x + Math.cos(dir2) * length, 
                                    y: outSegToPos.y + Math.sin(dir2) * length}

                let bp = bezierPoints(controlPointBez1, inSegFromPos, outSegToPos, controlPointBez2, LENGTH_SEG_BEZIER, tension)
                bpMap.set(firstSeg.id + '_' + secSeg.id, bp)
                this.innerEdges.push(bp)
            }
        }

        if(this.innerEdges.length == 0) this.innerEdges = null

        this.calculateInnerLaneEdges()
    }

    // type: showWays
    showInnerEdges(){
        if(this.nodeObj.OOB) return
        
        if(this.innerEdges && this.innerEdges.length > 0){
            for(let p of this.innerEdges) {
                for(let i = 0; i < p.length; i+= this.paths.length > 2 ? 2 : 1){
                    let p1 = p[i]
                    let p2 = p[Math.min(i+1, p.length-1)]
                    line(p1.x, p1.y, p2.x, p2.y)
                }
            }
        }
        
        if(this.innerLaneEdges && this.innerLaneEdges.length > 0){
            for(let p of this.innerLaneEdges) {
                for(let i = 0; i < p.length; i += 2){
                    let p1 = p[i]
                    let p2 = p[Math.min(i+1, p.length-1)]
                    line(p1.x, p1.y, p2.x, p2.y)
                }
            }
        }
        
    }

    // son las lineas discontinuas que pasan por las intersecciones para separar carriles de MISMO sentido,
    // solo funciona en intersecciones con 2 paths
    calculateInnerLaneEdges(){
        this.innerLaneEdges = []
        if(this.paths.length != 2) return
        let pairs = []
        
        for(let p of this.paths){
            if(p.segments.length == 1) continue
            let segments = p.segments[0].toNodeID == this.nodeID ? p.segments : p.segments.toReversed()
            
            for(let other of this.paths){
                if(p == other) continue
                if(p.segments.length == 1) continue
                let otherSegments = other.segments[0].toNodeID == this.nodeID ? other.segments : other.segments.toReversed()

                let nLanesToHereP = 0
                let nLanesFromHereOther = 0

                for(let s of segments) if(s.toNodeID == this.nodeID) nLanesToHereP++
                for(let s of otherSegments) if(s.fromNodeID == this.nodeID) nLanesFromHereOther++

                if(nLanesToHereP != nLanesFromHereOther){
                    let minLanes = Math.min(nLanesToHereP, nLanesFromHereOther)
                    for(let i = 0; i < minLanes-1; i++){
                        pairs.push({from: segments[i], to: otherSegments[otherSegments.length-i-1]})
                    }
                }
                if(nLanesToHereP == nLanesFromHereOther){
                    
                    for(let i = 0; i < nLanesToHereP-1; i++){
                        pairs.push({from: segments[i], to: otherSegments[otherSegments.length-i-1]})
                    }
                }
                
            }

        } //A-B, D-C

        let nodePos = this.road.findNode(this.nodeID).pos
        let bpMap = new Map()
        for(let pair of pairs){
            let s1 = pair.from
            let s2 = pair.to
            if(bpMap.has(s1.id + '_' + s2.id) || bpMap.has(s2.id + '_' + s1.id)) continue

            let inSegFromPos = {x: s1.corners[4], y: s1.corners[5]}
            let outSegToPos = {x: s2.corners[2], y: s2.corners[3]}

            let tension = TENSION_BEZIER_MAX
            let d = dist(inSegFromPos.x, inSegFromPos.y, outSegToPos.x, outSegToPos.y)
            let length = d * LANE_WIDTH * 0.02


            let controlPointBez1
            let dir1 = s1.dir 
            controlPointBez1 = {x: inSegFromPos.x + Math.cos(dir1) * length, 
                                y: inSegFromPos.y + Math.sin(dir1) * length}

            let controlPointBez2
            let dir2 = s2.dir + PI
            controlPointBez2 = {x: outSegToPos.x + Math.cos(dir2) * length, 
                                y: outSegToPos.y + Math.sin(dir2) * length}

            let bp = bezierPoints(controlPointBez1, inSegFromPos, outSegToPos, controlPointBez2, LENGTH_SEG_BEZIER*.6, tension)
            bpMap.set(s1.id + '_' + s2.id, bp)
            this.innerLaneEdges.push(bp)
        }

        if(this.innerLaneEdges.length == 0) this.innerLaneEdges = null
    }

    // type: showWays
    showYieldMarkings(){
        if(this.nodeObj.OOB) return
        // find all segments that feed into this intersection
        let paths = this.paths.length > 0 ? this.paths : this.road.findAnyPath(this.nodeID)
        if(paths.length > 2){
            for(let i = 0; i < paths.length; i++){
                let path = paths[i]
                if(path){
                    let segmentsEndingHere = path.getSegmentsEndingAtNode(this.nodeID)
                    segmentsEndingHere.forEach(segment => {
                        let yieldPos = segment.yieldPos
                        if(yieldPos && yieldPos[0] != undefined){
                            line(yieldPos[0].x, yieldPos[0].y, yieldPos[1].x, yieldPos[1].y)
                        }
                    });
                }
            }
        }
    }

    showDirectionsIntersection(){
        if(this.nodeObj.OOB) return
        let paths = this.paths.length > 0 ? this.paths : this.road.findAnyPath(this.nodeID)
        if(paths.length > 2){
            for(let i = 0; i < paths.length; i++){
                let path = paths[i]
                if(path){
                    let segmentsEndingHere = path.getSegmentsEndingAtNode(this.nodeID)
                    segmentsEndingHere.forEach(segment => {
                        segment.drawDirectionsIntersection()
                    });
                }
            }
        }
    }



    // supposes that the corners of segments DO NOT overlap with other paths, if they do, the outline will be wrong because
    // the sorting of points will be affected. The fix for this was to set the width of Road.js (lines 914-915) to BIG_LANE_WIDTH instead of LANE_WIDTH
    getOutline(is16 = false, separatedCurves = false){
        function orderClockwisePos(center, points) {
            return points.slice().sort((a, b) => {
                const angleA = Math.atan2(a.pos.y - center.y, a.pos.x - center.x);
                const angleB = Math.atan2(b.pos.y - center.y, b.pos.x - center.x);
                return angleA - angleB;
            });
        }

        function getCorners(segment){
            return is16 ? segment.corners16 : segment.corners
        }

        let firstSegmentPoss = []
        let lastSegmentPoss = []
        let paths = this.paths.length > 0 ? this.paths : this.road.findAnyPath(this.id)
        for(let p of paths){
            let firstSeg = p.nodeA == this.nodeID ? p.segments[0] : p.segments[p.segments.length - 1]
            let lastSeg = p.nodeA != this.nodeID ? p.segments[0] : p.segments[p.segments.length - 1]
            if(firstSeg) {
                let index = firstSeg.toNodeID == this.nodeID ? 4 : 0
                let pos = {x: getCorners(firstSeg)[index], y: getCorners(firstSeg)[index+1]}
                firstSegmentPoss.push({pos: pos, seg: firstSeg, path: p})
            }
            if(lastSeg) {
                let index = lastSeg.toNodeID == this.nodeID ? 6 : 2
                let pos = {x: getCorners(lastSeg)[index], y: getCorners(lastSeg)[index+1]}
                lastSegmentPoss.push({pos: pos, seg: lastSeg, path: p})
            }
        }

        let all = [...firstSegmentPoss, ...lastSegmentPoss]
        let allPoss = orderClockwisePos(this.road.findNode(this.nodeID).pos, all).reverse()


        if(!lastSegmentPoss.includes(allPoss[0])){
            allPoss.push(allPoss.shift());
        }

        for(let i = 0; i < allPoss.length; i++){
            let poss = allPoss[i]
            let nextPoss = (i % 2 == 0) ? allPoss[(i+1) % allPoss.length] : ((i == 0) ? allPoss[allPoss.length - 1] : allPoss[(i-1) % allPoss.length])
            let point = poss.pos
            let seg = poss.seg
            let dir = seg.dir
            if(seg.fromNodeID == this.nodeID) dir += PI
            let d = dist(point.x, point.y, nextPoss.pos.x, nextPoss.pos.y)
            let length = d * LANE_WIDTH * 0.02
            allPoss[i].newPos = {x: point.x + Math.cos(dir) * length, y: point.y + Math.sin(dir) * length}
            poss.dir = seg.dir
        }

        let curves = []
        let corners = []
        let nodePos = this.road.findNode(this.nodeID).pos

        for (let i = 0; i < allPoss.length; i += 2) {
            let a = allPoss[i].newPos
            let b = allPoss[i].pos
            let c = allPoss[(i + 1) % allPoss.length].pos
            let d = allPoss[(i + 1) % allPoss.length].newPos
            let tension = TENSION_BEZIER_MAX
            let bz = bezierPoints(a, b, c, d, LENGTH_SEG_BEZIER_INTER, tension)
            separatedCurves ? curves.push(bz) : curves.push(...bz)

            let minDistToNode = Infinity
            for (let v of bz) {
                let d = squaredDistance(v.x, v.y, nodePos.x, nodePos.y)
                if (d < minDistToNode) minDistToNode = d
            }
            let distToUse = minDistToNode * 0.8

            let cx = (b.x + c.x) * 0.5
            let cy = (b.y + c.y) * 0.5
            let midToNode = squaredDistance(cx, cy, nodePos.x, nodePos.y)

            let shift = midToNode - Math.min(distToUse, midToNode)
            shift = Math.sqrt(shift)
            let dir = Math.atan2(cy - nodePos.y, cx - nodePos.x)
            let cornerPoint = {
                x: cx - Math.cos(dir) * shift,
                y: cy - Math.sin(dir) * shift
            }
            corners.push(cornerPoint)
        }


        return {curves, corners: {corners, grid: corners.length == 4 ? gridLines(corners, {spacing: 18, angle: 65, origin: nodePos}) : null}}
    }

}