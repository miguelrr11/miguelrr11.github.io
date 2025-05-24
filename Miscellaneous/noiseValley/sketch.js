//Visualization of Gradient Descent
//Miguel Rodríguez
//24-05-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let grid = []
let tamCell = 10
let cols = Math.floor(WIDTH / tamCell)
let rows = Math.floor(HEIGHT / tamCell)
let sclNoise = 0.02

let particles = []
let nParticles = 200

let frame = 0

function mousePressed() {
    initParticles()
    initGrid()
}

function initGrid() {
    for (let i = 0; i < cols; i++) {
        grid[i] = []
        for (let j = 0; j < rows; j++) {
            let noiseVal = noise(i * sclNoise, j * sclNoise, frame * 0.0025)
            grid[i][j] = noiseVal
        }
    }
}

function initParticles() {
    particles = [] 
    for (let i = 0; i < nParticles; i++) {
        let x = random(WIDTH)
        let y = random(HEIGHT)
        particles.push({
            pos: createVector(x, y),
            vel: createVector(0, 0),
            acc: createVector(0, 0),
            path: []
        })
    }
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    initGrid()
    initParticles()
    noStroke()
}

function draw(){
    background(0)
    if(keyIsPressed){ 
        frame++
        initGrid()
    }
    showGrid()
    updateParticles()
    showParticles()
    showPaths()
}

function showParticles() {
    fill(255, 0, 0)
    for (let p of particles) {
        ellipse(p.pos.x, p.pos.y, 5, 5)
    }
}

function showPaths(){
    push()
    stroke(255, 0, 0, 100)
    noFill()
    for (let p of particles) {
        beginShape()
        for (let v of p.path) {
            vertex(v.x, v.y)
        }
        endShape()
    }
    pop()
}

function showGrid() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * tamCell
            let y = j * tamCell
            let noiseVal = grid[i][j]
            fill(noiseVal * 255)
            rect(x, y, tamCell, tamCell)
        }
    }
}

function updateParticles(){
  for (let p of particles) {
    // ---- compute continuous grid position ----
    let gx = p.pos.x / tamCell;
    let gy = p.pos.y / tamCell;
    let i  = Math.floor(gx);
    let j  = Math.floor(gy);
    let dx = gx - i;
    let dy = gy - j;

    // clamp indices so we can safely sample [i,i+1]×[j,j+1]
    i = constrain(i, 0, cols - 2);
    j = constrain(j, 0, rows - 2);

    // fetch corner noise values
    let v00 = grid[i    ][j    ];
    let v10 = grid[i + 1][j    ];
    let v01 = grid[i    ][j + 1];
    let v11 = grid[i + 1][j + 1];

    // approximate gradient of the bilinear surface
    let dndx = lerp(v10, v11, dy) - lerp(v00, v01, dy);
    let dndy = lerp(v01, v11, dx) - lerp(v00, v10, dx);
    let grad  = createVector(dndx, dndy);

    // accelerate downhill
    p.acc = grad.mult(-1).limit(0.2);
    p.vel.add(p.acc).mult(0.99);
    p.pos.add(p.vel);

    // ---- hard walls (bounce) ----
    // Left or right wall
    if (p.pos.x < 0) {
      p.pos.x = 0;
      p.vel.x *= -1;
    } else if (p.pos.x > WIDTH) {
      p.pos.x = WIDTH;
      p.vel.x *= -1;
    }
    // Top or bottom wall
    if (p.pos.y < 0) {
      p.pos.y = 0;
      p.vel.y *= -1;
    } else if (p.pos.y > HEIGHT) {
      p.pos.y = HEIGHT;
      p.vel.y *= -1;
    }

    // record path
    p.path.push(p.pos.copy());
    if (p.path.length > 350) {
      p.path.shift();
    }
  }
}
