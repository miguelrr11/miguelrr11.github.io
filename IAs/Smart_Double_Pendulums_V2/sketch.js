//NEAT learns inverted pendulum
//Miguel Rodríguez
//15-11-2024

p5.disableFriendlyErrors = true
const WIDTH = 1500
const HEIGHT = 700
const { Engine, Runner, World, Bodies, Body, Constraint } = Matter;
let engine;
let world;

const track_length = 650
const track_start = 100
const rod_length = 150
const track_height = HEIGHT * 0.75

const c1 = "#22223B"
const c2 = "#4A4E69"
const c3 = "#9A8C98"
const c4 = "#C9ADA7"
const c5 = "#F2E9E4"

let pendulums = []
let size = 750
const timeG = 10
let timeGen = timeG
let bestNN = undefined
let avgPosBob

let indexShowing = 0
let automaticallyBest = true

let panel
let panel_bestPts, panel_gen, panel_timeLeft, panel_lastFitness
let panel_jumpNextGen, panel_factor, panel_showBest, panel_interact
let panel_fitnessLog, panel_gravity, panel_difficulty
let logs = []
let lastFitness = 0
let bestScore = 0

let factor = 1  //matterjs simulation steps per frame
let t = 0

let friction = 0.0001
let gravity = 0.01
let factor_gravity = 0.001
let points_threshold = 500
let difficulty_level = 1

const maxOutputVel = 0.01
const maxAngVel = 0.2  

let debug = false
let best, showing

const timeStep = 1000 / 60
let steps, avgPoints

let omegaMax = 0.01


function preload(){
    font = loadFont('mono.ttf')
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
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
    panel.createText("Learns to stabilize an inverted double pendulum from a swing-up.")
    panel.createSeparator()
    panel_gen = panel.createText()
    //panel_timeLeft = panel.createText()
    panel_lastFitness = panel.createText()
    panel_difficulty = panel.createText()
    panel_interact = panel.createCheckbox("Interact")
    panel.createSeparator()
    panel_jumpNextGen = panel.createButton("Jump to next gen", () => {
        timeShowing = 0
    })
    // panel_showBest = panel.createButton("Show best", () => {
    //     let best = getBestPendulum()
    //     indexShowing = best.id
    //     automaticallyBest = true
    // })
    // panel_gravity = panel.createSlider(0.005, 1, 0.005, "Gravity", true, () => {
    //     for(let p of pendulums){
    //         p.engine.gravity.y = panel_gravity.getValue()
    //         gravity = panel_gravity.getValue()
    //     }
    // })
    panel.createSeparator()
    panel_bestPts = panel.createText(
                          "Best pendulum: \n" + 
                          "  - Fitness: 0%" +
                          "  - Id: -")
    panel.createSeparator()
    panel_fitnessLog = panel.createText("Fitness across generations:\n")
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
    nns = new Population(size, 4, 1, 
                (value, bias) => {return constrain(Math.max(value, 0), 0, 1)  }, 
                (value, bias) => {return Math.tanh(value) * maxOutputVel}, false,
                70, HEIGHT*0.15, 500, h)
    Runner.run(engine);
}

function setInputs(best = false){
    if(debug) console.log("setInputs")
    for(let i = 0; i < size; i++){
        let pend = best ? bestNN : pendulums[i]
        let pivot = pend.p1
        let bob1 = pend.p2
        let bob2 = pend.p3
        let dt = timeStep

        // For Bob 1
        let theta1 = pend.getAngle_p2()
        let omega1 = normalizeAngleDifference(theta1 - pend.prevTheta1) / dt;

        // For Bob 2
        //let thetaRel2 = pend.getAngle_p3()
        let theta2 = pend.getAngle_p3()
        let omega2 = normalizeAngleDifference(theta2 - pend.prevTheta2) / dt;

        let normalizedValues = normalizeForNeuralNetwork(theta1, omega1, theta2, omega2, omegaMax);

        //console.log(round(omega1, 4), round(omega2, 4))

        // Update previous angles for next iteration
        pend.prevTheta1 = theta1;
        pend.prevTheta2 = theta2;

        nns.setValues([normalizedValues.theta1, 
                       normalizedValues.omega1, 
                       normalizedValues.theta2, 
                       normalizedValues.omega2], pend.id)

        // let angularVel_p2 = pend.getAngularVelocity_p2() * 10
        // let pend_angle_p2 = pend.getAngle_p2()
        // let dx_p2 = Math.cos(pend_angle_p2)
        // let dy_p2 = -Math.sin(pend_angle_p2)

        // let angularVel_p3 = pend.getAngularVelocity_p3() * 10
        // let pend_angle_p3 = pend.getAngle_p3()
        // let dx_p3 = Math.cos(pend_angle_p3)
        // let dy_p3 = -Math.sin(pend_angle_p3)

        // let dot = dx_p2 * dx_p3 + dy_p2 * dy_p3

        // nns.setValues([dx_p2, dy_p2, angularVel_p2*-1,
        //                dx_p3, dy_p3, angularVel_p3*-1, dot
        // ], pend.id)

        if(best) return
    }
}

function normalizeForNeuralNetwork(theta1, omega1, theta2, omega2, omegaMax) {
    return {
        theta1: normalizeAngle(theta1),
        omega1: normalizeAngularVelocity(omega1, omegaMax),
        theta2: normalizeAngle(theta2),
        omega2: normalizeAngularVelocity(omega2, omegaMax),
    };
}

