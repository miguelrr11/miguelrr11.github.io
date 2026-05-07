const DETECT_DISTANCE = 130  // how far ahead to scan for a lead car (IDM needs look-ahead > braking distance)

// Intelligent Driver Model parameters  (units: pixels / normalized-frame)
const IDM_S0 = 22        // minimum bumper-to-bumper gap when stopped (≈ one car length)
const IDM_T  = 16        // desired time headway (frames)
const IDM_A  = 0.07      // max comfortable acceleration
const IDM_B  = 0.25      // max comfortable deceleration (must be > IDM_A to brake fast enough)
const CAR_LEN = 22       // visual car length used to convert centre-to-centre dist to gap

class Car{
    constructor(road, id){
        this.id = id
        this.segmentID = undefined
        this.segTrav = 0        //the travelled length of the current segment
        this.speed = 0
        this.maxSpeed = random(1.6, 2.4)
        this.road = road
        this.worldPos = undefined

        if(road.segments.size > 0){
            let segs = Array.from(road.segments.values())
            let seg = random(segs)
            this.segmentID = seg.id
            this.segTrav = random(seg.getLen())
            let inserted = false
            for(let car of seg.cars){
                if(car.segTrav > this.segTrav){
                    let index = seg.cars.indexOf(car)
                    seg.cars.splice(index, 0, this)
                    inserted = true
                    this.worldPos = this.getCurPos()
                    break
                }
            }
            if(!inserted) seg.cars.push(this)
        }

        this.isOnIntersection = false
        this.accelerating = true
        this.col = color(random(255), random(255), random(255))

        this.route = [] // array of segments/intersecSegments IDs to follow
        this.routeIndex = 0 // index of the next connector in the route to head towards
    }

    whatIndexOfSegmentIsCarOn(){
        let segment = this.getCurSeg()
        if(segment == undefined) return undefined
        return segment.cars.indexOf(this)
    }

    changeSegment(oldSegment, newSegment){
        if(newSegment == undefined) {
            console.log('Error: new segment is undefined when changing segments')
            return
        }

        let success = oldSegment.removeCar(this.id)
        if(success == -1) console.log('Error: car not found in old segment when changing segments')

        
        newSegment.cars.push(this)

        this.segmentID = newSegment.id
        this.segTrav = 0
        this.isOnIntersection = !this.isOnIntersection
    }

    carAhead(){
        let result = this._scanAhead(this.getCurSeg(), this.isOnIntersection, this.segTrav, 0)
        if(result) this.acumTrav = result.acumDist // debug
        return result ? {car: result.car, distance: result.distance} : null
    }

    _scanAhead(seg, isInter, segTrav, acumDist){
        if(!seg || acumDist >= DETECT_DISTANCE) return null

        let carObj = seg.carAheadInSafeDistance(DETECT_DISTANCE - acumDist, segTrav)
        if(carObj.car){
            return {car: carObj.car, distance: acumDist + carObj.distance, acumDist: acumDist}
        }

        let newAccumDist = acumDist + seg.getLen() - segTrav
        if(newAccumDist >= DETECT_DISTANCE) return null

        let toConnector = seg.toConnector || this.road.findConnector(seg.toConnectorID)
        if(!toConnector) return null

        if(isInter){
            // intersegment -> exit connector -> one regular segment
            let nextSegID = toConnector.outgoingSegmentIDs[0]
            if(nextSegID == undefined) return null
            return this._scanAhead(this.road.findSegment(nextSegID), false, 0, newAccumDist)
        } else {
            // regular segment -> enter connector -> all active outgoing intersegments
            let outgoingIDs = toConnector.getOutgoingActiveIntersegs()
            let closest = null
            for(let isegID of outgoingIDs){
                let result = this._scanAhead(this.road.findIntersecSeg(isegID), true, 0, newAccumDist)
                if(result && (!closest || result.distance < closest.distance)) closest = result
            }
            return closest
        }
    }


    showCarAheadDebug(){
        let carObj = this.carAhead()
        if(carObj && carObj.car){
            push()
            stroke(255, 0, 0)
            noFill()
            ellipse(this.worldPos.x, this.worldPos.y, carObj.distance * 2)
            pop()
        }
    }

    // checks if there's a car ahead in a segment that finishes in the same segment as this one.
    carIntersecting(){
        // we need all segments that finish in the same toConn as this one
        let mySeg = this.getCurSeg()
        let conn = mySeg.toConnector
        let segsIDs = conn.incomingSegmentIDs || []
        // now filter our own, and get the object no id
        let segs = segsIDs.filter(id => id != mySeg.id).map(id => this.road.findIntersecSeg(id)).filter(seg => seg != undefined)
        // now we save the car whose distance to the connector is the closest but still smaller than the distance from this car to the connector
        let closestCar = null
        let myDistToConn = mySeg.getLen() - this.segTrav
        for(let seg of segs){
            if(seg.cars.length > 0){
                for(let car of seg.cars){
                    let distToConn = seg.getLen() - car.segTrav
                    if(distToConn < myDistToConn){
                        let distanceFromMyCarToThatCar = dist(this.worldPos.x, this.worldPos.y, car.worldPos.x, car.worldPos.y)
                        closestCar = {car: car, distance: distanceFromMyCarToThatCar}
                        myDistToConn = distToConn
                    }
                }
            }
        }
        return closestCar
    }


