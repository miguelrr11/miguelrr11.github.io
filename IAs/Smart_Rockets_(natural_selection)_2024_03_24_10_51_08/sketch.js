//Smart Rockets (Natural Selection algorithm)
//Miguel Rodriguez
//21-03-2024

let rockets = []
let popul
let steps
let count = 0
let nrock = 30
let goal
let P
let gener
let fitMean
let obstacles = []
let checkBox

function setup() {
  createCanvas(400, 400);
  background(0);
  goal = createVector(width/2, 50)
  steps = 150
  gener = 0
  checkBox = createCheckbox("Trails");
  
  obstacles.push(new obstacle(width/2, 300, 100, 15))
  obstacles.push(new obstacle(100, 200, 100, 15))
  obstacles.push(new obstacle(300, 200, 100, 15))
  obstacles.push(new obstacle(50, 100, 15, 100))
  obstacles.push(new obstacle(350, 100, 15, 100))
  
  P = createP(count)
  fitMean = createP("Fitness medio: " + 0)
  
  for(let i = 0; i < nrock; i++){
    rockets.push(new rocket())
  }
  
  popul = new population(rockets)
  
}

function draw() {
  if(checkBox.checked()) background(0,5);
  else background(0);
  popul.run()
  if(count == steps){
    popul.calcularFit()
    let MP = popul.createMP()
    newPop = popul.createNewGen(MP)
    popul = newPop
    count = 0
    gener++
    background(0)
  }
  P.html("Generacion: " + gener)
  ellipse(goal.x, goal.y, 20)
  for(let o of obstacles){
    o.show()
  }
}