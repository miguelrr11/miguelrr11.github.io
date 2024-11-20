/*
Snake Game IA (NEAT algorithm)
Miguel Rodriguez
25-03-2024
Red neuronal con 19 inputs, 2 hidden layers y 3 outputs
(girar izq, dcha, seguir recto)
*/

const WIDTH = 1500
const HEIGHT = 500
const nCells = 50
const tamCell = 500/nCells
let popul
let velSim = 1
let nSnakes = 2000
let nSnakesPool = 5
let timeLeftTotal = 250
let gen = 0
let mutFactor = 0.05
let bestScores = []
let P
let P2

let bestestScore = 0

let s1

// function keyPressed(){
// 	if(keyCode == DOWN_ARROW) s1.update(createVector(0, 1))
// 	else if(keyCode == UP_ARROW) s1.update(createVector(0, -1))
// 	else if(keyCode == RIGHT_ARROW) s1.update(createVector(1, 0))
// 	else if(keyCode == LEFT_ARROW) s1.update(createVector(-1, 0))
// 	s1.detectorColl()
// 	//console.log(s1)
// 	redraw()
// }



// function mouseClicked(){
// 	console.log(popul.snakes[0])
// }

function setup(){
	createCanvas(WIDTH, HEIGHT)
	background(0)
	//frameRate(velSim)

	popul = new population(nSnakes)
	popul.init()
	console.log(popul)
	P = createP()

	// s1 = new snake(5, 5)
	// s1.init()
	// noLoop()
}

function draw(){
	background(0)
	// s1.show()
	// if(!keyIsPressed) s1.update(s1.speed)
	popul.run()
	if(popul.checkEndGen()){
		bestScores.push(popul.bestSnake.tail.length)
		if(popul.bestSnake.tail.length > bestestScore) bestestScore = popul.bestSnake.tail.length
		popul.steps = 0
	    background(255)
	    popul.calcularFitness()
	    let MP = popul.generarMP()
	    popul.generarNewSnakes(MP)
	    popul.bestSnake = random(popul.snakes)
	    gen++
	}
	P.html('Gen: ' + gen + ' Media: ' + popul.media + ' Steps: ' + popul.steps + ' Best Score: ' + bestestScore)
	drawNN()
	drawPlot()
	
}

function drawNN(){
  let brain = popul.bestSnake.brain
  push()
  textFont('Courier')
  colorMode(HSB)
  textAlign(CENTER)
  textSize(10)
  translate(550, 20)
  strokeWeight(2)
  fill(220, 0, 90)

  let spacing = 25

  let index = brain.decideOutput()
  
  
  strokeWeight(2)
  for(let j = 0; j < brain.Ninput; j++){
    for(let i = 0; i < brain.Nhidden1; i++){
      stroke(map(brain.input[j].weights[i], -1, 1, 0, 120), 100, 100)
      strokeWeight(map(abs(brain.input[j].weights[i]), 0, 1, 1, 5))
      line(0, j*spacing, 70, i*spacing + 50)
    }
    stroke(0)
    strokeWeight(2)
    ellipse(0, j*spacing, 20)
    push()
    noStroke()
    fill(0)
    text(round(brain.input[j].value, 2), 0, j*spacing + 3)
    pop()
  }
  translate(70, 50)
  for(let j = 0; j < brain.Nhidden1; j++){
    for(let i = 0; i < brain.Nhidden2; i++){
      stroke(map(brain.hidden1[j].weights[i], -1, 1, 0, 120), 100, 100)
      strokeWeight(map(abs(brain.hidden1[j].weights[i]), 0, 1, 1, 5))
      line(0, j*spacing, 70, i*spacing + 55)
    }
    stroke(0)
    strokeWeight(2)
    ellipse(0, j*spacing, 20)
    push()
    noStroke()
    fill(0)
    text(round(brain.hidden1[j].value, 1), 0, j*spacing + 3)
    pop()
  }
  push()
  translate(-70, -50)
  for(let j = 0; j < brain.Ninput; j++){
    stroke(0)
    strokeWeight(2)
    ellipse(0, j*spacing, 20)
    push()
    noStroke()
    fill(0)
    text(round(brain.input[j].value, 2), 0, j*spacing + 3)
    pop()
  }
  pop()
  translate(70, 55)
  for(let j = 0; j < brain.Nhidden2; j++){
    for(let i = 0; i < brain.Noutput; i++){
      stroke(map(brain.hidden2[j].weights[i], -1, 1, 0, 120), 100, 100)
      strokeWeight(map(abs(brain.hidden2[j].weights[i]), 0, 1, 1, 5))
      line(0, j*spacing, 70, i*spacing + 97)
    }
    stroke(0)
    strokeWeight(2)
    ellipse(0, j*spacing, 20)
    push()
    noStroke()
    fill(0)
    text(round(brain.hidden2[j].value, 1), 0, j*spacing + 3)
    pop()
  }
  translate(70, 97)
  for(let i = 0; i < brain.Noutput; i++){
    strokeWeight(2)
    if(i == index){
      push()
      strokeWeight(4)
      stroke(120, 100, 100)
      ellipse(0, i*spacing, 20)
      pop()
    }
    else ellipse(0, i*spacing, 20)
    push()
    noStroke()
    fill(0)
    text(round(brain.output[i].value, 1), 0, i*spacing + 3)
    if(i == 0) text('Go straight', 80, i*spacing + 3)
    if(i == 1) text('Steer left', 80, i*spacing + 3)
    if(i == 2) text('Steer right', 80, i*spacing + 3)
    pop()
  }
  translate(-300, 0)
  strokeWeight(1)
  

  pop()
}

function drawPlot(){
  push()
  translate(840, 50)
  let w = 540
  let h = 420

  push()
  fill(255)
  rect(-50,-50,w+200,h+100)
  pop()

  textAlign(CENTER)
  colorMode(HSB)
  textFont('Courier')
  
  let maxGen = 100
  stroke(0)
  strokeWeight(2)
  line(0, 0, 0, h)
  line(0, h, w, h)
  noStroke()
  text('MaxScore', 0, -10)
  text('Gen', w + 20, h + 4)
  textSize(15)
  text('100', -15, +10)
  text('0', -10, h)
  //text('0', 5, h+15)
  text(maxGen, w-15, h+15)
  text(bestScores.length, (map(bestScores.length, 0, 100, 0, w)-5), h+15)
  noStroke()
  fill(200, 100, 100)
  translate(0, h)
  colorMode(RGB)
  fill(51, 212, 255, 200)
  stroke(51, 167, 255)
  beginShape()
  vertex(0,0)
  for(let i = 0; i < bestScores.length; i++){
    let f = bestScores[i]
    vertex(map(i, 0, 100, 0, w), map(f, 0, 100, 0, -h))
    if(i == bestScores.length-1) vertex(map(i, 0, 100, 0, w), 0)
  }
  endShape(CLOSE)
  pop()
} 

