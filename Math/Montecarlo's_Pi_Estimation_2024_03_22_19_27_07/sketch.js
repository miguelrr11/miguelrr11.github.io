//Montecarlo's Pi Estimation
//Miguel Rodríguez 
//10-02-2024

let total = 0
let inCircle = 0
let iter = 31
let iterPerFrame = 1000000
let pi

let scaleFactor = .00025
let upperBound = Math.PI + scaleFactor
let lowerBound = Math.PI - scaleFactor

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
  line(28, map(PI, lowerBound, upperBound, 360, 40)-5, 555, map(PI, lowerBound, upperBound, 360, 40)-5)
  pop()
  line(28, map(PI, lowerBound, upperBound, 360, 40)-5, 32, map(PI, lowerBound, upperBound, 360, 40)-5)
  line(28, 195, 32, 195)
  line(28, 355, 32, 355)
  noStroke()
  text('PI', 7, map(Math.PI, lowerBound, upperBound, 360, 40))
  text('time', 550, 390)
  pop()
}

function sqDist(x1, y1, x2, y2){
  return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)
}

const radSq = (600 / 2) * (600 / 2)

function draw() {
  push()
  for(let i = 0; i < iterPerFrame; i++){
    let aux = {x: Math.random() * 600, y: Math.random() * 600}
    let paintEllipse = i % iterPerFrame < 100
    if(sqDist(aux.x, aux.y, 300, 300) > radSq){ 
      if(paintEllipse) fill(255, 0, 102)
    }
    else{ 
      if(paintEllipse) fill(128, 255, 128)
      inCircle++
    }
    if(paintEllipse) ellipse(aux.x, aux.y, 1)
    total++
    iter += 0.1 / iterPerFrame
  }
  
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
  if(pi > Math.PI) fill(map(pi, Math.PI, upperBound, 255, 20))
  else fill(map(pi, lowerBound, Math.PI, 20, 255))
  noStroke()
  ellipse(iter, map(pi, lowerBound, upperBound, 355, 35), 2)
  pop()

  push()
  rectMode(CENTER)
  fill(0)
  rect(300, 300, 120, 35)
  fill(255)
  stroke(0)
  strokeWeight(2)
  textAlign(CENTER, CENTER)
  textSize(30)
  text(pi.toFixed(5), 300, 300)
  pop() 

}