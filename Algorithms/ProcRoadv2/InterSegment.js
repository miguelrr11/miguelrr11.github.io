class InterSegment{
    constructor(id, fromConnectorID, toConnectorID, visualDir, bezierPoints){
        this.id = id
        this.fromConnectorID = fromConnectorID
        this.toConnectorID = toConnectorID
        this.visualDir = visualDir
        this.bezierPoints = bezierPoints
        this.road = undefined
        this.len = undefined
        this.fromPos = undefined
        this.toPos = undefined
        this.dir = undefined
        this.outline = []
    }



    getPos(travelled){
        if(this.len == undefined) this.getLen()
        let bp = this.bezierPoints
        let travelledIndex = mapp(travelled, 0, this.getLen(), 0, bp.length - 1)
        let remaining = getDecimalPart(travelledIndex)
        let indexA = Math.floor(travelledIndex)
        let indexB = Math.min(indexA + 1, bp.length - 1)
        return lerppos(bp[indexA], bp[indexB], remaining)
    }

    getLen(){
        //if(this.len == undefined){
            let len = 0
            for(let i = 0; i < this.bezierPoints.length-1; i++){
                len += dist(this.bezierPoints[i].x, this.bezierPoints[i].y, this.bezierPoints[i+1].x, this.bezierPoints[i+1].y)
            }
            this.len = len
        //}
        return this.len
    }


    /*
      
        c0 ------- c1
        |           |
        |           |
        |           |
        c2--------- c3

     */


    constructOutline(){
        let points = []
        let points16 = []

        let fromSeg = this.road.findSegment(this.road.findConnector(this.fromConnectorID).incomingSegmentIDs[0])
        let cornersFromSeg = getCornersOfLine(fromSeg.fromPos, fromSeg.toPos, LANE_WIDTH)
        let toSeg = this.road.findSegment(this.road.findConnector(this.toConnectorID).outgoingSegmentIDs[0])
        let cornersToSeg = getCornersOfLine(toSeg.fromPos, toSeg.toPos, LANE_WIDTH)
        let c0 = cornersFromSeg[2]
        let c1 = cornersToSeg[1]
        let c3 = cornersToSeg[0]
        let c2 = cornersFromSeg[3]

        let cornersFromSeg16 = getCornersOfLine(fromSeg.fromPos, fromSeg.toPos, LANE_WIDTH*1.6)
        let cornersToSeg16 = getCornersOfLine(toSeg.fromPos, toSeg.toPos, LANE_WIDTH*1.6)
        let c0_16 = cornersFromSeg16[2]
        let c1_16 = cornersToSeg16[1]
        let c3_16 = cornersToSeg16[0]
        let c2_16 = cornersFromSeg16[3]

        stroke(0, 255, 0)
        strokeWeight(4)

        let bp = [ ...this.bezierPoints]
        let corners
        let corners16
        points.push(c2)
        points16.push(c2_16)
        for(let i = 0; i < bp.length - 1; i++){
            let p = bp[i]
            corners = getCornersOfLine(bp[i], bp[i+1], LANE_WIDTH)
            corners16 = getCornersOfLine(bp[i], bp[i+1], LANE_WIDTH*1.6)
            points.push(corners[0])
            points16.push(corners16[0])
        }
        points.push(c3)
        points.push(c1)
        points16.push(c3_16)
        points16.push(c1_16)
        for(let i = bp.length - 1; i > 0; i--){
            corners = getCornersOfLine(bp[i], bp[i-1], LANE_WIDTH)
            corners16 = getCornersOfLine(bp[i], bp[i-1], LANE_WIDTH*1.6)
            points.push(corners[3])
            points16.push(corners16[3])
        }
        points.push(c0)
        points16.push(c0_16)

        this.outline = points
        this.outline16 = points16

        this.corners = {c0, c1, c2, c3}
    }

    showLane(col, useOutline16 = false){
        push()
        let fromPos = this.bezierPoints[0]
        let toPos = this.bezierPoints[this.bezierPoints.length-1]

        if(!inBoundsCorners(fromPos.x, fromPos.y, GLOBAL_EDGES) && !inBoundsCorners(toPos.x, toPos.y, GLOBAL_EDGES)){
            pop()
            return
        }

        strokeWeight(1)
        stroke(255, 200)
        noStroke()
        this.visualDir == 'for' ? fill(COL_LANE_1) : fill(COL_LANE_2)
        if(col) fill(col)
        beginShape()
        if(!useOutline16) for(let p of this.outline) vertex(p.x, p.y)
        else for(let p of this.outline16) vertex(p.x, p.y)
        endShape()
        pop()
    }

    showBezier(SHOW_TAGS){
        let first = this.bezierPoints[0]
        let last = this.bezierPoints[this.bezierPoints.length-1]
        if(!inBoundsCorners(first.x, first.y, GLOBAL_EDGES) && !inBoundsCorners(last.x, last.y, GLOBAL_EDGES)){
            return
        }
        push()
        strokeWeight(1.5)
        stroke(COL_PATHS)
        noFill()
        beginShape()
        for(let i = 0; i < this.bezierPoints.length; i+=1){
            vertex(this.bezierPoints[i].x, this.bezierPoints[i].y)
        }
        endShape()
        if(SHOW_TAGS){
            let first = this.bezierPoints[0]
            let last = this.bezierPoints[this.bezierPoints.length-1]
            let midPos = {x: (first.x + last.x) / 2, y: (first.y + last.y) / 2}
            noStroke()
            fill(0, 255, 0)
            textAlign(CENTER)
            textSize(4)
            let str = '[' + this.id + ']' + ' N: ' +  (this.fromNodeID != undefined ? this.fromNodeID : '_') + '-' + (this.toNodeID != undefined ? this.toNodeID : '_') + '  C: ' + 
                      (this.fromConnectorID != undefined ? this.fromConnectorID : '_') + '-' + (this.toConnectorID != undefined ? this.toConnectorID : '_')
            let bbox = textBounds(str, midPos.x, midPos.y)
            fill(0)
            rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
            fill(255)
            text(str, midPos.x, midPos.y)
        }
        pop()
    }
}