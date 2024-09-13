//Travelling Salesman Problem Brute Force
//Miguel Rodríguez
//13-09-2024

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let nCities = 10
let cities = []
let order = []
let visited_orders = []
let combinations = 0

let bestOrder
let bestDist = Infinity

function setup(){
    createCanvas(WIDTH, HEIGHT)
    for(let i = 0; i < nCities; i++) cities.push(createVector(random(20, WIDTH-20), random(20, (HEIGHT/2)-20)))

    bestOrder = generateRandomArray(nCities)
    combinations = tspCombinations(nCities)
    stroke(200)
    fill(140)
    strokeWeight(2)
    textSize(20)
}

function draw(){
    background(0)
    if(frameCount == combinations) noLoop()

    order = generateRandomArray(nCities)
    let totalDist = 0
    for(let i = 0; i < order.length-1; i++){
        let c1 = cities[order[i]]
        let c2 = cities[order[i+1]]
        totalDist += dist(c1.x, c1.y, c2.x, c2.y)
    }
    if(totalDist < bestDist){
        bestDist = totalDist
        bestOrder = order
        console.log(bestDist)
    }

    for(let c of cities) ellipse(c.x, c.y, 20, 20)
    for(let i = 0; i < bestOrder.length-1; i++){
        let c1 = cities[bestOrder[i]]
        let c2 = cities[bestOrder[i+1]]
        line(c1.x, c1.y, c2.x, c2.y)
    }
    translate(0, HEIGHT/2)
    for(let c of cities) ellipse(c.x, c.y, 20, 20)
    for(let i = 0; i < order.length-1; i++){
        let c1 = cities[order[i]]
        let c2 = cities[order[i+1]]
        line(c1.x, c1.y, c2.x, c2.y)
    }
    push()
    noStroke()
    fill(255)
    text(round((frameCount/combinations)*100, 3) + "%", 20, (HEIGHT/2)-20)
    pop()
}

function generateRandomArray(length) {

  let arr = Array.from({ length: length }, (_, i) => i);

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; 
  }

  return [...arr, arr[0]];
}

function dupeArr(arr){
    let res = []
    for(let i = 0; i < arr.length; i++) res.push(arr[i])
    return res
}

function factorial(n) {
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

function tspCombinations(n) {
  if (n <= 1) return 1
  return factorial(n - 1) / 2
}