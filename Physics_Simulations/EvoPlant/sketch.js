//EvoPlant
//Miguel Rodríguez
//11-08-2025

//TODO: implement separate race mixing
//TODO: if gen se queda sin plantas, reiniciar
/*
Opciones de simulacion
- N plantas
- Rangos spawn genes
- Bloquear genes

*/

p5.disableFriendlyErrors = true
const WIDTH = 850
const HEIGHT = 850
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

// [0] is min, [1] is max, [2] is blocked
let genRanges = {
    long_sec: [4, 25, false],
    prob_repro: [0.0003, 0.0005, false],
    precision_light: [0, 0.1, false],
    angle_mult: [0.01, 0.2, false],
    growth_rate: [0.001, 0.03, false],
    max_turn_angle: [20, 120, false]
}

let nPlantsPerGen = 100

const INNER_RAD_SUN_SQ = rad1 * rad1
const RAD_PLANT_TO_SUN = 350
const RAD_PLANT_TO_SUN_SQ = RAD_PLANT_TO_SUN * RAD_PLANT_TO_SUN

let sigmaMax, sigmaMin

let ctx, canvas
let iters = 75
let totalIters = 0
let MAX_ITERS = 18000
let gen = 0
let rnd = randomm(0.1, .75)
let rnd2 = randomm(2, 4)

const TABLE_SIZE = 1024
const TWO_PI = Math.PI * 2
const cosTable = new Float32Array(TABLE_SIZE)
const sinTable = new Float32Array(TABLE_SIZE)

const colorBack = 240
const colorDead = 30

let panel, panelOpt, panelSim, panelSp, tabs
let textGen, textEff
let plotCurEnergy, plotCurPlants
let plotEnergy, plotPrecision, plotAngle, plotAngleMult, plotLong

function restart(){
    plants = []
    flowers = []
    totalPlantsCreated = 0
    gen = 0
    rnd = randomm(0.1, .75)
    rnd2 = randomm(2, 4)
    let plots = [plotCurEnergy, plotCurPlants, plotEnergy, plotPrecision, plotAngle, plotAngleMult, plotLong]
    plots.forEach(p => p.clear())
    startedSim = false
}


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
    canvas = createCanvas(WIDTH + WIDTH_UI, HEIGHT)
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
    panelSp = tabs.createTab('SPECIATION')
    panel.createText('INTRODUCTION', true)
    panel.createText('This is an plant evolution simulation where growth towards the sun adapts through 6 genes.\n\nPlants grow slowly section by section. Sections try to find the sun until they grow enough, then another section takes over. The closer to the sun, the more energy the plant receives, if it reaches 0 it dies.\n\nWhen all plants try their best, the better plants reproduce mixing their genes and try again.\n\nThese are the genes:\n\n- [long_sec]: maximum length of a section.\n\n- [prob_repro]: probability of a plant branching into a new plant.\n\n- [precision_light]: determines the angular error when aiming at the sun.\n\n- [angle_mult]: a multiplier that affects the the angluar movement.\n\n- [growth rate]: the rate at which sections grow.\n\n- [max_turn_angle]: maximum angle of turn')
    panel.createSeparator()

    createOptionsSimUI()
    createStartedSimUI()
    createSpeciationUI()
}

function startSim(){
    for(let i = 0; i < nPlantsPerGen; i++){
        let pos = getCircularPos(i, RAD_PLANT_TO_SUN);
        plants.push(new Plant(pos));
    }
    startedSim = true

    POP_SIZE = nPlantsPerGen

    initSimSp(plants, {
        deltaThreshold: 2,
        weights: DEFAULT_WEIGHTS,
        stalenessCap: 25,
        minChildrenFloor: 2,
        floorMinSize: 5,
        crossSpeciesProb: 0.05,
        tournamentK: 3,
    });
    
    startGen()

    console.log('Number of species: ' + speciator.species.length)
}

