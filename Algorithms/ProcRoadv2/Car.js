class Car{
    constructor(road){
        this.segmentID = undefined
        this.segTrav = 0        //the travelled length of the current segment
        this.speed = 2
        this.road = road
        if(road.segments.length > 0){
            this.segmentID = random(road.segments).id
        }
        this.isOnIntersection = false

        this.dead = false
    }



    update(dt = deltaTime/16){
        if(this.dead){
            return
        }
        if(this.segmentID != undefined){
            let segment = this.getCurSeg()
            if(segment){
                if(segment.fromPos && segment.toPos){
                    if(this.speed > 0){
                        this.segTrav += this.speed * dt
                        if(this.segTrav > segment.getLen()){
                            let connector = this.road.findConnector(segment.toConnectorID)
                            if(!connector){
                                this.dead = true
                                return
                            }
                            let intersecSegChosenID = connector.chooseOutRandom()
                            this.segmentID = intersecSegChosenID
                            this.segTrav = 0
                            this.isOnIntersection = !this.isOnIntersection
                        }
                    }
                }
            }
        }
    }

    getCurSeg(){
        return this.isOnIntersection ? this.road.findIntersecSeg(this.segmentID) : this.road.findSegment(this.segmentID)
    }

    getCurPos(){
        return this.getCurSeg()?.getPos(this.segTrav)
    }

    setStyle(){
        noStroke()
        fill(255, 255, 0)
    }

    show(){
        if(this.segmentID != undefined){
            let pos = this.getCurPos()
            if(pos){
                ellipse(pos.x, pos.y, 8, 8) 
            }
        }
    }
}