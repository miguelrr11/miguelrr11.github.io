//PID Controller
//Miguel Rodríguez
//06-06-2025

/*
ideon:
el cart tiene dos posiciones goal:
1. a la izquierda, donde recoge oro que sale de arriba
2. a la derecha, donde lo suelta por debajo
3. cuando el cart se llena de oro va a dejarlo
4. el peso del oro afecta a las fisicas
*/

p5.disableFriendlyErrors = true
const WIDTH = 900
const HEIGHT = 650
const WIDTH_UI = 250

const MAX_ACC = 200

let dt

let cart = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    v: 0,
    w: 45,
    h: 35,
    amt: 0
}

let spawner = {x: 250, y: 50}
let particles = []
let coolDownSpawner = 15
let coolDownStash = 15

let stash = {
    x: WIDTH - 250, 
    y: HEIGHT - 50,
    amt: 0
}

let goal = spawner.x

let kp = 1
let ki = 0
let kd = 0

let integral = 0
let derivative = 0
let prevError = goal - cart.x
let error

let panel
let plotAcc, plotErr, plotInt, plotDer
let btTime
let resetOnSettingsChange = false
let measureTime = false
let currentTime = 0
let highscore = undefined

function reset(){
    cart.x = WIDTH / 2
    cart.v = 0
    cart.amt = 0
    stash.amt = 0
    goal = spawner.x
    integral = 0
    derivative = 0
    prevError = goal - cart.x
    currentTime = 0
    particles = []

    plotAcc.clear()
    plotErr.clear()
    plotInt.clear()
    plotDer.clear()
}

async function setup(){
    createCanvas(WIDTH + WIDTH_UI, HEIGHT)
    let fontPanel = await loadFont("migUI/main/bnr.ttf")
    panel = new Panel({
        title: 'PID Controller',
        x: WIDTH,
        w: WIDTH_UI,
        font: fontPanel,
        lightCol: '#000000',
        darkCol: '#ffffff',
        h: HEIGHT,
        automaticHeight: false
    })
    //min, max, origin, [title], [showValue]
    let skp = panel.createSlider(0, 10, 1, 'Kp', true)
    skp.setValue(kp)
    skp.setFunc((value) => {
        kp = value
        if(resetOnSettingsChange) reset()
    }, true)
    let ski = panel.createSlider(0, 10, 1, 'Ki', true)
    ski.setValue(ki)
    ski.setFunc((value) => {
        ki = value
        if(resetOnSettingsChange) reset()
    }, true)
    let skd = panel.createSlider(0, 10, 1, 'Kd', true)
    skd.setValue(kd)
    skd.setFunc((value) => {
        kd = value
        if(resetOnSettingsChange) reset()
    }, true)

    let rb = panel.createCheckbox('Reset on Settings Change', false)
    rb.setFunc((value) => {
        resetOnSettingsChange = value
    }, true)

    plotAcc = panel.createPlot('Acceleration')
    plotErr = panel.createPlot('Error (P)')
    plotInt = panel.createPlot('Integral (I)')
    plotDer = panel.createPlot('Derivative (D)')

    plotAcc.setMaxMinAbs(200, -200)
    plotErr.setMaxMinAbs(200, -200)
    plotInt.setMaxMinAbs(200, -200)
    plotDer.setMaxMinAbs(200, -200)

    btTime = panel.createButton('Measure Time')
    btTime.setFunc(() => {
        measureTime = !measureTime
        btTime.setText(measureTime ? 'Stop Measuring' : 'Measure Time', true)
        if(measureTime) reset()
    })

}

function draw(){
    background(255)
    dt = deltaTime * 0.001
    let drag = cart.amt == 100 ? 5 : 1
    let a = updatePID() / drag
    cart.v += a * dt
    cart.x += cart.v * dt
    
    udpateSpawner()
    updateStash()
    updateParticles()
    showParticles()
    showCart()
    showSpawner()
    showStash() 
    

    plotAcc.feed(a)
    plotErr.feed(error)
    plotInt.feed(integral)
    plotDer.feed(derivative)

    if(highscore !== undefined){
        push()
        fill(0)
        noStroke()
        textAlign(LEFT, TOP)
        textSize(17)
        text('Highscore: ' + highscore.toFixed(2) + 's', 10, 15)
        pop()
    }

    if(measureTime){
        currentTime += dt
        if(cart.amt == 0 && goal == stash.x){
            if(highscore === undefined || currentTime < highscore) highscore = currentTime
            measureTime = false
            btTime.setText('Measure Time', true)
        }
        push()
        fill(0)
        noStroke()
        textAlign(LEFT, TOP)
        textSize(17)
        text('Time: ' + currentTime.toFixed(2) + 's', 10, 40)
        pop()
    }

    updateGoal()

    panel.update()
    panel.show()
}

