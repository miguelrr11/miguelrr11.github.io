//Flight game
//Miguel Rodríguez
//03-03-2024

let pos
let speed
let ac
let enemies = []
let score = 0
let goal

function setup() {
  createCanvas(1000, 1000);
  background(0);
  pos = createVector(200, 30)
  speed = createVector(0, 2)
  ac = createVector(0, 0.34)
  goal = createVector(random(0, width), random(0, height))
  
  for(let i = 0; i < 5; i++){
    enemies.push(new enemy(0, (height/5)*i, 4, 0))
  }
  for(let i = 0; i < 5; i++){
    enemies.push(new enemy(width, ((height/5)*i)+100, -4, 0))
  }
  enemies.push(new enemy(width/2, 0, 0, 6))
  enemies.push(new enemy(width/2, height, 0, -6))
  
  noStroke()
  fill(255)
}



function draw() {
  background(0);
  
  textSize(50)
  text(score, 20, 50)
  
  push()
  fill(0, 255, 0)
  ellipse(goal.x, goal.y, 50)
  pop()
  
  if(keyIsPressed){
    if(keyCode == UP_ARROW){
      ac.y = -0.34
    }
    if(keyCode == LEFT_ARROW){
      ac.x = -0.15
    }
    if(keyCode == RIGHT_ARROW){
      ac.x = 0.15
    }
  }
  else{
    ac.x = 0
    ac.y =  0.34
  }
  speed.add(ac)
  speed.x = constrain(speed.x, -15, 15)
  speed.y = constrain(speed.y, -15, 15)
  pos.add(speed)
  pos.x = constrain(pos.x, 0, width)
  pos.y = constrain(pos.y, 0, height)
  if(pos.y == 0 || pos.y == height) speed = createVector(0, 0)
  if(pos.x == 0 || pos.x == width) speed = createVector(0, 0)
  checkCollision()
  
  for(let enemy of enemies){
    enemy.update()
    enemy.show()
    if(enemy.pos.x < 0 || enemy.pos.x > width) enemy.speed.mult(-1)
    if(enemy.pos.y < 0 || enemy.pos.y > height) enemy.speed.mult(-1)
  }
  ellipse(pos.x, pos.y, 15)
}

function checkCollision(){
  for(let enemy of enemies){
    if(dist(pos.x, pos.y, enemy.pos.x, enemy.pos.y) < 20) score = 0
  }
  if(dist(pos.x, pos.y, goal.x, goal.y) < 40){
    score++
    goal = createVector(random(0, width), random(0, height))
  }
}