//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 1500
const HEIGHT = 600
const { Engine, Runner, World, Bodies, Body, Constraint } = Matter;
let engine;
let world;

const track_length = 650
const track_start = 100
const rod_length = 120
const track_height = HEIGHT * 0.75

const light_brown = "#FAEFD0"
const mid_brown = "#EECE9F"
const dark_brown = "#7f5539"

let pendulums = []
let size = 500
const timeG = 60
let timeGen = timeG    //seconds
let bestNN
let avgPosBob

let indexShowing = 0
let automaticallyBest = true

let panel
let panel_bestPts, panel_gen, panel_timeLeft, panel_lastFitness
let panel_jumpNextGen, panel_factor, panel_showBest, panel_interact
let lastFitness = 0
let bestScore = 0

let factor = 1  //matterjs simulation steps per frame
let t = 0

const maxOutputVel = 20
const maxAngVel = 15  //para un maxOutputVel de 20

let debug = false
let best, showing


/*
pos x
speed x
speed y
angular vel
*/

// IDEA:
// aumentar size
// aumentar precision matterjs
// mas points si se mantiene arriba por mas tiempo
// optimizar
// aumentar track_length
// resetear pendulums.poitions al meter nuevas NNs
// aumentar precision de js ?
// aumentar precision de nn ? meter inputs mas de 60 veces por segundo

function preload(){
    font = loadFont('mono.ttf')

    // pendulums.forEach(pend => {
    //     if(pend.p1.position >= track_start + 20 && (pend.p1.position >= track_start - 20 + track_length){
    //         console.log(nns.NNs[pend.id])
    //     }
    // })
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
        lightCol: dark_brown,
        darkCol: light_brown,
        title: 'NEAT algorithm'
    })
    panel.createSeparator()
    panel_gen = panel.createText()
    panel_timeLeft = panel.createText()
    panel_lastFitness = panel.createText()
    panel_interact = panel.createCheckbox("Interact")
    panel_jumpNextGen = panel.createButton("Jump to next gen", () => {
        timeGen = 0
    })
    panel_showBest = panel.createButton("Show best", () => {
        let best = getBestPendulum()
        indexShowing = best.id
        automaticallyBest = true
    })
    //panel_factor = panel.createSlider(1, 60, 1, undefined, undefined, () => factor = panel_factor.getValue())
    panel_bestPts = panel.createText()
}

function init(){
    if(debug) console.log("init")
    engine = Engine.create();
    world = engine.world;
    pendulums = []
    for(let i = 0; i < size; i++){
        pendulums.push(new Pendulum(i))
    }
    nns = new Population(size, 5, 1, 
                (value, bias) => {return constrain(Math.max(value, 0), 0, 1)  }, 
                (value, bias) => {return Math.tanh(value) * maxOutputVel}, false,
                650, 25, 500, 200)
    Runner.run(engine);
    //movePendulums(true)
}

let maxdx = 0
let maxdy = 0


function setInputs(){
    if(debug) console.log("setInputs")
    for(let i = 0; i < size; i++){
        let pend = pendulums[i]
        let nn = nns.NNs[i]

        let x = map(pend.p1.position.x, track_start, track_start + track_length, -1, 1)
        //let dx = pend.p2.velocity.x * 0.1
        //let dy = pend.p2.velocity.y * 0.1
        let angularVel = pend.getAngularVelocity() * 2
        let vel = pend.baseVel

        let pend_angle = pend.getAngle()
        

        let bob_x = map(pend.p2.position.x, track_start, track_start + track_length, -1, 1)
        let bob_dist_to_cart = bob_x - x

        let dx = cos(pend_angle)
        let dy = -sin(pend_angle)

        let sx = map(pend.p1.velocity.x, -maxOutputVel , maxOutputVel, -1, 1)

        nns.setValues([x, dx, dy, angularVel*-1, sx], pend.id)

        //nns.setValues([x, dx, dy, angularVel, vel, pend_angle], pend.id)


        // let pend_angle = Math.atan2(pend.p2.position.y - pend.p1.position.y, pend.p2.position.x - pend.p1.position.x) / PI
        // let ang_vel = pend.getAngularVelocity() / maxAngVel
        // let cart_pos = map(pend.p1.position.x, track_start, track_start + track_length, -1, 1)

        // nns.setValues([pend_angle, ang_vel, cart_pos, dx, dy], pend.id)
    }
}

function setFitness(){
    if(debug) console.log("setFitness")
    //let fitness = []
    lastFitness = 0
    let w_points = 1
    let w_velocity = 10
    let w_position = 5
    
    for(let i = 0; i < size; i++){
        let pend = pendulums[i]
        // let normalizedAngularVelocity = Math.abs(pend.getAngularVelocity()) / maxAngVel;

        // let maxDistance = ((track_start + track_length) - track_start) / 2; // Half of the total range
        // let normalizedDistance = abs(pend.p1.position.x - (track_start + track_length / 2)) / maxDistance; // Ranges from 0 to 1

        // let fit = (w_points * pend.points) - (w_velocity * normalizedAngularVelocity) - (w_position * normalizedDistance);
        // fit = constrain(fit, 0, fit)

        // if(pend.points != 0){
        //     console.log("fit: " + pend.points)
        //     console.log("ang: " + round(normalizedAngularVelocity, 2))
        //     console.log("pos: " + round(normalizedDistance, 2))
        //     if(normalizedDistance == 1) console.log("x: " + pend.p1.position.x)
        //     console.log(fit)
        // }

        //console.log("------------")
        let fit = pend.points
        // if(fit != 0) console.log("fit " + fit)
        // let avg = Math.abs(pend.avgAngularVelocity) / timeG
        // if(fit != 0) console.log("avg " + avg)
        // let normAvg = 1 - avg / maxAngVel;
        // if(fit != 0) console.log("normAvg " + avg)
        // fit *= normAvg
        // if(fit != 0) console.log("fit " + fit)


        
        nns.NNs[pend.id].fitness = fit
        lastFitness += pend.points
    }
    lastFitness /= size
    //nns.setFitness(fitness)
}

