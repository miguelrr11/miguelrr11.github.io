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
  
  sliderM = createSlider(0, 50000, 1500)
  
  noFill()
  stroke(255, 100, 0, 90)
  strokeWeight(15)
  circle(300, HEIGHT/2, r*3)
  stroke(255, 255, 0, 80)
  strokeWeight(50)
  circle(300, HEIGHT/2, r*6)

  let nPhotons = 5000
  let separation = (HEIGHT / 2) / nPhotons

  indexKing = floor(nPhotons * 0.4999)

  for(let i = 0; i < nPhotons; i++){
    photons.push(new Photon(createVector(WIDTH-40, 1.32 + i*separation), createVector(-c, 0)))
    photonsPrev.push(new Photon(createVector(WIDTH-40, 0 + i*separation), createVector(-c, 0)))
    if(i == indexKing){
      kingPhotonPos.push(createVector(WIDTH-40, 1.32 + i*separation))
    }
  }
}

function draw() {
  
  stroke(255, 0, 0, 30)
  strokeWeight(1)
  
  m = sliderM.value()
  
  for(let i = 0; i < photons.length; i++){
    let p = photons[i]
    photonsPrev[i].pos = createVector(p.pos.x, p.pos.y)
    photonsPrev[i].vel = createVector(p.vel.x, p.vel.y)
    const force = p5.Vector.sub(posBH, p.pos);
    const R = force.mag();
    const fg = G * m / (R * R);
    force.setMag(fg);
    p.vel.add(force);
    p.vel.setMag(c);
    p.pos.add(p.vel)
    //p.vel.x = constrain(p.vel.x, -c, -c)
    line(photonsPrev[i].pos.x, photonsPrev[i].pos.y, photons[i].pos.x, photons[i].pos.y)
    if(i == indexKing){
      kingPhotonPos.push(createVector(p.pos.x, p.pos.y))
    }
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