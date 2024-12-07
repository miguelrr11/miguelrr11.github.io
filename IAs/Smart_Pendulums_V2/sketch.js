    //NEAT learns inverted pendulum
//Miguel Rodríguez
//15-11-2024

p5.disableFriendlyErrors = true
const WIDTH = 1500
const HEIGHT = 600
const { Engine, Runner, World, Bodies, Body, Constraint } = Matter;
let engine;
let world;

const track_length = 650
const track_start = 100
const rod_length = 190
const track_height = HEIGHT * 0.75

const c1 = "#22223B"
const c2 = "#4A4E69"
const c3 = "#9A8C98"
const c4 = "#C9ADA7"
const c5 = "#F2E9E4"

let pendulums = []
let size = 1000
const timeG = 30
let timeGen = timeG    //seconds
let bestNN
let avgPosBob

let indexShowing = 0
let automaticallyBest = true

let panel
let panel_bestPts, panel_gen, panel_timeLeft, panel_lastFitness
let panel_jumpNextGen, panel_factor, panel_showBest, panel_interact
let panel_fitnessLog
let lastFitness = 0
let bestScore = 0

let factor = 1  //matterjs simulation steps per frame
let t = 0

const maxOutputVel = 0.0025
const maxAngVel = 0.2  

let debug = false
let best, showing

let plotFitness, plotSpecies

function preload(){
    font = loadFont('mono.ttf')
}

function setup(){
    createCanvas(WIDTH, HEIGHT+200)
    textFont(font)
    init()

    panel = new Panel({
        x: 1200,
        y: 0,
        w: 300,
        automaticHeight: false,
        lightCol: c1,
        darkCol: c5,
        title: 'NEAT algorithm'
    })
    panel.createText("Learns to stabilize an inverted pendulum from a swing-up.")
    panel.createSeparator()
    panel_gen = panel.createText()
    panel_timeLeft = panel.createText()
    panel_lastFitness = panel.createText()
    panel_interact = panel.createCheckbox("Interact")
    panel.createSeparator()
    panel_jumpNextGen = panel.createButton("Jump to next gen", () => {
        timeGen = 0
    })
    panel_showBest = panel.createButton("Show best", () => {
        let best = getBestPendulum()
        indexShowing = best.id
        automaticallyBest = true
    })
    panel.createSeparator()
    panel_bestPts = panel.createText(
                          "Best pendulum: \n" + 
                          "  - Fitness: 0%" +
                          "  - Id: -")
    panel.createSeparator()
    panel_fitnessLog = panel.createText("Fitness across generations:\n")

    plotFitness = new MigPLOT(0, HEIGHT-100, 350, 250, [], 'Fitness', 'Generation')
    plotFitness.backCol = c5
    plotFitness.axisCol = c1
    plotFitness.graphCol = c2
    plotFitness.textCol = c3
    plotFitness.minGlobal = 0
    plotFitness.maxGlobal = 100
    plotFitness.feed(0)

    plotSpecies = new MigPLOT(360, HEIGHT-100, 350, 250, [], 'Species', 'Generation')
    plotSpecies.backCol = c5
    plotSpecies.axisCol = c1
    plotSpecies.graphCol = c2
    plotSpecies.textCol = c3
    plotSpecies.feed(0)
}

function init(){
    if(debug) console.log("init")
    engine = Engine.create();
    world = engine.world;
    pendulums = []
    for(let i = 0; i < size; i++){
        pendulums.push(new Pendulum(i))
    }
    let h = HEIGHT * 0.7
    nns = new Population(size, 3, 1, 
                (value, bias) => {return constrain(Math.max(value, 0), 0, 1)  }, 
                (value, bias) => {return Math.tanh(value) * maxOutputVel}, false,
                50, HEIGHT*0.15, 500, h)
    Runner.run(engine);
}

let maxdx = 0
let maxdy = 0


function setInputs(){
    if(debug) console.log("setInputs")
    for(let i = 0; i < size; i++){
        let pend = pendulums[i]
        let nn = nns.NNs[i]

        let angularVel = pend.getAngularVelocity() * 10
        let pend_angle = pend.getAngle()
        let dx = cos(pend_angle)
        let dy = -sin(pend_angle)

        nns.setValues([dx, dy, angularVel*-1], pend.id)
    }
}

function setFitness(){
    if(debug) console.log("setFitness")
    lastFitness = 0
    
    for(let i = 0; i < size; i++){
        let pend = pendulums[i]
        let fit = pend.points
        nns.NNs[pend.id].fitness = fit
        lastFitness += pend.points
    }
    lastFitness /= size
}

function updateNNs(){
    nns.update()
}

function updatePendulums(){
    if(debug) console.log("updatePendulums")
    for (let pend of pendulums) {
        pend.engine.timeScale = 1 / factor
        Engine.update(pend.engine, deltaTime * pend.engine.timeScale);
        pend.angularVelocity = pend.getAngularVelocity()
        pend.setAvgAngVel()
        pend.checkBounds()
    }
}

