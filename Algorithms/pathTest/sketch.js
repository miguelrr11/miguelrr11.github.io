//Path test
//Miguel Rodríguez
//24-09-2025

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 800

let road
let cars = []
let nCars = 7
let iters = 1

let SHOW_DEBUG = false

function setup(){
    createCanvas(WIDTH, HEIGHT)
    let p = JSON.parse(getItem('paths'))
    let i = JSON.parse(getItem('intersections'))
    road = createRoad(p, i, nCars)

    //createLightSch([road.paths[0].segments[2], road.paths[1].segments[0], road.paths[2].segments[2]])
}

function createRoad(pathPoints, intersections, nCars){
    let paths = []
    for(const path of pathPoints){
        let p = new Path(path.id)
        for(const seg of path.segments){
            p.addSegment(createVector(seg.a.x, seg.a.y), createVector(seg.b.x, seg.b.y), seg.id)
        }
        paths.push(p)
    }
    let road = new Road(paths)
    if(intersections != null && intersections.outputIntersections.length > 0){
        for(const inter of intersections.outputIntersections){
            let fromPath = paths.find(p => p.id === inter.from.path)
            let fromSeg = fromPath.segments.find(s => s.id === inter.from.segment)
            let toPath = paths.find(p => p.id === inter.to.path)
            let toSeg = toPath.segments.find(s => s.id === inter.to.segment)
            let pos = createVector(inter.point.x, inter.point.y)
            road.addIntersection(fromPath, fromSeg, toPath, toSeg, pos)

            console.log(inter.from.path + ' ' + inter.from.segment + ' ' + inter.to.path + ' ' + inter.to.segment)
        }
    }
    for(let i=0; i<nCars; i++){
        let car1 = new Car(paths[0], i)
        paths[0].addCar(car1)
        road.cars.push(car1)
        let car2 = new Car(paths[1], i + nCars)
        paths[1].addCar(car2)
        road.cars.push(car2)
    }
    for(const p of paths){
        p.col = color(random(100, 255), random(100, 255), random(100, 255))
    }
    return road
}

function draw(){
    background(0)
    if(keyIsPressed) iters = 40
    else iters = 1
    for(let i = 0; i < iters; i++){ 
        road.update()
        road.show()
    }

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

function createLightSch(segments){
    let lights = []
    for(let i = 0; i < segments.length; i++){
        let light = segments[i].createRedLight(0.85, 0, 600, i == 0)
        light.individual = false
        lights.push(light)
    }

    for(let i = 0; i < lights.length; i++){
        lights[i].starts(lights[(i + 1) % lights.length])
    }

}