    update(dt = deltaTime/16){
        if(this.segmentID != undefined){
            let segment = this.getCurSeg()
            if(segment){
                if(segment.fromPos && segment.toPos){

                    // --- Intelligent Driver Model ---
                    // Free-road term: accelerate toward maxSpeed with a gentle S-curve
                    let aFree = IDM_A * (1 - Math.pow(this.speed / this.maxSpeed, 4))

                    let distToCarObj = this.carAhead()
                    let distToCarObjIntersecting = this.carIntersecting()

                    let finalDistToCarObj = null
                    // save the closest one
                    if(distToCarObj && distToCarObjIntersecting){
                        finalDistToCarObj = distToCarObj.distance < distToCarObjIntersecting.distance ? distToCarObj : distToCarObjIntersecting
                    }
                    else if(distToCarObj){
                        finalDistToCarObj = distToCarObj
                    }
                    else if(distToCarObjIntersecting){
                        finalDistToCarObj = distToCarObjIntersecting
                    }
                    let acc

                    if(finalDistToCarObj && finalDistToCarObj.car){
                        // bumper-to-bumper gap (centre-to-centre minus one car length)
                        let s = Math.max(finalDistToCarObj.distance - CAR_LEN, 0.1)
                        let dv = this.speed - finalDistToCarObj.car.speed   // positive = closing in
                        // desired gap: standing gap + speed * headway + brake term
                        let sStar = IDM_S0 + Math.max(0, this.speed * IDM_T + this.speed * dv / (2 * Math.sqrt(IDM_A * IDM_B)))
                        // full IDM formula
                        acc = IDM_A * (1 - Math.pow(this.speed / this.maxSpeed, 4) - Math.pow(sStar / s, 2))
                        this.accelerating = false
                        this.carTooClose = finalDistToCarObj.car
                        this.debugGap = s
                        this.debugSStar = sStar
                    } else {
                        acc = aFree
                        this.accelerating = true
                        this.carTooClose = null
                    }

                    this.speed += acc * dt
                    if(this.speed > this.maxSpeed) this.speed = this.maxSpeed
                    if(this.speed < 0) this.speed = 0
                    this.segTrav += this.speed * dt

                    if(this.segTrav > segment.getLen()){
                        let oldSegment = segment
                        let newSegment = this.findSegmentOrIntersecSegment(this.route[this.routeIndex], this.isOnIntersection)
                        this.routeIndex++
                        this.changeSegment(oldSegment, newSegment)
                    }
                }
            }
        }
    }

    findSegmentOrIntersecSegment(id, intersection){
        let bool = intersection == undefined ? this.isOnIntersection : intersection
        return bool ? 
                this.road.findSegment(id) : 
                this.road.findIntersecSeg(id)
    }

    getCurSeg(){
        return this.isOnIntersection ? this.road.findIntersecSeg(this.segmentID) : this.road.findSegment(this.segmentID)
    }

    getCurPos(){
        return this.getCurSeg()?.getPos(this.segTrav)
    }

    setWorldPos(){
        this.worldPos = this.getCurSeg()?.getWorldPos(this.segTrav)
    }

    setStyle(){
        fill(this.col)
    }

    showRoute(){
        if(this.route.length == 0) return
        push()
        stroke(0, 0, 255)
        strokeWeight(3)
        noFill()
        let curSeg = this.getCurSeg()
        beginShape()
        if(this.isOnIntersection){
            let index = curSeg.getIndexOfBP(this.segTrav)
            for(let i = index; i < curSeg.bezierPoints.length; i+=2){
                let bp = curSeg.bezierPoints
                vertex(bp[i], bp[i+1])
            }
        }
        else{
            let pos = this.getCurPos()
            if(pos == undefined) {pop(); return}
            vertex(pos.x, pos.y)
            vertex(curSeg.toPos.x, curSeg.toPos.y)
        }
        let inter = this.isOnIntersection
        for(let i = this.routeIndex; i < this.route.length; i++){
            let seg = this.findSegmentOrIntersecSegment(this.route[i], inter)
            if(seg == undefined) continue  
            curSeg = seg 
            inter = !inter
            if(inter){
                for(let i = 0; i < curSeg.bezierPoints.length; i+=2){
                    let bp = curSeg.bezierPoints
                    vertex(bp[i], bp[i+1])
                }
            }
            else{
                vertex(curSeg.fromPos.x, curSeg.fromPos.y)
                vertex(curSeg.toPos.x, curSeg.toPos.y)
            }
        }
        endShape()
        pop()
    }

    show(showRoute = false){
        let showDebug = this.road.tool.showOptions.SHOW_CAR_DEBUG
        if(showDebug && showRoute) {this.showRoute(); this.showCarAheadDebug()}
        push()
        if(this.segmentID != undefined){
            let pos = this.getCurPos()
            if(pos == undefined) {pop(); return}
            translate(pos.x, pos.y)
            let ang = this.getCurSeg().getDir(this.segTrav)
            rotate(ang)
            if(pos){
                this.setStyle()
                if(!this.accelerating && showDebug) stroke(this.carTooClose ? this.carTooClose.col : 0)
                else noStroke()
                rectMode(CENTER)
                rect(0, 0, 22, 10, 2)
                noStroke()

                if(showDebug){
                    rotate(-ang)
                    fill(255)
                    stroke(0)
                    textSize(9)
                    textAlign(CENTER, CENTER)
                    let str = 'I: ' + this.whatIndexOfSegmentIsCarOn() + '\nS: ' + round(this.speed, 2)
                    if(!this.accelerating) str += '\ng: ' + round(this.debugGap, 1)
                    if(this.acumTrav != undefined) str += '\nAT: ' + round(this.acumTrav, 1)
                    str += '\nID: ' + this.id
                    //text(str, 0, 0)

                    noFill()
                    stroke(0, 255, 0, 50)
                    strokeWeight(.5)
                    ellipse(0, 0, DETECT_DISTANCE * 2)

                    
                }
            }
        }
        pop()

        
    }
}