function movePendulums(){
    if(debug) console.log("movePendulums")
    for(let i = 0; i < size; i++){
        let pend = pendulums[i]
        let nn = nns.NNs[pend.id]

        let output = nn.getOutput()
        pend.move(output)
        pend.baseVel = output / maxOutputVel
    }
}

function restartPendulums(){
    if(debug) console.log("restartPendulums")
    for(let i = 0; i < size; i++){
        let pend = pendulums[i]

        pend.id = nns.NNs[i].id
        pend.avgAngularVelocity = 0

        let [x1, y1, x2, y2] = pend.getNewPos()

        Body.setPosition(pend.p1, {x: x1, y: y1})
        Body.setPosition(pend.p2, {x: x2, y: y2})
        Body.setVelocity(pend.p1, { x: 0, y: 0 });
        Body.setVelocity(pend.p2, { x: 0, y: 0 });

        pend.timeUp = 0
        pend.timeDown = 0
        pend.baseVel = 0
        pend.points = 0
        pend.alive = true
        pend.path = []
    }
}

function getBestPendulum(){
    if(debug) console.log("getBestPendulum")
    let max = pendulums[0]
    avgPosBob = createVector(0, 0)
    for(let pend of pendulums){
        if(pend.points > max.points) max = pend
        avgPosBob.x += pend.p2.position.x
        avgPosBob.y += pend.p2.position.y
    }
    avgPosBob.div(size)
    return max
}

function getUpPendulum(){
    for(let p of pendulums){
        if(p.p2.position.y < p.p1.position.y) {
            indexShowing = p.id; 
            return p
        }
    }
    return pendulums[0]
}


function drawTags(){
    if(debug) console.log("drawTags")
    push()
    fill(0)
    textSize(15)
    let inputTags = ["dir_x", 
                     "dir_y", 
                     "ang_vel",
                     "bias"]
    let nn = nns.NNs[0]
    textAlign(RIGHT, CENTER)
    for(let i = 0; i < nn.inputs.length; i++){
        let inp = nn.inputs[i]
        let part = nn.particles.find(par => par.id == inp.id)
        text(inputTags[i], part.pos.x - 20, part.pos.y)
    }
    textAlign(LEFT, CENTER)
    let out = nn.outputs[0]
    let part = nn.particles.find(par => par.id == out.id)
    text(" force", part.pos.x + 20, part.pos.y)
    pop()
}

function iteration(){
    if(debug) console.log("iteration")
    setInputs()
    updateNNs()
    movePendulums()
    updatePendulums()
}

function mousePressed(){
    if(mouseX > 1200) return
    indexShowing = Math.floor(Math.random() * size)
    automaticallyBest = false
}

function setT(){
    if(debug) console.log("setT")
    t = 30
    if(nns.gen > 30) t = 60
    if(nns.gen > 80) t = 120
}

function drawTrack(){
    push()
    stroke(mid_brown)
    strokeWeight(5)
    line(track_start, track_height, track_start+track_length, track_height)
    let mid = track_start + track_length / 2
    fill(mid_brown)
    ellipse(mid, track_height, 10)
    pop()
}

function draw(){
    background(c5)
    setT()

    plotFitness.show()
    plotSpecies.show()

    best = getBestPendulum()
    showing = pendulums[indexShowing]
    if(automaticallyBest){ 
        showing = best
    }

    for(let i = 0; i < factor; i++) iteration()

    if(frameCount % Math.floor(60/factor) == 0) timeGen--
    if(timeGen <= 0 || best.points >= 100){
        timeGen = timeG
        if(best.points > bestScore) bestScore = best.points
        let overAllFitness = round((pendulums.filter(element => element.points > 0).length)/size*100, 1)
        panel_fitnessLog.setText(panel_fitnessLog.getText() + "Gen #" + nns.gen + 
                                ": " + overAllFitness
                                 + "%\n")
        plotFitness.feed(overAllFitness);
        plotSpecies.feed(nns.species.size)
        setFitness()
        nns.evolvePopulation()
        restartPendulums()
    }

    showing.show()
    if(keyIsPressed) for(let p of pendulums) p.show()
    nns.showIndex(showing.id)
    drawTags()

    push()
    panel_bestPts.setText("Best pendulum: \n" + 
                          "  - Fitness: " + round(best.points/timeG*100, 1) + "%\n" +
                          "  - Id: " + best.id + "\n")
    panel_gen.setText("Generation: " + nns.gen)
    panel_timeLeft.setText("Time left: " + timeGen + "s")
    panel_lastFitness.setText("Fitness: " + 
                              round((pendulums.filter(element => element.points > 0).length)/size*100, 1) + "%")
    panel.update()
    panel.show()
    pop()

    push()
    fill(c2)
    textAlign(LEFT, TOP)
    text("Pendulum #" + showing.id + "\nFPS: " + Math.round(frameRate()), 20, 20)
    pop()
}

function getHeightPercentage(y){
    if(debug) console.log("getHeightPercentage")
    let low = track_height + rod_length
    let high = track_height - rod_length
    return map(y, low, high, 0, 100)
}






