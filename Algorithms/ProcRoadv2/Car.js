class Car{
    constructor(road){
        this.segmentID = undefined
        this.segTrav = 0        //the travelled length of the current segment
        this.speed = random(1, 4)
        this.road = road
        if(road.segments.length > 0){
            this.segmentID = random(road.segments).id
        }
        this.isOnIntersection = false
    }

    update(dt = 1){
        if(this.segmentID != undefined){
            let segment = this.getCurSeg()
            if(segment){
                if(segment.fromPos && segment.toPos){
                    if(this.speed > 0){
                        this.segTrav += this.speed * dt
                        if(this.segTrav > segment.getLen()){
                            if(!this.isOnIntersection && segment.toConnectorID != undefined){
                                let connector = this.road.findConnector(segment.toConnectorID)
                                let intersecSegChosenID = connector.chooseOutRandom()
                                this.segmentID = intersecSegChosenID
                                this.segTrav = 0
                                this.isOnIntersection = true
                            }
                            else if(this.isOnIntersection && segment.toConnectorID != undefined){
                                let connector = this.road.findConnector(segment.toConnectorID)
                                let outSegID = connector.outgoingSegmentIDs[0]
                                this.segmentID = outSegID
                                this.segTrav = 0
                                this.isOnIntersection = false
                            }
                        }
                    }
                }
            }
        }
    }

    getCurSeg(){
        return this.isOnIntersection ? this.road.findIntersecSeg(this.segmentID) :this.road.findSegment(this.segmentID)
    }

    getCurPos(){
        return this.getCurSeg()?.getPos(this.segTrav)
    }

    show(){
        push()
        if(this.segmentID != undefined){
            let pos = this.getCurPos()
            if(pos){
                fill(255, 255, 0)
                stroke(0)
                strokeWeight(1)
                ellipse(pos.x, pos.y, 8, 8) 
            }
        }
        pop()
    }
}