class Intersection {
    constructor(nodeID, connectorsIDs, intersecSegsIDs){
        this.nodeID = nodeID
        this.id = nodeID
        this.connectorsIDs = connectorsIDs
        this.intersecSegsIDs = intersecSegsIDs
        this.road = undefined     //filled by road.js
        this.pathsIDs = []        //filled by road.js

        this.convexHullPoints = [] //filled by calculateconvexHullAllSegments()
        this.convexHullPoints16 = [] //filled by calculateconvexHullAllSegments()
        this.edges = []         //filled by calculateconvexHullAllSegments()
        this.convexHullCalculated = false

    }

        /*
        c0 -------- c1
        |           |
        |           |
        |           |
        c3 -------- c4
    */

    // returns a map with keys as "fromSegmentID_toSegmentID" and values as true/false depending on whether the intersegment that connects them is active or not
    getActivenessMap(){
        let map = new Map()
        for(let segID of this.intersecSegsIDs){
            let seg = this.road.findIntersecSeg(segID)
            if(seg){
                let fromSegID = this.road.findConnector(seg.fromConnectorID).incomingSegmentIDs[0]
                let toSegID = this.road.findConnector(seg.toConnectorID).outgoingSegmentIDs[0]
                map.set(fromSegID + '_' + toSegID, seg.active)
            }
        }
        return map
    }

    //calling p.orderSegmentsByDirection(true) will work 1/2 of the time (just call it once)
    // not working properly yet
    debugOrder(){
        let paths = this.road.findAnyPath(this.id)
        for(let p of paths){
            if(p.nodeB != this.id){ 
                console.log(p.id)
                p.orderSegmentsByDirection(true)
            }
        }
        
        

        function getManecilla(point, farPoint){
            let dir = Math.atan2(farPoint.y - point.y, farPoint.x - point.x)
            const LENGTH = 20
            return {x: point.x + Math.cos(dir) * LENGTH, y: point.y + Math.sin(dir) * LENGTH}
        }

        function orderClockwiseOfP(center, points) {
            return points.slice().sort((a, b) => {
                const angleA = Math.atan2(a.p.y - center.y, a.p.x - center.x);
                const angleB = Math.atan2(b.p.y - center.y, b.p.x - center.x);
                return angleA - angleB;
            });
        }

        let points = []
        for(let p of paths){
            if(p.segments.length == 1){
                if(p.segments[0].fromNodeID == this.nodeID){
                    points.push({p: p.segments[0].corners[0], m: getManecilla(p.segments[0].corners[0], p.segments[0].corners[3])})
                    points.push({p: p.segments[0].corners[1], m: getManecilla(p.segments[0].corners[1], p.segments[0].corners[2])})
                }
                else{
                    points.push({p: p.segments[0].corners[2], m: getManecilla(p.segments[0].corners[0], p.segments[0].corners[1])})
                    points.push({p: p.segments[0].corners[3], m: getManecilla(p.segments[0].corners[3], p.segments[0].corners[0])})
                }
            }
            else if(p.segments.length == 2){
                for(let i = 0; i < p.segments.length; i++){
                    let s = p.segments[i]
                    if(s.toNodeID == this.nodeID && i == 1) points.push({p: s.corners[2], m: getManecilla(s.corners[2], s.corners[1])})
                    else if(s.fromNodeID == this.nodeID && i == 0) points.push({p: s.corners[1], m: getManecilla(s.corners[1], s.corners[2])})
                    else if(s.fromNodeID == this.nodeID) points.push({p: s.corners[0], m: getManecilla(s.corners[0], s.corners[3])})
                    else points.push({p: s.corners[3], m: getManecilla(s.corners[3], s.corners[0])})
                }
            }
            else if(p.segments.length > 2){
                for(let i = 0; i < p.segments.length; i++){
                    if(i != 0 && i != p.segments.length - 1) continue
                    let s = p.segments[i]
                    if(s.fromNodeID == this.nodeID) points.push({p: s.corners[0], m: getManecilla(s.corners[0], s.corners[3])})
                    else points.push({p: s.corners[3], m: getManecilla(s.corners[3], s.corners[0])})
                }
            }
            
        }

        points = orderClockwiseOfP(this.road.findNode(this.nodeID).pos, points)

        let op = []

        let i = 0
        while(i < points.length){
            let bezPoint = points[i]
            let p = bezPoint.p
            let m = bezPoint.m
            op.push(p)
            let bezPoint2 = points[(i+1) % points.length]
            let p2 = bezPoint2.p
            let m2 = bezPoint2.m
            //op.push(p2)

            let bezPoint3 = points[(i+2) % points.length]
            let p3 = bezPoint3.p
            let m3 = bezPoint3.m

            let tension = map(dist(p.x, p.y, p2.x, p2.y), 10, 250, TENSION_BEZIER_MIN, TENSION_BEZIER_MAX, true)
            let curvePoints = bezierPoints(m, p, p2, m2, LENGTH_SEG_BEZIER, tension)
            op.push(...curvePoints)

            i += 2
        }
        //op.push([points[0].p])
        this.outline = op
        this.debugpoints = points
    }

