//EvoPlant
//Miguel Rodríguez
//11-08-2025

p5.disableFriendlyErrors = true
const WIDTH = 750
const HEIGHT = 750
const WIDTH_UI = 300

let sun
let rad1 = 40
let rad2 = 75
let rad3 = 125
let plants = []
let fps = Array(10).fill(60)
let oldfps = 60
let totalPlantsCreated = 0

const nPlantsPerGen = 20

const RAD_PLANT_TO_SUN = 350
const RAD_PLANT_TO_SUN_SQ = RAD_PLANT_TO_SUN * RAD_PLANT_TO_SUN

let sigmaMax, sigmaMin

let ctx
let iters
let totalIters = 0
const MAX_ITERS = 15000
let gen = 0

const TABLE_SIZE = 1024
const TWO_PI = Math.PI * 2
const cosTable = new Float32Array(TABLE_SIZE)
const sinTable = new Float32Array(TABLE_SIZE)

let panel
let textGen, textEff
let plotCurEnergy, plotAllEnergy
let plotEnergy, plotPrecision, plotAngle, plotAngleMult


function getCircularPos(n, radius){
    let angle = map(n, 0, nPlantsPerGen, 0, TWO_PI);
    let x = WIDTH / 2 + cos(angle + 0.1) * radius;
    let y = HEIGHT / 2 + sin(angle + 0.1) * radius;
    return createVector(x, y);
}

async function setup(){
    let canvas = createCanvas(WIDTH + WIDTH_UI, HEIGHT)
    ctx = canvas.elt.getContext('2d');
    sun = createVector(WIDTH / 2, HEIGHT / 2)
    sigmaMax = radians(60);
    sigmaMin = radians(2);
    
    for (let i = 0; i < TABLE_SIZE; i++) {
        const angle = (i / TABLE_SIZE) * TWO_PI;
        cosTable[i] = Math.cos(angle);
        sinTable[i] = Math.sin(angle);
    }
    totalPlantsCreated = plants.length;
    iters = 20
    MAX_TURNS = floor(nPlantsPerGen * 0.5)

    let fontPanel = await loadFont("migUI/main/bnr.ttf")
    panel = new Panel({
        x: WIDTH,
        w: WIDTH_UI,
        h: HEIGHT,
        font: fontPanel,
        theme: 'light',
        automaticHeight: false,
        title: 'EVOPLANTS'
    })
    panel.createText('This is an plant evolution simulation where growth towards the sun adapts through genes')
    panel.createSeparator()

    textGen = panel.createText('Generation ' + gen, true)
    textGen.setFunc(() => 'Generation ' + gen + ': ' + round(totalIters/MAX_ITERS * 100, 0) + '%')
    plotCurEnergy = panel.createPlot('Current Mean Energy')
    plotCurEnergy.setLimitData(MAX_ITERS / 25)

    panel.createSeparator()

    panel.createText('Progress over generations', true)
    plotEnergy = panel.createPlot('Mean Energy')
    plotEnergy.setLimitData(20)
    plotPrecision = panel.createPlot('Mean Precision')
    plotPrecision.setLimitData(20)
    plotAngle = panel.createPlot('Mean Max Turn Angle')
    plotAngle.setLimitData(20)
    plotAngleMult = panel.createPlot('Mean Angle Mult')
    plotAngleMult.setLimitData(20)

    let fpstext = panel.createText('')
    fpstext.reposition(WIDTH - 20, 5)
    fpstext.setFunc(() => Math.floor(fps.reduce((a, b) => a + b, 0) / fps.length))

    textEff = panel.createText()

    for(let i = 0; i < nPlantsPerGen+1; i++){
        let pos = getCircularPos(i, RAD_PLANT_TO_SUN);
        plants.push(new Plant(pos));
    }
}
let showPlot = true
function keyPressed(){
    showPlot = !showPlot
}

function draw(){
    background(240)
    push()
    console.log()
    fps.shift()
    fps.push(frameRate())
    let avgFps = fps.reduce((a, b) => a + b, 0) / fps.length;
    oldfps = avgFps;


    let allSections = []
    let numBatches = 0
    for(let i = 0; i < iters; i++){
        totalIters++
        allSections = []
        for(let j = plants.length-1; j > 0; j--){
            let plant = plants[j]
            plant.update()
            plant.show()
            allSections.push(...plant.stem)
            if(!plant.dead) alive = true
            else plants.splice(j, 1)
        }
        numBatches = renderSectionsBatched(allSections)
    }

    const n = numBatches;
    const total = allSections.length;
    let eff = total > 1 ? ((total - n) / (total - 1)) * 100 : 100;
    eff = Math.max(0, Math.min(100, Math.round(eff)));
    textEff.setText(`[Debug]\nBatch Rendering Efficiency: ${eff}%`);

    pop()


    fill(0)
    noStroke()
    let meanEnergy = plants.reduce((sum, plant) => sum + plant.energy, 0) / plants.length;


    noStroke()
    fill(0, 10)
    ellipse(sun.x, sun.y, rad1*2)

    

    textGen.setText('Generation ' + gen)
    plotCurEnergy.feed(meanEnergy)
    for(let i = 0; i < plants.length; i++){
        //plotAllEnergy.feed(plants[i].energy, i)
    }
    if(totalIters >= MAX_ITERS){
        next()
    }
    panel.update()
    panel.show()
}

function next(){
    let meanEnergy = plants.reduce((sum, plant) => sum + plant.energy, 0) / plants.length;
    let meanAngle = plants.reduce((sum, plant) => sum + plant.gen.max_turn_angle, 0) / plants.length;
    let meanPrecision = plants.reduce((sum, plant) => sum + plant.gen.precision_light, 0) / plants.length;
    let meanAngleMult = plants.reduce((sum, plant) => sum + plant.gen.angle_mult, 0) / plants.length;
    idCounter = 0
    plants.sort((a, b) => b.getFitness() - a.getFitness())
    let survivors = plants.slice(0, plants.length / 2)
    let elites = plants.slice(0, 1)
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
    // if(gen > 10){
    //     sun.x = WIDTH / 2 + random(-150, 150)
    //     sun.y = HEIGHT / 2 + random(-150, 150)
    // }

    

    gen++
    
    plotCurEnergy.clear()

    plotEnergy.feed(meanEnergy)
    plotAngle.feed(meanAngle)
    plotPrecision.feed(meanPrecision)
    plotAngleMult.feed(meanAngleMult)
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