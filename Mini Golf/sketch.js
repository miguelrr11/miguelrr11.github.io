const WIDTH = 600
const HEIGHT = 600
const col_back = "#F7E0AB"
const col_grass = "#A1DD52"
const col_wall = "#A04D31"

let ball
let rBall = 5
let level
let levelID = 0
let speed
let vel = 10
let oldPos
let moving
let inGoal = false
let levelsWalls = []

let ballP
let speedP
let oldPosP

function keyPressed(){
  level.restart()
}

function preload(){
  levelsWalls = loadJSON('levels1.json')
}

function setup() {
  let canvas = createCanvas(WIDTH, HEIGHT);
  centerCanvas(canvas)

  ball = createVector(0,0)
  ballP = createVector(0,0)
  speed = createVector(0, 0)
  speedP = createVector(0, 0)

  level = new Level(levelsWalls[levelID])
}

function centerCanvas(canvas) {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function mouseClicked(){
  if(moving) return
  let angle = atan2(mouseY-ball.y, mouseX-ball.x)
  let x = cos(angle)
  let y = sin(angle)
  speed.x = x
  speed.y = y
  speed.normalize()
  speed.mult(-1*vel)
}

//de chatGpt
function isCircleIntersectingLine(C, R, P1, P2) {

  // Calculate the projection of the circle center onto the line segment
  let t = ((C.x - P1.x) * (P2.x - P1.x) + (C.y - P1.y) * (P2.y - P1.y)) / ((P2.x - P1.x) ** 2 + (P2.y - P1.y) ** 2);
  
  // Clamp t to the range [0, 1] to find the closest point on the line segment
  t = max(0, min(1, t));
  
  // Find the closest point on the line segment
  let closestX = P1.x + t * (P2.x - P1.x);
  let closestY = P1.y + t * (P2.y - P1.y);
  
  // Calculate the distance from the circle center to the closest point
  let distance = dist(C.x, C.y, closestX, closestY);
  
  // Check if the distance is less than or equal to the radius
  
  return distance <= R
}

function draw() {
  background(col_back);

  if(!inGoal){
    ball.add(speed)

    let colliding = level.collide(ball, speed)

    if(colliding != undefined){
      speed.set(colliding)
      ball = oldPos.copy()
    }
    
    speed.mult(0.98)
    moving = speed.mag() > 0.1
    if(!moving) speed = createVector(0,0)
    
    //render level
    level.show()
    
    //render linea prediccion
    if(!moving){
      let angle = atan2(mouseY-ball.y, mouseX-ball.x)
      let x = cos(angle)
      let y = sin(angle)
      speedP.x = x
      speedP.y = y
      speedP.normalize()
      speedP.mult(-1)
      ballP = ball.copy()
      let d = constrain(dist(mouseX, mouseY, ball.x, ball.y), 40, 250)
      d = map(d, 40, 250, 20, 100)
      vel = abs(map(d, 30, 100, 1, 10))
      push()
      strokeWeight(2)
      stroke(0)
      noFill()
      beginShape()
      for(let i = 0; i < d; i++){
        ballP.add(speedP)
        let colliding = level.collide(ballP, speedP)
        if(colliding != undefined){
          speedP.set(colliding)
          ballP = oldPosP.copy()
        }
        vertex(ballP.x, ballP.y)
        oldPosP = ballP.copy()
      }
      endShape()
      pop()
    }
    
    //render player
    strokeWeight(2)
    fill(255)
    ellipse(ball.x, ball.y, rBall*2, rBall*2)

    inGoal = level.inGoal()
    oldPos = ball.copy()
  }
  
  else{
    level.show()
    strokeWeight(2)
    fill(255)
    ellipse(ball.x, ball.y, rBall*2, rBall*2)
    rBall -= 0.2
    if(rBall <= 0){
      inGoal = false
      ball = createVector(0,0)
      ballP = createVector(0,0)
      speed = createVector(0, 0)
      speedP = createVector(0, 0)
      oldPos = undefined
      moving = false
      rBall = 5
      level = new Level(levelsWalls[++levelID])
    }
  }
}










