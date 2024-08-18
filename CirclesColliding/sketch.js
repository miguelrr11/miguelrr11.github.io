//Circles colliding
//Miguel Rodríguez Rodríguez
//13-08-2024

const WIDTH = 1500
const HEIGHT = 800
let corner1, 
corner2, 
corner3, 
corner4 

let balls = []

let qtree, range, boundary
let N = 32

let gravity
let sliderTam
let tamVal

function setup(){
    createCanvas(WIDTH, HEIGHT)
    noSmooth()
    corner1 = createVector(0, 0)
    corner2 = createVector(WIDTH, 0)
    corner3 = createVector(WIDTH, HEIGHT)
    corner4 = createVector(0, HEIGHT)

    for(let i = 0; i < 1700; i++){
        let x = random(10, WIDTH-10)
        let y = random(10, HEIGHT-10)
        balls.push(new Ball(createVector(x, y)))
    }


    range = new Rectangle(0, 0, 0, 0);
    boundary = new Rectangle(WIDTH/2, WIDTH/2, WIDTH/2, WIDTH/2);
    qtree = new QuadTree(boundary, N);
    for (let b of balls) {
        qtree.insert(b);
    }

    gravity = createCheckbox()
    sliderTam = createSlider(4, 10, 7, 0.5)
    tamVal = 8
}


function draw(){
    background(0)
    let aux = sliderTam.value()
    let tamChanged = aux != tamVal
    if(tamChanged) tamVal = aux
    

    for(let k = 0; k < 2; k++){
        for(let i = 0; i < balls.length; i++){
            let b1 = balls[i]
            if(tamChanged) b1.r = tamVal
            range.x = b1.pos.x
            range.y = b1.pos.y
            range.w = b1.r * 2
            range.h = b1.r * 2
            let points = qtree.query(range);
            if(points == undefined) points = []

            for(let j = 0; j < points.length; j++){
                let b2 = points[j]
                if(b1 == b2) continue
                else {
                    b1.collideBall(b2)
                }
            }

            b1.update()
        }

        qtree = new QuadTree(boundary, N);
        for (let b of balls) {
            if(k == 0) b.show()
            qtree.insert(b);
        }
    }


    
}