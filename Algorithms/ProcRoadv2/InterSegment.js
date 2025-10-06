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

    showLane(){
        push()
        let fromPos = this.bezierPoints[0]
        let toPos = this.bezierPoints[this.bezierPoints.length-1]

        let cornersFirst = getCornersOfLine(fromPos, this.bezierPoints[1], LANE_WIDTH)
        let cornersLast = getCornersOfLine(this.bezierPoints[this.bezierPoints.length-2], toPos, LANE_WIDTH)
        let points = [cornersFirst[1]]
        for(let i = 0; i < this.bezierPoints.length-1; i++){
            let corners = getCornersOfLine(this.bezierPoints[i], this.bezierPoints[i+1], LANE_WIDTH)
            points.push(corners[0])
        }
        points.push(cornersLast[3])
        points.push(cornersLast[2])
        for(let i = this.bezierPoints.length-1; i > 0; i--){
            let corners = getCornersOfLine(this.bezierPoints[i], this.bezierPoints[i-1], LANE_WIDTH)
            points.push(corners[0])
        }
        points.push(cornersFirst[1])

        strokeWeight(1)
        stroke(255, 200)
        this.visualDir == 'for' ? fill(40, 40, 255, 60) : fill(255, 40, 40, 60)
        beginShape()
        for(let p of points) vertex(p.x, p.y)
        endShape()
        pop()       
    }

    showBezier(SHOW_TAGS){
        push()
        strokeWeight(1)
        stroke(255)
        noFill()
        beginShape()
        this.bezierPoints.forEach(p => vertex(p.x, p.y))
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