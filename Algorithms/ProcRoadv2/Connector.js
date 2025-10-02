class Connector{
    constructor(incomingSegmentID, outgoingSegmentID, pos, id){
        this.pos = pos
        this.incomingSegmentID = incomingSegmentID
        this.outgoingSegmentID = outgoingSegmentID
        this.road = undefined
        this.id = id
    }

    show(){
        push()
        strokeWeight(1.5)
        noFill()
        stroke(0, 0, 255)
        ellipse(this.pos.x, this.pos.y, 10, 10)
        pop()
    }
}