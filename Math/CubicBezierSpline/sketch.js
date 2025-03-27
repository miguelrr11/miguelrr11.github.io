//Cubic Bezier Spline
//Miguel Rodríguez
//27-3-2025

p5.disableFriendlyErrors = true
const WIDTH = 1200
const HEIGHT = 800
let col0, col1, col2, col3;
let u = 1
let draggingPoint = null;

let curves = []

function setup(){
    createCanvas(WIDTH, HEIGHT)
    col0 = color("#F41C66") 
    col1 = color("#FFDA85")
    col2 = color("#06d6a0")
    col3 = color("#3EC3FA")
    let curve = {
        p0: createVector(50, 300),
        p1: createVector(100, 50),
        p2: createVector(250, 50),
        p3: createVector(300, 300),
        i: 0
    }
    let curve2 = {
        p0: createVector(300, 300),
        p1: createVector(350, 550),
        p2: createVector(550, 550),
        p3: createVector(600, 300),
        i: 1
    }
    curves.push(curve)
}


function mouseReleased(){
    draggingPoint = null
}


function mouseDragged() {
    for(let curve of curves){
        let points = [curve.p0, curve.p1, curve.p2, curve.p3];
        if (!draggingPoint) {
            for (let point of points) {
                if (dist(mouseX, mouseY, point.x, point.y) < 15) {
                    draggingPoint = point;
                    break;
                }
            }
        } 
        else {
            draggingPoint.x = mouseX;
            draggingPoint.y = mouseY;
        }
    }
}

function doubleClicked(){
    let tension = 0.5;

    let lastAnchor = curves[curves.length - 1].p3.copy();
    let lastControl = curves[curves.length - 1].p2.copy();

    let newP0 = curves[curves.length - 1].p3

    let newP1 = p5.Vector.add(
    lastAnchor,
    p5.Vector.mult(p5.Vector.sub(lastAnchor, lastControl), tension)
    );

    let newP3 = createVector(mouseX, mouseY);

    let distance = p5.Vector.dist(newP0, newP3);
    let handleLength = distance * tension;

    let direction = p5.Vector.sub(newP3, newP0).normalize();

    let newP2 = p5.Vector.add(newP3, p5.Vector.mult(direction, -handleLength));

    let curve = {
    p0: newP0,
    p1: newP1,
    p2: newP2,
    p3: newP3,
    i: curves.length
    };
    curves.push(curve);

}

function draw(){
    background(0)
    for(let curve of curves) drawCurve(curve)
}

function drawCurve(curve){
    let p0 = curve.p0
    let p1 = curve.p1
    let p2 = curve.p2
    let p3 = curve.p3
    noFill();
    stroke(150)
    strokeWeight(2);
    line(p0.x, p0.y, p1.x, p1.y);
    line(p3.x, p3.y, p2.x, p2.y);
    strokeWeight(10);
    point(p0.x, p0.y);
    point(p1.x, p1.y);
    point(p2.x, p2.y);
    point(p3.x, p3.y);
    strokeWeight(5);
    let minVal = curve.i / curves.length;
    let maxVal = (curve.i + 1) / curves.length;
    let points = calculatePoints(curve);
    for(let i = 1; i < points.length; i++){
        let ratio = map(i, 0, points.length, minVal, maxVal);
        stroke(lerpColor(col0, col3, ratio));
        line(points[i-1].x, points[i-1].y, points[i].x, points[i].y)
    }
}

function calculatePoints(curve) {
    let p0 = curve.p0
    let p1 = curve.p1
    let p2 = curve.p2
    let p3 = curve.p3
    let index = curve.i
    let points = [];
    let t = (u * curves.length) - index;
    t = Math.max(0, Math.min(t, 1));   
    for (let i = 0; i < t; i += 0.001) {
        let a = p5.Vector.lerp(p0, p1, i);
        let b = p5.Vector.lerp(p1, p2, i);
        let c = p5.Vector.lerp(p2, p3, i);
        let d = p5.Vector.lerp(a, b, i);
        let e = p5.Vector.lerp(b, c, i);
        points.push(p5.Vector.lerp(d, e, i));
    }
    return points;
}