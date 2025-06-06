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
const HEIGHT = 600
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
let ki = 1
let kd = 1

let integral = 0
let derivative = 0
let prevError = goal - cart.x
let error

let panel
let plotAcc, plotVars

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
    plotAcc = panel.createPlot('Acceleration')
    plotAcc.reposition(undefined, undefined, undefined, 150)

    plotVars = panel.createPlot('Variables', 3)
    plotVars.reposition(undefined, plotAcc.pos.y + plotAcc.height + 20, undefined, 150)
}

function draw(){
    background(255)
    dt = deltaTime * 0.001
    let a = updatePID()
    cart.v += a * dt
    cart.x += cart.v * dt
    
    udpateSpawner()
    updateStash()
    updateParticles()
    showParticles()
    showCart()
    showSpawner()
    showStash() 
    updateGoal()

    plotAcc.feed(a)
    plotVars.feed(error, 0)
    plotVars.feed(integral, 1)
    plotVars.feed(derivative, 2)

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
    }
    else if(cart.amt == 0 && goal == stash.x){
        goal = spawner.x
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
        coolDownSpawner = 15
        return
    }
    if(coolDownSpawner > 0 && isBelow) coolDownSpawner--
    if(coolDownSpawner == 0){
        coolDownSpawner = 15
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
        coolDownStash = 15
        return
    }
    if(coolDownStash > 0 && isAbove) coolDownStash--
    if(coolDownStash == 0){
        coolDownStash = 15
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