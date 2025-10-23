const CONN_RAD = 6

class Connector{
    constructor(incomingSegmentID, outgoingSegmentID, pos, id){
        this.pos = pos
        this.incomingSegmentIDs = incomingSegmentID != undefined ? [incomingSegmentID] : []  //not really important
        this.outgoingSegmentIDs = outgoingSegmentID != undefined ? [outgoingSegmentID] : []  //very important
        this.road = undefined
        this.id = id
        this.type = undefined // 'enter' or 'exit' depending on whether the connector is entering or exiting an intersection
        this.dirs = undefined //calculated directions (left, right, straight) based on outgoing segments (used by segments)
    }

    // gets all the outgoing segments of this outgoingSegmentIDs and returns their angles respective of the path of this connector
    getAnglesOutgoing(applyActiveness = false){
        if(this.type == 'exit') return []
        let inSeg = this.road.findSegment(this.incomingSegmentIDs[0])
        if(!inSeg) return []
        let inDir = Math.atan2(this.pos.y - inSeg.fromPos.y, this.pos.x - inSeg.fromPos.x)
        let angles = []
        for(let segID of this.outgoingSegmentIDs){
            let intersecSeg = this.road.findIntersecSeg(segID)
            // continue if the intersecSeg is inactive and we want to ignore inactive segments
            if(applyActiveness && (!intersecSeg || !intersecSeg.active)) continue 
            if(intersecSeg){
                let toConnID = intersecSeg.toConnectorID
                let toConn = this.road.findConnector(toConnID)
                if(toConn){
                    let toSeg = this.road.findSegment(toConn.outgoingSegmentIDs[0])
                    if(toSeg){
                        let outDir = Math.atan2(toSeg.toPos.y - toSeg.fromPos.y, toSeg.toPos.x - toSeg.fromPos.x)
                        let angle = outDir - inDir
                        // Normalize angle to [-PI, PI]
                        while (angle > Math.PI) angle -= 2 * Math.PI
                        while (angle < -Math.PI) angle += 2 * Math.PI
                        angles.push(angle)
                    }
                }
            }
            
        }
        return angles
    }


    constructDirections(){
        let dirs = {
            leftTurn: false,
            rightTurn: false,
            straight: false
        }

        const margin = .45

        let angles = this.getAnglesOutgoing(true)
        this.angles = angles
        for(let angle of angles){
            // Positive angles = left turn (counterclockwise)
            // Negative angles = right turn (clockwise)
            // Small angles near 0 = straight
            if(angle > margin){
                dirs.rightTurn = true
            } else if(angle < -margin){
                dirs.leftTurn = true
            } else{
                dirs.straight = true
            }
        }
        this.dirs = dirs
        return dirs
    }

    hover(x, y){
        if(!inBoundsCorners(this.pos.x, this.pos.y, GLOBAL_EDGES, NODE_RAD)) return false
        return dist(x, y, this.pos.x, this.pos.y) <= CONN_RAD
    }

    getPosition(){
        return this.pos
    }

    chooseOutRandom(){
        return random(this.getOutgoingActiveIntersegs())
    }

    getOutgoingActiveIntersegs(){
        if(this.type == 'exit') return [this.outgoingSegmentIDs[0]]
        let outgoingSegs = []
        for(let id of this.outgoingSegmentIDs){
            let seg = this.road.findIntersecSeg(id)
            if(seg != undefined && seg.active) outgoingSegs.push(id)
        }
        return outgoingSegs
    }

    showHover(){
        push()
        strokeWeight(2)
        this.type != 'enter' ? stroke(255, 0, 0, 200) : stroke(255, 200)
        this.type != 'enter' ? fill(255, 0, 0, 200) : fill(255, 200)
        ellipse(this.pos.x, this.pos.y, CONN_RAD * 2)
        noFill()
        pop()
    }

    showSelected(){
        push()
        stroke(255, 200)
        fill(255, 200)
        ellipse(this.pos.x, this.pos.y, CONN_RAD * 2)
        pop()
    }

    showActiveness(activeBool){
        push()
        strokeWeight(2)
        activeBool ? stroke(0, 255, 0) : stroke(255, 0, 0)
        noFill()
        ellipse(this.pos.x, this.pos.y, CONN_RAD * 2)
        pop()
    }

    show(SHOW_TAGS, show_only_enter = false){
        if(!inBoundsCorners(this.pos.x, this.pos.y, GLOBAL_EDGES, 10)) return
        push()
        strokeWeight(2)
        noFill()
        this.type != 'enter' ? stroke(255, 0, 0, 200) : stroke(255, 200)
        if(show_only_enter && this.type != 'enter'){
            pop()
            return
        }
        ellipse(this.pos.x, this.pos.y, CONN_RAD * 2)
        if(SHOW_TAGS){
            let strIncomingAll = this.incomingSegmentIDs.length > 0 ? this.incomingSegmentIDs.join(',') : '_'
            let strOutgoingAll = this.outgoingSegmentIDs.length > 0 ? this.outgoingSegmentIDs.join(',') : '_'
            let str = '[' + this.id + '] In: ' + strIncomingAll + ' Out: ' + strOutgoingAll
            textAlign(CENTER)
            textSize(6)
            let bbox = textBounds(str, this.pos.x, this.pos.y - 10)
            fill(255, 0, 0)
            noStroke()
            rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
            fill(0, 0, 255)
            noStroke()
            text(str, this.pos.x, this.pos.y - 10)
        }

        //this.showHover()
        pop()
    }
}