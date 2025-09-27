class Road{
    constructor(paths){
        this.cars = []
        this.paths = paths
        this.intersections = []
        for(let path of this.paths){
            path.road = this
        }
    }

    addRandomCar(){
        if(this.paths.length === 0) return
        let path = random(this.paths)
        let car = new Car(path)
        path.addCar(car)
        this.cars.push(car)
    }

    addIntersection(fromPath, fromSeg, toPath, toSeg, pos){
        this.intersections.push(new Intersection(fromPath, fromSeg, toPath, toSeg, pos))
    }

    anyIntersectionNearby(car){
        let res = []
        if(this.intersections.length === 0) return false
        for(let inter of this.intersections){
            if(dist(car.pos.x, car.pos.y, inter.pos.x, inter.pos.y) < INTER_DIST){
                res.push(inter)
            }
        }
        return res
    }

    intersectionNearby(path, car){
        //find all intersections for this path and segment
        if(this.intersections.length === 0) return null
        let res = []
        for(let inter of this.intersections){
            if(inter.fromPath === path && inter.fromSeg === car.path.segments[car.currentSeg]){
                let seg = path.segments[car.currentSeg]
                let interDist = p5.Vector.dist(seg.a, inter.pos)
                if(interDist - car.segPos < INTER_DIST && interDist - car.segPos > 0){
                    res.push(inter)
                }
            }
        }
        return res
    }

    update(){
        for(let path of this.paths){
            path.updateSegments()
            path.updateCarsPos()
        }
    }

    show(){
        for(let path of this.paths){
            path.show()
            path.showCars()
        }
        for(let inter of this.intersections){
            inter.show()
        }
    }
}