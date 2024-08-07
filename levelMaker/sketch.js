let def = 15
let WIDTH = 600
let nWidth = WIDTH/def
let levels = []
let pointsR = []
let x, y
let first = true
let saveButton
let loadButton
let json
let loaded
let levelWithAux = false

function preload(){
  json = loadJSON('/lines.json');
}

function setup() {
  createCanvas(WIDTH, WIDTH);
  saveButton = createButton('Guardar Niveles en Json')
  saveButton.mousePressed(saveJson)
  loadButton = createButton('Cargar Niveles de Json')
  loadButton.mousePressed(loadJson)
}

function saveJson(){
  let json = levels.map(level => level.map(point => ({ x: point.x, y: point.y })));
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
    pointsR.push(createVector(levelWithAux, 0))
    levels.push(pointsR)
    pointsR = []
    first = true
    levelWithAux = false
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
    first = true
  }
  //despued de cargar el json con los niveles, pulsar flecha de arriba para
  //ir mostrandolos
  if(keyCode == UP_ARROW && loaded != undefined) loaded++
  
}

//para añadir puntos auxiliares (no forman parte del layout del nivel) presionar M al hacer click
function mouseClicked(){
  if(mouseY > WIDTH || mouseX > WIDTH) return
  if(first || (keyIsPressed && keyCode == '77')){
    if(keyIsPressed && keyCode == '77') levelWithAux = true
    pointsR.push(createVector(x, y))
    first = false
  }
  else{
    pointsR.push(createVector(x, y), createVector(x, y))
  }
}


function draw() {
  background(220);
  let restX = mouseX % def
  let restY = mouseY % def
  if(restX > def/2) x =  mouseX - restX + def
  else x = mouseX - restX
  if(restY > def/2) y =  mouseY - restY + def
  else y = mouseY - restY
  
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
  
  if(loaded != undefined) drawLevel(loaded)
}

function drawLevel(n){
  let level = levels[n]
  let aux = level[level.length-1].x
  let num
  if(aux) num = level.length-3
  else num = level.length-1
  push()
  beginShape(LINES)
  stroke(255, 0, 0)
  strokeWeight(3)
  noFill()
  for(let i = 0; i < num; i++){
    let p = level[i]
    vertex(p.x, p.y)
  }
  endShape()
  if(aux){
    noStroke()
    fill(0, 255, 0)
    ellipse(level[level.length-3].x, level[level.length-3].y, 10, 10)
    fill(255, 0, 0)
    ellipse(level[level.length-2].x, level[level.length-2].y, 10, 10)
  }
  pop()
}

