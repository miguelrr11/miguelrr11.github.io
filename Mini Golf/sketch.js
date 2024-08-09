const WIDTH = 600
const HEIGHT = 600
const col_back = "#F7E0AB"
const col_grass = "#A1DD52"
const col_wall = "#6DB837"
const dark_orange = "#bf770a"
const light_orange = "#ff9900"
const light_blue = "#4dacff"
const dark_blue = "#327ecf"
const dark_purple = "#912adb"
const light_purple = "#c969f5"
const dark_red = "#bf2222"
const light_red = "#e65353"
const light_yellow = "#edd34e"
const dark_yellow = "#bda73a"

let ball
let rBall = 6
let level
let levelID = 0
let speed
let vel = 10
let oldPos
let moving
let inGoal = false
let levelsWalls = []
let font
let inSand = false
let friction = 0.98

let ballP
let speedP
let oldPosP
let powerLeft = 100
let powerToBeUsed = 0
let powerAnim = 100
let t = 0

function keyPressed(){
  level.restart()
}

function preload(){
  levelsWalls = loadJSON('levels1.json')
  font = loadFont('PORKYS_.ttf')
  console.log(font)
}

function setup() {
  let canvas = createCanvas(WIDTH, HEIGHT+100);
  centerCanvas(canvas)

  ball = createVector(0,0)
  ballP = createVector(0,0)
  speed = createVector(0,0)
  speedP = createVector(0,0)

  level = new Level(levelsWalls[levelID], levelsWalls[levelID+1])
}

function centerCanvas(canvas) {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function mouseClicked(){
  if(moving || powerToBeUsed == 0) return
  powerAnim = powerLeft
  powerLeft -= powerToBeUsed
  let angle = atan2(mouseY-ball.y, mouseX-ball.x)
  let x = cos(angle)
  let y = sin(angle)
  speed.x = x
  speed.y = y
  speed.normalize()
  vel = abs(map(powerToBeUsed, 0, 100, 0.5, 15))
  speed.mult(-1*vel)
  powerToBeUsed = 0
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
  t += 0.04
  // strokeWeight(7)
  // stroke(dark_orange)
  // noFill()
  // rect(3.5,3.5,WIDTH-7,HEIGHT-7)

  if(powerAnim > powerLeft) powerAnim -= map(vel, 0.5, 15, 0.06, 1.3)
  if(powerLeft >= 1) powerAnim = constrain(powerAnim, 1, 100)

  if(!inGoal){
    ball.add(speed)
    if(level.collideWater()) level.restart()

    inSand = level.collideSand()
    if(inSand) friction = 0.88
    else friction = 0.98

    let collPortal = level.collidePortals()
    if(collPortal != undefined){
      let angle = atan2(speed.y, speed.x)
      let x = cos(angle)
      let y = sin(angle)
      let newPos = createVector(x, y)
      newPos.normalize().mult(20).add(collPortal)
      ball = newPos.copy()
    }

    level.collideCharges()

    let colliding = level.collide(ball, speed)

    if(colliding != undefined){
      speed.set(colliding)
      ball = oldPos.copy()
    }
    
    speed.mult(friction)
    moving = speed.mag() > 0.1
    if(!moving) speed = createVector(0,0)
    
    //render level
    level.show()
    
    //render linea prediccion
    //hay que refactorizar
    if(!moving){
      if(powerLeft <= 0){
        level.restart()
      }
      else{
        let angle = atan2(mouseY-ball.y, mouseX-ball.x)
        let x = cos(angle)
        let y = sin(angle)
        speedP.x = x
        speedP.y = y
        speedP.normalize()
        speedP.mult(-1)
        ballP = ball.copy()
        //deberia estar en la carcel por escribir semejante trozo de basura:
        powerToBeUsed = constrain(round(map(constrain(dist(mouseX, mouseY, ball.x, ball.y), 20, 250), 20, 250, 0, 100)), 0, powerLeft)
        push()
        strokeWeight(6)
        stroke(light_orange)
        noFill()
        beginShape()
        for(let i = 0; i < 100; i++){
          if(i == powerToBeUsed){
            endShape()
            stroke(dark_orange)
            beginShape()
          }
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
        let posText = createVector(x, y)
        posText.normalize().mult(40).add(ball)
        fill(0)
        textSize(28)
        textAlign(CENTER, CENTER)
        textFont(font)
        stroke(dark_orange)
        fill(light_orange)
        strokeWeight(6)
        text(powerToBeUsed + "%", posText.x, posText.y)
        pop()
      }

    }
    
    //render player
    strokeWeight(3)
    fill(255)
    ellipse(ball.x, ball.y, rBall*2, rBall*2)

    inGoal = level.inGoal()
    oldPos = ball.copy()

    // fill(0)
    // text("Power Left: " + powerLeft, 30, 600-30)
    // text("Power to be used: " + powerToBeUsed, 30, 600-15)
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
      rBall = 6
      levelID += 2
      level = new Level(levelsWalls[levelID], levelsWalls[levelID+1])
      powerLeft = 0
    }

    

  }
}

function DiscLinesEllipse(col, pos, rad, dis, offset = 0, isDotted = false) {
    push()
    stroke(col)
    strokeWeight(7)
    noFill()
    translate(pos)

    let angleStep = TWO_PI / dis
    let angleStep2 = TWO_PI / dis
    let curAngleStep = offset % TWO_PI
    let limit = TWO_PI + offset % TWO_PI
    if(isDotted) angleStep2 = 0.000001

    for (let i = 0; curAngleStep < limit; i++) {
        let x1 = rad * cos(curAngleStep)
        let y1 = rad * sin(curAngleStep)
        curAngleStep += angleStep2
        let x2 = rad * cos(curAngleStep)
        let y2 = rad * sin(curAngleStep)
        curAngleStep += angleStep
        line(x1, y1, x2, y2)
    }
    pop();
}











