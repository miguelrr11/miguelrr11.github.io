//Circles colliding
//Miguel Rodríguez Rodríguez
//13-08-2024

const WIDTH = 800
const HEIGHT = 800
let corner1, 
corner2, 
corner3, 
corner4 

let balls = []

let qtree, range, boundary
let N = 32
let radius = 12

let gravity

function setup(){
    createCanvas(WIDTH, HEIGHT)
    corner1 = createVector(0, 0)
    corner2 = createVector(WIDTH, 0)
    corner3 = createVector(WIDTH, HEIGHT)
    corner4 = createVector(0, HEIGHT)

    for(let i = 0; i < 1500; i++){
        let x = random(10, WIDTH-10)
        let y = random(10, HEIGHT-10)
        balls.push(new Ball(createVector(x, y)))
    }

    // let b1 = new Ball(createVector(200, 200))
    // b1.speed = createVector(-2, 7)
    // let b2 = new Ball(createVector(200, 300))
    // b2.speed = createVector(2, -7)
    // balls.push(b1, b2)

    range = new Rectangle(0, 0, radius, radius);
    boundary = new Rectangle(WIDTH/2, WIDTH/2, WIDTH/2, WIDTH/2);
    qtree = new QuadTree(boundary, N);
    for (let b of balls) {
        qtree.insert(b);
    }
    console.log(qtree)

    gravity = createCheckbox()
}


function draw(){
    background(0)
    range = new Rectangle(0, 0, radius, radius);

    // let b1 = balls[0]
    // let b2 = balls[1]
    // b1.collideBall(b2)
    // b1.update()
    // b1.show()
    // b2.collideBall(b1)
    // b2.update()
    // b2.show()


    for(let i = 0; i < balls.length; i++){
        let b1 = balls[i]
        range.x = b1.pos.x
        range.y = b1.pos.y
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
        b1.show()
    }

    qtree = new QuadTree(boundary, N);
    for (let b of balls) {
        qtree.insert(b);
    }
}