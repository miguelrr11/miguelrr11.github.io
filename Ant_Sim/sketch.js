//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 800

let maxAngle = 0.05

let ants = []
let food = []
let homePhero = []
let foodPhero = []

let qtreeH, rangeH, boundaryH
let qtreeF, rangeF, boundaryF
let N = 32

let home

let p1
let p2

let Nants = 300
let Nfood = 200

let boolTrace = false

let panel
let fov, fovRad, range, rangesq, speedMag, half_fov_rad

function noiseFood(){
    let n = 50
    let spa = WIDTH/n
    for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
            if(noise(i/5, j/5, frameCount) > 0.7) food.push(new Particle(i*spa+random(-20, 20), 
                                                             j*spa+random(-20, 20), "food"))
        }
    }
}

function blobFood(){
    let x = random(WIDTH)
    let y = random(HEIGHT)
    for(let i = 0; i < 50; i++){
        food.push(new Particle(x + random(-20, 20), y + random(-20, 20), "food"))
    }
}

function toggleBoolTrace(){
    if(boolTrace){
        boolTrace = false
        panel.changeText(1, "Show Tracing")
    }
    else{
        boolTrace = true
        background(0)
        panel.changeText(1, "Show Particles")
    }
}

function reset(){
    resetOptions()
    ants = []
    for(let i = 0; i < Nants; i++){
        ants.push(new Ant(WIDTH/2, HEIGHT/2))
    }
    food = []
    homePhero = []
    foodPhero = []
    noiseFood()
    blobFood()
    
    rangeH = new Rectangle(0, 0, 0, 0);
    boundaryH = new Rectangle(WIDTH/2, WIDTH/2, WIDTH/2, WIDTH/2);
    qtreeH = new QuadTree(boundaryH, N);

    rangeF = new Rectangle(0, 0, 0, 0);
    boundaryF = new Rectangle(WIDTH/2, WIDTH/2, WIDTH/2, WIDTH/2);
    qtreeF = new QuadTree(boundaryF, N);
}

function setup(){
    createCanvas(WIDTH+200, HEIGHT)
    home = createVector(WIDTH/2, HEIGHT/2)
    panel = new Panel(WIDTH, 0, 200, HEIGHT, "ANT SIM", )
    panel.addSlider(0, 100, 30, "FOV", true)
    panel.addSlider(0, 100, 45, "Range", true)
    panel.addSlider(0, 5, 1, "Speed", true)
    panel.addSlider(0, 0.5, 0.05, "Steering", true)
    panel.addButton("Reset Params", resetOptions)
    panel.addButton("Show Tracing", toggleBoolTrace)
    panel.addButton("Random food", noiseFood)
    panel.addButton("Blob food", blobFood)
    panel.addButton("Reset Sim", reset)
    panel.addText("FPS: ")

    fov = 30
    fovRad = radians(fov)
    range = 45
    rangesq = range * range
    speedMag = 1
    half_fov_rad = fovRad/2

    noStroke()

    for(let i = 0; i < Nants; i++){
        ants.push(new Ant(WIDTH/2, HEIGHT/2))
    }
    let x = random(WIDTH)
    let y = random(HEIGHT)
    // for(let i = 0; i < Nfood; i++){
    //     //food.push(new Particle(x + random(-20, 20), y + random(-20, 20), "food"))
    //     food.push(new Particle(random(WIDTH), random(HEIGHT), "food"))
    // }
    noiseFood()
    blobFood()
    


    rangeH = new Rectangle(0, 0, 0, 0);
    boundaryH = new Rectangle(WIDTH/2, WIDTH/2, WIDTH/2, WIDTH/2);
    qtreeH = new QuadTree(boundaryH, N);

    rangeF = new Rectangle(0, 0, 0, 0);
    boundaryF = new Rectangle(WIDTH/2, WIDTH/2, WIDTH/2, WIDTH/2);
    qtreeF = new QuadTree(boundaryF, N);

    p1 = createP()
    p2 = createP()

    background(0)
}

function resetOptions(){
    fov = 30
    fovRad = radians(fov)
    range = 45
    rangesq = range * range
    speedMag = 1
    half_fov_rad = fovRad/2
    maxAngle = 0.05
    panel.setValue("FOV", fov)
    panel.setValue("Range", range)
    panel.setValue("Speed", speedMag)
    panel.setValue("Steering", maxAngle)
}

function draw(){
    if(!boolTrace) background(0)

    fov = panel.getValue("FOV")
    fovRad = radians(fov)
    range = panel.getValue("Range") 
    rangesq = range * range
    speedMag = panel.getValue("Speed") 
    half_fov_rad = fovRad/2
    maxAngle = panel.getValue("Steering") 
    panel.setText(0, "FPS: " + round(frameRate()))

    
    // loadPixels()
    // for(let i = 0; i < WIDTH; i++){
    //     for(let j = 0; j < HEIGHT; j++){
    //         if(ants[0].isPointInFOV(createVector(i, j))) set(i, j, color(255, 0, 0))
    //         if(ants[0].isPointInFOV(createVector(i, j), "left")) set(i, j, color(0, 255, 0))
    //         if(ants[0].isPointInFOV(createVector(i, j), "right")) set(i, j, color(0, 0, 255))
    //     }
    // }
    // updatePixels()
    if(food.length == 0){
        let x = random(WIDTH)
        let y = random(HEIGHT)
        for(let i = 0; i < Nfood; i++){
            food.push(new Particle(x + random(-20, 20), y + random(-20, 20), "food"))
        }
    }
    if(boolTrace){
        stroke(255, 10)
    }

    if(!boolTrace){
        for(let f of food){
            f.show()
        }
    }
    

    qtreeH = new QuadTree(boundaryH, N);
    for(let i = 0; i < homePhero.length; i++){
        let p = homePhero[i]
        p.update()
        if(!boolTrace) p.show()
        if(p.life <= 0) homePhero.splice(i, 1)
        else qtreeH.insert(p);
    }

    qtreeF = new QuadTree(boundaryF, N);
    for(let i = 0; i < foodPhero.length; i++){
        let p = foodPhero[i]
        p.update()
        if(!boolTrace) p.show()
        if(p.life <= 0) foodPhero.splice(i, 1)
        else qtreeF.insert(p);
    }

    for(let a of ants){
        a.update()
        if(!boolTrace) a.show()
        if(boolTrace) line(a.pos.x, a.pos.y, a.oldPos.x, a.oldPos.y)
    }

   

    if(!boolTrace){ 
        noFill()
        stroke(255)
        ellipse(home.x, home.y, 100, 100)
        noStroke()
    }

    // p1.html("homePhero: " + homePhero.length)
    // p2.html("foodPhero: " + foodPhero.length)

    panel.update()
    panel.show()
}

function squaredDistance(x1, y1, x2, y2) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2
}