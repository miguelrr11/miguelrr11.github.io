class InterSegment{
    constructor(id, fromConnectorID, toConnectorID, visualDir, bezierPoints){
        this.id = id
        this.fromConnectorID = fromConnectorID
        this.toConnectorID = toConnectorID
        this.fromConnector = undefined  // Direct object reference
        this.toConnector = undefined    // Direct object reference
        this.visualDir = visualDir
        this.bezierPoints = []
        for(let p of bezierPoints) this.bezierPoints.push(p.x, p.y) // Flattened
        this.road = undefined
        this.len = undefined
        this.fromPos = undefined
        this.toPos = undefined
        this.dir = undefined

        //all intersections set its intersegments to active = true, but then the user can disable some of them
        this.active = true

        // car stuff
        this.cars = [] // ordered array of cars that are currently on the segment, updated by car manager
    }

    removeCar(carID){
        for(let i = 0; i < this.cars.length; i++){
            if(this.cars[i].id == carID){
                this.cars.splice(i, 1)
                return i
            }
        }
        return -1
    }

    carAheadInSafeDistance(safeDistance, segTrav){
        let closestCar = null
        let closestDistance = Infinity
        for(let car of this.cars){
            if(car.segTrav > segTrav && car.segTrav - segTrav < safeDistance){
                if(car.segTrav - segTrav < closestDistance){
                    closestDistance = car.segTrav - segTrav
                    closestCar = car
                }
            }
        }
        return {car: closestCar, distance: closestDistance}
    }

    getDir(travelled){
        if(this.len == undefined) this.getLen()
        let bp = this.bezierPoints

        let pointCount = bp.length / 2

        let travelledIndex = mapp(travelled, 0, this.getLen(), 0, pointCount - 1)
        let remaining = getDecimalPart(travelledIndex)

        let indexA = Math.floor(travelledIndex)
        let indexB = Math.min(indexA + 1, pointCount - 1)

        let ax = bp[indexA * 2]
        let ay = bp[indexA * 2 + 1]
        let bx = bp[indexB * 2]
        let by = bp[indexB * 2 + 1]

        return Math.atan2(by - ay, bx - ax)
    }



    getPos(travelled){
        if(this.len == undefined) this.getLen()
        let bp = this.bezierPoints

        let pointCount = bp.length / 2

        let travelledIndex = mapp(travelled, 0, this.getLen(), 0, pointCount - 1)
        let remaining = getDecimalPart(travelledIndex)

        let indexA = Math.floor(travelledIndex)
        let indexB = Math.min(indexA + 1, pointCount - 1)

        let ax = bp[indexA * 2]
        let ay = bp[indexA * 2 + 1]
        let bx = bp[indexB * 2]
        let by = bp[indexB * 2 + 1]

        return lerrposFlat(ax, ay, bx, by, remaining)
    }

    getLen(){
        let len = 0
        for(let i = 0; i < this.bezierPoints.length-2; i+=4){
            len += distt(this.bezierPoints[i], this.bezierPoints[i+1], this.bezierPoints[i+2], this.bezierPoints[i+3])
        }
        this.len = len
        return this.len * 2
    }


    /*
      
        c0 ------- c1
        |           |
        |           |
        |           |
        c2--------- c3

     */

    showLane(col, useOutline16 = false){
        return
        push()
        let fromPos = {x: this.bezierPoints[0], y: this.bezierPoints[1]}
        let toPos = {x: this.bezierPoints[this.bezierPoints.length-2], y: this.bezierPoints[this.bezierPoints.length-1]}

        if(!inBoundsCorners(fromPos.x, fromPos.y, GLOBAL_EDGES) && !inBoundsCorners(toPos.x, toPos.y, GLOBAL_EDGES)){
            pop()
            return
        }

        strokeWeight(1)
        stroke(255, 200)
        noStroke()
        this.visualDir == 'for' ? fill(COL_LANE_1) : fill(COL_LANE_2)
        if(col) fill(col)
        beginShape()
        if(!useOutline16) for(let p of this.outline) vertex(p.x, p.y)
        else for(let p of this.outline16) vertex(p.x, p.y)
        endShape()

        // stroke(0, 255, 0)
        // strokeWeight(2)
        // for(let p of this.outline) point(p.x, p.y)
        pop()
    }

    showBezier(SHOW_TAGS){
        let first = {x: this.bezierPoints[0], y: this.bezierPoints[1] }
        let last = {x: this.bezierPoints[this.bezierPoints.length-2], y: this.bezierPoints[this.bezierPoints.length-1] }
        if(!inBoundsCorners(first.x, first.y, GLOBAL_EDGES) && !inBoundsCorners(last.x, last.y, GLOBAL_EDGES)){
            return
        }
        push()
        strokeWeight(1.5)
        this.active ? stroke(COL_PATHS) : stroke(120)
        noFill()
        beginShape()
        for(let i = 0; i < this.bezierPoints.length; i+=2){
            vertex(this.bezierPoints[i], this.bezierPoints[i+1])
        }
        endShape()
        if(SHOW_TAGS){
            let first = {x: this.bezierPoints[0], y: this.bezierPoints[1] }
            let last = {x: this.bezierPoints[this.bezierPoints.length-2], y: this.bezierPoints[this.bezierPoints.length-1] }
            let midPos = {x: (first.x + last.x) / 2, y: (first.y + last.y) / 2}
            noStroke()
            fill(0, 255, 0)
            textAlign(CENTER)
            textSize(4)
            let str = '[' + this.id + ']' + '  C: ' + 
                      (this.fromConnectorID != undefined ? this.fromConnectorID : '_') + '-' + (this.toConnectorID != undefined ? this.toConnectorID : '_')
            let bbox = textBounds(str, midPos.x, midPos.y)
            fill(0)
            rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
            fill(255)
            text(str, midPos.x, midPos.y)
        }
        pop()
    }

    showCarDebug(){
        push()
        let midIndex = Math.floor(this.bezierPoints.length / 4) * 2
        let midPos = {x: this.bezierPoints[midIndex], y: this.bezierPoints[midIndex + 1]}
        translate(midPos.x, midPos.y)
        textAlign(CENTER)
        rectMode(CENTER)
        textSize(8)
        let str = 'C: ' + this.cars.length
        let bbox = textBounds(str, 0, 0)
        fill(255, 0, 0, 150)
        noStroke()
        rectMode(CORNER)
        rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
        fill(255)
        text(str, 0, 0)
        pop()
    }
}