function updateNNs(){
    nns.update()
}

function updatePendulums(){
    if(debug) console.log("updatePendulums")
    let alive = false
    for (let pend of pendulums) {
        if(pend.alive) alive = true
        if(!pend.alive) continue
        pend.engine.timeScale = 1 / factor
        Engine.update(pend.engine, deltaTime * pend.engine.timeScale);
        pend.angularVelocity = pend.getAngularVelocity()
        pend.setAvgAngVel()
        pend.checkBounds()
    }
    if(!alive) timeGen = 0
}

function movePendulums(){
    if(debug) console.log("movePendulums")
    for(let i = 0; i < size; i++){
        let pend = pendulums[i]
        if(!pend.alive) continue
        let nn = nns.NNs[pend.id]

        let izqda = (pend.p1.position.x - pend.rad) <= (pend.paredIzquierda.x + 5)
        let dcha = (pend.p1.position.x + pend.rad) >= (pend.paredDerecha.x - 5)
        let output = nn.getOutput()
        if(izqda && output < 0){
            continue
        }
        if(dcha && output > 0){
            continue
        }

        //let out = nn.getOutput() > 0 ? maxOutputVel : maxOutputVel * -1
        pend.move(output)
        pend.baseVel = output / maxOutputVel
        //else pend.move(random(-50, 50))
    }
}

function restartPendulums(){
    let friction = pendulums[0].p2.frictionAir - 0.01
    friction = constrain(friction, 0, 1)
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
    }
}

function getBestPendulum(){
    if(debug) console.log("getBestPendulum")
    let max = pendulums[0]
    avgPosBob = createVector(0, 0)
    for(let pend of pendulums){
        // if(pend.points >= max.points){
        //     if(pend.p2.position.y > max.p2.position.y) max = pend
        // }
        if(pend.points > max.points) max = pend
        avgPosBob.x += pend.p2.position.x
        avgPosBob.y += pend.p2.position.y
    }
    avgPosBob.div(size)
    return max
}

function getUpPendulum(){
    for(let p of pendulums){
        if(p.p2.position.y < p.p1.position.y) {indexShowing = p.id; return p}
    }
    return pendulums[0]
}




/*
set inputs
update nns
move pendulums
show pend
show nn
*/

function drawTags(){
    if(debug) console.log("drawTags")
    //[x, bob_x, dx, dy, angularVel*-2]
    push()
    fill(0)
    textSize(15)
    let inputTags = ["cart position", 
                     "direction x", 
                     "direction y", 
                     "angular vel",
                     "speed", 
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
    text(" speed", part.pos.x + 20, part.pos.y)
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
    // if(nns.gen < 5) t = 10
    // else if(nns.gen < 10) t = 30
    // else if(nns.gen < 30) t = 60
    // else if(nns.gen < 40) t = 75
    // else t = 90
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
    background(light_brown)
    setT()

    best = getBestPendulum()
    //getBestPendulum()
    //let best = getUpPendulum()
    showing = pendulums[indexShowing]
    if(automaticallyBest) showing = best

    for(let i = 0; i < factor; i++) iteration()

    if(frameCount % Math.floor(60/factor) == 0) timeGen--
    if(timeGen <= 0 || best.points >= 100){
        timeGen = timeG
        if(best.points > bestScore) bestScore = best.points
        console.log("gen: " + nns.gen + ", t: " + t + ", pendulums with points > 0: " + round((pendulums.filter(element => element.points > 0).length)/size*100, 1) + "%")
        setFitness()
        nns.evolvePopulation()
        restartPendulums()
    }
    
    drawTrack()

    showing.show()
    //if(keyIsPressed) for(let p of pendulums) {if(!p.alive) continue; p.show()}
    nns.showIndex(showing.id)
    drawTags()

    push()
    panel_bestPts.setText("Pendulums with points > 0: " + round((pendulums.filter(element => element.points > 0).length)/size*100, 1) + "%" +  
                          "\nBest pendulum: \n" + 
                          "  - Points: " + round(best.points, 1) + " of " + timeG + "\n" +
                          "  - Id: " + best.id + "\n" + 
                          // "  - Angular vel: " + round(best.getAngularVelocity() / maxAngVel, 6) + "\n" +
                          //  "  - Angle: " + Math.round(degrees(best.getAngle())) + "\n" +
                          // "Avg height: " + Math.round(getHeightPercentage(avgPosBob.y)) + "%" + "\n" + 
                          "Friction: " + round(pendulums[0].p2.frictionAir, 3))
    panel_gen.setText("Generation: " + nns.gen)
    panel_timeLeft.setText("Time left: " + timeGen + "s")
    panel_lastFitness.setText("Best Fitness: " + Math.round(bestScore))
    panel.update()
    panel.show()
    pop()

    push()
    fill(dark_brown)
    textAlign(LEFT, TOP)
    text("Pendulum #" + indexShowing + "\nFPS: " + Math.round(frameRate()), 20, 20)
    pop()
}

function getHeightPercentage(y){
    if(debug) console.log("getHeightPercentage")
    let low = track_height + rod_length
    let high = track_height - rod_length
    return map(y, low, high, 0, 100)
}






