//Black hole visualization
//Miguel Rodríguez 
//11-02-2024
//Si eres físico y estás leyendo esto, perdón

const WIDTH = 1000
const HEIGHT = 600
const r = 50
let m = 1500
const c = 5;
const G = 1;
let photons = []
let photonsPrev = []
let kingPhotonPos = []
let indexKing = 0
let sliderM

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(255);
  posBH = createVector(300, HEIGHT/2)
  noStroke()
  fill(0)
  circle(300, HEIGHT/2, r*2)
  
  sliderM = createSlider(0, 5000, 1500)
  
  noFill()
  stroke(255, 100, 0, 90)
  strokeWeight(15)
  circle(300, HEIGHT/2, r*3)
  stroke(255, 255, 0, 80)
  strokeWeight(50)
  circle(300, HEIGHT/2, r*6)

  let nPhotons = 30000
  let separation = ((HEIGHT / 2)-200) / nPhotons

  indexKing = floor(nPhotons * 0.51296)

  for(let i = 0; i < nPhotons; i++){
    photons.push(new Photon(createVector(WIDTH-40, 100 + i*separation), createVector(-c, 0)))
    photonsPrev.push(new Photon(createVector(WIDTH-40, 0 + i*separation), createVector(-c, 0)))
    if(i == indexKing){
      kingPhotonPos.push(createVector(WIDTH-40, 100 + i*separation))
    }
  }
}

function draw() {
  
  stroke(255, 0, 0, 30)
  strokeWeight(1)
  
  m = sliderM.value()

  // assumes: const f = G * m; and posBH has {x, y}
  const f = G * m;

  for (let i = 0, n = photons.length; i < n; i++) {
    const p  = photons[i];
    const pp = photonsPrev[i];

    // cache current position
    const px = p.pos.x;
    const py = p.pos.y;

    // store previous position
    pp.pos.x = px;
    pp.pos.y = py;

    // vector from photon -> black hole
    const dx = posBH.x - px;
    const dy = posBH.y - py;

    // gravitational force ~ f * r̂ / r^2  ==>  f * (dx,dy) / r^3
    const r2 = dx * dx + dy * dy;
    const invR = 1 / Math.sqrt(r2 + 1e-12);   // epsilon avoids div-by-zero
    const invR3 = invR / (r2 + 1e-12);

    // apply force
    let vx = p.vel.x + f * dx * invR3;
    let vy = p.vel.y + f * dy * invR3;

    // renormalize velocity to constant speed c
    const invV = c / Math.hypot(vx, vy);
    vx *= invV;
    vy *= invV;

    // advance position
    const nx = px + vx;
    const ny = py + vy;

    // write back
    p.vel.x = vx; p.vel.y = vy;
    p.pos.x = nx; p.pos.y = ny;

    // draw segment
    if(i % 5 === 0) line(pp.pos.x, pp.pos.y, nx, ny);

    // keep "king" trail without createVector
    if (i === indexKing) kingPhotonPos.push({ x: nx, y: ny });
  }


  if(kingPhotonPos.length > 300){
    kingPhotonPos.splice(0, 1)
  }

  stroke(0, 0, 255)
  strokeWeight(2.5)
  noFill()
  beginShape()
  for(let i = 0; i < kingPhotonPos.length; i++){
    vertex(kingPhotonPos[i].x, kingPhotonPos[i].y)
  }
  endShape()
  
  noStroke()
  fill(0)
  circle(300, HEIGHT/2, r*2)
  
}