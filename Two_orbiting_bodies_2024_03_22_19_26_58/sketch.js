//Two orbiting bodies
//Miguel Rodríguez 
//11-02-2024

const WIDTH = 800
const HEIGHT = 800
const G = 14 
let astro1
let astro2
let pos1prev
let pos2prev

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(0)
  astro1 = new Astro(createVector(200, 200), createVector(10, 0), 150, 80)
  astro2 = new Astro(createVector(600, 600), createVector(-10, 0), 100, 80)
}

function draw() {
  pos1prev = createVector(astro1.pos.x, astro1.pos.y)
  pos2prev = createVector(astro2.pos.x, astro2.pos.y)
  background(0)
  const force = p5.Vector.sub(astro1.pos, astro2.pos);
  let R = force.mag();
  const pull = -G * (astro1.m * astro2.m) / (R * R)
  force.setMag(pull);
  
  astro1.vel.add(force);
  astro1.pos.add(astro1.vel)
  
  force.mult(-1)
  astro2.vel.add(force);
  astro2.pos.add(astro2.vel)
  
  push()
  R /= 7
  strokeWeight(5)
  stroke(255, 0, 0)
  line(astro2.pos.x, astro2.pos.y, astro2.pos.x+force.x*R, astro2.pos.y+force.y*R)
  force.mult(-1)
  stroke(0, 255, 0)
  line(astro1.pos.x, astro1.pos.y, astro1.pos.x+force.x*R, astro1.pos.y+force.y*R)
  pop()
  

  astro1.show()
  astro2.show()
  
  stroke(255)
  //line(pos1prev.x, pos1prev.y, astro1.pos.x, astro1.pos.y)
  //line(pos2prev.x, pos2prev.y, astro2.pos.x, astro2.pos.y)
  
  
}