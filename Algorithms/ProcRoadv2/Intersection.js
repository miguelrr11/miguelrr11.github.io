class Intersection {
    constructor(nodeID, connectorsIDs, intersecSegsIDs){
        this.nodeID = nodeID
        this.id = nodeID
        this.connectorsIDs = connectorsIDs
        this.intersecSegsIDs = intersecSegsIDs
        this.road = undefined     //filled by road.js
        this.pathsIDs = []        //filled by road.js
    }

    /**
      
        c0 ------- c1
        |           |
        |           |
        |           |
        c3--------- c4

     */

    showWayBase(){
        for(let i = 0; i < this.intersecSegsIDs.length; i++){
            let segment = this.road.findIntersecSeg(this.intersecSegsIDs[i])
            segment.showLane([200], true)
        }
    }

    showWayTop(){
        for(let i = 0; i < this.intersecSegsIDs.length; i++){
            let segment = this.road.findIntersecSeg(this.intersecSegsIDs[i])
            segment.showLane([100])
        }
        if(this.pathsIDs.length < 3) return
        stroke(220)
        strokeWeight(7)
        strokeCap(SQUARE)
        for(let i = 0; i < this.intersecSegsIDs.length; i++){
            let segment = this.road.findIntersecSeg(this.intersecSegsIDs[i])
            let corners = segment.corners
            line(corners.c0.x, corners.c0.y, corners.c2.x, corners.c2.y)
            //line(corners.c1.x, corners.c1.y, corners.c3.x, corners.c3.y)
        }
    }
}