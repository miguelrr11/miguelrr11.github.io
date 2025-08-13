//Plant Generator
//Miguel Rodríguez
//13-08-2025

p5.disableFriendlyErrors = true
const WIDTH = 750
const HEIGHT = 750

let sun
let rad1 = 40
let plants = []
let parents = []
let fps = Array(10).fill(60)
let oldfps = 60
let totalPlantsCreated = 0

const MAX_PARENTS = 1

const RAD_PLANT_TO_SUN = 350
const RAD_PLANT_TO_SUN_SQ = RAD_PLANT_TO_SUN * RAD_PLANT_TO_SUN

let sigmaMax, sigmaMin

let ctx

const TABLE_SIZE = 1024
const TWO_PI = Math.PI * 2
const cosTable = new Float32Array(TABLE_SIZE)
const sinTable = new Float32Array(TABLE_SIZE)


function getCircularPos(n, radius){
    let angle = map(n, 0, nPlantsPerGen, 0, TWO_PI);
    let x = WIDTH / 2 + cos(angle + 0.1) * radius;
    let y = HEIGHT / 2 + sin(angle + 0.1) * radius;
    return createVector(x, y);
}

function setup(){
    let canvas = createCanvas(WIDTH, HEIGHT)
    ctx = canvas.elt.getContext('2d');
    sun = createVector(WIDTH / 2, HEIGHT / 2)
    sigmaMax = radians(60);
    sigmaMin = radians(2);
    
    for (let i = 0; i < TABLE_SIZE; i++) {
        const angle = (i / TABLE_SIZE) * TWO_PI;
        cosTable[i] = Math.cos(angle);
        sinTable[i] = Math.sin(angle);
    }

    plants.push(new Plant(createVector(random(width), random(height))))
    //parents.push(plants[plants.length - 1])
    plants.push(new Plant(createVector(random(width), random(height))))
    parents.push(plants[plants.length - 1])
    
}

function mouseClicked(){
    plants.push(new Plant(createVector(mouseX, mouseY)))
    parents.push(plants[plants.length - 1])

    if(parents.length > MAX_PARENTS){
        let oldest = parents.shift();
        oldest.dead = true;
        oldest.dieOffsprings()
    }
}

function draw(){
    background(240)
    push()

    iters = 100

    if(frameRate() < 15){
        plants.push(new Plant(createVector(random(width), random(height))))
        parents.push(plants[plants.length - 1])

        if(parents.length > MAX_PARENTS){
            let oldest = parents.shift();
            oldest.dead = true;
            oldest.dieOffsprings()
        }
    }

    let allSections = []
    for(let i = 0; i < iters; i++){
        allSections = []
        for(let j = plants.length-1; j > 0; j--){
            let plant = plants[j]
            plant.update()
            plant.show()
            allSections.push(...plant.stem)
            if(!plant.dead) alive = true
            else plants.splice(j, 1)
        }
        renderSectionsBatched(allSections)
    }
    console.log('Sections: ' + allSections.length)
    pop()

    //orbit sun
    sun.x = WIDTH / 2 + cos(frameCount * 0.004) * 250;
    sun.y = HEIGHT / 2 + sin(frameCount * 0.004) * 250;

    noStroke()
    fill(0, 10)
    ellipse(sun.x, sun.y, rad1*2)

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