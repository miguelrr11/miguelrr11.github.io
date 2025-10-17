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
        this.convexHullCalculated = false

    }

        /*
        c0 -------- c1
        |           |
        |           |
        |           |
        c3 -------- c4
    */

    //calling p.orderSegmentsByDirection(true) will work 1/2 of the time (just call it once)
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

    calculateconvexHullAllSegments(){
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
        if(!this.convexHullPointsExists()) return
        beginShape()
        for(let v of this.convexHullPoints16) vertex(v.x, v.y)
        endShape()
    }

    // type: showWays
    showWayTop(){
        if(!this.convexHullPointsExists()) return
        beginShape()
        for(let v of this.convexHullPoints) vertex(v.x, v.y)
        endShape()
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
}