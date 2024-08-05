//One More Line (iPhone game recreation)
//Miguel Rodríguez Rodríguez
//04-08-2024

let player
let camara
let oldPos
let anchors = []
let activeAnchor
let nearestAnchor
let angle
let vel = 0.035
let speed
let c
let anchored = false
let poss = []
let anim = 0
const WIDTH = 600
const HEIGHT = 600
let score = 0

function setup() {
  createCanvas(WIDTH, HEIGHT);
  camara = createVector(0, 0)
  player = createVector(WIDTH/2, 500)
  anchors.push(new Anchor(createVector(450, -300), 130, 40))
  speed = createVector(0, -7)
  getActiveAnchor()
  spawnAnchor(true)
}

function get_angle(x1, y1, x2, y2){
  dx = x2 - x1
  dy = y2 - y1
  angle_radians = atan2(dy, dx)
  angle = angle_radians-PI
}


function getActiveAnchor(){
  let bestDist = Infinity
  let bestAnc = undefined
  let inBounds = []
  let up = []
  let down = []
  for(let a of anchors){
    let d = dist(player.x, player.y, a.pos.x, a.pos.y)
    if(d < a.rad) inBounds.push(a)
    if(d < bestDist){
      bestDist = d  
      nearestAnchor = a
    }
  }
  bestDist = Infinity
  bestAnc = undefined
 
  for(let a of inBounds){
    if(a.pos.y < player.y) up.push(a)
    else down.push(a)
  }
  if(up.length > 0){
    for(let a of up){
      let d = dist(player.x, player.y, a.pos.x, a.pos.y)
      if(d < bestDist){
        bestDist = d  
        bestAnc = a
      }
    }
  }
  else{
    for(let a of down){
      let d = dist(player.x, player.y, a.pos.x, a.pos.y)
      if(d < bestDist){
        bestDist = d  
        bestAnc = a
      }
    }
  }
  activeAnchor = bestAnc
  if(bestAnc != undefined && bestDist > bestAnc.rad) activeAnchor = undefined
}

function mouseReleased(){
  anchored = false
}

function checkCollisions(){
  for(let a of anchors){
    a.checkCollision()
  }
  if(!mouseIsPressed && (player.x > 500 || player.x < 100)) noLoop()
  if(player.x > 700 || player.x < -100) noLoop()
}


function draw() {
  background(20)
  anim += 0.003
  
  if(mouseIsPressed && !anchored){
    getActiveAnchor()
    if(activeAnchor != undefined){
      anchored = true
      get_angle(player.x, player.y, activeAnchor.pos.x, activeAnchor.pos.y)
      let r = createVector(player.x - activeAnchor.pos.x, player.y - activeAnchor.pos.y)
      c = (speed.x * r.y) - (speed.y * r.x)
    }
  }


  if(!mouseIsPressed || !anchored) player.add(speed)
  
  else if (anchored && mouseIsPressed){
    let rad = dist(player.x, player.y, activeAnchor.pos.x, activeAnchor.pos.y)
    vel = 12/rad
    if(c > 0) angle -= vel
    else angle += vel
    
    player.x = activeAnchor.pos.x + rad*cos(angle)
    player.y = activeAnchor.pos.y + rad*sin(angle)
    activeAnchor.getNewSpeed()
  }

  poss.push(player.copy())
  spawnAnchor()
  camara.y = player.y - 400
  render()
  if(-player.y/250 > score) score = floor(-player.y/250)
  
  checkCollisions()
  
  
}

function spawnAnchor(bool){
  let lastAnchor = anchors[anchors.length-1]
  if(lastAnchor.pos.y - player.y > -500 || bool){
    for(let i = 0; i < 10; i++){
      let x = random(120, 480)
      let y = random(lastAnchor.pos.y-160, lastAnchor.pos.y - 250)
      let tam = random(15, 38)
      let rad = random(155, 240)
      anchors.push(new Anchor(createVector(x, y), rad, tam))
      lastAnchor = anchors[anchors.length-1]
    }
  }
}

function discLinesEllipse(col, pos, rad, dis, offset = frameCount, isDotted = false, strokeW = 3) {
      push()
      colorMode(HSB)
      stroke(col, 100, 100)
      strokeWeight(strokeW)
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

function render(){
  colorMode(RGB)
  let x = player.x - camara.x
  let y = player.y - camara.y
  
  
  //linea player-anchor
  noFill()
  stroke(255)
  strokeWeight(2)
  if(mouseIsPressed && activeAnchor){
    let x2 = activeAnchor.pos.x - camara.x
    let y2 = activeAnchor.pos.y - camara.y
    line(x, y, x2, y2)
  }
  else if(mouseIsPressed){
    let x2 = nearestAnchor.pos.x - camara.x
    let y2 = nearestAnchor.pos.y - camara.y
    line(x, y, x2, y2)
  }

  //anchors
  push()
  for(let a of anchors){
    if(a.pos.y > player.y + 400) continue
    let x = a.pos.x - camara.x
    let y = a.pos.y - camara.y
    colorMode(HSB)
    fill(a.col, 65, 100)
    noStroke()
    ellipse(x, y, a.tam, a.tam)

    discLinesEllipse(a.col, createVector(x, y), a.tam-a.tam/4, 20, offset = anim*10)
  }
  pop()

  //circunferencia anchor
  if(activeAnchor && mouseIsPressed){
    let x = activeAnchor.pos.x - camara.x
    let y = activeAnchor.pos.y - camara.y
    let rad = dist(player.x, player.y, activeAnchor.pos.x, activeAnchor.pos.y)
    discLinesEllipse(activeAnchor.col, createVector(x, y), rad, floor(map(rad, 0, 230, 50, 170)), offset = anim*5)
  }

  //traza player
  stroke(225)
  strokeWeight(3)
  beginShape()
  for(let p of poss){
    let x = p.x - camara.x
    let y = p.y - camara.y
    vertex(x, y)
    if(poss.length > 1000) poss.shift()
  }
  endShape()

  colorMode(RGB)
  //player
  fill(255)
  noStroke()
  let curAngle = atan2(speed.y, speed.x)
  let a1 = curAngle + HALF_PI
  let a2 = curAngle - HALF_PI
  arc(x, y, 25, 25, a2, a1)
  //ellipse(x, y, 25, 25)

  //paredes
  push()
  colorMode(RGB)
  fill(64, 181, 255)
  if(player.x > 500 || player.x < 100) fill(248, 67, 67)
  noStroke()
  rect(70, 0, 10, HEIGHT)
  rect(90, 0, 10, HEIGHT)
  rect(500, 0, 10, HEIGHT)
  rect(520, 0, 10, HEIGHT)
  pop()

  //score
  push()
  textFont("Courier")
  textSize(40)
  colorMode(RGB)
  fill(150)
  noStroke()
  text(score, 10, 35)
  pop()

}

