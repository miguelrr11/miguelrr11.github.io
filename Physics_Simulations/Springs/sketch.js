const WIDTH = 600
const HEIGHT = 600
let b, b2, b3
const k = 0.01
let g

// function mouseClicked(){
//     //ball2 = createVector(mouseX, mouseY)
//     ball2.y = mouseY
// }

function mouseDragged(){
    b3.pos.x = mouseX
    b3.pos.y = mouseY
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    b = new Ball(createVector(300, 50), undefined)
    b2 = new Ball(createVector(300, 250), b)
    b3 = new Ball(createVector(300, 450), b2)
    g = createVector(0, 0.2)
    fill(0)
    stroke(0)
    strokeWeight(3)
}

function draw(){
    background(255)

    if(!mouseIsPressed){ 
        b2.update()
        b3.update()
    }
    
    b.show()
    b2.show()
    b3.show()
    line(b.pos.x, b.pos.y, b2.pos.x, b2.pos.y)
    line(b3.pos.x, b3.pos.y, b2.pos.x, b2.pos.y)
}