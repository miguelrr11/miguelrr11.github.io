const DIST_RED = 40
const DIST_RED_PARDON = 25
const DIST_CAR = 40

class Path{
    constructor(){
        this.segments = []
        this.cars = []
    }

    constructSegments(points, skip = true){
        this.segments = []
        let off = skip ? 2 : 1
        for(let i = 0; i < points.length; i+=off){
            let p1 = points[i]
            let p2 = points[(i+1) % points.length]
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

            segIdx = (segIdx + 1) % this.segments.length
            visited += 1
        }

        return res
    }


    redLightAhead(car){
        if(this.segments.length === 0 || !this.segments[car.currentSeg].hasRedLight) return false

        let seg = this.segments[car.currentSeg]
        return seg.red && car.segPos < seg.redLightRelPos && (seg.redLightRelPos - car.segPos) < DIST_RED && (seg.redLightRelPos - car.segPos) > DIST_RED_PARDON
    }

    updateCarPos(car){
        if(this.segments.length === 0) return

        if(!car.pos){
            car.pos = this.segments[0].a.copy()
            car.currentSeg = 0
            car.segPos = 0
            return
        }

        let seg = this.segments[car.currentSeg]

        let redLightAhead = this.redLightAhead(car)
        let carsAhead = this.carsAhead(car)
        let hasToBreak = redLightAhead || carsAhead.length > 0

        if(hasToBreak){
            car.break()
        }

        else car.step()

        if(car.segPos > seg.len){
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

        car.pos = p5.Vector.add(seg.a, p5.Vector.mult(seg.dir, car.segPos))
    }

    showCars(){
        for(let car of this.cars){
            car.show()
        }
    }

    show(){
        for(let seg of this.segments){
            seg.show()
        }
    }
}