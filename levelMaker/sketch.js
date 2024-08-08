let def = 15
let WIDTH = 600
let nWidth = WIDTH/def
let levels = []
let pointsR = []
let auxPoints = []
let x, y
let first = true
let saveButton
let loadButton
let json
let loaded
let levelWithAux = false
let selector

function preload(){
  json = loadJSON('lines.json');
}

function setup() {
  createCanvas(WIDTH, WIDTH);
  saveButton = createButton('Guardar Niveles en Json')
  saveButton.mousePressed(saveJson)
  loadButton = createButton('Cargar Niveles de Json')
  loadButton.mousePressed(loadJson)
  selector = createSelect()
  selector.option('walls')
  selector.option('start')
  selector.option('end')
  selector.option('water')
  selector.selected('walls')
}

function saveJson(){
  let json = levels.map(level => level.map(point => ({ type: point.type, x: point.x, y: point.y })));
  saveJSON(json, 'lines.json');
}

function loadJson(){
  levels = json
  loaded = 0
}

//SPACE para guardar nivel y empezar otro
//R para quitar punto 
//A para agujero
//X para reiniciar nivel
function keyPressed(){
  if(keyCode == 32){
    levels.push(pointsR)
    levels.push(auxPoints)
    auxPoints = []
    pointsR = []
    first = true
  }
  if(keyCode == 82){
    pointsR.pop()
    pointsR.pop()
  }
  if(keyCode == 65){
    pointsR.pop()
    first = true
  }
  if(keyCode == 88){
    pointsR = []
    auxPoints = []
    first = true
  }
  //despued de cargar el json con los niveles, pulsar flecha de arriba para
  //ir mostrandolos
  if(keyCode == UP_ARROW && loaded != undefined) loaded++
  
}



//para añadir puntos auxiliares (no forman parte del layout del nivel) presionar M al hacer click
function mouseClicked(){
  if(mouseY > WIDTH || mouseX > WIDTH) return
  if(first){
    pointsR.push(createVector(x, y))
    first = false
  }
  if(selector.selected() == 'water'){
    auxPoints.push({"type": 'water', "x": x, "y": y})
  }
  if(selector.selected() == 'start'){
    auxPoints.push({"type": 'start', "x": x, "y": y})
  }
  if(selector.selected() == 'end'){
    auxPoints.push({"type": 'end', "x": x, "y": y})
  }
  else if(selector.selected() == 'walls'){
    pointsR.push(createVector(x, y), createVector(x, y))
  }
}

function drawGrid(){
  stroke(190)
  for(let i = 0; i < nWidth+1; i++){
      line(0, i*def, nWidth*def, i*def)
  }
  for(let j = 0; j < nWidth+1; j++){
      line(j*def, 600, j*def, 0)   
  }
  
  stroke(0)
  strokeWeight(2)
  line(300, 0, 300, 600)
  line(0, 300, 600, 300)
  line(150, 0, 150, 600)
  line(0, 150, 600, 150)
  line(450, 0, 450, 600)
  line(0, 450, 600, 450)
  strokeWeight(1)
  stroke(120)
  line(0, 75, 600, 75)
  line(75, 0, 75, 600)
  line(0, 225, 600, 225)
  line(225, 0, 225, 600)
  line(0, 375, 600, 375)
  line(375, 0, 375, 600)
  line(0, 525, 600, 525)
  line(525, 0, 525, 600)
  fill(255)
  ellipse(x, y, def/2, def/2)
}


function draw() {
  background(220);
  let restX = mouseX % def
  let restY = mouseY % def
  if(restX > def/2) x =  mouseX - restX + def
  else x = mouseX - restX
  if(restY > def/2) y =  mouseY - restY + def
  else y = mouseY - restY
  
  drawGrid()
  
  push()
  stroke(255, 0, 0)
  strokeWeight(3)
  noFill()
  beginShape(LINES)
  for(let p of pointsR){
    vertex(p.x, p.y) 
  }
  endShape()
  pop()

  noStroke()
  for(let p of auxPoints){
    if(p.type == 'water'){
      fill(0,0,255)
      ellipse(p.x, p.y, 10, 10)
    }
    if(p.type == 'start'){
      fill(0,255,0)
      ellipse(p.x, p.y, 10, 10)
    }
    if(p.type == 'end'){
      fill(255,0,0)
      ellipse(p.x, p.y, 10, 10)
    }
  }
  
  if(loaded != undefined) drawLevel(loaded)

  fill(100)
  text("SPACE - guardar nivel y empezar otro", 20, WIDTH-70)
  text("R - quitar punto ", 20, WIDTH-50)
  text("A - agujero ", 20, WIDTH-30)
  text("X - reiniciar nivel ", 20, WIDTH-10)
}

function drawLevel(n){
  background(220);
  drawGrid()
  let levelWalls = levels[n%2]
  let levelAuxPoints = levels[n%2+1]
  push()
  beginShape(LINES)
  stroke(255, 0, 0)
  strokeWeight(3)
  noFill()
  for(let i = 0; i < levelWalls.length; i++){
    let p = levelWalls[i]
    vertex(p.x, p.y)
  }
  endShape()
  noStroke()
  for(let p of levelAuxPoints){
    if(p.type == 'start'){
      fill(0, 255, 0)
      ellipse(p.x, p.y, 10, 10)
    }
    if(p.type == 'end'){
      fill(255, 0, 0)
      ellipse(p.x, p.y, 10, 10)
    }
    if(p.type == 'water'){
      fill(0, 0, 255)
      ellipse(p.x, p.y, 10, 10)
    }
  }
  pop()
}

