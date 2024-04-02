//Montecarlo's Pi Estimation
//Miguel Rodríguez 
//10-02-2024

let total = 0
let inCircle = 0
let iter = 31
let pi

function setup() {
  createCanvas(600, 1000);
  background(0)
  push()
  stroke(255)
  noFill()
  strokeWeight(2)
  ellipse(300, 300, 597)
  rectMode(CENTER)
  rect(300, 300, 599, 599)
  pop()
  fill(255)
  noStroke()
  textSize(20)
  
  push()
  textSize(13)
  translate(0, 600)
  stroke(255)
  fill(255)
  strokeWeight(2)
  line(30, 30, 30, 370)
  line(30, 370, 570, 370)
  
  line(28, 35, 32, 35)
  push()
  strokeWeight(1)
  stroke(80)
  line(28, map(PI, 2.5, 3.5, 360, 40)-5, 555, map(PI, 2.5, 3.5, 360, 40)-5)
  pop()
  line(28, map(PI, 2.5, 3.5, 360, 40)-5, 32, map(PI, 2.5, 3.5, 360, 40)-5)
  line(28, 195, 32, 195)
  line(28, 355, 32, 355)
  noStroke()
  text('3,5', 7, 40)
  text('3', 7, 200)
  text('PI', 7, map(PI, 2.5, 3.5, 360, 40))
  text('2,5', 7, 358)
  text('time', 550, 390)
  pop()
}

function draw() {
  push()
  let aux = createVector(random(0, 600), random(0, 600))
  if(dist(aux.x, aux.y, 300, 300) > 300){ 
    fill(255, 0, 102)
  }
  else{ 
    fill(128, 255, 128)
    inCircle++
  }
  total++
  iter += 0.03
  ellipse(aux.x, aux.y, 5)
  pop()
  
  push()
  fill(0)
  stroke(255)
  rect(10, 965, 215, 970)
  fill(255)
  pi = (inCircle / total) * 4
  text(pi, 20, 985);
  pop()
  
  push()
  translate(0, 600)
  if(pi > PI) fill(map(pi, PI, 3.5, 255, 20))
  else fill(map(pi, 2.5, PI, 20, 255))
  noStroke()
  ellipse(iter, map(pi, 2.5, 3.5, 355, 35), 2)
  pop()
}