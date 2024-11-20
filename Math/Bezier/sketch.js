const WIDTH = 1000
const HEIGHT = 700

let p0
let p1
let p2

let res_slider
let extra_cb
let textP

function setup(){
    createCanvas(WIDTH, HEIGHT)
    background(0)
    p0 = createVector(125,125)
    p1 = createVector(300,300)
    p2 = createVector(875,575)
    stroke(150)
    strokeWeight(8)
    fill(255)

    res_slider = createSlider(1, 20, 20, 1)
    extra_cb = createCheckbox()
    textP = createP('Draw itermediate interpolations')
}

function mouseDragged(){
    if(mouseX < WIDTH && mouseY < HEIGHT){
        p1.x = mouseX
        p1.y = mouseY
    }
}

function draw(){
    background(0)
    drawBezier(res_slider.value())
    strokeWeight(5)
    stroke(255, 76, 74)
    line(p0.x, p0.y, p1.x, p1.y)
    stroke(74, 172, 255)
    line(p2.x, p2.y, p1.x, p1.y)
    strokeWeight(8)
    stroke(150)
    ellipse(p0.x, p0.y, 40)
    ellipse(p1.x, p1.y, 40)
    ellipse(p2.x, p2.y, 40)
}

function drawBezier(res){
    strokeWeight(3)
    stroke(150)
    let prev = p0.copy()
    for(let i = 0; i < res; i++){
        let t = (i + 1) / res
        let next = bezierInterpolation(t)
        line(prev.x, prev.y, next.x, next.y)
        prev = next
    }
}


function bezierInterpolation(t){
    push()
    strokeWeight(1)
    stroke(150, 150, 150, 200)
    let vectA = linearInterpolation(p0, p1, t)
    let vectB = linearInterpolation(p1, p2, t)
    if(extra_cb.checked())line(vectA.x, vectA.y, vectB.x, vectB.y)
    pop()
    return linearInterpolation(vectA, vectB, t)
}

function linearInterpolation(start, end, t){
    let aux = p5.Vector.sub(end, start)
    aux.mult(t)
    aux.add(start)
    return aux
}