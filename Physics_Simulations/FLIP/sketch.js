//FLIP
//Miguel Rodríguez
//27-05-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

const nParticles = 8000
const particles = []

const subSteps = 4

let tamCellGridParticles = RAD_PART * 2
const cols = Math.ceil(WIDTH / tamCellGridParticles)
const rows = Math.ceil(HEIGHT / tamCellGridParticles)
const gridSize = cols * rows
let gridParticles = Array.from({ length: gridSize }, () => [])


const gravity = 10

function setup(){
    createCanvas(WIDTH, HEIGHT)
    for(let i = 0; i < nParticles; i++){
        const x = random(WIDTH)
        const y = random(HEIGHT)
        let particle = new Particle(x, y)
        particles.push(particle)
        particle.insertIntoGrid()
    }
}



function draw() {
    background(0);

    let dt    = deltaTime * 0.001;
    let subDt = dt / subSteps;

    gridParticles.forEach(cell => cell.length = 0);
    particles.forEach(p => p.insertIntoGrid());  

    for (let s = 0; s < subSteps; s++) {
        for (let p of particles) {
            const neighs = getNeighbors(p.pos.x, p.pos.y);
            for (let q of neighs) {
                if (p == q) continue;
                const delta = p.pos.copy().sub(q.pos);
                const dist2 = delta.magSq();
                if (dist2 > 0 && dist2 < DIAM_PART_SQUARED) {
                    const distance    = Math.sqrt(dist2);
                    const overlap = 0.5 * ((DIAM_PART) - distance);
                    delta.normalize().mult(overlap);
                    p.pos.add(delta);
                    q.pos.sub(delta);
                }
            }
        }

        for (let p of particles) {
            p.applyForce(0, gravity);
            p.update(subDt);  
            p.edges();  
        }
    }

    fill(255);
    noStroke(); 
    for (let p of particles){ 
        p.show();
        
    }
}



function showGrid(){
    fill(255, 0, 0, 50)
    noStroke()
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            const x = i * tamCellGridParticles
            const y = j * tamCellGridParticles
            if(gridParticles[i + j * cols].length > 0){
                fill(255, 0, 0, 100)
            }
            else fill(255)
            rect(x, y, tamCellGridParticles, tamCellGridParticles)
        }
    }
}

function getNeighbors(x, y) {
    const indexX = Math.floor(x / tamCellGridParticles);
    const indexY = Math.floor(y / tamCellGridParticles);
    let neighbors = [];
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const neighborX = indexX + i;
            const neighborY = indexY + j;

            if (neighborX >= 0 && neighborX < cols && neighborY >= 0 && neighborY < rows) {
                const index = neighborX + neighborY * cols;
                neighbors.push(...gridParticles[index]);
            }
        }
    }

    return neighbors;
}