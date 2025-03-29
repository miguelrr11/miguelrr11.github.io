//Hermite Spline
//Miguel Rodríguez
//27-3-2025

p5.disableFriendlyErrors = true
const WIDTH = 1200
const HEIGHT = 800
let col0, col1, col2, col3;
let u = 1
let draggingPoint = null;
let draggingPointIndex = null

let curves = []

//p0 is p0
//p1 is v0
//v0 is v0
//v1 is v1
function setup(){
    createCanvas(WIDTH, HEIGHT)
    col0 = color("#F41C66") 
    col1 = color("#FFDA85")
    col2 = color("#06d6a0")
    col3 = color("#3EC3FA")
    data = [
        {
            "p0": {
                "isPInst": true,
                "x": 50,
                "y": 300,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 100,
                "y": 50,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 250,
                "y": 50,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 300,
                "y": 300,
                "z": 0
            },
            "i": 0
        },
        {
            "p0": {
                "isPInst": true,
                "x": 300,
                "y": 300,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 325,
                "y": 425,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 437,
                "y": 412,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 501,
                "y": 352,
                "z": 0
            },
            "i": 1
        },
        {
            "p0": {
                "isPInst": true,
                "x": 501,
                "y": 352,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 533,
                "y": 322,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 538.5,
                "y": 287.5,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 576,
                "y": 223,
                "z": 0
            },
            "i": 2
        },
        {
            "p0": {
                "isPInst": true,
                "x": 576,
                "y": 223,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 594.75,
                "y": 190.75,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 686,
                "y": 134,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 751,
                "y": 133,
                "z": 0
            },
            "i": 3
        },
        {
            "p0": {
                "isPInst": true,
                "x": 751,
                "y": 133,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 816,
                "y": 132,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 920,
                "y": 176,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 940,
                "y": 259,
                "z": 0
            },
            "i": 4
        },
        {
            "p0": {
                "isPInst": true,
                "x": 940,
                "y": 259,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 960,
                "y": 342,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 962,
                "y": 393,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 933,
                "y": 500,
                "z": 0
            },
            "i": 5
        },
        {
            "p0": {
                "isPInst": true,
                "x": 933,
                "y": 500,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 904,
                "y": 607,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 871,
                "y": 644,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 733,
                "y": 642,
                "z": 0
            },
            "i": 6
        },
        {
            "p0": {
                "isPInst": true,
                "x": 733,
                "y": 642,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 595,
                "y": 640,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 610,
                "y": 554,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 552,
                "y": 551,
                "z": 0
            },
            "i": 7
        },
        {
            "p0": {
                "isPInst": true,
                "x": 552,
                "y": 551,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 494,
                "y": 548,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 480,
                "y": 558,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 447,
                "y": 577,
                "z": 0
            },
            "i": 8
        },
        {
            "p0": {
                "isPInst": true,
                "x": 447,
                "y": 577,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 414,
                "y": 596,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 360,
                "y": 708,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 273,
                "y": 710,
                "z": 0
            },
            "i": 9
        },
        {
            "p0": {
                "isPInst": true,
                "x": 273,
                "y": 710,
                "z": 0
            },
            "p1": {
                "isPInst": true,
                "x": 186,
                "y": 712,
                "z": 0
            },
            "p2": {
                "isPInst": true,
                "x": 87,
                "y": 662,
                "z": 0
            },
            "p3": {
                "isPInst": true,
                "x": 65,
                "y": 561,
                "z": 0
            },
            "i": 10
        }
    ]
    for (let i = 0; i < data.length; i++) {
        if(i == data.length - 1){
            let curve = {
                p0: createVector(data[i].p0.x, data[i].p0.y),
                v0: createVector(data[i].p1.x, data[i].p1.y),
                v1: createVector(data[i].p2.x, data[i].p2.y),
                p1: createVector(data[i].p3.x, data[i].p3.y),
                i: i
            };
            curves.push(curve);
            continue
        }
        let curve = {
            p0: createVector(data[i].p0.x, data[i].p0.y),
            v0: createVector(data[i].p2.x, data[i].p2.y),
            v1: createVector(data[i+1].p2.x, data[i+1].p2.y),
            p1: createVector(data[i].p3.x, data[i].p3.y),
            i: i
        };
        curves.push(curve);
    }
}


function mouseReleased(){
    draggingPoint = null
    draggingPointIndex = null
}


function mouseDragged() {
    for(let j = 0; j < curves.length; j++){
        let curve = curves[j]
        let points = [curve.p0, curve.v0,curve.v1, curve.p1];
        console.log(points)
        console.log(mouseX, mouseY)
        if (!draggingPoint) {
            for (let i = 0; i < points.length; i++) {
                let point = points[i]
                if (dist(mouseX, mouseY, point.x, point.y) < 15) {
                    draggingPoint = point;
                    draggingPointIndex = {
                        curveIndex: j,
                        pointIndex: i
                    }
                    if(i == 1 || i == 2) mirrorControlPoint(j, i)
                    break;
                }
            }
        } 
        else {
            draggingPoint.x = mouseX;
            draggingPoint.y = mouseY;
            mirrorControlPoint(draggingPointIndex.curveIndex, draggingPointIndex.pointIndex)
        }
    }
    
}


