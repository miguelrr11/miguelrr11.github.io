const MIN_ROUTE_LEN = 8

class CarManager{
    constructor(road){
        this.cars = []
        this.road = road
        this.globalCarID = 0
    }

    addCars(num){
        for(let i = 0; i < num; i++){
            let car = new Car(this.road, this.globalCarID++)
            car.route = this.setRoute(car)
            this.cars.push(car)
        }
    }

    setRoute(car){
        let route = []
        let curSeg = car.getCurSeg()
        for(let i = 0; i < MIN_ROUTE_LEN; i++){
            if(curSeg == undefined) {console.log('Error fetching curSeg'); return []}
            let toConn = curSeg.toConnector
            if(toConn == undefined) {console.log('Error fetching toConn'); return []}
            let nextSegID = toConn.chooseOutRandom()
            let nextSeg = this.road.findIntersecSeg(nextSegID) || this.road.findSegment(nextSegID)
            if(nextSeg == undefined) {console.log('Error fetching nextSeg'); return []}
            route.push(nextSeg.id)
            curSeg = nextSeg
        }
        return route
    }

    checkRoute(car){
        //if car is in the same segment as the last connector in its route, recalculate route
        if(car.route.length == 0) return
        let lastSegID = car.route[car.route.length - 1]
        let curSeg = car.getCurSeg()
        if(curSeg == undefined) return
        if(curSeg.id == lastSegID){
            car.route = this.setRoute(car)
            car.routeIndex = 0
        }
    }

    removeCars(){
        this.cars = []
    }

    update(dtMult = 1){
        for(let car of this.cars) {
            car.update(deltaTime/16 * dtMult)
            this.checkRoute(car)
        }
    }

    show(){
        push()
        fill(255, 0, 0)
        noStroke()
        for(let i = 0; i < this.cars.length; i++){
            let car = this.cars[i]
            car.show(i == 0)
        }
        pop()
    }
}