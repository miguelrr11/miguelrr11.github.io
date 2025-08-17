//EvoPlant
//Miguel Rodríguez
//11-08-2025

//TODO: make an UI to start the simulation with some options
//Implement 'stuck' genes, so plants can't evolve that stat

/*
Opciones de simulacion
- N plantas
- Rangos spawn genes
- Bloquear genes

*/

p5.disableFriendlyErrors = true
const WIDTH = 750
const HEIGHT = 800
const WIDTH_UI = 300

let sun
let rad1 = 40
let rad2 = 75
let rad3 = 125
let plants = []
let flowers = []
let fps = Array(10).fill(60)
let oldfps = 60
let totalPlantsCreated = 0
let startedSim = false

let nPlantsPerGen = 12

const INNER_RAD_SUN_SQ = rad1 * rad1
const RAD_PLANT_TO_SUN = 350
const RAD_PLANT_TO_SUN_SQ = RAD_PLANT_TO_SUN * RAD_PLANT_TO_SUN

let sigmaMax, sigmaMin

let ctx
let iters = 75
let totalIters = 0
const MAX_ITERS = 18000
let gen = 0
let rnd = randomm(0.1, .75)
let rnd2 = randomm(2, 4)

const TABLE_SIZE = 1024
const TWO_PI = Math.PI * 2
const cosTable = new Float32Array(TABLE_SIZE)
const sinTable = new Float32Array(TABLE_SIZE)

const colorBack = 240
const colorDead = 30

let panel, panelOpt, panelSim, tabs
let textGen, textEff
let plotCurEnergy, plotAllEnergy
let plotEnergy, plotPrecision, plotAngle, plotAngleMult, plotLong


function getCircularPos(n, radius){
    let angle = map(n, 0, nPlantsPerGen, 0, TWO_PI);
    let x = WIDTH / 2 + cos(angle + 0.1) * radius;
    let y = HEIGHT / 2 + sin(angle + 0.1) * radius;
    return createVector(x, y);
}

function addFlower(pos, ranges){
    flowers.push(new Flower(pos, ranges));
    if(flowers.length > 100) flowers.shift();
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
    //MAX_TURNS = floor(nPlantsPerGen * 0.5)
    MAX_TURNS = 10

    let fontPanel = await loadFont("migUI/main/bnr.ttf")
    tabs = new TabManager({
        x: WIDTH,
        w: WIDTH_UI,
        h: HEIGHT,
        font: fontPanel,
        theme: 'light',
        automaticHeight: false,
        title: 'EVOPLANTS'
    })
    panel = tabs.createTab('INTRO')
    panelOpt = tabs.createTab('OPTIONS')
    panelSim = tabs.createTab('SIMULATION')
    panel.createText('This is an plant evolution simulation where growth towards the sun adapts through 6 genes.\n\nPlants grow slowly section by section. Sections try to find the sun until they grow enough, then another section takes over. The closer to the sun, the more energy the plant receives, if it reaches 0 it dies.\n\nWhen all plants try their best, the better plants reproduce mixing their genes and try again.\n\nThese are the genes:\n\n- [long_sec]: maximum length of a section.\n\n- [prob_repro]: probability of a plant branching into a new plant.\n\n- [precision_light]: determines the angular error when aiming at the sun.\n\n- [angle_mult]: a multiplier that affects the the angluar movement.\n\n- [growth rate]: the rate at which sections grow.\n\n- [max_turn_angle]: maximum angle of turn')
    panel.createSeparator()

    createOptionsSimUI()

    for(let i = 0; i < nPlantsPerGen; i++){
        let pos = getCircularPos(i, RAD_PLANT_TO_SUN);
        plants.push(new Plant(pos));
    }

}

