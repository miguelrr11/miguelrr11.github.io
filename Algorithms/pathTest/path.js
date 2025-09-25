const DIST_RED = 40
const DIST_RED_PARDON = 15
const DIST_CAR = 40
const INTER_DIST = 40
const DIST_CROSS_INTER = 2

let auxCar = null

// paths are supposed to start on an intersection and end on another intersection

class Path{
    constructor(){
        this.segments = []
        this.cars = []
        this.col = 255
    }

    addSegment(a, b){
        this.segments.push(new Segment(a.x, a.y, b.x, b.y))
    }

    constructSegments(points, skip = true){
        this.segments = []
        let off = skip ? 2 : 1
        for(let i = 0; i < points.length-1; i+=off){
            let p1 = points[i]
            let p2 = points[(i+1)]
            this.segments.push(new Segment(p1.x, p1.y, p2.x, p2.y))
        }
    }

    addCar(car){
        this.cars.push(car)
        this.assignRandomPos(car)
    }

    assignRandomPos(car){
        if(this.segments.length === 0) return

        let segIndex = floor(random(this.segments.length))
        let seg = this.segments[segIndex]
        car.currentSeg = segIndex
        car.segPos = random(seg.len)
        car.pos = p5.Vector.add(seg.a, p5.Vector.mult(seg.dir, car.segPos))
    }

    updateCarsPos(){
        for(let car of this.cars){
            this.updateCarPos(car)
        }
    }

    carsAhead(car) {
        if(!car) return []
        const trackLen = this.segments.reduce((sum, s) => sum + s.len, 0)
        const lookahead = Math.min(DIST_CAR, trackLen - 1e-6) //Avoid full loop
        const res = [];

        const curSegLen = this.segments[car.currentSeg].len;
        res.push(
            ...this.cars.filter(c =>
                c !== car &&
                c.currentSeg === car.currentSeg &&
                c.segPos > car.segPos &&
                (c.segPos - car.segPos) <= lookahead   
            )
        );

        let remaining = lookahead - (curSegLen - car.segPos)
        if (remaining <= 0) return res

        let segIdx = (car.currentSeg + 1) % this.segments.length
        if(this.noMoreRoad(car.currentSeg)) return res
        let visited = 0;
        while (remaining > 0 && visited < this.segments.length - 1) {
            const segLen = this.segments[segIdx].len

            if (remaining >= segLen) {
                res.push(
                    ...this.cars.filter(c =>
                        c !== car &&
                        c.currentSeg === segIdx
                    )
                )
                remaining -= segLen;
            } 

            else {
                res.push(
                ...this.cars.filter(c =>
                    c !== car &&
                    c.currentSeg === segIdx &&
                    c.segPos <= remaining           
                )
                )
                break
            }

            let oldSeg = segIdx
            segIdx = (segIdx + 1) % this.segments.length

            //stop if the segments are not connected
            if(this.noMoreRoad(oldSeg)) break

            visited += 1
        }

        return res
    }

    noMoreRoad(segIndex){
        let curSeg = this.segments[segIndex]
        let nextSeg = this.segments[(segIndex + 1) % this.segments.length]
        return curSeg.b.x !== nextSeg.a.x || curSeg.b.y !== nextSeg.a.y
    }


    redLightAhead(car){
        if(this.segments.length === 0 || !this.segments[car.currentSeg].hasRedLight) return false

        let seg = this.segments[car.currentSeg]
        return seg.light.red && car.segPos < seg.light.redLightRelPos && 
        (seg.light.redLightRelPos - car.segPos) < DIST_RED && 
        (seg.light.redLightRelPos - car.segPos) > DIST_RED_PARDON
    }

    carsBehindIntersection(seg, relPosInter, distance){
        if(this.segments.length === 0) return []
        const res = [];

        res.push(
            ...this.cars.filter(c =>
                c.currentSeg === this.segments.indexOf(seg) &&
                c.segPos < relPosInter &&
                (relPosInter - c.segPos) <= distance   
            )
        );

        return res
    }