function createOptionsSimUI(){
    panelOpt.createText('Sim Options', true)

    let np = panelOpt.createNumberPicker('Starting Plants', 2, 100, 3, 100)
    np.setFunc((arg) => {nPlantsPerGen = arg})
    let nIters = panelOpt.createSlider(5000, 25000, 18000, 'Iterations per Generation', true)
    nIters.setFunc((arg) => {MAX_ITERS = floor(arg)})

    panelOpt.createSeparator()
    panelOpt.createText('These are the ranges of the genes that will be used to create the first plants. You can block a gene so plants can\'t evolve it.')


    let text1 = panelOpt.createText('Section length')
    text1.setFunc(() => {return `long_sec: [${round(min1.getValue())} - ${round(min2.getValue())}]`})
    let min1 = panelOpt.createSlider(4, 25, 4)
    min1.setFunc((arg) => {genRanges.long_sec[0] = arg})
    let min2 = panelOpt.createSlider(4, 25, 25)
    min2.setFunc((arg) => {genRanges.long_sec[1] = arg})
    let cb1 = panelOpt.createCheckbox('Block gene');
    cb1.setFunc((arg) => {genRanges.long_sec[2] = arg})

    let text2 = panelOpt.createText('Probability of reproduction')
    text2.setFunc(() => {return `prob_repro: [${round(min3.getValue(), 5)} - ${round(min4.getValue(), 5)}]`})
    let min3 = panelOpt.createSlider(0.0003, 0.0005, 0.0003)
    min3.setFunc((arg) => {genRanges.prob_repro[0] = arg})
    let min4 = panelOpt.createSlider(0.0003, 0.0005, 0.0005)
    min4.setFunc((arg) => {genRanges.prob_repro[1] = arg})
    let cb2 = panelOpt.createCheckbox('Block gene');
    cb2.setFunc((arg) => {genRanges.prob_repro[2] = arg})

    let text3 = panelOpt.createText('Precision light')
    text3.setFunc(() => {return `precision_light: [${round(min5.getValue(), 2)} - ${round(min6.getValue(), 2)}]`})
    let min5 = panelOpt.createSlider(0, 1, 0)
    min5.setFunc((arg) => {genRanges.precision_light[0] = arg})
    let min6 = panelOpt.createSlider(0, 1, 0.1)
    min6.setFunc((arg) => {genRanges.precision_light[1] = arg})
    let cb3 = panelOpt.createCheckbox('Block gene');
    cb3.setFunc((arg) => {genRanges.precision_light[2] = arg})

    let text4 = panelOpt.createText('Angle multiplier')
    text4.setFunc(() => {return `angle_mult: [${round(min7.getValue(), 3)} - ${round(min8.getValue(), 3)}]`})
    let min7 = panelOpt.createSlider(0.01, 1, 0.01)
    min7.setFunc((arg) => {genRanges.angle_mult[0] = arg})
    let min8 = panelOpt.createSlider(0.01, 1, 0.2)
    min8.setFunc((arg) => {genRanges.angle_mult[1] = arg})
    let cb4 = panelOpt.createCheckbox('Block gene');
    cb4.setFunc((arg) => {genRanges.angle_mult[2] = arg})

    let text5 = panelOpt.createText('Growth rate')
    text5.setFunc(() => {return `growth_rate: [${round(min9.getValue(), 4)} - ${round(min10.getValue(), 4)}]`})
    let min9 = panelOpt.createSlider(0.003, 0.03, 0.003)
    min9.setFunc((arg) => {genRanges.growth_rate[0] = arg})
    let min10 = panelOpt.createSlider(0.003, 0.03, 0.05)
    min10.setFunc((arg) => {
        genRanges.growth_rate[1] = arg
    })
    let cb5 = panelOpt.createCheckbox('Block gene');
    cb5.setFunc((arg) => {genRanges.growth_rate[2] = arg})

    let text6 = panelOpt.createText('Max turn angle')
    text6.setFunc(() => {return `max_turn_angle: [${round(min11.getValue())} - ${round(min12.getValue())}]`})
    let min11 = panelOpt.createSlider(20, 120, 20)
    min11.setFunc((arg) => {genRanges.max_turn_angle[0] = arg})
    let min12 = panelOpt.createSlider(20, 120, 120)
    min12.setFunc((arg) => {genRanges.max_turn_angle[1] = arg})
    let cb6 = panelOpt.createCheckbox('Block gene');
    cb6.setFunc((arg) => {genRanges.max_turn_angle[2] = arg})

    

}

