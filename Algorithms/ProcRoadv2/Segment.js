class Segment{
    constructor(id, fromNodeID, toNodeID, visualDir){
        this.id = id
        this.fromNodeID = fromNodeID
        this.toNodeID = toNodeID
        this.fromConnectorID = undefined
        this.toConnectorID = undefined
        this.visualDir = visualDir
        this.road = undefined


        //info updated by Path.js AFTER calling road.setPaths()
        this.fromPos = undefined
        this.toPos = undefined
        this.dir = undefined // direction in radians
        this.len = undefined
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

    //called by path, so must have frompos and topos defined
    hover(){
        if(!inBoundsCorners(this.fromPos.x, this.fromPos.y, GLOBAL_EDGES) && !inBoundsCorners(this.toPos.x, this.toPos.y, GLOBAL_EDGES)) return false

    }

    showCustomLanes(col, w){
        push()
        let fromPos = this.fromPos
        let toPos = this.toPos
        let corners = getCornersOfLine(fromPos, toPos, w)
        rectMode(CORNERS)
        noStroke()
        fill(col)
        beginShape()
        vertex(corners[0].x, corners[0].y)
        vertex(corners[1].x, corners[1].y)
        vertex(corners[2].x, corners[2].y)
        vertex(corners[3].x, corners[3].y)
        endShape(CLOSE)
        pop()
    }

    showLanes(hoveredSegID = undefined){
        push()
        let fromPos = this.fromPos
        let toPos = this.toPos
        if(!inBoundsCorners(fromPos.x, fromPos.y, GLOBAL_EDGES) && !inBoundsCorners(toPos.x, toPos.y, GLOBAL_EDGES)){
            pop()
            return
        }
        let corners = getCornersOfLine(fromPos, toPos, LANE_WIDTH)
        rectMode(CORNERS)
        stroke(255, 200)
        strokeWeight(1)
        this.visualDir == 'for' ? fill(40, 40, 255, 60) : fill(255, 40, 40, 60)
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
        stroke(255)
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
        if(!inBoundsCorners(fromPos.x, fromPos.y, GLOBAL_EDGES) && !inBoundsCorners(toPos.x, toPos.y, GLOBAL_EDGES)){
            pop()
            return
        }
        line(fromPos.x, fromPos.y, toPos.x, toPos.y)

        if(SHOW_TAGS){
            noStroke()
            fill(0, 255, 0)
            let midPos = {x: (fromPos.x + toPos.x) / 2, y: (fromPos.y + toPos.y) / 2}
            textAlign(CENTER)
            textSize(4)
            let str = this.id + ': ' + this.fromNodeID + '-' + this.toNodeID
            let bbox = textBounds(str, midPos.x, midPos.y)
            fill(0)
            rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
            fill(255)
            text(str, midPos.x, midPos.y)       
        }
        
        pop()

        this.showDirection()
    }

    showPath(SHOW_TAGS, SHOW_SEGS_DETAILS){
        if(!inBoundsCorners(this.fromPos.x, this.fromPos.y, GLOBAL_EDGES) && !inBoundsCorners(this.toPos.x, this.toPos.y, GLOBAL_EDGES)){
            return
        }
        push()
        stroke(255)
        strokeWeight(1.5)
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
            if(str2) str += ' ' + str2
            textAlign(CENTER)
            textSize(5)
            let bbox = textBounds(str, midPos.x, midPos.y - 10)
            fill(255, 0, 0)
            noStroke()
            rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
            fill(255)
            noStroke()
            text(str, midPos.x, midPos.y - 10)
        }
        pop()
    }
}

