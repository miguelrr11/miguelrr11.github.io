//Snake Game
//Miguel Rodríguez
//02-02-2024

let WIDTH = 600
let HEIGHT = 600
let tam_cell = WIDTH/40
let head
let dir
let food
let tail = []
let new_tail = []
let total = 0

function setup() {
  
  createCanvas(WIDTH, HEIGHT);
  background(255);
  frameRate(10)
  stroke(0)
  fill(255)
  
  head = createVector(40, 40)
  dir = createVector(1, 0)
  push()
  fill(0, 255, 0)
  food = createVector(40*floor(random(0, tam_cell)), 40*floor(random(0, tam_cell)))
  rect(food.x, food.y, tam_cell, tam_cell)
  pop()
  tail.unshift(head)
  textSize(20)
}

function draw() {
  background(0)
  text(total+1, 20, 40)
  update()
}

/*
head = antiguo
tail = [head_antiguo, antiguo1, antiguo2, antiguo3...]
head = nuevo
****
** **
*/

function update(){
  
  
  if(dist(head.x, head.y, food.x, food.y) < 20){ 
    food = createVector(40*floor(random(0, tam_cell)), 40*floor(random(0, tam_cell)))
    total++
  }
  else new_tail.pop()
  
  let aux = createVector(head.x, head.y)
  new_tail.unshift(aux)
  
  head.x = constrain(head.x + (dir.x * tam_cell), 0, WIDTH-tam_cell)
  head.y = constrain(head.y + (dir.y * tam_cell), 0, HEIGHT-tam_cell)
  
  for(let i = 1; i < total; i++){
    new_tail[i] = tail[i-1]
  }
  for(let i = 0; i < total; i++){
    
    rect(new_tail[i].x, new_tail[i].y, tam_cell, tam_cell)
    tail[i] = new_tail[i]
  }
  for(let i = 0; i < total-1; i++){
    if(dist(head.x, head.y, new_tail[i+1].x, new_tail[i+1].y) < 5) reset()
  }
  
  rect(head.x, head.y, tam_cell, tam_cell)
  push()
  fill(0, 255, 0)
  rect(food.x, food.y, tam_cell, tam_cell)
  pop()
}

function reset(){
  tail = []
  new_tail = []
  total = 0
  head = createVector(40, 40)
  dir = createVector(0, 0)
}

function keyPressed(){
  if(dir.x != 0 && dir.y != 1 && keyCode === UP_ARROW) dir = createVector(0, -1)
  else if(dir.x != 0 && dir.y != -1 && keyCode === DOWN_ARROW) dir = createVector(0, 1)
  else if(dir.x != 1 && dir.y != 0 && keyCode === LEFT_ARROW) dir = createVector(-1, 0) 
  else if(dir.x != -1 && dir.y != 0 && keyCode === RIGHT_ARROW) dir = createVector(1, 0)
}

