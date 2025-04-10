//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 1200
const HEIGHT = 800
let col0, col1, col2, col3, col4;

let u = 1
let animating = false

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

let descriptions = new Map([
    ["Bezier", "A curve defined by a set of control points. The curve starts at the first point and ends at the last, but may not pass through the intermediate control points. Instead, these influence the direction and shape. Common in vector graphics and font design. Quadratic and cubic Bézier curves are the most used."],
    ["Hermite", "Instead of just using points, Hermite splines also use tangents (or derivatives) at the endpoints of each segment. This gives you fine control over the shape and slope of the curve. Ideal when you know both position and direction at certain key points."],
    ["Catmull-Rom", "A type of Hermite spline that automatically calculates tangents so the curve passes through all control points. It creates smooth paths with minimal effort and is often used in animation and camera movement."],
    ["B-Spline", "A generalization of Bézier curves. B-splines use multiple control points and do not necessarily pass through them, but provide smooth, flexible curves with local control—moving one point affects only part of the curve. They're powerful in modeling and CAD applications."],
])

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

function mouseReleased(){
    switch(mode){
        case "Bezier":
            bZspline.release()
            break
        case "Hermite":
            hMSpline.release()
            break
        case "Catmull-Rom":
            cRSpline.release()
            break
        case "B-Spline":
            bSpline.release()
            break
    }
}

function mouseDragged(){
    switch(mode){
        case "Bezier":
            bZspline.move()
            break
        case "Hermite":
            hMSpline.move()
            break
        case "Catmull-Rom":
            cRSpline.move()
            break
        case "B-Spline":
            bSpline.move()
            break
    }
}

function keyPressed(){
    if(keyCode == 32){
        if(mode == "Bezier"){
            mode = "Hermite"
            points = bZspline.getPoints()
            nextPoints = hMSpline.getPoints()
        }
        else if(mode == "Hermite"){
            mode = "Catmull-Rom"
            points = hMSpline.getPoints()
            nextPoints = cRSpline.getPoints()
        }
        else if(mode == "Catmull-Rom"){
            mode = "B-Spline"
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
    if(key == 'a' || key == 'A'){
        if(animating){
            animating = false
            u = 1
        }
        else{
            animating = true
        }
    }
}

function draw(){
    background("#011821")
    if(animating && !lerping){
        u = lerp(u, 1, 0.025)
        if(u > 0.98){
            u = 0
        }
    }
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
            case "Catmull-Rom":
                cRSpline.show()
                drawTitle("Catmull-Rom")
                break;
            case "B-Spline":
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
                drawTitle("Bézier", transLerping)
                drawTitle("B-Spline", 1-transLerping)
                break;
            case "Hermite":
                bZspline.drawControlFading(transLerping)
                hMSpline.drawControlFading(1-transLerping)
                drawTitle("Hermite", transLerping)
                drawTitle("Bézier", 1-transLerping)
                break;
            case "Catmull-Rom":
                hMSpline.drawControlFading(transLerping)
                cRSpline.drawControlFading(1-transLerping)
                drawTitle("Catmull-Rom", transLerping)
                drawTitle("Hermite", 1-transLerping)
                break;
            case "B-Spline":
                cRSpline.drawControlFading(transLerping)
                bSpline.drawControlFading(1-transLerping)
                drawTitle("B-Spline", transLerping)
                drawTitle("Catmull-Rom", 1-transLerping)
                break;
            default:
                break;
        }
    }
    checkHoverTitle()
}

function checkHoverTitle(){
    let title = mode
    let x = 20
    let y = 50
    let w = textWidth(title)
    let h = textAscent() + textDescent()
    if(mouseX > x && mouseX < x + w && mouseY > y - h && mouseY < y){
        drawDescription(descriptions.get(title))
    }
}

function drawDescription(description){
    push()
    fill(200)
    stroke(200)
    strokeWeight(.5)
    textSize(14)
    text('Click and drag to move control points', 20, 73)
    text('Press [SPACE] to change spline', 20, 93)
    text('Press [A] to toggle animation', 20, 113)
    
    fill(0, 150)
    stroke(0, 150)
    strokeWeight(6)
    textSize(20)
    text(description, 20, 150, 300)

    fill(col4)
    stroke(col4)
    strokeWeight(.5)
    textSize(20)
    text(description, 20, 150, 300)

    
    pop()
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

function drawTitle(title, lerping = undefined){
    let col = lerping ? lerpColor(col4, color(0,0,0,0), lerping) : col4
    fill(col)
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