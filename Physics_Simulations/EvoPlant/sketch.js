//EvoPlant
//Miguel Rodríguez
//11-08-2025

p5.disableFriendlyErrors = true
const WIDTH = 750
const HEIGHT = 750

let sun
let rad1 = 40
let rad2 = 75
let rad3 = 125
let plants = []
let fps = Array(10).fill(60)
let oldfps = 60
let totalPlantsCreated = 0
const nPlantsPerGen = 30
const RAD_PLANT_TO_SUN = 350
const RAD_PLANT_TO_SUN_SQ = RAD_PLANT_TO_SUN * RAD_PLANT_TO_SUN

let ctx
let iters
let totalIters = 0
const MAX_ITERS = 8000
let gen = 0

const TABLE_SIZE = 1024
const TWO_PI = Math.PI * 2
const cosTable = new Float32Array(TABLE_SIZE)
const sinTable = new Float32Array(TABLE_SIZE)


function getCircularPos(n, radius){
    let angle = map(n, 0, nPlantsPerGen, 0, TWO_PI);
    let x = WIDTH / 2 + cos(angle + 0.1) * radius;
    let y = HEIGHT / 2 + sin(angle + 0.1) * radius;
    return createVector(x, y);
}

function setup(){
    let canvas = createCanvas(WIDTH, HEIGHT)
    ctx = canvas.elt.getContext('2d');
    sun = createVector(WIDTH / 2, HEIGHT / 2)
    for(let i = 0; i < nPlantsPerGen+1; i++){
        let pos = getCircularPos(i, RAD_PLANT_TO_SUN);
        plants.push(new Plant(pos));
    }
    for (let i = 0; i < TABLE_SIZE; i++) {
        const angle = (i / TABLE_SIZE) * TWO_PI;
        cosTable[i] = Math.cos(angle);
        sinTable[i] = Math.sin(angle);
    }
    totalPlantsCreated = plants.length;
    iters = 10
    MAX_TURNS = nPlantsPerGen * 2 
}

function draw(){
    background(240)
    push()
    console.log()
    fps.shift()
    fps.push(frameRate())
    let avgFps = fps.reduce((a, b) => a + b, 0) / fps.length;
    // if(oldfps < avgFps || avgFps < 30){
    //     iters = constrain(iters-1, 1, 100)
    // }
    // else if(avgFps > 55) iters = constrain(iters+1, 1, 100)
    oldfps = avgFps;

    

    //iters = ceil(map(mouseX, 0, WIDTH, 1, 100))

    for(let i = 0; i < iters; i++){
        totalIters++
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

    // if(!alive){ 
    //     plants.push(new Plant());
    //     totalPlantsCreated++
    // }
    pop()


    fill(0)
    noStroke()
    text('Mean Energy: ' + Math.floor(plants.reduce((sum, plant) => sum + plant.energy, 0) / plants.length), 10, 20)
    text('Iterations per frame: ' + iters, 10, 40)
    text('Average FPS: ' + Math.floor(avgFps), 10, 60)
    //sum of all stem lengths
    let totalLength = plants.reduce((sum, plant) => sum + plant.stem.reduce((s, sec) => s + sec.long, 0), 0);
    text('Total Plants Created: ' + totalPlantsCreated, 10, 80)
    text('Total Plants Alive: ' + plants.length, 10, 100)
    text('Total Stem Length: ' + Math.floor(totalLength), 10, 120)
    //get mean fitness
    let meanFitness = plants.reduce((sum, plant) => sum + plant.getBeauty(), 0) / plants.length;
    text('Mean Fitness: ' + meanFitness.toFixed(2), 10, 140)
    text('Total iters: ' + totalIters + '/' + MAX_ITERS, 10, 160)


    noStroke()
    fill(0, 10)
    ellipse(sun.x, sun.y, rad1*2)
    // ellipse(sun.x, sun.y, rad2*2)
    // ellipse(sun.x, sun.y, rad3*2)

    if(totalIters >= MAX_ITERS){
        next()
    }
}

function next(){
    plants.sort((a, b) => b.getFitness() - a.getFitness())
    let survivors = plants.slice(0, plants.length / 2)
    let elites = plants.slice(0, 2)
    for(let i = 0; i < elites.length; i++){
        for(let j = 0; j < 2; j++) survivors.push(elites[i]);
    }
    let newGenPlants = []
    for(let i = 0; i < nPlantsPerGen+1; i++){
        let parentA = random(survivors);
        let parentB = random(survivors);
        let gen = crossGen(parentA.gen, parentB.gen)
        let ranges = crossRanges(parentA.ranges, parentB.ranges)
        let newPlant = new Plant(getCircularPos(i, RAD_PLANT_TO_SUN), ranges);
        newPlant.gen = gen
        newGenPlants.push(newPlant);
    }
    plants = newGenPlants
    totalIters = 0
    if(gen > 10){
        sun.x = WIDTH / 2 + random(-150, 150)
        sun.y = HEIGHT / 2 + random(-150, 150)
    }
    
    gen++
}

function crossRanges(rangesA, rangesB){
    let newRanges = []
    for(let i = 0; i < rangesA.length; i++){
        newRanges[i] = Math.random() < 0.5 ?
        constrain(rangesA[i] + random(-10, 10), 0, 255) :
        constrain(rangesB[i] + random(-10, 10), 0, 255)
    }
    return newRanges
}

function crossGen(genA, genB){
    let gen = {
        long_sec: Math.random() < 0.5 ? 
        genA.long_sec + random(-0.5, 0.5) : 
        genB.long_sec + random(-0.5, 0.5),
        prob_repro: Math.random() < 0.5 ? 
        genA.prob_repro + random(-0.00005, 0.00005) : 
        genB.prob_repro + random(-0.00005, 0.00005),
        precision_light: Math.random() < 0.5 ? 
        genA.precision_light + random(-0.05, 0.05) : 
        genB.precision_light + random(-0.05, 0.05),
        angle_mult: Math.random() < 0.5 ? 
        genA.angle_mult + random(-0.05, 0.05) : 
        genB.angle_mult + random(-0.05, 0.05),
        growth_rate: Math.random() < 0.5 ? 
        genA.growth_rate + random(-0.001, 0.001) : 
        genB.growth_rate + random(-0.001, 0.001),
        max_turn_angle: Math.random() < 0.5 ? 
        genA.max_turn_angle + random(-10, 10) : 
        genB.max_turn_angle + random(-10, 10)
    }
    return clampGen(gen);
}

function getEnergy(pos){
    let d = Math.min(squaredDistance(pos.x, pos.y, sun.x, sun.y), RAD_PLANT_TO_SUN_SQ)
    let val = mapp(d, 0, RAD_PLANT_TO_SUN_SQ, 1, 0)
    return val*val
    // if(d < rad1) return 0.22
    // if(d < rad2) return 0.08
    // if(d < rad3) return 0.02
    // return 0
}

function clampGen(gen){
    return {
        long_sec: constrain(gen.long_sec, 3, 22),
        prob_repro: constrain(gen.prob_repro, 0.0003, 0.0005),
        precision_light: constrain(gen.precision_light, 0, 1),
        angle_mult: constrain(gen.angle_mult, 0.01, 1),
        growth_rate: constrain(gen.growth_rate, 0.005, 0.03),
        max_turn_angle: constrain(gen.max_turn_angle, 20, 120)
    }
}