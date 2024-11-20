//Miguel Rodríguez 
//Break Bricks
//07-03-2024

let balls = []
let scaler = 3
let barraPos
let barraRadio
let bricks = []
let levels = []
let spawner = false
let contador = 60
let contSpawn = 20

function setup() {
  createCanvas(600, 600);
  //frameRate(5)
  /*
  9: no hay brick
  0: brick sin powerUp
  >0: brick con powerUp
  
  PowerUps:
  1: explosion: spawnea 8 bolas en todas direcciones
  2: barra mejorada: alarga la barra
  3: nueva bola: añade permanentemente una bola
  4: cañon: añade un spawner de bolas con vida = 1 a la barra
  */
  levels.push([[0,0,0,0,0,0,3,0,3,0,0,0,0,0,0],
               [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
                [0,0,0,3,0,0,0,2,0,0,0,3,0,0,0],
               [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
                [0,0,4,0,0,0,0,0,0,0,0,0,4,0,0],
               [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
                [0,1,0,0,0,3,0,3,0,3,0,0,0,1,0],
               [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
              [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9]])
  
  levels.push([[0,0,1,0,0,0,0,0,0,0,0,0,1,0,0],
               [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
                [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0],
               [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
                [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0],
               [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
                [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0],
               [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
                [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0],
               [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
                [0,0,1,0,0,0,0,2,0,0,0,0,1,0,0],
              [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9]])
  
  levels.push([[0,9,0,0,0,0,0,0,0,0,0,0,0,0,0],
               [0,9,0,9,9,9,9,9,9,9,0,9,9,9,0],
               [0,9,0,9,0,0,0,0,0,9,0,9,1,9,0],
               [0,9,0,9,0,0,0,0,0,9,0,9,1,9,0],
               [0,9,0,9,0,9,9,9,9,9,0,9,1,9,0],
               [0,9,0,9,0,9,1,1,1,0,0,9,0,9,0],
               [0,9,0,9,0,9,9,9,9,9,0,9,0,9,0],
               [0,9,1,9,0,0,0,0,0,9,0,9,0,9,0],
               [0,9,1,9,0,9,9,9,9,9,0,9,0,9,0],
               [0,9,1,9,0,9,0,0,0,0,0,9,0,9,0],
               [0,9,9,9,0,9,9,9,9,9,9,9,0,9,0],
               [0,0,0,0,0,0,0,0,0,0,0,0,0,9,0]])
   
  
  balls.push(new Ball(300, 400, 0, -6, undefined))
  
  barraPos = createVector(300, 580)
  barraRadio = 100
  
  let levelIndex = 0
  let level = levels[levelIndex]
  let health = 2
  if(levelIndex == 2) health = 3
  
  for(let i = 0; i < 12; i++){
    for(let j = 0; j < 15; j++){
      if(level[i][j] == 9) continue
      bricks.push(new Brick(20+j*(width/20 + 10), 50+i*20, health, level[i][j]))
    }
  }
  noStroke()
  fill(255)
  rectMode(CENTER)
}



function draw() {
  background(0);
  contador--
  
  if(keyIsDown(LEFT_ARROW) && barraPos.x > barraRadio/2) barraPos.x -= 6.5
  if(keyIsDown(RIGHT_ARROW) && barraPos.x < width - barraRadio/2) barraPos.x += 6.5
  
  if(spawner && contador == 0 && contSpawn != 0){
    balls.push(new Ball(barraPos.x-barraRadio, barraPos.y, 0, -6, 1))
    balls.push(new Ball(barraPos.x+barraRadio, barraPos.y, 0, -6, 1))
    contSpawn--
  }
  
  for(let j = 0; j < balls.length; j++){
    let b = balls[j]
    let borrar = false
    if(!b.update()) borrar = true
    b.show()
    for(let i = 0; i < bricks.length; i++){
      if(collBrick(bricks[i].pos.x, bricks[i].pos.y, b.pos.x, b.pos.y)){ 
        if(b.vida != undefined){ 
          b.vida--
          if(b.vida == 0) balls.splice(j, 1)
        }
        if(b.pos.y > bricks[i].pos.y + 12 || b.pos.y < bricks[i].pos.y - 12){
          b.speed.y *= -1
        }
        else if(b.pos.x >= bricks[i].pos.x + 22 || b.pos.x <= bricks[i].pos.x + 22){
          b.speed.x *= -1
        }
        if(bricks[i].hit()) bricks.splice(i, 1)
      }
    }
    if(borrar) balls.splice(j, 1)
    if(balls.length == 0) gameOver()
    if(bricks.length == 0) gameWin()
  }
  
  for(let b of bricks){
    b.show()
  }

  push()
  stroke(255)
  strokeWeight(4)
  line(barraPos.x-barraRadio, barraPos.y, barraPos.x+barraRadio, barraPos.y)
  pop()
  
  if(contador == 0) contador = 7
}

function gameWin(){
  fill(0, 255, 0)
  textSize(60)
  textAlign(CENTER)
  text("YOU WIN", 300, 350)
}

function gameOver(){
  noLoop()
  fill(255, 0, 0)
  textSize(60)
  textAlign(CENTER)
  text("GAME OVER", 300, 350)
}

function collBrick(xBrick, yBrick, xBall, yBall){
  if(yBall - 7.5 <= yBrick + 10 && yBall + 7.5 >= yBrick - 10 &&
    xBall + 7.5 >= xBrick - 20 &&  xBall - 7.5 <= xBrick + 20){
    return true
  }
  return false
}
