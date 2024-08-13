//Bezier cubico
//Miguel Rodriguez
//23-04-24

const WIDTH = 1000
const HEIGHT = 700
let moviendo

let p0
let p1
let p2
let p3

let points = []

let res_slider
let extra_cb
let textP


function setup(){
    createCanvas(WIDTH, HEIGHT)
    background(0)
    p0 = createVector(125,125)
    p1 = createVector(200,350)
    p2 = createVector(700,200)
    p3 = createVector(875,575)
    stroke(150)
    strokeWeight(8)
    fill(255)

    res_slider = createSlider(1, 40, 20, 1)
    //extra_cb = createCheckbox()
    //textP = createP('Draw itermediate interpolations')
}

function mouseDragged(){
    if(mouseX < WIDTH && mouseY < HEIGHT){
        if(moviendo){
            moviendo.x = mouseX
            moviendo.y = mouseY
        }
        else if(dist(mouseX, mouseY, p0.x, p0.y) < 40){
            if(!moviendo) moviendo = p0
            p0.x = mouseX
            p0.y = mouseY
        }
        else if(dist(mouseX, mouseY, p1.x, p1.y) < 40){
            if(!moviendo) moviendo = p1
            p1.x = mouseX
            p1.y = mouseY
        }
        else if(dist(mouseX, mouseY, p2.x, p2.y) < 40){
            if(!moviendo) moviendo = p2
            p2.x = mouseX
            p2.y = mouseY
        }
        else if(dist(mouseX, mouseY, p3.x, p3.y) < 40){
            if(!moviendo) moviendo = p3
            p3.x = mouseX
            p3.y = mouseY
        }
        
    }
}

function draw(){
    background(0)
    if(!mouseIsPressed) moviendo = undefined

    stroke(255)
    computeBezier(res_slider.value())
    beginShape()
    noFill()
    for(let p of points){
        vertex(p.x, p.y)
    }
    endShape()

    fill(255)
    strokeWeight(3)
    stroke(255, 100)
    line(p0.x, p0.y, p1.x, p1.y)
    line(p2.x, p2.y, p1.x, p1.y)
    line(p3.x, p3.y, p2.x, p2.y)
    strokeWeight(7)
    stroke(255, 76, 74)
    ellipse(p0.x, p0.y, 40)
    ellipse(p3.x, p3.y, 40)
    stroke(74, 172, 255)
    ellipse(p1.x, p1.y, 40)
    ellipse(p2.x, p2.y, 40)
    
}

function pointOnCubicBezier(t)
{
    let ax, bx, cx
    let ay, by, cy
    let tSquared, tCubed
    let result = createVector(0,0)


    cx = 3.0 * (p1.x - p0.x);
    bx = 3.0 * (p2.x - p1.x) - cx;
    ax = p3.x - p0.x - cx - bx;
    
    cy = 3.0 * (p1.y - p0.y);
    by = 3.0 * (p2.y - p1.y) - cy;
    ay = p3.y - p0.y - cy - by;
    
    
    tSquared = t * t;
    tCubed = tSquared * t;
    
    result.x = (ax * tCubed) + (bx * tSquared) + (cx * t) + p0.x;
    result.y = (ay * tCubed) + (by * tSquared) + (cy * t) + p0.y;

    return result;
}


function computeBezier(n) {
    let dt = 1.0 / ( n - 1 );
    points = []

    for(let i = 0; i < n; i++){
        points.push(pointOnCubicBezier(i*dt))
    }
}

