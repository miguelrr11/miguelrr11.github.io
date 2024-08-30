//3d Cube projection and rotation
//Miguel Rodríguez
//30-08-2024

const WIDTH = 700
const HEIGHT = 700

let cube
let angle = 0

let PPcheck
let distanceSlider

function setup(){
    createCanvas(WIDTH, HEIGHT)
    cube = [[-0.5, -0.5, -0.5],
            [0.5, -0.5, -0.5],
            [0.5, 0.5, -0.5],
            [-0.5, 0.5, -0.5],
            [-0.5, -0.5, 0.5],
            [0.5, -0.5, 0.5],
            [0.5, 0.5, 0.5],
            [-0.5, 0.5, 0.5]]

    PPcheck = createCheckbox('Perspective projection')
    PPcheck.checked(true)

    distanceSlider = createSlider(0.9, 7, 1.5, 0.05)
}


function draw(){
    background(0)
    translate(WIDTH/2, HEIGHT/2)

    const rotationZ = [
        [cos(angle), -sin(angle), 0],
        [sin(angle), cos(angle), 0],
        [0, 0, 1],
    ]

    const rotationX = [
        [1, 0, 0],
        [0, cos(angle), -sin(angle)],
        [0, sin(angle), cos(angle)],
    ]

    const rotationY = [
        [cos(angle), 0, sin(angle)],
        [0, 1, 0],
        [-sin(angle), 0, cos(angle)],
    ]

    stroke(255)
    noFill()
    let projected = []
    let pp = PPcheck.checked()
    let distance = distanceSlider.value()
    for(let c of cube){
        let rotated = matmult(rotationX, c)
        rotated = matmult(rotationY, rotated)
        rotated = matmult(rotationZ, rotated)
        let z = 1 / (distance - rotated[2][0]);
        if(!pp) z = 1
        const projection = [
          [z, 0, 0],
          [0, z, 0],
        ]
        let projected2d = matmult(projection, rotated);
        if(pp) projected2d = matscale(projected2d, 200)
        else projected2d = matscale(projected2d, map(distance, 0.9, 7, 400, 50))
        projected.push(createVector(projected2d[0][0], projected2d[1][0]))
        strokeWeight(map(rotated[2][0], -0.8, 0.8, 6, 18))
        point(projected2d[0][0], projected2d[1][0])
    }

    for (let i = 0; i < 4; i++) {
        connect(i, (i + 1) % 4, projected);
        connect(i + 4, ((i + 1) % 4) + 4, projected);
        connect(i, i + 4, projected);
    }

    angle += 0.025
}

function connect(i, j, points) {
    const a = points[i];
    const b = points[j];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);
}











