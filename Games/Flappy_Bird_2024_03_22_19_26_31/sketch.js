//Flappy Bird
//Miguel Rodríguez
//03-03-2024

let pos
let ac
let speed
let pipes = []
let flag = false
let score = 0

function setup() {
  createCanvas(600, 800);
  pos = createVector(200, 100)
  speed = createVector(0, 2)
  ac = createVector(0, 0.55)
  generatePipe(width+25)
  generatePipe(width + 300 + 25)
}

function mouseClicked(){
  speed = createVector(0, -10)
}

function generatePipe(x){
  let y = random(150, height-300)
  pipes.push(new Pipe(x, 0, x, y))
  pipes.push(new Pipe(x, y+150, x, height))
}

function draw() {
  background(0)
  speed.add(ac)
  pos.add(speed)
  pos.x = constrain(pos.x, 0, width)
  pos.y = constrain(pos.y, 0, height)
  if(pos.y == 0 || pos.y == height) speed = createVector(0, 0)
  if(pos.x == 0 || pos.x == width) speed = createVector(0, 0)
  ellipse(pos.x, pos.y, 25)
  for(let pipe of pipes){
    pipe.update()
    if(pipe.collision(pos)) noLoop()
    if(pos.x == pipe.x1) score += 0.5
    if(pipe.x1 < -25) flag = true
    pipe.show()
  }
  if(flag){
    pipes.shift()
    pipes.shift()
    generatePipe(width)
    flag = false
  }
  
  
  push()
  stroke(255)
  strokeWeight(5)
  textSize(65)
  fill(0)
  text(score, width/2, 70)
  pop()
  
}

