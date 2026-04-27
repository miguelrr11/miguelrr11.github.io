const SAFE_DISTANCE = 50
const DETECT_DISTANCE = 130  // how far ahead to scan for a lead car (IDM needs look-ahead > braking distance)

// Intelligent Driver Model parameters  (units: pixels / normalized-frame)
const IDM_S0 = 22        // minimum bumper-to-bumper gap when stopped (≈ one car length)
const IDM_T  = 16        // desired time headway (frames)
const IDM_A  = 0.07      // max comfortable acceleration
const IDM_B  = 0.25      // max comfortable deceleration (must be > IDM_A to brake fast enough)
const CAR_LEN = 22       // visual car length used to convert centre-to-centre dist to gap

class Car{
    constructor(road){
        this.segmentID = undefined
        this.segTrav = 0        //the travelled length of the current segment
        this.speed = 0
        this.maxSpeed = random(2, 4)
        this.road = road
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
                    break
                }
            }
            if(!inserted) seg.cars.push(this)
        }
        this.isOnIntersection = false
        this.accelerating = true
        this.col = color(random(255), random(255), random(255))
    }

    whatIndexOfSegmentIsCarOn(){
        let segment = this.getCurSeg()
        if(segment == undefined) return undefined
        return segment.cars.indexOf(this)
    }

    changeSegment(oldSegment, newSegment){
        //remove from old segment
        let index = oldSegment.cars.indexOf(this)
        if(index > -1) oldSegment.cars.splice(index, 1)
        //add to new segment
        newSegment.cars.push(this)
    }

    carAhead(){
        let segment = this.getCurSeg()
        if(segment == undefined) return false
        return segment.carAheadInSafeDistance(DETECT_DISTANCE, this.segTrav)
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
                    let acc

                    if(distToCarObj && distToCarObj.car){
                        // bumper-to-bumper gap (centre-to-centre minus one car length)
                        let s = Math.max(distToCarObj.distance - CAR_LEN, 0.1)
                        let dv = this.speed - distToCarObj.car.speed   // positive = closing in
                        // desired gap: standing gap + speed * headway + brake term
                        let sStar = IDM_S0 + Math.max(0, this.speed * IDM_T + this.speed * dv / (2 * Math.sqrt(IDM_A * IDM_B)))
                        // full IDM formula
                        acc = IDM_A * (1 - Math.pow(this.speed / this.maxSpeed, 4) - Math.pow(sStar / s, 2))
                        this.accelerating = false
                        this.carTooClose = distToCarObj.car
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
                        let connector = this.road.findConnector(segment.toConnectorID)
                        let intersecSegChosenID = connector.chooseOutRandom()

                        if(intersecSegChosenID == undefined){
                            return
                        }
                        let oldSegment = segment
                        this.segmentID = intersecSegChosenID
                        this.segTrav = 0
                        this.isOnIntersection = !this.isOnIntersection
                        let intersecSegChosen = this.getCurSeg()
                        this.changeSegment(oldSegment, intersecSegChosen)
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
        fill(this.col)
    }

    show(){
        push()
        let showDebug = this.road.tool.showCarDebug
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
                rect(0, 0, 22, 10)
                noStroke()

                if(showDebug){
                    fill(255)
                    textSize(8)
                    textAlign(CENTER, CENTER)
                    let str = 'I: ' + this.whatIndexOfSegmentIsCarOn() + '\nS: ' + round(this.speed, 2)
                    if(!this.accelerating) str += '\ng: ' + round(this.debugGap, 1)
                    text(str, 0, 0)

                    

                    noFill()
                    stroke(0, 255, 0, 100)
                    strokeWeight(.5)
                    ellipse(0, 0, SAFE_DISTANCE * 2)
                }
            }
        }
        pop()
    }
}