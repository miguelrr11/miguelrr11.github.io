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
        this.convexHullCalculated = true
    }

    convexHullPointsExists(){
        return this.convexHullCalculated
    }

    drawconvexHullDebug(){
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

    /*
        c0 -------- c1
        |           |
        |           |
        |           |
        c3 -------- c4
    */

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
    showIntersectionStartLine(){
        if(this.outline == [] || this.outline == undefined) return
        if(this.pathsIDs.length >= 3) {
            for(let i = 0; i < this.intersecSegsIDs.length; i++){
                let segment = this.road.findIntersecSeg(this.intersecSegsIDs[i])
                let corners = segment.corners
                line(corners.c0.x, corners.c0.y, corners.c2.x, corners.c2.y)
            }
        }
    }
}