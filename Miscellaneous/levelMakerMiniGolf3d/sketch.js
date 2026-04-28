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
let loaded
let levelWithAux = false
let selector
let waterR = 50
let sandR = 50

function setup() {
  createCanvas(WIDTH, WIDTH);
  saveButton = createButton('Pegar nivel al portapapeles')
  saveButton.mousePressed(saveJson)
  //loadButton = createButton('Cargar Niveles de Json')
  //loadButton.mousePressed(loadJson)
  selector = createSelect()
  selector.option('walls')
  selector.option('inside walls')
  selector.option('start')
  selector.option('end')
  selector.option('water')
  selector.option('sand')
  selector.option('portal')
  selector.option('charge')
  selector.option('wind north')
  selector.option('wind east')
  selector.option('wind south')
  selector.option('wind west')
  selector.selected('walls')
}

/*
obstacles.push_back(crear_box({ 4.0f,  0.0f, -0.1f}, {10.0f, 4.0f, 0.2f}, {0,0,0}, {0.3f, 0.65f, 0.3f}));  // suelo

obstacles.push_back(crear_box({ 4.0f,  2.1f,  0.3f}, {10.0f, 0.2f, 0.6f}, {0,0,0}, {0.55f,0.35f, 0.2f}));  // pared norte

ball.pos    = { 0.5f, 0.0f, ball.radius };
*/

function saveJson(){
  console.log(pointsR)
  let scaleFactor = 0.15
  let str = ''
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let level = pointsR
  if(level.length == 0) return
  for(let i = 0; i < level.length-1; i+=2){
    let p1 = level[i]
    let p2 = level[i+1]
    let p1x = (p1.x * scaleFactor)
    let p1y = (p1.y * scaleFactor)
    let p2x = (p2.x * scaleFactor)
    let p2y = (p2.y * scaleFactor)
    let midX = (p1x + p2x)/2
    let midY = (p1y + p2y)/2
    let w = floor(dist(p1x, p1y, p2x, p2y))
    midX = Math.floor(midX)
    midY = Math.floor(midY)
    if(midX < minX) minX = midX
    if(midY < minY) minY = midY
    if(midX > maxX) maxX = midX
    if(midY > maxY) maxY = midY
    let angle = atan2(p2.y - p1.y, p2.x - p1.x)
    let eulerAngle = (angle * 180 / PI).toFixed(1)
    //paredes
    str += `obstacles.push_back(crear_box({ ${midX}.0f,  ${midY}.0f, 0.3f}, {${w}.0f, 0.5f, 0.6f}, {0,0,${eulerAngle}f}, {1,1,1}));\n`
    str += 'obstacles.back().texID = texMadera;\n'
  }
  //suelo
  let midX = (minX + maxX)/2
  let midY = (minY + maxY)/2
  midX = Math.floor(midX)
  midY = Math.floor(midY)
  let deltaX = maxX - minX
  let deltaY = maxY - minY
  str += `obstacles.push_back(crear_box({ ${midX}.0f,  ${midY}.0f, -0.1f}, {${deltaX.toFixed(0)}.0f, ${deltaY.toFixed(0)}.0f, 0.2f}, {0,0,0}, {1,1,1}));\n`
  str += 'obstacles.back().texID = texCesped;\n'

  for(let p of auxPoints){
    let pX = (p.x * scaleFactor).toFixed(1)
    let pY = (p.y * scaleFactor).toFixed(1)
    if(p.type == 'start'){
      str += `ball.pos = { ${pX}f, ${pY}f, ball.radius };\n`
    }
    if(p.type == 'end'){
      str += `holePos = { ${pX}f, ${pY}f, FLOOR_Z+0.1f };\n`
    }
  }
  // save to clipboard
  navigator.clipboard.writeText(str).then(function() {
    console.log('Nivel copiado al portapapeles');
  }, function(err) {
    console.error('Error al copiar al portapapeles: ', err);
  });
  console.log(str)
  //saveJSON(json, 'lines.json');
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
    selector.selected('walls')
  }
  if(keyCode == 82){
    pointsR.pop()
    pointsR.pop()
  }
  if(keyCode == 65){
    pointsR.pop()
    pointsR[pointsR.length-1].z = 1
    first = true
  }
  if(keyCode == 88){
    pointsR = []
    auxPoints = []
    first = true
  }
  if(keyCode == 38 && selector.selected() == "water") waterR += 10
  if(keyCode == 40 && selector.selected() == "water") waterR -= 10
  waterR = constrain(waterR, 10, 500)
  if(keyCode == 38 && selector.selected() == "sand") sandR += 10
  if(keyCode == 40 && selector.selected() == "sand") sandR -= 10
  sandR = constrain(sandR, 10, 500)
  //despued de cargar el json con los niveles, pulsar flecha de arriba para
  //ir mostrandolos
  //if(keyCode == UP_ARROW && loaded != undefined) loaded++
  
}



