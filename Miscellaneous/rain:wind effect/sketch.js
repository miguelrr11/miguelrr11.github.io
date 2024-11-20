let a, b, w, h
let particles = []
let dir = "east"
let n

function setup() {
  createCanvas(600, 600);
  a = createVector(150, 150)
  b = createVector(450, 450)
  w = b.x - a.x
  h = b.y - a.y
  rectMode(CORNERS)
  noFill()
  stroke(255, 50)
  strokeWeight(5)
  n = floor(map(w*h, 0, 360000, 0, 130))
  for(let i = 0; i < n; i++){
    spawnParticle(true)
  }
}

function spawnParticle(bool){
  if(dir == "west" || dir == "east"){
    let yAux = random(a.y, b.y)
    let xAux
    if(bool) xAux = random(a.x, b.x)
    else if(dir == "east") xAux = a.x
    else if(dir == "west") xAux = b.x
    let speed
    if(dir == "east") speed = createVector(random(1.6, 3.5), 0)
    else if(dir == "west") speed = createVector(-random(1.6, 3.5), 0)
    let life = map(w, 0, 600, 0, 200)
    if(bool){
      let res = map(xAux, a.x, b.x, 0, life)
      life -= res
    }
    particles.push({'a': createVector(xAux, yAux), 'b': createVector(xAux - random(30, 75), yAux), 'speed': speed, 'life': life})
  }
  else{
    let xAux = random(a.x, b.x)
    let yAux
    if(bool) yAux = random(a.y, b.y)
    else if(dir == "north") yAux = b.y
    else if(dir == "south") yAux = a.y 
    let speed 
    if(dir == "north") speed = createVector(0, -random(1.6, 3.5))
    else if(dir == "south") speed = createVector(0, random(1.6, 3.5))
    let life = map(h, 0, 600, 0, 200)
    if(bool){
      let res = map(yAux, a.y, b.y, 0, life)
      life -= res
    }
    particles.push({'a': createVector(xAux, yAux), 'b': createVector(xAux, yAux - random(30, 75)), 'speed': speed, 'life': life})
  }
  
}

function draw() {
  background(0);
  //rect(a.x, a.y, b.x, b.y)
  if(particles.length < n) spawnParticle()
  for(let i = 0; i < particles.length; i++){
    let p = particles[i]
    let col
    if(p.life > 80) col = map(p.life, 100, 80, 0, 255)
    else if(p.life < 20) col = map(p.life, 20, 0, 255, 0)
    else col = 255
    stroke(col)
    line(p.a.x, p.a.y, p.b.x, p.b.y)
    p.a.add(p.speed)
    p.b.add(p.speed)
    p.life--
    if(p.life <= 0){
      particles.splice(i, 1)
      spawnParticle()
    }
  }
  stroke(100)
  rect(a.x, a.y, b.x, b.y)
}

// function draw() {
//   background(0);
//   rect(a.x, a.y, b.x, b.y)
//   if(particles.length < 25) spawnParticle()
//   for(let i = 0; i < particles.length; i++){
//     let p = particles[i]
//     let xAux
//     if(p.b.x < a.x) xAux = a.x
//     else xAux = p.b.x
//     let xAux2
//     if(p.a.x > b.x) xAux2 = b.x
//     else xAux2 = p.a.x
//     line(xAux2, p.a.y, xAux, p.b.y)
//     if(p.b.x > b.x){ 
//       particles.splice(i, 1)
//       spawnParticle()
//     }
//     else {
//       line(xAux2, p.a.y, xAux, p.b.y)
//       p.a.x += p.vel
//       p.b.x += p.vel
//     }
   
//   }
// }