function createStartedSimUI(){
    textGen = panelSim.createText('Generation ' + gen, true)
    textGen.setFunc(() => 'Generation ' + gen + ': ' + round(totalIters/MAX_ITERS * 100, 0) + '%')
    plotCurEnergy = panelSim.createPlot('Current Mean Energy')
    plotCurEnergy.setLimitData(MAX_ITERS / 25)
    plotCurEnergy.lock()
    plotCurEnergy.reposition(undefined, undefined, 265)

    plotCurPlants = panelSim.createPlot('Current Plants')
    plotCurPlants.setLimitData(MAX_ITERS / 25)
    plotCurPlants.lock()
    plotCurPlants.reposition(undefined, undefined, 265)

    panelSim.createSeparator()

    panelSim.createText('Progress over generations', true)

    plotEnergy = panelSim.createPlot('Mean Energy', 3)
    plotPrecision = panelSim.createPlot('Mean Precision', 3)
    plotAngle = panelSim.createPlot('Mean Max Turn Angle', 3)
    plotAngleMult = panelSim.createPlot('Mean Angle Mult', 3)
    plotLong = panelSim.createPlot('Mean Section Length', 3)

    let plots = [plotEnergy, plotPrecision, plotAngle, plotAngleMult, plotLong]

    for(let plot of plots){
        plot.setLimitData(40)
        plot.lock()
        plot.setColorsMinMax(1, 2)
        plot.reposition(undefined, undefined, 265)
    }

    let fpstext = tabs.panel.createText('')
    fpstext.reposition(WIDTH - 20, 5)
    fpstext.setFunc(() => Math.floor(fps.reduce((a, b) => a + b, 0) / fps.length))

    let simSpeed = panelSim.createSlider(2, 500, 75, 'Sim Speed', true)
    simSpeed.setFunc((arg) => {iters = ceil(arg)})

    let buttonStart = panelSim.createButton('Start')
    buttonStart.setFunc(() => {
        if(!startedSim) {
            startSim()
            buttonStart.setText('Restart', true)
        }
        else{
            restart()
            buttonStart.setText('Start', true)
        }
    })
    buttonStart.reposition(WIDTH + WIDTH_UI - buttonStart.w - 20, 70)

    textEff = panelSim.createText()
}