function doubleClicked(){
    let tension = 0.5;

    let lastAnchor = curves[curves.length - 1].p1.copy();
    let lastControl = curves[curves.length - 1].v1.copy();

    let newP0 = curves[curves.length - 1].p1

    let newv0 = curves[curves.length - 1].v1.copy();

    let newp1 = createVector(mouseX, mouseY);

    let distance = p5.Vector.dist(newP0, newp1);
    let handleLength = distance * tension;

    let direction = p5.Vector.sub(newp1, newP0).normalize();

    let newv1 = p5.Vector.add(newp1, p5.Vector.mult(direction, -handleLength));

    let curve = {
    p0: newP0,
    v0: newv0,
    v1: newv1,
    p1: newp1,
    i: curves.length
    };
    curves.push(curve);

}

function keyPressed(){
    if (keyCode === 32) { // Space key
        mirrorDistancesControlPoints();
    }
}

function draw(){
    background(0)
    for(let curve of curves) drawControlLines(curve)
    for(let curve of curves) drawCurve(curve)
    for(let curve of curves) drawControlPoints(curve)
}

function mirrorControlPoint(curveIndex, pointIndex) {
    if (pointIndex === 1) {
        if (curveIndex > 0) {
            let anchor = curves[curveIndex].p0; 
            let dragged = curves[curveIndex].v0;
            let mirrorPoint = p5.Vector.sub(p5.Vector.mult(anchor, 2), dragged);
            curves[curveIndex - 1].v1 = dragged;
        }
    } else if (pointIndex === 2) {
        if (curveIndex < curves.length - 1) { 
            let anchor = curves[curveIndex].p1;
            let dragged = curves[curveIndex].v1;
            let mirrorPoint = p5.Vector.sub(p5.Vector.mult(anchor, 2), dragged);
            curves[curveIndex + 1].v0 = dragged;
        }
    }
}
  
  

//sets the control points of the next curve to be the same distance and direction from the anchor point as the previous curve
function mirrorDistancesControlPoints(reveresed = true){
    let startIndex = 0
    let endIndex = curves.length - 1
    if(reveresed){
        for (let i = startIndex; i < endIndex; i++) {
            let current = curves[i]
            let nextCurve = curves[i + 1]
            let anchor = current.p1;
            let diff = p5.Vector.sub(anchor, nextCurve.v0);
            current.v1 = p5.Vector.add(anchor, diff);
        }
        return
    }
    for (let i = startIndex; i < endIndex; i++) {
        let current = curves[i]
        let nextCurve = curves[i + 1]
        let anchor = current.p1;
        let diff = p5.Vector.sub(anchor, current.v1);
        nextCurve.v0 = p5.Vector.add(anchor, diff);
    }
}
  

function drawCurve(curve){
    let minVal = curve.i / curves.length;
    let maxVal = (curve.i + 1) / curves.length;
    let points = calculatePoints(curve);
    strokeWeight(4)
    for(let i = 1; i < points.length; i++){
        let ratio = map(i, 0, points.length, minVal, maxVal);
        stroke(lerpColor(col0, col3, ratio));
        line(points[i-1].x, points[i-1].y, points[i].x, points[i].y)
    }
}

function drawControlPoints(curve){
    let p0 = curve.p0
    let v0 = curve.v0
    let v1 = curve.v1
    let p1 = curve.p1
    strokeWeight(2.5);
    stroke(0)
    fill(lerpColor(col0, col3, (curve.i) / curves.length));
    ellipse(p0.x, p0.y, 13);
    stroke(115)
    strokeWeight(10)
    point(v0.x, v0.y);
    point(v1.x, v1.y);
    strokeWeight(2.5)
    fill(lerpColor(col0, col3, (curve.i + 1) / curves.length));
    stroke(0)
    ellipse(p1.x, p1.y, 13);
}

function drawControlLines(curve){
    let p0 = curve.p0
    let v0 = curve.v0
    let v1 = curve.v1
    let p1 = curve.p1
    stroke(115)
    strokeWeight(2.5);
    line(p0.x, p0.y, v0.x, v0.y);
    line(p1.x, p1.y, v1.x, v1.y);
    stroke(40)
    //line(v0.x, v0.y, v1.x, v1.y);
}

function calculatePoints(curve) {
    let p0 = curve.p0;
    let v0 = p5.Vector.sub(curve.v0, curve.p0);
    let v1 = p5.Vector.sub(curve.v1, curve.p1);
    let p1 = curve.p1;
    let index = curve.i;
    let points = [];
    let tMax = (u * curves.length) - index;
    tMax = Math.max(0, Math.min(tMax, 1));
  
    let step = 0.001;
    for (let t = 0; t <= tMax; t += step) {
        let tCubed = t * t * t;
        let tSquared = t * t;
        
        let h00 = 2 * tCubed - 3 * tSquared + 1;
        let h10 = tCubed - 2 * tSquared + t;
        let h01 = -2 * tCubed + 3 * tSquared;
        let h11 = tCubed - tSquared;
        
        let x = h00 * p0.x + h10 * v0.x + h01 * p1.x + h11 * v1.x;
        let y = h00 * p0.y + h10 * v0.y + h01 * p1.y + h11 * v1.y;
        points.push(createVector(x, y));
    }
    return points;
}
  