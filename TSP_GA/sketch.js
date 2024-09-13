//Travelling Salesman Problem Genetic Algorithm
//Miguel Rodríguez
//13-09-2024

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let nCities = 12
let cities = []

let population = []
let nPop = 1000
let mutateFactor = 0.02

let bestOrder
let currentBest

let panel

function setup(){
    createCanvas(WIDTH+200, HEIGHT)
    for(let i = 0; i < nCities; i++) cities.push(createVector(random(20, WIDTH-20), random(20, (HEIGHT/2)-20)))
    for(let i = 0; i < nPop; i++) population.push(new Run(generateRandomArray(nCities)))
    bestOrder = population[0]
    currentBest = population[0]

    panel = new Panel(WIDTH, 0, 200, HEIGHT, "Travelling\nSalesman\nProblem")
    panel.addText("Genetic\nAlgorithm")
    panel.addText()
    panel.addText()
    panel.addButton("Reset", reset)
    //noLoop()

}

function draw(){
    background(0)
    if(bestOrder) bestOrder.show()
    push()
    translate(0, HEIGHT/2)
    if(currentBest) currentBest.show()
    pop()

    calculateDistPop()
    calculateFitness()
    generateNewPop()

    panel.setText(1, "Gen: " + getSimpleInt(frameCount))
    panel.setText(2, "Best: " + Math.round(bestOrder.totalDist))
    panel.update()
    panel.show()

}

function reset(){
    cities = []
    population = []
    for(let i = 0; i < nCities; i++) cities.push(createVector(random(20, WIDTH-20), random(20, (HEIGHT/2)-20)))
    for(let i = 0; i < nPop; i++) population.push(new Run(generateRandomArray(nCities)))
    bestOrder = population[0]
}

function calculateDistPop(){
    for(let p of population) p.calculateDist()
}

function calculateFitness(){
    let bestDist = Infinity
    let worstDist = 0
    for(let p of population){
        if(p.totalDist < bestDist) {
            bestDist = p.totalDist
            currentBest = p
        }
        if(p.totalDist < bestOrder.totalDist) bestOrder = p
        if(p.totalDist > worstDist) worstDist = p.totalDist
    }

    let diff = worstDist - bestDist
    for(let p of population) p.fitness = 1 - (p.totalDist - bestDist) / diff
}

function generateNewPop(){
    let newPop = []

    for(let i = 0; i < nPop; i++){
        const orderA = pickFromArr(population).order
        const orderB = pickFromArr(population).order
        const order = crossover(orderA, orderB)
        let newRun = new Run(order)
        newRun.mutate()
        newPop[i] = newRun
    }

    population = newPop
}

function crossover(orderA, orderB){
    const start = floor(random(orderA.length));
    const end = floor(random(start + 1, orderA.length));
    const neworder = orderA.slice(start, end);

    for (let i = 0; i < orderB.length; i++) {
        const city = orderB[i];
        if (!neworder.includes(city)) {
          neworder.push(city);
        }
    }
    return neworder;
}

function pickFromArr(arr){
    const totalFitness = arr.reduce((sum, item) => sum + item.fitness, 0);
    let random = Math.random() * totalFitness;

    for (let item of arr) {
        random -= item.fitness;
        if (random <= 0) {
            return item;
        }
    }
}

function generateRandomArray(length) {

  let arr = Array.from({ length: length }, (_, i) => i);

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; 
  }

  return arr
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

function swap(a, b){
    let tmp = a 
    a = b 
    b = tmp
}

function getSimpleInt(n){
    if(n < 1000) return floor(n)  
    if(n < 1000000) return round(n/1000, 2) + "K"
    if(n < 1000000000) return round(n/1000000, 2) + "M"
    else return round(n/1000000000, 2) + "B"
}