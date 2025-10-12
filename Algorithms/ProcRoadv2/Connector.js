class Connector{
    constructor(incomingSegmentID, outgoingSegmentID, pos, id){
        this.pos = pos
        this.incomingSegmentIDs = incomingSegmentID != undefined ? [incomingSegmentID] : []  //not really important
        this.outgoingSegmentIDs = outgoingSegmentID != undefined ? [outgoingSegmentID] : []  //very important
        this.road = undefined
        this.id = id
    }

    getPosition(){
        return this.pos
    }

    chooseOutRandom(){
        return random(this.outgoingSegmentIDs)
    }

    show(SHOW_TAGS){
        if(!inBoundsCorners(this.pos.x, this.pos.y, GLOBAL_EDGES, 10)) return
        push()
        strokeWeight(2)
        noFill()
        stroke(255, 200)
        ellipse(this.pos.x, this.pos.y, 13)
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
        pop()
    }
}