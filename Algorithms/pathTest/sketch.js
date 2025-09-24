//Path test
//Miguel Rodríguez
//24-09-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let path

let cars = []
let nCars = 20

function setup(){
    createCanvas(WIDTH, HEIGHT)
    path = new Path()
    path.constructSegments(road)
    //path.constructSegments(createPointsForCircle(WIDTH/2, HEIGHT/2, 200, 50), false)

    for(let i=0; i<nCars; i++){
        let car = new Car(path)
        path.addCar(car)
    }

}

function draw(){
    background(0)
    path.updateCarsPos()
    path.show()
    path.showCars()
}

function createPointsForCircle(x, y, r, n){
    let points = []
    for(let i=0; i<n; i++){
        let angle = map(i, 0, n, 0, TWO_PI)
        let px = x + r * cos(angle)
        let py = y + r * sin(angle)
        points.push({x: px, y: py, z: -1})
    }
    return points
}
