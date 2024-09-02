//3d sphere projection and rotation
//Miguel Rodríguez
//30-08-2024

const WIDTH = 700
const HEIGHT = 700

let sphere = []
let sphereT = []
let angle = 0

let goldenRatio = (1 + Math.sqrt(5)) / 2
let N = 1000
let scl = 10

let nslider

let projected = []

function setup(){
    createCanvas(WIDTH, HEIGHT)

    for (let i = 0; i < N; i++) {
        let lat = Math.acos(1 - (2 * i + 1) / N);
        let lon = (2 * PI * i) / goldenRatio;

        let x = cos(lon) * sin(lat) * scl; 
        let y = sin(lon) * sin(lat) * scl;
        let z = cos(lat) * scl;
        sphere.push([x, y, z]);
        sphereT.push(new THREE.Vector3(x, y, z))
    }

    // let geometry = new THREE.ConvexGeometry(sphereT);
    // let faces = geometry.faces.map(face => ({
    //     a: geometry.vertices[face.a],
    //     b: geometry.vertices[face.b],
    //     c: geometry.vertices[face.c]
    // }));

    // console.log(faces)


    nslider = createSlider(5, 3000, 1000, 1)
    
}


function draw(){
    if(nslider.value() != N){
        N = nslider.value()
        sphere = []
        for (let i = 0; i < N; i++) {
            let lat = Math.acos(1 - (2 * i + 1) / N);
            let lon = (2 * PI * i) / goldenRatio;

            let x = cos(lon) * sin(lat) * scl; 
            let y = sin(lon) * sin(lat) * scl;
            let z = cos(lat) * scl;
            sphere.push([x, y, z]); 
        }
    }

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

    const projection = [
        [1, 0, 0],
        [0, 1, 0],
    ]

    stroke(255)
    strokeWeight(2)
    noFill()

    projected = []
    let distance = 7.4

    for(let c of sphere){
        let rotated = matmult(rotationX, c)
        rotated = matmult(rotationY, rotated)
        rotated = matmult(rotationZ, rotated)

        let projected2d = matmult(projection, rotated);
        projected2d = matscale(projected2d, map(distance, 0.9, 7, 400, 50))

        projected.push(createVector(projected2d[0][0], projected2d[1][0]))
        
        strokeWeight(map(rotated[2][0], -10, 10, 1.5, 4.5))
        point(projected2d[0][0], projected2d[1][0])
    }

    angle += 0.005  
}

function connect(i, j, points) {
    const a = points[i];
    const b = points[j];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);
}











