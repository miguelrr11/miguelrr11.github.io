class CarManager{
    constructor(road){
        this.cars = []
        this.road = road
    }

    addCars(num){
        for(let i = 0; i < num; i++){
            let car = new Car(this.road)
            this.cars.push(car)
        }
    }

    removeCars(){
        this.cars = []
    }

    update(dtMult = 1){
        for(let car of this.cars) {
            car.update(deltaTime/16 * dtMult)
        }
    }

    show(){
        push()
        fill(255, 0, 0)
        noStroke()
        for(let car of this.cars) {
            car.show()
        }
        pop()
    }
}