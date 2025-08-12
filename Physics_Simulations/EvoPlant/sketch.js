//EvoPlant
//Miguel Rodríguez
//11-08-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let sun
let rad1 = 50
let rad2 = 95
let rad3 = 175
let plants = []
let fps = Array(10).fill(60)
let totalPlantsCreated = 0

//const greenPalette = ["#d8f3dc","#b7e4c7","#95d5b2","#74c69d","#52b788","#40916c","#2d6a4f","#1b4332","#081c15"]

function setup(){
    createCanvas(WIDTH, HEIGHT)
    sun = createVector(WIDTH / 2, 0)
    plants.push(new Plant())
    plants.push(new Plant())
    plants.push(new Plant())
    plants.push(new Plant())
    // let smartPlant = new Plant()
    // smartPlant.gen.precision_light = 0.9
    // smartPlant.gen.angle_mult = 0.9
    // plants.push(smartPlant)
    totalPlantsCreated += 5
}

function draw(){
    background(240)
    push()
    let iters = ceil(map(mouseX, 0, WIDTH, 1, 100))
    let alive = false
    for(let i = 0; i < iters; i++){
        for(let j = plants.length-1; j > 0; j--){
            let plant = plants[j]
            plant.update()
            plant.show()
            if(!plant.dead) alive = true
            else plants.splice(j, 1)
        }
        
    }

    // sun.x = WIDTH / 2 + Math.cos(frameCount * 0.01 * floor(iters)) * 200;
    // sun.y = HEIGHT / 2 + Math.sin(frameCount * 0.01 * floor(iters)) * 200;

    if(!alive){ 
        plants.push(new Plant());
        totalPlantsCreated++
    }
    pop()


    fps.shift()
    fps.push(frameRate())
    let avgFps = fps.reduce((a, b) => a + b, 0) / fps.length;

    fill(0)
    noStroke()
    text('Energy: ' + Math.floor(plants[0].energy), 10, 20)
    text('Iterations: ' + iters, 10, 40)
    text('Average FPS: ' + Math.floor(avgFps), 10, 60)
    //sum of all stem lengths
    let totalLength = plants.reduce((sum, plant) => sum + plant.stem.reduce((s, sec) => s + sec.long, 0), 0);
    text('Total Plants Created: ' + totalPlantsCreated, 10, 80)
    text('Total Plants Alive: ' + plants.length, 10, 100)
    text('Total Stem Length: ' + Math.floor(totalLength), 10, 120)
    //get mean fitness
    let meanFitness = plants.reduce((sum, plant) => sum + plant.getFitness(), 0) / plants.length;
    text('Mean Fitness: ' + meanFitness.toFixed(2), 10, 140)


    noStroke()
    fill(0, 10)
    ellipse(sun.x, sun.y, rad1*2)
    ellipse(sun.x, sun.y, rad2*2)
    ellipse(sun.x, sun.y, rad3*2)

    

}