    updateCarPos(car){
        car.carsAhead = []
        if(this.segments.length === 0) return

        if(!car.pos){
            car.pos = this.segments[0].a.copy()
            car.currentSeg = 0
            car.segPos = 0
            return
        }

        let seg = this.segments[car.currentSeg]

        let redLightAhead = this.redLightAhead(car)
        let actualCarsAhead = this.carsAhead(car)
        car.carsAhead = actualCarsAhead
        let carsAhead = actualCarsAhead.length > 0
        let noMoreRoad = this.noMoreRoad(car.currentSeg) && this.segments[car.currentSeg].len - car.segPos < DIST_CAR

        let interNearby = this.road.intersectionNearby(this, car)
        let anyIntersectionNearby = this.road.anyIntersectionNearby(car)
        //the car has to slow down if there are any cars in the nearby coming intersections
        //but if the car is closest to the intersection, it has priority, so it doesnt slow down
        for(let inter of anyIntersectionNearby){
            if(inter.toPath == car.chosenIntersection?.toPath && inter.toSeg == car.chosenIntersection?.toSeg && inter != car.chosenIntersection){
                let path = inter.fromPath
                let seg = inter.fromSeg
                let relPosInter = p5.Vector.dist(seg.a, inter.pos)
                let carsBehindIntersection = path.carsBehindIntersection(seg, relPosInter, DIST_CAR)
                if(carsBehindIntersection.length > 0) {
                    let dCar = p5.Vector.dist(car.pos, inter.pos)
                    let dOtherCars = carsBehindIntersection.map(c => p5.Vector.dist(c.pos, inter.pos))
                    if(dCar > Math.min(...dOtherCars)) carsAhead = true
                    car.carsAhead.push(...carsBehindIntersection)
                }
            }
        }
    
        if(car.chosenIntersection == undefined && interNearby.length > 0){
            if(!noMoreRoad) interNearby.push(false) //continues in its own path -- uncomment !!!
            let randomInter = random(interNearby)
            if(randomInter){
                auxCar = new Car(randomInter.toPath)
                auxCar.currentSeg = randomInter.toPath.segments.indexOf(randomInter.toSeg)
                auxCar.segPos = p5.Vector.dist(randomInter.pos, randomInter.toSeg.a)
                auxCar.pos = randomInter.pos.copy()
                let otherCars = randomInter.toPath.carsAhead(auxCar)
                car.carsAhead.push(...otherCars)
                carsAhead = carsAhead || otherCars.length > 0
                noMoreRoad = false
                car.chosenIntersection = randomInter
            }
            else car.chosenIntersection = false
        }
        else{
            noMoreRoad = false
            if(car.chosenIntersection){
                auxCar = new Car(car.chosenIntersection.toPath)
                auxCar.currentSeg = car.chosenIntersection.toPath.segments.indexOf(car.chosenIntersection.toSeg)
                auxCar.segPos = p5.Vector.dist(car.chosenIntersection.pos, car.chosenIntersection.toSeg.a)
                auxCar.pos = car.chosenIntersection.pos.copy()
                let otherCars = car.chosenIntersection.toPath.carsAhead(auxCar)
                carsAhead = carsAhead || otherCars.length > 0
            }
            else if(car.chosenIntersection === false && interNearby.length == 0){
                car.chosenIntersection = undefined
            }
            
        }
        
        let hasToBreak = redLightAhead || carsAhead || noMoreRoad

        if(hasToBreak){
            car.break()
        }

        else car.step()

        if(car.segPos > seg.len && !this.noMoreRoad(car.currentSeg)){
            //car reached end of segment of the same path and continues in the same path
            car.currentSeg++
            if(car.currentSeg >= this.segments.length){
                car.pos = this.segments[0].a.copy()
                car.currentSeg = 0
                car.segPos = 0
                return
            }
            car.segPos = 0
            seg = this.segments[car.currentSeg]
        }
        else if(car.chosenIntersection && dist(car.pos.x, car.pos.y, car.chosenIntersection.pos.x, car.chosenIntersection.pos.y) < DIST_CROSS_INTER){
            //car crosses to another path at an intersection
            let inter = car.chosenIntersection
            for(let i = 0; i < inter.toPath.segments.length; i++){
                if(inter.toSeg === inter.toPath.segments[i]){
                    car.currentSeg = i
                    break
                }
            }
            car.path = inter.toPath
            car.segPos = p5.Vector.dist(car.pos, inter.toSeg.a)
            this.cars = this.cars.filter(c => c !== car)
            car.path.cars.push(car)
            car.chosenIntersection = undefined
            return
        }

        car.pos = p5.Vector.add(seg.a, p5.Vector.mult(seg.dir, car.segPos))
    }

    updateSegments(){
        for(let seg of this.segments){
            seg.update()
        }
    }

    showCars(){
        for(let car of this.cars){
            car.show()
        }
        // if(auxCar){
        //     auxCar.show(true)
        // }
    }

    show(){
        for(let seg of this.segments){
            seg.show(this.col)
        }
    }
}