//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 1200
const HEIGHT = 800
let col0, col1, col2, col3;

let u = 1

let points
let nextPoints
let lerping = false
let lerpingCounter
let transLerping = 1

let bZspline
let hMSpline
let cRSpline

let mode = "Bezier"

let font

function preload(){
    font = loadFont('font.otf')
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    textFont(font)
    col0 = color("#05668D") 
    col1 = color("#028090")
    col2 = color("#00A896")
    col3 = color("#02C39A")
    col4 = color("#F0F3BD")
    bZspline = new Bezier()
    hMSpline = new Hermite()
    cRSpline = new Catmull()
    bSpline = new Bspline()
}

function keyPressed(){
    if(keyCode == 32){
        if(mode == "Bezier"){
            mode = "Hermite"
            points = bZspline.getPoints()
            nextPoints = hMSpline.getPoints()
        }
        else if(mode == "Hermite"){
            mode = "Catmull"
            points = hMSpline.getPoints()
            nextPoints = cRSpline.getPoints()
        }
        else if(mode == "Catmull"){
            mode = "Bspline"
            points = cRSpline.getPoints()
            nextPoints = bSpline.getPoints()
        }
        else{
            mode = "Bezier"
            points = bSpline.getPoints()
            nextPoints = bZspline.getPoints()
        }
        lerping = true
        lerpingCounter = 60
    }
}

function draw(){
    background("#010E13")
    if(!lerping){
        transLerping = 1
        switch (mode) {
            case "Bezier":
                bZspline.show()
                drawTitle("Bézier")
                break;
            case "Hermite":
                hMSpline.show()
                drawTitle("Hermite")
                break;
            case "Catmull":
                cRSpline.show()
                drawTitle("Catmull-Rom")
                break;
            case "Bspline":
                bSpline.show()
                drawTitle("B-Spline")
                break;
            default:
                break;
        }
    }
    else{
        lerpPoints(points, nextPoints)
        drawPoints(points)
        transLerping = lerp(transLerping, 0, 0.2)
        switch (mode) {
            case "Bezier":
                bSpline.drawControlFading(transLerping)
                bZspline.drawControlFading(1-transLerping)
                drawTitle("Bézier")
                break;
            case "Hermite":
                bZspline.drawControlFading(transLerping)
                hMSpline.drawControlFading(1-transLerping)
                drawTitle("Hermite")
                break;
            case "Catmull":
                hMSpline.drawControlFading(transLerping)
                cRSpline.drawControlFading(1-transLerping)
                drawTitle("Catmull-Rom")
                break;
            case "Bspline":
                cRSpline.drawControlFading(transLerping)
                bSpline.drawControlFading(1-transLerping)
                drawTitle("B-Spline")
                break;
            default:
                break;
        }
    }
    
}

function drawPoints(points){
    strokeWeight(4)
    stroke(col2)
    for(let i = 1; i < points.length; i++){
        line(points[i-1].x, points[i-1].y, points[i].x, points[i].y)
    }
}

function lerpPoints(points, nextPoints){
    let len1 = points.length
    let len2 = nextPoints.length
    let indexMultiplier = (len2 / len1)
    for(let i = 0; i < len1; i++){
        let point = points[i]
        point.x = lerp(point.x, nextPoints[Math.floor(indexMultiplier*i)].x, 0.1)
        point.y = lerp(point.y, nextPoints[Math.floor(indexMultiplier*i)].y, 0.1)
    }
    lerpingCounter--
    if(lerpingCounter < 0){
        lerping = false
        points = []
        nextPoints = []
    }
}

function drawTitle(title){
    fill(col4)
    noStroke()
    textSize(40)
    text(title, 20, 50)
}

function drawArrowTip(x, y, angle, arrowSize = 7) {
    let x1 = x + Math.cos(angle - PI / 6) * arrowSize;
    let y1 = y + Math.sin(angle - PI / 6) * arrowSize;
    let x2 = x + Math.cos(angle + PI / 6) * arrowSize;
    let y2 = y + Math.sin(angle + PI / 6) * arrowSize;
    line(x, y, x1, y1);
    line(x, y, x2, y2);
}

function drawDashedLine(x1, y1, x2, y2, dashLength = 10) {
    let d = dist(x1, y1, x2, y2);
    let numDashes = Math.floor(d / dashLength);
    let dx = (x2 - x1) / numDashes;
    let dy = (y2 - y1) / numDashes;
    for (let i = 0; i < numDashes; i++) {
        line(x1 + i * dx, y1 + i * dy, x1 + (i + 0.5) * dx, y1 + (i + 0.5) * dy);
    }
}