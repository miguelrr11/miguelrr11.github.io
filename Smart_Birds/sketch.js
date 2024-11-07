//Flappy Bird NEAT algorithm
//Miguel Rodríguez
//03-03-2024

let birds
let nBirds = 200
let pipes = []
let flag = false
let bird_x = 200
let altura_entry = 150
const altura_entry_tot = 150
let nextPipe
const mutFactor = 0.05
let scores = []
let customFont

function setup() {
  createCanvas(1500, 800);
  customFont = loadFont('Minecraft.ttf')
  generatePipe(600+25)
  generatePipe(600 + 300 + 25)
  nextPipe = createVector(0,0)
  let bs = []
  for(let i = 0; i < nBirds; i++){
    let b = new bird(height/2)
    b.brain.init()
    bs.push(b)
  }
  birds = new population(bs)
  console.log(birds)
  noStroke()
  drawPlot()
}


function generatePipe(x){
  let y = random(150, height-300)
  pipes.push(new Pipe(x, 0, x, y, altura_entry))
  pipes.push(new Pipe(x, y+altura_entry, x, height, altura_entry))
  altura_entry--
  altura_entry = constrain(altura_entry, 120, 150)
}

function draw() {
  background(147,211,229)
  
  for(let pipe of pipes){
    pipe.update()
    pipe.show()
  }
  
  birds.run()
  
  if(birds.checkEndGen()){
    scores.push(birds.scoreTotal)
    console.log(scores)
    drawNN()
    drawPlot()
    birds.createNextGen()
    pipes = []
    altura_entry = altura_entry_tot
    generatePipe(600+25)
    generatePipe(600 + 300 + 25)
    nextPipe = createVector(0,0)
  }

  push()
  stroke(255)
  strokeWeight(5)
  textSize(65)
  fill(0)
  textFont(customFont)
  text(birds.alive.score, 600/2 -15, 70)
  pop()
  scores[scores.length-1] = birds.scoreTotal
  drawNN()
  drawPlot()
}

function drawNN(){
  let brain = birds.alive.brain
  push()
  textFont('Courier')
  colorMode(HSB)
  textAlign(CENTER)
  textSize(15)
  fill(255)
  rect(600,0, 5000, 1000)
  translate(650, 30)
  strokeWeight(2)
  fill(220, 0, 90)
  
  strokeWeight(2)
  for(let j = 0; j < brain.Ninput; j++){
    for(let i = 0; i < 1; i++){
      stroke(map(brain.input[j].weights[i], -1, 1, 0, 120), 100, 100)
      strokeWeight(map(abs(brain.input[j].weights[i]), 0, 1, 1, 10))
      line(0, j*60, 150, 115)
    }
    stroke(0)
    strokeWeight(2)
    ellipse(0, j*60, 40)
    push()
    noStroke()
    fill(0)
    text(floor(round(brain.input[j].value, 2)), 0, j*60 + 3)
    pop()
  }
  
  translate(150, 0)
  stroke(0)
  strokeWeight(2)
  if(birds.alive.speed < 0){
    push()
    strokeWeight(6)
    stroke(120, 100, 100)
    ellipse(0, 115, 40)
    pop()
  }
  else ellipse(0, 115, 40)
  push()
  noStroke()
  fill(0)
  text("JUMP", 0, 115 + 3)
  pop()
  

  pop()
}

function drawPlot(){
  push()
  textAlign(CENTER)
  colorMode(HSB)
  textFont('Courier')
  let w = 540
  let h = 260
  let maxGen = 30
  let maxScore = 5000
  translate(650, 330)
  stroke(0)
  strokeWeight(2)
  line(0, 0, 0, h)
  line(0, h, w, h)
  noStroke()
  text('Score Total', 0, -10)
  text('Gen', w + 20, h + 4)
  textSize(15)
  text(maxScore, -24, +10)
  if(maxScore < 200) text('0', -10, h)
  text(maxGen, w-15, h+15)
  text(birds.scoreTotal, -24,  (map(birds.scoreTotal, 0, maxScore, h, 0)))
  text(birds.gen, map(scores.length, 0, maxGen, 0, w)-18, h + 20)
  noStroke()
  fill(200, 100, 100)
  translate(0, h)
  colorMode(RGB)
  fill(51, 212, 255, 200)
  stroke(51, 167, 255)
  beginShape()
  vertex(0,0)
  for(let i = 0; i < scores.length; i++){
    let f = scores[i]
    f = constrain(f, 0, maxScore)
    vertex(map(i, 0, maxGen, 0, w), map(f, 0, maxScore, 0, -h))
    if(i == scores.length-1) vertex(map(i, 0, maxGen, 0, w), 0)
  }
  endShape(CLOSE)
  pop()
} 

