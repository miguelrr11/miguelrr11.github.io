//Cloth Simulation (Verlet Integration)
//Miguel Rodríguez
//23-10-2024

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 800
const GRAVITY = 10
const TIME_STEP = 0.1

const ROW = 50
const COL = 80
const REST_DISTANCE = 8

let particles = []
let constraints = []
let grabbingParticle = undefined

let panel, panel_color_cb, panel_timeStep_sl, panel_wind_cb

function createCloth(){
    particles = []
    constraints = []
    let totalW = COL * REST_DISTANCE
    let off = (WIDTH - totalW) / 2
    for (let row = 0; row < ROW; row++) {
        for (let col = 0; col < COL; col++) {
            let x = col * REST_DISTANCE + off
            let y = row * REST_DISTANCE + off
            let pinned = (row == 0);
            particles.push(new Particle(x, y, pinned))
        }
    }

    for (let row = 0; row < ROW; row++) {
        for (let col = 0; col < COL; col++) {
            if (col < COL - 1) {
                constraints.push(new Constraint(particles[row * COL + col], particles[row * COL + col + 1]))
            }
            if (row < ROW - 1) {
                constraints.push(new Constraint(particles[row * COL + col], particles[(row + 1) * COL + col]))
            }
        }
    }
}

function createBall(centerX = WIDTH / 2, centerY = HEIGHT / 2, radius = 200, numSegments = 25) {
    particles = [];
    constraints = [];
    
    let angleStep = TWO_PI / numSegments;
    let centerParticle = new Particle(centerX, centerY, false)
    particles.push(centerParticle);

    // Create particles in a circle
    for (let i = 0; i < numSegments; i++) {
        let angle = i * angleStep;
        let x = centerX + radius * cos(angle);
        let y = centerY + radius * sin(angle);
        let particle = new Particle(x, y, false); 
        particles.push(particle);

        constraints.push(new Constraint(centerParticle, particle));

        if (i > 0) {
            constraints.push(new Constraint(particles[i], particles[i + 1]));
        }
    }

    constraints.push(new Constraint(particles[1], particles[numSegments]));

    // Optional: Add additional internal constraints for more stability (like a spider web)
    for (let i = 1; i < numSegments; i++) {
        for (let j = i + 1; j <= numSegments; j++) {
            constraints.push(new Constraint(particles[i], particles[j]));
        }
    }
}


function setup(){
    createCanvas(WIDTH + 220, HEIGHT)
    panel = new Panel({
        title: "CLOTH SIM",
        w: 220,
        x: WIDTH
    })
    panel.createText("With Verlet Integration")
    panel.createSeparator()
    panel.createText("- Click and drag to cut the cloth")
    panel.createText("- Click and drag while pressing any key to grab the cloth")
    panel.createSeparator()
    panel_color_cb = panel.createCheckbox("Show tension")
    panel_wind_cb = panel.createCheckbox("Wind")
    panel_timeStep_sl = panel.createSlider(0, 1, 0.1, "Time step", true)
    panel.createSeparator()
    panel.createButton("Reset", createCloth)

   createCloth()
   //createBall()
}

function draw(){
    background(0)

    if(mouseIsPressed && !keyIsPressed && !grabbingParticle) InputHandler.handleMouseClick(particles, constraints)
    else if(mouseIsPressed && keyIsPressed){
        if(!grabbingParticle){
            let bestD = Infinity
            for(let p of particles){
                if(p.isPinned) continue
                let d = hypot(p.pos.x - mouseX, p.pos.y - mouseY)
                if(d < bestD){ 
                    bestD = d
                    grabbingParticle = p
                }
            }
            if(bestD > 20) grabbingParticle = undefined
        }
    }
    if(grabbingParticle && mouseIsPressed){
        grabbingParticle.pos.x = mouseX
        grabbingParticle.pos.y = mouseY
    }
    else if(!mouseIsPressed) grabbingParticle = undefined

    let seed = frameCount/80
    for(let p of particles){
        p.applyForce(createVector(0, GRAVITY))
        if(panel_wind_cb.isChecked()){
            let angle = mapp(noise(p.pos.x/200, p.pos.y/200, seed), 0, 1, -TWO_PI, TWO_PI)
            let x = cos(angle) * 3
            let y = sin(angle) * 3
            p.applyForce(createVector(x, y))
        }
        p.update(panel_timeStep_sl.getValue())
        p.constrainToBounds()
        //p.show()
    }

    for(let i = 0; i < 5; i++){
        for(let c of constraints) c.satisfy()
    }

    push()
    stroke(255)
    if(panel_color_cb.isChecked()) colorMode(HSB)
    for(let c of constraints){
        c.show()
    }
    pop()

    panel.update()
    panel.show()

}

function hypot(x, y){
    return Math.sqrt(x * x + y * y)
}









