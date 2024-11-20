/*
Miguel Rodríguez
25-03-2024
Smart cars (NEAT algotithm)
v2: Nuevo mapa
Cada coche tiene una red neuronal asociada
Al final de cada generación se aplica selección natural
y evolución:
Los dos coches con mejor fitenss se reproducen y se 
aplica una pequeña mutuación
Los coches colisionan con las paredes del circuito
La red neuronal tiene 5 neuronas de entrada,
una por cada rayo que castea el coche:
-90, -45, 0, 45, y 90 grados. Cada neurona de entrada 
tiene como valor la distancia del coche hasta el punto
de colision de este rayo con las paredes del circuito.
Estas colisiones se ven como puntitos verdes.
La red neuronal contiene 2 capas ocultas de 4 neuronas cada una
Finalmente, existen 5 neuronas en la capa de salida que 
determinan el siguiente movimiento del coche:
- Girar a la derecha
- Girar a la izquierda
- Seguir recto
- Aumentar velocidad
- Decrementar velocidad
Para el calculo del fitness se tiene en cuenta la posicion final
en el circuito, si se ha chocado o no, y si ha sido el primero en
completar el circuito.
La visualizacion de la red neuronal corresponde siempre al
coche que va primero.
*/

let circuitimg
let circuit = []
let checkpoints = []
let Ncars = 50
let gen = 0
let popul
let txt
let fitMeans = []
let mutFactor = 0.05

let step

let btnSavePopul


function preload() {
  circuitimg = loadImage('circuito3.png');
}

function setup() {
  createCanvas(1500, 600);
  background(255)
  prev = createVector(0,0)
  let b = new border()
  b.createCircuit()
  b.createCheckPoints()

  let cars = initCars()
  popul = new population(cars)

  step = createP(popul.steps)

  btnSavePopul = createButton('Guardar NN')
  btnSavePopul.mousePressed(saveNN)
}

function saveNN(){
  saveJSON(popul, 'popul.json');
}

function initCars(){
  let cars = []
  for(let i = 0; i < Ncars; i++){
    let c = new car(200 + map(i, 0, Ncars, 0, 50), 400)
    let n = new nn()
    n.init()
    c.update(0, 0)
    c.brain = n 
    cars.push(c)
  }
  return cars
}


// function mousePressed(){
//   console.log(popul.cars)
// }

// function mouseClicked(){
//   let data = {
//     x: mouseX,
//     y: mouseY
//   };
//   c1.push(data)
// }

// function keyPressed(){
//   saveJSON(c1, 'borders.json');
// }

// function mouseClicked(){
//   console.log(mouseX, mouseY)
// }


function draw() {
  background(255)
  
  image(circuitimg, 0,0)

  step.html(popul.steps)


  // for(let b of circuit){
  //   b.show()
  // }

  // for(let c of checkpoints){
  //   c.show()
  // }

  popul.run()

  if(popul.checkEndGen()){
    popul.steps = 0
    background(255)
    popul.calcularFitness()
    let MP = popul.generarMP()
    popul.generarNewCars(MP)
    popul.first = undefined
    popul.fastestCar = undefined
    popul.podium = []
    gen++
  }

  drawNN()
  drawPlot()

  describe('A simulation of neural networks racing in a 2D circuit.')

}

//la madre q me pario menuda mosntruosidad odio p5
function drawNN(){
  let brain
  if(popul.first) brain = popul.first.brain
  else brain = popul.cars[0].brain
  push()
  textFont('Courier')
  colorMode(HSB)
  textAlign(CENTER)
  textSize(15)
  translate(650, 30)
  strokeWeight(2)
  fill(220, 0, 90)

  let index = brain.decideOutput()
  
  strokeWeight(2)
  for(let j = 0; j < brain.Ninput; j++){
    for(let i = 0; i < brain.Nhidden; i++){
      stroke(map(brain.input[j].weights[i], -1, 1, 0, 120), 100, 100)
      strokeWeight(map(abs(brain.input[j].weights[i]), 0, 1, 1, 7))
      line(0, j*60, 150, i*60 + 45)
    }
    stroke(0)
    strokeWeight(2)
    ellipse(0, j*60, 40)
    push()
    noStroke()
    fill(0)
    text(round(brain.input[j].value, 2), 0, j*60 + 3)
    pop()
  }
  translate(150, 40)
  for(let j = 0; j < brain.Nhidden; j++){
    for(let i = 0; i < brain.Nhidden; i++){
      stroke(map(brain.hidden1[j].weights[i], -1, 1, 0, 120), 100, 100)
      strokeWeight(map(abs(brain.hidden1[j].weights[i]), 0, 1, 1, 7))
      line(0, j*60, 150, i*60)
    }
    stroke(0)
    strokeWeight(2)
    ellipse(0, j*60, 40)
    push()
    noStroke()
    fill(0)
    text(round(brain.hidden1[j].value, 1), 0, j*60 + 3)
    pop()
  }
  translate(150, 0)
  for(let j = 0; j < brain.Nhidden; j++){
    for(let i = 0; i < brain.Noutput; i++){
      stroke(map(brain.hidden2[j].weights[i], -1, 1, 0, 120), 100, 100)
      strokeWeight(map(abs(brain.hidden2[j].weights[i]), 0, 1, 1, 7))
      line(0, j*60, 150, i*60 - 45)
    }
    stroke(0)
    strokeWeight(2)
    ellipse(0, j*60, 40)
    push()
    noStroke()
    fill(0)
    text(round(brain.hidden2[j].value, 1), 0, j*60 + 3)
    pop()
  }
  translate(150, -40)
  for(let i = 0; i < brain.Noutput; i++){
    strokeWeight(2)
    if(i == index){
      push()
      strokeWeight(6)
      stroke(120, 100, 100)
      ellipse(0, i*60, 40)
      pop()
    }
    else ellipse(0, i*60, 40)
    push()
    noStroke()
    fill(0)
    text(round(brain.output[i].value, 1), 0, i*60 + 3)
    if(i == 0) text('Steer right', 80, i*60 + 3)
    if(i == 1) text('Steer left', 80, i*60 + 3)
    if(i == 2) text('Go straight', 80, i*60 + 3)
    if(i == 3) text('Accelerate', 80, i*60 + 3)
    if(i == 4) text('Decelerate', 80, i*60 + 3)
    pop()
  }
  translate(-300, 0)
  strokeWeight(1)
  

  pop()
}

function drawPlot(){
  push()
  textAlign(CENTER)
  colorMode(HSB)
  textFont('Courier')
  let w = 540
  let h = 260
  let maxGen = 100
  translate(650, 320)
  stroke(0)
  strokeWeight(2)
  line(0, 0, 0, h)
  line(0, h, w, h)
  noStroke()
  text('Fitness', 0, -10)
  text('Gen', w + 20, h + 4)
  textSize(15)
  text('1', -10, +10)
  text('0', -10, h)
  //text('0', 5, h+15)
  text(maxGen, w-15, h+15)
  text(fitMeans.length, (map(fitMeans.length, 0, 100, 0, w)-5), h+15)
  noStroke()
  fill(200, 100, 100)
  translate(0, h)
  colorMode(RGB)
  fill(51, 212, 255, 200)
  stroke(51, 167, 255)
  beginShape()
  vertex(0,0)
  for(let i = 0; i < fitMeans.length; i++){
    let f = fitMeans[i]
    vertex(map(i, 0, 100, 0, w), map(f, 0, 1, 0, -h))
    if(i == fitMeans.length-1) vertex(map(i, 0, 100, 0, w), 0)
  }
  endShape(CLOSE)
  pop()
} 
