function updatePID(){
    error = goal - cart.x
    integral += error * dt
    derivative = (error - prevError) / dt
    prevError = error
    return constrainn(error * kp + integral * ki + derivative * kd, -MAX_ACC, MAX_ACC)
}

function updateGoal(){
    if(cart.amt >= 100 && goal == spawner.x){
        goal = stash.x
        inertia = 0
    }
    else if(cart.amt == 0 && goal == stash.x){
        goal = spawner.x
        inertia = 0
    }
}

function showCart(){
    push()
    stroke(0)
    strokeWeight(3)
    line(0, HEIGHT/2 + 28, WIDTH, HEIGHT/2 + 28)
    rectMode(CENTER)
    rect(cart.x, cart.y, cart.w, cart.h)
    ellipse(cart.x - 22, cart.y + 20, 13)
    ellipse(cart.x + 22, cart.y + 20, 13)
    rectMode(CORNER)
    fill(0)
    noStroke()
    textAlign(CENTER, CENTER)
    textSize(17)
    text(cart.amt + '%', cart.x, cart.y)
    pop()
}

function showSpawner(){
    push()
    stroke(0)
    strokeWeight(3)
    rectMode(CENTER)
    rect(spawner.x, spawner.y, 60, 60)
    isCartBelowSpawner() ? fill(0, 255, 0, 50) : fill(255, 0, 0, 50)
    noStroke()
    rectMode(CORNER)
    rect(spawner.x-10, spawner.y, 20, HEIGHT - spawner.y - HEIGHT/2 - 28)
    pop()
}

function showStash(){
    push()
    stroke(0)
    strokeWeight(3)
    rectMode(CENTER)
    rect(stash.x, stash.y, 60, 60)
    isCartAboveStash() ? fill(0, 255, 0, 50) : fill(255, 0, 0, 50)
    noStroke()
    rectMode(CORNER)
    rect(stash.x-10, HEIGHT/2 + 48, 20, stash.y - HEIGHT/2 - 48)
    fill(0)
    noStroke()
    textAlign(CENTER, CENTER)
    textSize(17)
    text(stash.amt, stash.x, stash.y)
    pop()
}

function isCartBelowSpawner(){
    return cart.x > spawner.x - 10 && cart.x < spawner.x + 10
}

function isCartAboveStash(){
    return cart.x > stash.x - 10 && cart.x < stash.x + 10
}

function udpateSpawner(){
    let isBelow = isCartBelowSpawner()
    if(!isBelow){
        coolDownSpawner = 5
        return
    }
    if(coolDownSpawner > 0 && isBelow) coolDownSpawner--
    if(coolDownSpawner == 0){
        coolDownSpawner = 5
        let particle = {
            x: spawner.x + random(-7, 7),
            y: spawner.y + 15,
            v: 0
        }
        particles.push(particle)
    }
}

function updateStash(){
    if(cart.amt == 0) return
    let isAbove = isCartAboveStash()
    if(!isAbove){
        coolDownStash = 5
        return
    }
    if(coolDownStash > 0 && isAbove) coolDownStash--
    if(coolDownStash == 0){
        coolDownStash = 5
        let particle = {
            x: stash.x + random(-7, 7),
            y: cart.y,
            v: 0
        }
        cart.amt--
        particles.push(particle)
    }
}

function updateParticles(){
    for(let i = particles.length - 1; i >= 0; i--){
        let p = particles[i]
        p.v += 100 * dt 
        p.y += p.v * dt
        if(cart.amt < 100 && particleIntersectingCart(p)){
            particles.splice(i, 1)
            cart.amt++
        }
        else if(inBounds(p.x, p.y, stash.x - 30, stash.y - 30, 60, 60)){
            particles.splice(i, 1)
            stash.amt++
        }
        else if(p.y > HEIGHT){
            particles.splice(i, 1)
        }
    }
}

function particleIntersectingCart(p) {
    const radius = 10;
    const cartTop = cart.y - cart.h / 2 + radius / 2;

    const touchingTopEdge = (p.y + radius >= cartTop) && (p.y - radius < cartTop);
    const withinHorizontalBounds = (p.x > cart.x - cart.w / 2) && (p.x < cart.x + cart.w / 2);

    return touchingTopEdge && withinHorizontalBounds;
}


function showParticles(){
    push()
    stroke(0)
    strokeWeight(3)
    fill(255)
    for(let p of particles){
        ellipse(p.x, p.y, 10)
    }
    pop()
}