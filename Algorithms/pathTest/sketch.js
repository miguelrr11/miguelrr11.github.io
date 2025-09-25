//Path test
//Miguel Rodríguez
//24-09-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let road

let cars = []
let nCars = 15

let iters = 1

function setup(){
    createCanvas(WIDTH, HEIGHT)
    road = createRoad(paths, intersections, nCars)

    createLightSch([road.paths[0].segments[2], road.paths[1].segments[0], road.paths[2].segments[2]])
}

function createRoad(pathPoints, intersections, nCars){
    let paths = []
    for(const path of pathPoints){
        let p = new Path()
        for(const seg of path.segments){
            p.addSegment(createVector(seg.a.x, seg.a.y), createVector(seg.b.x, seg.b.y))
        }
        p.id = paths.length
        paths.push(p)
    }
    let road = new Road(paths)
    for(const inter of intersections){
        let fromPath = paths[inter.from.path]
        let fromSeg = fromPath.segments[inter.from.segment]
        let toPath = paths[inter.to.path]
        let toSeg = toPath.segments[inter.to.segment]
        let pos = createVector(inter.point.x, inter.point.y)
        road.addIntersection(fromPath, fromSeg, toPath, toSeg, pos)
    }
    for(let i=0; i<nCars; i++){
        paths[0].addCar(new Car(paths[0]))
        paths[1].addCar(new Car(paths[1]))
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