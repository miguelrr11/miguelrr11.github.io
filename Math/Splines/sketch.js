//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 1200
const HEIGHT = 800
let col0, col1, col2, col3;

let u = 1

let bZspline
let hMSpline
let cRSpline

let mode = "Bezier"

function setup(){
    createCanvas(WIDTH, HEIGHT)
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
        }
        else if(mode == "Hermite"){
            mode = "Catmull"
        }
        else if(mode == "Catmull"){
            mode = "Bspline"
        }
        else{
            mode = "Bezier"
        }
    }
}

function draw(){
    background("#010E13")
    switch (mode) {
        case "Bezier":
            bZspline.show()
            break;
        case "Hermite":
            hMSpline.show()
            break;
        case "Catmull":
            cRSpline.show()
            cRSpline.drawCurveUsingP5()
            break;
        case "Bspline":
            bSpline.show()
            break;
        default:
            break;
    }
}

function drawArrowTip(x, y, angle, arrowSize = 7) {
    let x1 = x + cos(angle - PI / 6) * arrowSize;
    let y1 = y + sin(angle - PI / 6) * arrowSize;
    let x2 = x + cos(angle + PI / 6) * arrowSize;
    let y2 = y + sin(angle + PI / 6) * arrowSize;
    line(x, y, x1, y1);
    line(x, y, x2, y2);
}
