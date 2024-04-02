//2D RayCasting
//Click on the 2d map to create walls
//Miguel Rodriguez
//08-02-2024

let emitter
let rays = []
let boundaries = []
const WIDTH2d = 500
const HEIGHT2d = 500
const WIDTH3d = 540
const HEIGHT3d = 540
let turn = 0
let aux
let btn
let btnDes


function setup() {
  createCanvas(WIDTH2d, HEIGHT2d*2);
  stroke(255)
  drawBack()
  
  btn = createButton('Crear pared')
  btn.mousePressed(() => {
    turn = 0
    for(let bound of boundaries){
      bound.setTipo('white')
    }
  });
  
  btnDes = createButton('Deshacer pared')
  btnDes.mousePressed(() => {
    if(boundaries.length >= 2) aux = createVector(boundaries[boundaries.length-2].v2.x, boundaries[boundaries.length-2].v2.y)
    boundaries.pop()
  });


  for(let i = -45; i < 45; i++){
    let aux = createVector(200, 200)
    rays.push(new Linea(aux, radians(i)))
  }
  
  emitter = new Emitter(rays)
  emitter.show()
  
  boundaries.push(new Boundarie(createVector(0, 0), createVector(WIDTH2d, 0), 'white'))
  boundaries.push(new Boundarie(createVector(WIDTH2d-2, 0), createVector(WIDTH2d-2, WIDTH2d), 'white'))
  boundaries.push(new Boundarie(createVector(WIDTH2d, WIDTH2d), createVector(0, WIDTH2d), 'white'))
  boundaries.push(new Boundarie(createVector(2, WIDTH2d), createVector(2, 0), 'white'))
  
}

function mouseClicked(){
  if(mouseX >= 0 && mouseX <= WIDTH2d && mouseY >= 0 && mouseY <= HEIGHT2d){
    push()
    fill(255, 0, 0)
    if(turn == 0){
      turn = 1
      aux = createVector(mouseX, mouseY)
    }
    else{
      boundaries.push(new Boundarie(aux, createVector(mouseX, mouseY), 'blue'))
      aux = createVector(mouseX, mouseY)
      push()
      stroke(255, 0, 0)
      boundaries[boundaries.length-1].show()
      pop()
    }
    pop()
  }
  
}

function drawBack(){
  background(0)
}

function draw() {
  //if(keyIsPressed){
    drawBack()
  //2d
  if(keyIsDown(RIGHT_ARROW) || keyIsDown(68)){
    emitter.rotateRays(-0.05)
  }
  if(keyIsDown(LEFT_ARROW) || keyIsDown(65)){
     emitter.rotateRays(0.05)
  }
  if(keyIsDown(UP_ARROW) || keyIsDown(87)){
     emitter.updateRays(1.5)
  }
  if(keyIsDown(DOWN_ARROW) || keyIsDown(83)){
     emitter.updateRays(-1.5)
  }
  else emitter.show()
  
  ellipse(constrain(emitter.rays[0].pos.x, 0, WIDTH2d), constrain(emitter.rays[0].pos.y, 0, HEIGHT2d), 20)
  for(let bound of boundaries){
    bound.show()
  }
  
  //3d
  push()
  noStroke()
  translate(0, HEIGHT3d + HEIGHT3d/2 - 65)
  rectMode(CENTER)
  for(let dis of emitter.screen){
    fill(dis)
    const alt = map(dis, 0, 255, 20, HEIGHT3d-150)
    rect(0, (WIDTH3d/emitter.screen.length)/2, WIDTH3d/emitter.screen.length, alt)
    translate(WIDTH3d/emitter.screen.length, 0)
  }
  pop()
  //}
  
}



