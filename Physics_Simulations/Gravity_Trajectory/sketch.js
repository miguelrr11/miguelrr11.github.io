const WIDTH = 400
const HEIGHT = 400

let planet1;
let planet2
let planet3
let mPlanet = 10;

let astro1;
let astro2
let mAstro = 10;
let speed;
let acc;
const G = 2;

let angleP = 0

let maxSpeed = 5

let maxIter = 1000;
let poss = [];

let grid = []
let N = 50
let spacing = WIDTH/N

function getPosPlanet(angle){
  return [cos(angle)*100 + WIDTH/2, sin(angle)*100 + WIDTH/2]
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  let pos = getPosPlanet(angleP)
  planet1 = createVector(pos[0], pos[1]);
  pos = getPosPlanet(angleP + TWO_PI/3)
  planet2 = createVector(pos[0], pos[1]);
  pos = getPosPlanet(angleP + (TWO_PI/3)*2)
  planet3 = createVector(pos[0], pos[1]);

  astro1 = createVector(100, 100);
  astro2 = createVector(300, 300)
  speed = createVector(2, 0);
  acc = createVector(0, 0);
  fill(0);

  
  noFill()
}

function getPoss(astro){
  let poss = []
  let speed = createVector(0,0)
  let acc = createVector(0, 0);
  for (let i = 0; i < maxIter; i++) {
    let f1 = getF(planet1, astro)
    let f2 = getF(planet2, astro)
    let f3 = getF(planet3, astro)
    acc.x = f1.x + f2.x + f3.x
    acc.y = f1.y + f2.y + f3.y
    speed.add(acc);
    speed.limit(maxSpeed);
    astro.add(speed);
      
    poss.push(astro.copy())
  }
  return poss
}

function getF(planet, astro){
  let dir = p5.Vector.sub(planet, astro);
  let distnor = dist(astro.x, astro.y, planet.x, planet.y);

  if (distnor > 0) {
    let F = G * ((mAstro * mPlanet) / (distnor * distnor));
    dir.normalize();
    dir.setMag(F);
    return dir.copy();
  }
  return createVector(0 ,0)
}

function draw() {
  background(120);
  angleP += 0.002

  let pos = getPosPlanet(angleP)
  planet1 = createVector(pos[0], pos[1]);
  pos = getPosPlanet(angleP + TWO_PI/3)
  planet2 = createVector(pos[0], pos[1]);
  pos = getPosPlanet(angleP + (TWO_PI/3)*2)
  planet3 = createVector(pos[0], pos[1]);

  astro1 = createVector(100, 100)
  astro2 = createVector(300, 300)
  
  // let angle = atan2(astro.y - mouseY, astro.x - mouseX)
  // speed = p5.Vector.fromAngle(angle).normalize()
  //speed.setMag(floor(map(dist(mouseX, mouseY, astro.x, astro.y), 0, 100, 1, 3)))
  
  
  let poss1 = getPoss(astro1)
  let poss2 = getPoss(astro2)
  
  
  stroke(10, 255, 180)
  strokeWeight(4)
  noFill()
  beginShape()
  for(let p of poss1) vertex(p.x, p.y)
  endShape()
  ellipse(poss1[poss1.length-1].x, poss1[poss1.length-1].y, 15, 15)

  beginShape()
  stroke(255, 10, 180)
  for(let p of poss2) vertex(p.x, p.y)
  endShape()
  ellipse(poss2[poss2.length-1].x, poss2[poss2.length-1].y, 15, 15)
  
  fill(255)
  stroke(0)
  strokeWeight(2)
  ellipse(planet1.x, planet1.y, 15);
  ellipse(planet2.x, planet2.y, 15);
  ellipse(planet3.x, planet3.y, 15);
}
