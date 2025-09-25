//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let cursor
let mode = 'path'
let nCols = 50
let spacing = WIDTH / nCols

let paths = []
let currentPath = null
let currentSegment = null
let intersections = []

let selectedPath = null
let selectedSegment = null
let currentIntersection = null
let from = null
let to = null

function mouseClicked(){
    if(mode == 'path'){
        if(currentPath === null){
            currentPath = {
                segments: [],
            }
            paths.push(currentPath)
            currentSegment = {a: {x: cursor.x, y: cursor.y}, b: null}
        }
        else{
            if(currentSegment !== null){
                currentSegment.b = {x: cursor.x, y: cursor.y}
                currentPath.segments.push(currentSegment)
                currentSegment = null
            }
            else {
                currentSegment = {a: {x: cursor.x, y: cursor.y}, b: null}
            }
        }
    }
    else if(mode == 'intersection'){
        if(currentIntersection === null){
            currentIntersection = {fromPath}
        }
    }    
}



function setup(){
    createCanvas(WIDTH, HEIGHT)
    cursor = createVector(0, 0)
}

function draw(){
    background(255)
    drawGrid()
    drawPaths()
    updateCursorToMatrix()
    
}

function keyPressed(){
    if(key == 'p'){
        mode = 'path'
        currentPath = null
        currentSegment = null
    }
    else if(key == 'i'){
        mode = 'intersection'
        currentPath = null
        currentSegment = null
    }
    else if(keyCode == 39 && mode == 'intersection'){ //arrow left
        if(selectedPath == null){
            selectedPath = 0
            selectedSegment = 0
        }
        else{
            selectedSegment++
            if(selectedSegment >= paths[selectedPath].segments.length){
                selectedPath++
                selectedSegment = 0
                if(selectedPath >= paths.length){
                    selectedPath = 0
                    selectedSegment = 0
                }
            }
        }
    }
    else if(keyCode == 32 && mode == 'intersection' && selectedPath != undefined){ // space
        if(from == null){
            from = {path: selectedPath, segment: selectedSegment}
        }
        else if(to == null){
            to = {path: selectedPath, segment: selectedSegment}
            let pointOfIntersection = getIntersectionPoint(
                paths[from.path].segments[from.segment],
                paths[to.path].segments[to.segment]
            )
            if(!pointOfIntersection) console.log("No intersection found")
            intersections.push({from, to, point: pointOfIntersection})
            from = null
            to = null
            selectedPath = null
            selectedSegment = null
        }
    }
    else if(keyCode == 8){ //backspace
        if(mode == 'path'){
            if(currentSegment !== null){
                currentSegment = null
            }
            else if(currentPath !== null){
                paths = paths.filter(p => p !== currentPath)
                currentPath = null
            }
        }
        else if(mode == 'intersection'){
            if(selectedPath !== null){
                selectedPath = null
                selectedSegment = null
            }
            else if(from !== null){
                from = null
            }
            else if(to !== null){
                to = null
            }
            else if(intersections.length > 0){
                intersections.pop()
            }
        }
    }
}

function getIntersectionPoint(seg1, seg2){
    //first check if its edges are the same
    if(seg1.a.x == seg2.a.x && seg1.a.y == seg2.a.y) return {x: seg1.a.x, y: seg1.a.y}
    if(seg1.a.x == seg2.b.x && seg1.a.y == seg2.b.y) return {x: seg1.a.x, y: seg1.a.y}
    if(seg1.b.x == seg2.a.x && seg1.b.y == seg2.a.y) return {x: seg1.b.x, y: seg1.b.y}
    if(seg1.b.x == seg2.b.x && seg1.b.y == seg2.b.y) return {x: seg1.b.x, y: seg1.b.y}
    let x1 = seg1.a.x
    let y1 = seg1.a.y
    let x2 = seg1.b.x
    let y2 = seg1.b.y
    let x3 = seg2.a.x
    let y3 = seg2.a.y
    let x4 = seg2.b.x
    let y4 = seg2.b.y

    let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if(denom == 0) return null // parallel lines

    let px = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4)) / denom
    let py = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4)) / denom

    return {x: px, y: py}
}

function drawPaths(){
    push()
    stroke(0)
    strokeWeight(4)
    for(const path of paths){
        if(path.segments.length === 0) continue
        for(let segment of path.segments){
            line(segment.a.x, segment.a.y, segment.b.x, segment.b.y)
        }
    }
    if(currentSegment !== null){
        line(currentSegment.a.x, currentSegment.a.y, cursor.x, cursor.y)
    }
    if(selectedPath !== null){
        stroke(255, 0, 0)
        strokeWeight(6)
        let segment = paths[selectedPath].segments[selectedSegment]
        line(segment.a.x, segment.a.y, segment.b.x, segment.b.y)
    }
    if(from !== null){
        stroke(0, 255, 0)
        strokeWeight(6)
        let segment = paths[from.path].segments[from.segment]
        line(segment.a.x, segment.a.y, segment.b.x, segment.b.y)
    }
    if(to !== null){
        stroke(0, 0, 255)
        strokeWeight(6)
        let segment = paths[to.path].segments[to.segment]
        line(segment.a.x, segment.a.y, segment.b.x, segment.b.y)
    }
    for(const intersection of intersections){
        fill(0, 0, 255)
        noStroke()
        ellipse(intersection.point.x, intersection.point.y, 10)
    }
    pop()
}

function updateCursorToMatrix(){
    cursor.x = floor(mouseX / spacing) * spacing 
    cursor.y = floor(mouseY / spacing) * spacing 

    mode == 'path' ? stroke(0) : stroke(0, 0, 255)
    strokeWeight(8)
    point(cursor.x, cursor.y)
}

function drawGrid(){
    push()
    stroke(200)
    strokeWeight(1)
    for(let x = 0; x <= WIDTH; x += spacing){
        line(x, 0, x, HEIGHT)
    }
    for(let y = 0; y <= HEIGHT; y += spacing){
        line(0, y, WIDTH, y)
    }
    pop()
}