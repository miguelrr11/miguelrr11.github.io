//Path test
//Miguel Rodríguez
//24-09-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let road

let cars = []
let nCars = 5

function setup(){
    createCanvas(WIDTH, HEIGHT)
    let path = new Path()
    path.constructSegments(points1, false)
    

    let path2 = new Path()
    path2.constructSegments(points2, false)

    for(let i=0; i<nCars; i++){
        path.addCar(new Car(path))
        path2.addCar(new Car(path2))
    }

    road = new Road([path, path2])

    path.col = color(255, 20, 50)
    path2.col = color(20, 150, 255)

    road.addIntersection(path2, path2.segments[0], path, path.segments[2], createVector(300, 400))
    road.addIntersection(path, path.segments[1], path2, path2.segments[1], createVector(400, 300))
}

function draw(){
    background(0)
    road.show()
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