function createSpeciationUI(){
    plotSp = panelSp.createPlot('Species')
    plotSp.ctx = ctx
    plotSp.clear(true)
    console.log(plotSp)
    plotSp.isAreaChart = true
    plotSp.reposition(undefined, undefined, 265, 265)
    plotSp.lock()
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
        plotCurPlants.feed(plants.length)
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

    let minEnergy = plants.reduce((min, plant) => Math.min(min, plant.energy), Infinity);
    let maxEnergy = plants.reduce((max, plant) => Math.max(max, plant.energy), -Infinity);

    let minAngle = plants.reduce((min, plant) => Math.min(min, plant.gen.max_turn_angle), Infinity);
    let maxAngle = plants.reduce((max, plant) => Math.max(max, plant.gen.max_turn_angle), -Infinity);

    let minPrecision = plants.reduce((min, plant) => Math.min(min, plant.gen.precision_light), Infinity);
    let maxPrecision = plants.reduce((max, plant) => Math.max(max, plant.gen.precision_light), -Infinity);

    let minAngleMult = plants.reduce((min, plant) => Math.min(min, plant.gen.angle_mult), Infinity);
    let maxAngleMult = plants.reduce((max, plant) => Math.max(max, plant.gen.angle_mult), -Infinity);

    let minLong = plants.reduce((min, plant) => Math.min(min, plant.gen.long_sec), Infinity);
    let maxLong = plants.reduce((max, plant) => Math.max(max, plant.gen.long_sec), -Infinity);

    idCounter = 0

    let maxFitness = -Infinity
    for(let plant of plants){
        if(plant.getFitness() > maxFitness) maxFitness = plant.getFitness()
    }
    for(let plant of plants){
        plant.fitness = plant.getFitness() / maxFitness
    }
    
    endGen()

    startGen()

    plotSp.title = 'Species: ' + speciator.species.length

    // plants.sort((a, b) => b.getFitness() - a.getFitness())
    // let survivors = plants.slice(0, plants.length / 2)
    // let elites = plants.slice(0, 1)
    // for(let i = 0; i < elites.length; i++){
    //     for(let j = 0; j < 2; j++) survivors.push(elites[i]);
    // }
    // let newGenPlants = []
    // for(let i = 0; i < nPlantsPerGen+1; i++){
    //     let parentA = random(survivors);
    //     let parentB = random(survivors);
    //     let gen = crossGen(parentA.gen, parentB.gen)
    //     let ranges = crossRanges(parentA.ranges, parentB.ranges)
    //     let newPlant = new Plant(getCircularPos(i, RAD_PLANT_TO_SUN), ranges);
    //     newPlant.gen = gen
    //     newGenPlants.push(newPlant);
    // }
    // plants = newGenPlants
    totalIters = 0
    // if(gen > 10){
    //     sun.x = WIDTH / 2 + random(-150, 150)
    //     sun.y = HEIGHT / 2 + random(-150, 150)
    // }

    

    gen++
    
    plotCurEnergy.clear()
    plotCurPlants.clear()

    plotEnergy.feed(meanEnergy, 0)
    plotAngle.feed(meanAngle, 0)
    plotPrecision.feed(meanPrecision, 0)
    plotAngleMult.feed(meanAngleMult, 0)
    plotLong.feed(meanLong, 0)

    plotEnergy.feed(minEnergy, 1)
    plotEnergy.feed(maxEnergy, 2)

    plotAngle.feed(minAngle, 1)
    plotAngle.feed(maxAngle, 2)

    plotPrecision.feed(minPrecision, 1)
    plotPrecision.feed(maxPrecision, 2)

    plotAngleMult.feed(minAngleMult, 1)
    plotAngleMult.feed(maxAngleMult, 2)

    plotLong.feed(minLong, 1)
    plotLong.feed(maxLong, 2)
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
        long_sec: genRanges.long_sec[2] ? genA.long_sec : (Math.random() < 0.5 ? 
        genA.long_sec + random(-0.5, 0.5) : 
        genB.long_sec + random(-0.5, 0.5)),
        prob_repro: genRanges.prob_repro[2] ? genA.prob_repro : (Math.random() < 0.5 ? 
        genA.prob_repro + random(-0.00005, 0.00005) : 
        genB.prob_repro + random(-0.00005, 0.00005)),
        precision_light: genRanges.precision_light[2] ? genA.precision_light : (Math.random() < 0.5 ? 
        genA.precision_light + random(-0.05, 0.05) : 
        genB.precision_light + random(-0.05, 0.05)),
        angle_mult: genRanges.angle_mult[2] ? genA.angle_mult : (Math.random() < 0.5 ? 
        genA.angle_mult + random(-0.05, 0.05) : 
        genB.angle_mult + random(-0.05, 0.05)),
        growth_rate: genRanges.growth_rate[2] ? genA.growth_rate : (Math.random() < 0.5 ? 
        genA.growth_rate + random(-0.001, 0.001) : 
        genB.growth_rate + random(-0.001, 0.001)),
        max_turn_angle: genRanges.max_turn_angle[2] ? genA.max_turn_angle : (   Math.random() < 0.5 ? 
        genA.max_turn_angle + random(-10, 10) : 
        genB.max_turn_angle + random(-10, 10))
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