function createOptionsSimUI(){
    panelOpt.createText('Sim Options', true)

    panelOpt.createText('Starting Plants')
    let np = panelOpt.createNumberPicker('Plants', 2, 30, 1, 10)
    np.setFunc((arg) => {nPlantsPerGen = arg})
    
    panelOpt.separate()

    panelOpt.createText('Starting gen ranges', true)

    panelOpt.createText('Section length')
    panelOpt.createText('Probability of reproduction')
    panelOpt.createText('Precision towards the sun')
    panelOpt.createText('Agility in angle movement')
    panelOpt.createText('Growth rate')
    panelOpt.createText('Max turn angle')

}

function createStartedSimUI(){
    panelSim.lastElementPos.x = 767
    panelSim.lastElementPos.y = 121.8
    textGen = panelSim.createText('Generation ' + gen, true)
    textGen.setFunc(() => 'Generation ' + gen + ': ' + round(totalIters/MAX_ITERS * 100, 0) + '%')
    plotCurEnergy = panelSim.createPlot('Current Mean Energy')
    plotCurEnergy.setLimitData(MAX_ITERS / 25)

    panelSim.createSeparator()

    panelSim.createText('Progress over generations', true)
    plotEnergy = panelSim.createPlot('Mean Energy')
    plotEnergy.setLimitData(40)
    plotPrecision = panelSim.createPlot('Mean Precision')
    plotPrecision.setLimitData(40)
    plotAngle = panelSim.createPlot('Mean Max Turn Angle')
    plotAngle.setLimitData(40)
    plotAngleMult = panelSim.createPlot('Mean Angle Mult')
    plotAngleMult.setLimitData(40)
    plotLong = panelSim.createPlot('Mean Section Length')
    plotLong.setLimitData(40)

    let fpstext = panelSim.createText('')
    fpstext.reposition(WIDTH - 20, 5)
    fpstext.setFunc(() => Math.floor(fps.reduce((a, b) => a + b, 0) / fps.length))

    textEff = panelSim.createText()
}

let showPlot = true
function keyPressed(){
    showPlot = !showPlot
}

function draw(){
    background(colorBack)

    if(startedSim){
        push()
        fps.shift()
        fps.push(frameRate())
        let avgFps = fps.reduce((a, b) => a + b, 0) / fps.length;
        oldfps = avgFps;


        let allSections = []
        let numBatches = 0
        for(let i = 0; i < iters; i++){
            totalIters++
            allSections = []
            for(let j = plants.length-1; j >= 0; j--){
                let plant = plants[j]
                plant.update()
                plant.show()
                if(i == iters-1) allSections.push(...plant.stem)
                if(!plant.dead) alive = true
                else plants.splice(j, 1)
            }
            
        }
        numBatches = renderSectionsBatched(allSections) 

        const n = numBatches;
        const total = allSections.length;
        let eff = total > 1 ? ((total - n) / (total - 1)) * 100 : 100;
        eff = Math.max(0, Math.min(100, Math.round(eff)));
        textEff.setText(`Batch Rendering Efficiency: ${eff}%`);
        pop()

        fill(0)
        noStroke()
        let meanEnergy = plants.reduce((sum, plant) => sum + plant.energy, 0) / plants.length;

        noStroke()
        fill(0, 10)
        ellipse(sun.x, sun.y, rad1*2)

        for(let flower of flowers) flower.show()

        textGen.setText('Generation ' + gen)
        plotCurEnergy.feed(meanEnergy)
        if(totalIters >= MAX_ITERS){
            next()
        }
    }


    tabs.update()
    tabs.show()
}

function next(){
    let meanEnergy = plants.reduce((sum, plant) => sum + plant.energy, 0) / plants.length;
    let meanAngle = plants.reduce((sum, plant) => sum + plant.gen.max_turn_angle, 0) / plants.length;
    let meanPrecision = plants.reduce((sum, plant) => sum + plant.gen.precision_light, 0) / plants.length;
    let meanAngleMult = plants.reduce((sum, plant) => sum + plant.gen.angle_mult, 0) / plants.length;
    let meanLong = plants.reduce((sum, plant) => sum + plant.gen.long_sec, 0) / plants.length;
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
    plotLong.feed(meanLong)
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