//para añadir puntos auxiliares (no forman parte del layout del nivel) presionar M al hacer click
function mouseClicked(){
  if(mouseY > WIDTH || mouseX > WIDTH) return
  if(selector.selected() == 'water'){
    auxPoints.push({"type": 'water', "x": x, "y": y, "z": waterR})
  }
  if(selector.selected() == 'sand'){
    auxPoints.push({"type": 'sand', "x": x, "y": y, "z": sandR})
  }
  if(selector.selected() == 'start'){
    auxPoints.push({"type": 'start', "x": x, "y": y, "z": -1})
  }
  if(selector.selected() == 'end'){
    auxPoints.push({"type": 'end', "x": x, "y": y, "z": -1})
  }
  if(selector.selected() == 'portal'){
    auxPoints.push({"type": 'portal', "x": x, "y": y, "z": -1})
  }
  if(selector.selected() == 'charge'){
    auxPoints.push({"type": 'charge', "x": x, "y": y, "z": -1})
  }
  if(selector.selected() == 'wind north'){
    auxPoints.push({"type": 'wind', "x": x, "y": y, "z": 1})
  }
  if(selector.selected() == 'wind east'){
    auxPoints.push({"type": 'wind', "x": x, "y": y, "z": 2})
  }
  if(selector.selected() == 'wind south'){
    auxPoints.push({"type": 'wind', "x": x, "y": y, "z": 3})
  }
  if(selector.selected() == 'wind west'){
    auxPoints.push({"type": 'wind', "x": x, "y": y, "z": 4})
  }
  else if(selector.selected() == 'walls'){
    if(first){
      pointsR.push(createVector(x, y, -1))
      first = false
    }
    else pointsR.push(createVector(x, y, -1), createVector(x, y, -1))
  }
  else if(selector.selected() == 'inside walls'){
    if(first){
      pointsR.push(createVector(x, y, 2))
      first = false
    }
    else pointsR.push(createVector(x, y, 2), createVector(x, y, 2))
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
  
  stroke(110)
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
  if(selector.selected() == "water") ellipse(x, y, waterR, waterR)
  if(selector.selected() == "sand") ellipse(x, y, sandR, sandR)
  else ellipse(x, y, def/2, def/2)
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
      ellipse(p.x, p.y, p.z, p.z)
    }
    if(p.type == 'sand'){
      fill(255,255,0)
      ellipse(p.x, p.y, p.z, p.z)
    }
    if(p.type == 'start'){
      fill(0,255,0)
      ellipse(p.x, p.y, 10, 10)
    }
    if(p.type == 'end'){
      fill(255,0,0)
      ellipse(p.x, p.y, 10, 10)
    }
    if(p.type == 'portal'){
      fill(255, 147, 5)
      ellipse(p.x, p.y, 10, 10)
    }
    if(p.type == 'charge'){
      fill(255, 0, 255)
      ellipse(p.x, p.y, 10, 10)
    }
    if(p.type == 'wind'){
      fill(155, 50, 225)
      ellipse(p.x, p.y, 10, 10)
    }
  }
  
  //if(loaded != undefined) drawLevel(loaded)

  fill(100)
  text("R - deshacer", 20, WIDTH-60)
  text("Poner walls, start, end y darle al botón", 20, WIDTH-45)
  text("El resto de opciones no sirven ", 20, WIDTH-30)
}

// function drawLevel(n){
//   background(220);
//   drawGrid()
//   let levelWalls = levels[n%2]
//   let levelAuxPoints = levels[n%2+1]
//   push()
//   beginShape(LINES)
//   stroke(255, 0, 0)
//   strokeWeight(3)
//   noFill()
//   for(let i = 0; i < levelWalls.length; i++){
//     let p = levelWalls[i]
//     vertex(p.x, p.y)
//   }
//   endShape()
//   noStroke()
//   for(let p of levelAuxPoints){
//     if(p.type == 'start'){
//       fill(0, 255, 0)
//       ellipse(p.x, p.y, 10, 10)
//     }
//     if(p.type == 'end'){
//       fill(255, 0, 0)
//       ellipse(p.x, p.y, 10, 10)
//     }
//     if(p.type == 'water'){
//       fill(0, 0, 255)
//       ellipse(p.x, p.y, p.z, p.z)
//     }
//     if(p.type == 'portal'){
//       fill(255, 147, 5)
//       ellipse(p.x, p.y, 10, 10)
//     }
//   }
//   pop()
// }

