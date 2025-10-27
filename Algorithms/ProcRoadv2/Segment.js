const WIDTH_YIELD_MARKING = 7

class Segment{
    constructor(id, fromNodeID, toNodeID, visualDir, curvedPath){
        this.id = id
        this.fromNodeID = fromNodeID
        this.toNodeID = toNodeID
        this.fromConnectorID = undefined
        this.toConnectorID = undefined
        this.visualDir = visualDir
        this.road = undefined
        this.curvedPath = curvedPath == undefined ? false : (!curvedPath[0] || !curvedPath[1] ? true : false)
        this.curvedPath = false

        
        //info updated by Path.js (constructRealLanes())
        this.name = undefined   //used by path.js to set the name of the path
        this.fromPos = undefined
        this.toPos = undefined
        this.dir = undefined // direction in radians
        this.len = undefined
        this.originalFromPos = undefined // used when trimming segments at intersections
        this.originalToPos = undefined
        this.arrowsPos = []
        this.corners = []
        this.corners16 = []
        this.yieldPos = []
        this.drawOuterLinesAboveDashed = undefined
        this.drawOuterLinesBelowDashed = undefined
    }

    constructCorners(){
        this.corners = getCornersOfLine(this.fromPos, this.toPos, LANE_WIDTH)
        this.corners16 = getCornersOfLine(this.fromPos, this.toPos, BIG_LANE_WIDTH)

        let dir = Math.atan2(this.toPos.y - this.fromPos.y, this.toPos.x - this.fromPos.x)
        let toPosShort = {x: this.toPos.x - Math.cos(dir) * WIDTH_YIELD_MARKING * 0.5, y: this.toPos.y - Math.sin(dir) * WIDTH_YIELD_MARKING * 0.5}
        let yieldCorners = getCornersOfLine(this.fromPos, toPosShort, LANE_WIDTH)
        this.yieldPos = [{x: yieldCorners[2].x, y: yieldCorners[2].y}, {x: yieldCorners[3].x, y: yieldCorners[3].y}]
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
        let totalLen = dist(fromPos.x, fromPos.y, toPos.x, toPos.y) - 50

        if(totalLen < 30) return

        if(totalLen < spacing){
            totalLen = dist(this.fromPos.x, this.fromPos.y, this.toPos.x, this.toPos.y)
            let tippos = lerppos(this.fromPos, this.toPos, 0.5)
            let startLinePos = lerppos(this.fromPos, this.toPos, (totalLen/2 - 15) / totalLen)
            this.arrowsPos.push({tip: tippos, startLine: startLinePos})
            return
        }

        let nArrows = Math.floor(totalLen / spacing)
        let centerPos = 0.5 

        if(nArrows === 1){
            let tippos = lerppos(fromPos, toPos, centerPos)
            let startLinePos = lerppos(fromPos, toPos, centerPos - 15 / totalLen)
            this.arrowsPos.push({tip: tippos, startLine: startLinePos})
        } 
        else {
            for(let i = 0; i < nArrows; i++){
                let offset = Math.floor((i + 1) / 2) * (spacing / totalLen)
                let isEven = i % 2 === 0
                let relPosTip = isEven ? centerPos + offset : centerPos - offset
                let relPosStart = relPosTip - 15 / totalLen

                let tippos = lerppos(fromPos, toPos, relPosTip)
                let startLinePos = lerppos(fromPos, toPos, relPosStart)
                this.arrowsPos.push({tip: tippos, startLine: startLinePos})
            }
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
        if(this.outOfBounds()) return
        push()
        let fromPos = this.fromPos
        let toPos = this.toPos
        let corners = this.corners
        if(!disc) line(corners[0].x, corners[0].y, corners[3].x, corners[3].y)
        else drawDashedLine(corners[0].x, corners[0].y, corners[3].x, corners[3].y)
        pop()
    }

    drawLineAbove(disc = false){
        if(this.outOfBounds()) return
        let fromPos = this.fromPos
        let toPos = this.toPos
        let corners = getCornersOfLine(fromPos, toPos, LANE_WIDTH)
        if(!disc) line(corners[1].x, corners[1].y, corners[2].x, corners[2].y)
        else drawDashedLine(corners[1].x, corners[1].y, corners[2].x, corners[2].y)
    }

    // rectMode must be CORNERS and noStroke must be set before calling this
    showCustomLanes(col, w, hoveredID = undefined){
        if(this.outOfBounds()) return
        let corners = w == LANE_WIDTH ? this.corners : this.corners16
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
        let corners = this.corners
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

    //not mantained, only for debug
    showOutlineCorners(){
        //if(this.curvedPath) return
        push()
        noFill()
        stroke(255, 100)
        strokeWeight(1.5)
        beginShape()
        for(let i = 0; i < this.corners.length; i++){
            if(this.corners[i] == undefined) continue
            vertex(this.corners[i].x, this.corners[i].y)
        }
        endShape(CLOSE)
        stroke(255, 0, 0, 100)
        beginShape()
        for(let i = 0; i < this.corners16.length; i++){
            if(this.corners16[i] == undefined) continue
            vertex(this.corners16[i].x, this.corners16[i].y)
        }
        endShape(CLOSE)
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

    showSimple(){
        if(this.outOfBounds()){
            return
        }
        line(this.fromPos.x, this.fromPos.y, this.toPos.x, this.toPos.y)
    }


    // just shows a white line with arrows, and tags if needed, from fromPos to toPos
    showPath(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID = undefined, indexOfSeg = 0){
        if(this.outOfBounds()){
            return
        }
        push()

        
        stroke(COL_PATHS)
        hoveredSegID == this.id ? strokeWeight(3) : strokeWeight(2)
        line(this.fromPos.x, this.fromPos.y, this.toPos.x, this.toPos.y)
        let midPos = {x: (this.fromPos.x + this.toPos.x) / 2, y: (this.fromPos.y + this.toPos.y) / 2}
        drawArrowTip(midPos.x, midPos.y, this.dir, 7)

        //debug
        if(hoveredSegID == this.id){
            stroke(255)
            fill(0)
            for(let i = 0; i < this.corners.length; i++){
                if(this.corners[i] == undefined) continue
                text('c' + i, this.corners[i].x, this.corners[i].y)
            }
            stroke(0)
            fill(255)
            for(let i = 0; i < this.corners16.length; i++){
                if(this.corners16[i] == undefined) continue
                text('c' + i, this.corners16[i].x, this.corners16[i].y)
            }
        }

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

        //debug
        this.showOutlineCorners()
        // stroke(255, 0, 0, 100)
        // strokeWeight(1)
        // line(this.originalFromPos.x, this.originalFromPos.y, this.originalToPos.x, this.originalToPos.y)
        // let mid = lerppos(this.originalFromPos, this.originalToPos, .5)
        // let bbox = textBounds(indexOfSeg, mid.x, mid.y)
        // fill(0, 0, 255)
        // rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
        // noStroke()
        // fill(255)
        // text(indexOfSeg, mid.x, mid.y)

        // strokeWeight(10)
        // // verde es from y to
        // stroke(0, 255, 0, 200)
        // point(this.fromPos.x, this.fromPos.y)
        // point(this.toPos.x, this.toPos.y)
        // //rojo es original
        // stroke(255, 0, 0, 200)
        // point(this.originalFromPos.x, this.originalFromPos.y)
        // point(this.originalToPos.x, this.originalToPos.y)

        pop()
    }

    // type: showWays
    drawArrows(){
        if(this.outOfBounds()) return
        this.arrowsPos.forEach(pos => {
            line(pos.startLine.x, pos.startLine.y, pos.tip.x, pos.tip.y)
            drawArrowTip(pos.tip.x, pos.tip.y, this.dir, 5)
        })
    }

    drawDirectionsIntersection(){
        let toConnector = this.road.findConnector(this.toConnectorID)
        if(toConnector){
            let dirs = toConnector.dirs
            if(!dirs.straight && !dirs.leftTurn && !dirs.rightTurn) return
            let length_arrow_line = 10
            let basePos = shortenSegment(this.fromPos, this.toPos, 40)
            let endPos = shortenSegment(this.fromPos, this.toPos, 30)
            let straightDir = Math.atan2(this.toPos.y - this.fromPos.y, this.toPos.x - this.fromPos.x)
            let leftDir = straightDir - Math.PI / 2.5
            let rightDir = straightDir + Math.PI / 2.5
            //all lines ending in the arrows will start at endPos
            let endPosStraight = {x: endPos.x + Math.cos(straightDir) * length_arrow_line, y: endPos.y + Math.sin(straightDir) * length_arrow_line}
            let endPosLeft = {x: endPos.x + Math.cos(leftDir) * length_arrow_line, y: endPos.y + Math.sin(leftDir) * length_arrow_line}
            let endPosRight = {x: endPos.x + Math.cos(rightDir) * length_arrow_line, y: endPos.y + Math.sin(rightDir) * length_arrow_line}
            if(dirs.straight){
                line(endPos.x, endPos.y, endPosStraight.x, endPosStraight.y)
                drawArrowTip(endPosStraight.x, endPosStraight.y, straightDir + PI, 5)
            }
            if(dirs.leftTurn){
                line(endPos.x, endPos.y, endPosLeft.x, endPosLeft.y)
                drawArrowTip(endPosLeft.x, endPosLeft.y, leftDir + PI, 5)
            }
            if(dirs.rightTurn){
                line(endPos.x, endPos.y, endPosRight.x, endPosRight.y)
                drawArrowTip(endPosRight.x, endPosRight.y, rightDir + PI, 5)
            }
            line(basePos.x, basePos.y, endPos.x, endPos.y)
        }
    }

}