    drawOutlineDebug(){
        if(!this.outline) return
        push()
        noFill()
        stroke(0, 255, 0, 200)
        strokeWeight(1.5)
        beginShape()
        for(let i = 0; i < this.outline.length; i++){
            vertex(this.outline[i].x, this.outline[i].y)
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

    showSelected(){
        if(!this.convexHullPointsExists()) return
        push()
        noFill()
        stroke(255)
        strokeWeight(2.5)
        beginShape()
        for(let i = 0; i < this.convexHullPoints.length; i++){
            vertex(this.convexHullPoints[i].x, this.convexHullPoints[i].y)
        }
        endShape(CLOSE)
        pop()
    }

    // shows the selected connector and all segments going out from it within this intersection
    // it also shows the connectors connected to those segments with the correct colors to indicate if its active or not
    showSelectedConnectorAndSegments(connID){
        let conn = this.road.findConnector(connID)
        if(conn) conn.showSelected()
        for(let segID of this.intersecSegsIDs){
            let seg = this.road.findIntersecSeg(segID)
            if(seg.fromConnectorID == connID){ 
                seg.showBezier(false)
                let outConn = this.road.findConnector(seg.toConnectorID)
                if(outConn) {
                    outConn.showActiveness(seg.active)
                }
            }
        }
    }

    showConnectorsAndSegments(){
        for(let connID of this.connectorsIDs){
            let conn = this.road.findConnector(connID)
            if(conn) conn.show(false, true)
        }
        for(let segID of this.intersecSegsIDs){
            let seg = this.road.findIntersecSeg(segID)
            if(seg) seg.showBezier(false)
        }
    }

    findHoverConnector(x, y){
        for(let connID of this.connectorsIDs){
            let conn = this.road.findConnector(connID)
            if(conn && conn.hover(x, y)) return conn
        }
        return undefined
    }

    toggleActivenessOfSeg(fromConnID, toConnID){
        for(let segID of this.intersecSegsIDs){
            let seg = this.road.findIntersecSeg(segID)
            if(seg.toConnectorID == toConnID && seg.fromConnectorID == fromConnID){ 
                seg.active = !seg.active
                return
            }
        }
    }

    findHoveredConnectorsOfSelectedConnector(selectedConnID, x, y){
        let possibleConnectors = []
        for(let segID of this.intersecSegsIDs){
            let seg = this.road.findIntersecSeg(segID)
            if(seg.fromConnectorID == selectedConnID){ 
                let outConn = this.road.findConnector(seg.toConnectorID)
                if(outConn) possibleConnectors.push(outConn)
            }
        }
        for(let conn of possibleConnectors){
            if(conn.hover(x, y)) return conn
        }
        return undefined
    }

    calculateconvexHullAllSegments(){
        this.convexHullPoints16 = this.getOutline(true)
        this.convexHullPoints = this.getOutline()
        this.edges = this.getOutline(false, true)
        this.convexHullCalculated = true
        return

        //first translate the points obejcts to an array of points
        let points = []
        let points16 = []
        for(let i = 0; i < this.intersecSegsIDs.length; i++){
            let segment = this.road.findIntersecSeg(this.intersecSegsIDs[i])
            if(segment){
                segment.constructOutline()
                let outline = segment.outline
                let outline16 = segment.outline16
                for(let j = 0; j < outline.length; j++){
                    points.push({x: outline[j].x, y: outline[j].y})
                }
                for(let j = 0; j < outline16.length; j++){
                    points16.push({x: outline16[j].x, y: outline16[j].y})
                }
            }
        }
        let calculated_hull = convexhull.makeHull(points)
        this.convexHullPoints = calculated_hull.map(p => {return {x: p.x, y: p.y}})
        let calculated_hull16 = convexhull.makeHull(points16)
        this.convexHullPoints16 = calculated_hull16.map(p => {return {x: p.x, y: p.y}})
        //much faster because is half the convex hull calls but less precise
        //this.convexHullPoints16 = this.extendConvexHullPoints(this.convexHullPoints, LANE_WIDTH * 0.6)  
        this.convexHullCalculated = true
    }

    extendConvexHullPoints(points, distance){
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

    convexHullPointsExists(){
        return this.convexHullCalculated && this.convexHullPoints.length > 0 && this.convexHullPoints16.length > 0
    }

    drawconvexHullDebug(){
        // this.drawOutlineDebug()
        // return


        if(!this.convexHullPointsExists()) return
        push()
        noFill()
        stroke(0, 255, 0, 200)
        strokeWeight(2)
        beginShape()
        for(let i = 0; i < this.convexHullPoints.length; i++){
            vertex(this.convexHullPoints[i].x, this.convexHullPoints[i].y)
        }
        endShape(CLOSE)
        stroke(255, 0, 0, 200)
        beginShape()
        for(let i = 0; i < this.convexHullPoints16.length; i++){
            vertex(this.convexHullPoints16[i].x, this.convexHullPoints16[i].y)
        }
        endShape(CLOSE)
        pop()
    }



    // type: showWays
    showWayBase(){
        beginShape()
        for(let v of this.convexHullPoints16) vertex(v.x, v.y)
        endShape()
    }

    // type: showWays
    showWayTop(){
        beginShape()
        for(let v of this.convexHullPoints) vertex(v.x, v.y)
        endShape()
    }

    showEdges(){
        for(let edge of this.edges){
            beginShape()
            for(let v of edge) vertex(v.x, v.y)
            endShape()
        }
    }

    // type: showWays
    showYieldMarkings(){
        // find all segments that feed into this intersection
        let paths = this.road.findAnyPath(this.nodeID)
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
        let paths = this.road.findAnyPath(this.nodeID)
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
        let paths = this.road.findAnyPath(this.id)
        for(let p of paths){
            let firstSeg = p.nodeA == this.nodeID ? p.segments[0] : p.segments[p.segments.length - 1]
            let lastSeg = p.nodeA != this.nodeID ? p.segments[0] : p.segments[p.segments.length - 1]
            if(firstSeg) firstSegmentPoss.push({pos: getCorners(firstSeg)[firstSeg.toNodeID == this.nodeID ? 2 : 0], seg: firstSeg})
            if(lastSeg) lastSegmentPoss.push({pos: getCorners(lastSeg)[lastSeg.toNodeID == this.nodeID ? 3 : 1], seg: lastSeg})
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
        for(let i = 0; i < allPoss.length; i += 2){
            let a = allPoss[i].newPos
            let b = allPoss[i].pos
            let c = allPoss[(i+1) % allPoss.length].pos
            let d = allPoss[(i+1) % allPoss.length].newPos
            let dirDiff = Math.abs(allPoss[i].dir - allPoss[(i+1) % allPoss.length].dir)
            let tension = map(dirDiff, 0, TWO_PI, 0, 2)
            tension = .8
            let bz = bezierPoints(a, b, c, d, 3, tension)
            separatedCurves ?  curves.push(bz) : curves.push(...bz)
        }

        return curves
    }

}