function normalizeAngularVelocity(omega, omegaMax) {
    // Clamp angular velocity to the range [-omegaMax, omegaMax] for safety
    omega = Math.max(-omegaMax, Math.min(omega, omegaMax));
    // Normalize to [-1, 1]
    return omega / omegaMax;
}

function normalizeAngle(angle) {
    // Wrap angle to [-π, π]
    let wrappedAngle = Math.atan2(Math.sin(angle), Math.cos(angle));
    // Normalize to [-1, 1]
    return wrappedAngle / Math.PI;
}

function normalizeAngleDifference(diff) {
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
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

function updateNNs(best = false){
    if(best) nns.NNs[bestNN.id].update()
    else nns.update()
}

function updatePendulums(best = false){
    if(debug) console.log("updatePendulums")
    if(best) Engine.update(bestNN.engine, timeStep);
    else{
        for (let pend of pendulums) {
            Engine.update(pend.engine, timeStep);
        }
    }
}

function movePendulums(best = false){
    if(debug) console.log("movePendulums")
    for(let i = 0; i < size; i++){
        let pend = best ? bestNN : pendulums[i]
        let nn = nns.NNs[pend.id]

        let output = nn.getOutput()
        pend.move(output)
        pend.baseVel = output / maxOutputVel

        if(best) return
    }
}

function restartPendulums(){
    if(debug) console.log("restartPendulums")
    for(let i = 0; i < size; i++){
        let pend = pendulums[i]

        pend.id = nns.NNs[i].id
        pend.avgAngularVelocity = 0

        let [x, y1, y2, y3] = pend.getNewPos()

        Body.setPosition(pend.p1, {x: x, y: y1})
        Body.setPosition(pend.p2, {x: x, y: y2})
        Body.setPosition(pend.p3, {x: x, y: y3})
        Body.setVelocity(pend.p1, { x: 0, y: 0 });
        Body.setVelocity(pend.p2, { x: 0, y: 0 });

        pend.p2.frictionAir = friction
        pend.p3.frictionAir = friction
        pend.engine.gravity.y = gravity

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
    let inputTags = ["theta_1", 
                     "omega_1", 
                     "theta_2",
                     "omega_2",
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

function overAllFitness(){
    let sum = pendulums.reduce((sum, obj) => sum + obj.points, 0);
    return sum / (size * timeG) * 100
}

function getMedianFitness(){
    let sum = pendulums.reduce((sum, obj) => sum + obj.points, 0);
    return sum / size
}

function setFitnessLogs(){
    logs.push("Gen #" + nns.gen + ": " + Math.round(getMedianFitness()) + "\n")
    if(logs.length > 20) logs.shift()
    let text = "Avg points across generations:\n"
    for(let log of logs) text += log
    return text
}




function oneGeneration(){
    const totalDuration = timeG * 1000
    steps = totalDuration / timeStep
    for(let i = 0; i < steps; i++){
        iteration()
    }
    avgPoints = getMedianFitness()
    bestNN = getBestPendulum()
    showing = bestNN
    panel_fitnessLog.setText(setFitnessLogs())
    bestNN.restartPos()
}

function nextGeneration(){
    if(avgPoints >= points_threshold){
        difficulty_level++
        gravity += factor_gravity
        if(gravity > 1) gravity = 1
        points_threshold *= 1.02
    }
    timeGen = timeG
    if(bestNN.points > bestScore) bestScore = bestNN.points
    
    setFitness()
    nns.evolvePopulation()
    restartPendulums()
    bestNN = undefined
}

function simBest(){
    setInputs(true)
    updateNNs(true)
    movePendulums(true)
    updatePendulums(true)
}

let timeShowing = 15

function draw(){
    background(c5)
    setT()

    // simulating...
    if(!bestNN) oneGeneration()
    //done simulating -> showing best of simulation
    if(bestNN){
        simBest()
        bestNN.show()
        nns.showIndex(bestNN.id)
        drawTags()
        push()
        panel_bestPts.setText("Best pendulum: \n" + 
                              "  - Points: " + round(bestNN.points, 1) + "\n" +
                              "  - Id: " + bestNN.id + "\n")
        panel_gen.setText("Generation: " + nns.gen)
        //panel_timeLeft.setText("borrar")
        panel_lastFitness.setText("Avg points: " + 
                                  Math.round(avgPoints) + " of " + round(points_threshold, 1))
        panel_difficulty.setText("Difficulty level: " + difficulty_level + " (g = " + round(gravity, 6) + ")")
        panel.update()
        panel.show()
        pop()
        push()
        fill(c2)
        textAlign(LEFT, TOP)
        if(bestNN) text("Pendulum #" + bestNN.id + "\nFPS: " + Math.round(frameRate()), 20, 20)
        pop()
        if(nns.gen % 10 != 0){
            nextGeneration()
            return
        }
        if(timeShowing < 0){
            timeShowing = 15
            nextGeneration()
            return
        }
        if(frameCount % 60 == 0) timeShowing--
    }
}

function getHeightPercentage(y){
    if(debug) console.log("getHeightPercentage")
    let low = track_height + rod_length
    let high = track_height - rod_length
    return map(y, low, high, 0, 100)
}






