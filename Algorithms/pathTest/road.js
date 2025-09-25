class Road{
    constructor(paths){
        this.paths = paths
        this.intersections = []
        for(let path of this.paths){
            path.road = this
        }
    }

    addIntersection(fromPath, fromSeg, toPath, toSeg, pos){
        this.intersections.push(new Intersection(fromPath, fromSeg, toPath, toSeg, pos))
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

    show(){
        for(let path of this.paths){
            path.updateCarsPos()
            path.show()
            path.showCars()
        }
        for(let inter of this.intersections){
            inter.show()
        }
    }
}