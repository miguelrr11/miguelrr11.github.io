class Segment{
    constructor(id, fromNodeID, toNodeID, visualDir){
        this.id = id
        this.fromNodeID = fromNodeID
        this.toNodeID = toNodeID
        this.fromConnectorID = undefined
        this.toConnectorID = undefined
        this.visualDir = visualDir
        this.road = undefined


        //info updated by Path.js (constructRealLanes())
        this.fromPos = undefined
        this.toPos = undefined
        this.dir = undefined // direction in radians
        this.len = undefined
        this.originalFromPos = undefined // used when trimming segments at intersections
        this.originalToPos = undefined
        this.arrowsPos = []
        this.corners = []
        this.drawOuterLinesAboveDashed = undefined
        this.drawOuterLinesBelowDashed = undefined
    }

    constructCorners(){
        this.corners = getCornersOfLine(this.fromPos, this.toPos, LANE_WIDTH)
    }

    createArrows(){
        this.arrowsPos = []
        let spacing = 300
        let fromPos = {x: this.fromPos.x, y: this.fromPos.y}
        let toPos = {x: this.toPos.x, y: this.toPos.y}
        let margin = - 20
        fromPos.x += Math.cos(this.dir) * margin
        fromPos.y += Math.sin(this.dir) * margin
        toPos.x -= Math.cos(this.dir) * margin
        toPos.y -= Math.sin(this.dir) * margin
        let totalLen = dist(fromPos.x, fromPos.y, toPos.x, toPos.y)
        if(totalLen < spacing){
            totalLen = dist(this.fromPos.x, this.fromPos.y, this.toPos.x, this.toPos.y)
            let tippos = lerppos(this.fromPos, this.toPos, 0.5)
            let startLinePos = lerppos(this.fromPos, this.toPos, (totalLen/2 - 10) / totalLen)
            this.arrowsPos.push({tip: tippos, startLine: startLinePos})
            return
        }
        let nArrows = Math.floor(totalLen / spacing)
        for(let i=1; i<=nArrows; i++){
            let relPosTip = (i * spacing) / totalLen
            let relPosStart = ((i * spacing) - 10) / totalLen
            let tippos = lerppos(fromPos, toPos, relPosTip)
            let startLinePos = lerppos(fromPos, toPos, relPosStart)
            this.arrowsPos.push({tip: tippos, startLine: startLinePos})
        }
    }


    export(){
        return {
            id: this.id,
            fromNodeID: this.fromNodeID,
            toNodeID: this.toNodeID,
            fromConnectorID: this.fromConnectorID,
            toConnectorID: this.toConnectorID,
            visualDir: this.visualDir
        }
    }

    getPos(travelled){
        if(this.len == undefined) this.getLen()
        let relPos = travelled / this.getLen()
        relPos = constrain(relPos, 0, 1)
        return lerppos(this.fromPos, this.toPos, relPos)
    }

    getLen(){
        //if(this.len == undefined){
            if(this.fromPos && this.toPos){
                this.len = dist(this.fromPos.x, this.fromPos.y, this.toPos.x, this.toPos.y)
            }
        //}
        return this.len
    }

    outOfBounds(){
        if(!inBoundsCorners(this.fromPos.x, this.fromPos.y, GLOBAL_EDGES) && 
        !inBoundsCorners(this.toPos.x, this.toPos.y, GLOBAL_EDGES) &&
        !lineIntersection(this.fromPos, this.toPos, {x: GLOBAL_EDGES[0], y: GLOBAL_EDGES[2]}, {x: GLOBAL_EDGES[1], y: GLOBAL_EDGES[2]}) &&
        !lineIntersection(this.fromPos, this.toPos, {x: GLOBAL_EDGES[1], y: GLOBAL_EDGES[2]}, {x: GLOBAL_EDGES[0], y: GLOBAL_EDGES[3]}) &&
        !lineIntersection(this.fromPos, this.toPos, {x: GLOBAL_EDGES[0], y: GLOBAL_EDGES[3]}, {x: GLOBAL_EDGES[1], y: GLOBAL_EDGES[3]}) &&
        !lineIntersection(this.fromPos, this.toPos, {x: GLOBAL_EDGES[1], y: GLOBAL_EDGES[3]}, {x: GLOBAL_EDGES[0], y: GLOBAL_EDGES[2]})) return true
        return false
    }

    //called by path, so must have frompos and topos defined
    hover(){
        if(this.outOfBounds()) return false
    }

    drawLineBelow(disc = false){
        push()
        let fromPos = this.fromPos
        let toPos = this.toPos
        let corners = getCornersOfLine(fromPos, toPos, LANE_WIDTH)
        if(!disc) line(corners[0].x, corners[0].y, corners[3].x, corners[3].y)
        else drawDashedLine(corners[0].x, corners[0].y, corners[3].x, corners[3].y)
        pop()
    }

    drawLineAbove(disc = false){
        let fromPos = this.fromPos
        let toPos = this.toPos
        let corners = getCornersOfLine(fromPos, toPos, LANE_WIDTH)
        if(!disc) line(corners[1].x, corners[1].y, corners[2].x, corners[2].y)
        else drawDashedLine(corners[1].x, corners[1].y, corners[2].x, corners[2].y)
    }

    // rectMode must be CORNERS and noStroke must be set before calling this
    showCustomLanes(col, w, hoveredID = undefined){
        let fromPos = this.fromPos
        let toPos = this.toPos
        let corners = getCornersOfLine(fromPos, toPos, w)
        fill(col)
        beginShape()
        vertex(corners[0].x, corners[0].y)
        vertex(corners[1].x, corners[1].y)
        vertex(corners[2].x, corners[2].y)
        vertex(corners[3].x, corners[3].y)
        endShape(CLOSE)
        if(this.id == hoveredID){
            fill(255, 100)
            beginShape()
            vertex(corners[0].x, corners[0].y)
            vertex(corners[1].x, corners[1].y)
            vertex(corners[2].x, corners[2].y)
            vertex(corners[3].x, corners[3].y)
            endShape(CLOSE)
        }
    }

    showLanes(hoveredSegID = undefined){
        push()
        let fromPos = this.fromPos
        let toPos = this.toPos
        if(this.outOfBounds()){
            pop()
            return
        }
        let corners = getCornersOfLine(fromPos, toPos, LANE_WIDTH)
        rectMode(CORNERS)
        stroke(255, 200)
        strokeWeight(1)
        noStroke()
        this.visualDir == 'for' ? fill(COL_LANE_1) : fill(COL_LANE_2)
        if(this.id == hoveredSegID) fill(255, 120)
        beginShape()
        vertex(corners[0].x, corners[0].y)
        vertex(corners[1].x, corners[1].y)
        vertex(corners[2].x, corners[2].y)
        vertex(corners[3].x, corners[3].y)
        endShape(CLOSE)
        // stroke(255)
        // strokeWeight(5)
        // point(corners[0].x, corners[0].y)
        // point(corners[1].x, corners[1].y)
        // point(corners[2].x, corners[2].y)
        // point(corners[3].x, corners[3].y)
        pop()
    }

    showDirection(){
        push()
        strokeWeight(1.5)
        stroke(COL_PATHS)
        let fromPos = this.road.findNode(this.fromNodeID).pos
        let toPos = this.road.findNode(this.toNodeID).pos
        let midPos1 = lerppos(fromPos, toPos, 0.33)
        let midPos2 = lerppos(fromPos, toPos, 0.66)
        let angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) - PI
        drawArrowTip(midPos1.x, midPos1.y, angle, 10)
        drawArrowTip(midPos2.x, midPos2.y, angle, 10)
        pop()
    }


    showHover(){
        push()
        strokeWeight(2.5)
        stroke(255, 130)
        let fromPos = this.road.findNode(this.fromNodeID).pos
        let toPos = this.road.findNode(this.toNodeID).pos
        line(fromPos.x, fromPos.y, toPos.x, toPos.y)
        pop()
    }

    //this is shown if road calls segment.show(), it doesnt take into account the real separation between lanes
    showMain(SHOW_TAGS){
        push()
        strokeWeight(10)
        stroke(255, 40)
        let fromPos = this.road.findNode(this.fromNodeID).pos
        let toPos = this.road.findNode(this.toNodeID).pos
        if(this.outOfBounds()){
            pop()
            return
        }
        line(fromPos.x, fromPos.y, toPos.x, toPos.y)

        

        if(SHOW_TAGS){
            noStroke()
            fill(0, 255, 0)
            let midPos = {x: (fromPos.x + toPos.x) / 2, y: (fromPos.y + toPos.y) / 2}
            textAlign(CENTER)
            textSize(12)
            let str = '[' + this.id + ']' + ': ' + this.fromNodeID + '-' + this.toNodeID
            let bbox = textBounds(str, midPos.x, midPos.y)
            fill(0)
            rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
            fill(255)
            text(str, midPos.x, midPos.y)       
        }
        
        pop()

        this.showDirection()
    }

    showPath(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID = undefined){
        if(this.outOfBounds()){
            return
        }
        push()
        stroke(COL_PATHS)

        // strokeWeight(1)
        // line(this.originalFromPos.x, this.originalFromPos.y, this.originalToPos.x, this.originalToPos.y)

        hoveredSegID == this.id ? strokeWeight(2.5) : strokeWeight(1.5)
        line(this.fromPos.x, this.fromPos.y, this.toPos.x, this.toPos.y)
        let midPos = {x: (this.fromPos.x + this.toPos.x) / 2, y: (this.fromPos.y + this.toPos.y) / 2}
        drawArrowTip(midPos.x, midPos.y, this.dir, 7)

        if(SHOW_SEGS_DETAILS){
            stroke(0, 255, 0)
            strokeWeight(8)
            point(this.fromPos.x, this.fromPos.y)
            stroke(255, 0, 0)
            point(this.toPos.x, this.toPos.y)
        }
        

        if(SHOW_TAGS){
            let str = '[' + this.id + ']' + ' N: ' + this.fromNodeID + '-' + this.toNodeID
            let str2 = this.fromConnectorID != undefined || this.toConnectorID != undefined ?
                'C: ' + (this.fromConnectorID != undefined ? this.fromConnectorID : '_') + '-' + (this.toConnectorID != undefined ? this.toConnectorID : '_')
                : undefined
            let str3 = '[' + this.id + ']'
            if(str2) str += ' ' + str2
            str = str3
            textAlign(CENTER)
            textSize(12)
            let bbox = textBounds(str, midPos.x, midPos.y - 10)
            fill(255, 0, 0)
            noStroke()
            rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
            fill(255)
            noStroke()
            text(str, midPos.x, midPos.y - 10)
        }

        // strokeWeight(10)
        // // verde es from y to
        // stroke(0, 255, 0, 200)
        // point(this.fromPos.x, this.fromPos.y)
        // point(this.toPos.x, this.toPos.y)
        // // rojo es original
        // stroke(255, 0, 0, 200)
        // point(this.originalFromPos.x, this.originalFromPos.y)
        // point(this.originalToPos.x, this.originalToPos.y)

        pop()
    }

    // type: showWays
    drawArrows(){
        this.arrowsPos.forEach(pos => {
            line(pos.startLine.x, pos.startLine.y, pos.tip.x, pos.tip.y)
            drawArrowTip(pos.tip.x, pos.tip.y, this.dir, 6.5)
        })
    }

}

