const WIDTH = 600
const HEIGHT = 600

let nexo 
let en_pos
let en_vel

let bh

let r = 50
let m = 9500
let c = 4;
let G = 1;

let slider_total_vel

let p 

let slider_r, slider_m, slider_c, slider_G

let ens = []

function setup(){
    createCanvas(WIDTH, HEIGHT)
    nexo = createVector(300, 300)
    bh = createVector(450, 450)
    en_pos = createVector(random(0, WIDTH), random(0, HEIGHT))
    en_vel = getTangentialVector(p5.Vector.sub(nexo, en_pos))

    slider_r = createSlider(1, 2000, 1)
    slider_m = createSlider(-20000, 20000, 10000)
    slider_c = createSlider(0.1, 20, 4, 0.1)
    slider_G = createSlider(0.1, 10, 1, 0.1)
    slider_total_vel = createSlider(1, 10, 1, 0.1)

    p = createP()

    for(let i = 0; i < 1000; i++){
        addEn()
    }
    noStroke()
    fill(255)
}

function addEn(){
    let pos = getInitialPos()
    let vel = getTangentialVector(p5.Vector.sub(nexo, pos))
    ens.push({en_pos: pos, en_vel: vel, hasBeenAttracted: false})
}

function getInitialPos(){
    let x = random(-WIDTH, WIDTH)
    let y = random(-HEIGHT, HEIGHT)
    if(random() < 0.5){
        if(random() < 0.5) y = 0
        else y = HEIGHT
    }
    else{
        if(random() < 0.5) x = 0
        else x = WIDTH
    }
    return createVector(x, y)
}

function getTangentialVector(positionVector) {
    // Calculate the unit vector perpendicular to the position vector (clockwise direction)
    let u = {
        x: -positionVector.y,
        y: positionVector.x
    };
    // Normalize the unit vector
    let magnitude = Math.sqrt(u.x * u.x + u.y * u.y);
    u.x /= magnitude;
    u.y /= magnitude;

    // Multiply the unit vector by the magnitude of the position vector
   

    tangentialVector = createVector(u.x * magnitude, u.y * magnitude)
    tangentialVector.setMag(3)

    return tangentialVector;
}

function updateBH(en_pos, en_vel){
    const force = p5.Vector.sub(bh, en_pos);
    const R = force.mag();
    let mBH = 30000
    let GBH = 5
    const fg = GBH * mBH / (R * R);
    force.setMag(fg);
    en_vel.add(force);
    //en_vel.add(getTangentialVector(p5.Vector.sub(bh, en_pos)))
    en_vel.setMag(c);
    en_pos.add(en_vel)
}

function updateNexo(en_pos, en_vel, bool){
    const force = p5.Vector.sub(nexo, en_pos);
    const R = force.mag();
    const fg = G * m / (R * R);
    force.setMag(fg);
    en_vel.add(force);
    if(!bool) en_vel.add(getTangentialVector(p5.Vector.sub(nexo, en_pos)))
    en_vel.setMag(c);
    en_pos.add(en_vel)
}

// function updateTotal(en_pos, en_vel){
//     const forceNexo = p5.Vector.sub(nexo, en_pos);
//     const forceBH = p5.Vector.sub(bh, en_pos);
//     let force = p5.Vector.add(forceBH, forceNexo)
//     const R = force.mag();
//     const fg = G * m / (R * R);
//     force.setMag(fg);
//     en_vel.add(force);
//     en_vel.add(getTangentialVector(p5.Vector.sub(nexo, en_pos)))
//     en_vel.setMag(c);
//     en_pos.add(en_vel)
// }

function getGandC(){
    let wanted_vel = slider_total_vel.value()
    c = map(wanted_vel, 1, 10, 2.5, 14)
    G = map(wanted_vel, 1, 10, 1.5, 9)
}

function draw(){
    fill(255)
    m = slider_m.value()
    getGandC()
    ens.splice(random(ens.length), 1)
    addEn()
    background(0)
    bh.x = mouseX
    bh.y = mouseY
    for(let i = 0; i < ens.length; i++){
        let e = ens[i]
        if(dist(e.en_pos.x, e.en_pos.y, bh.x, bh.y) < 200) {updateBH(e.en_pos, e.en_vel); e.hasBeenAttracted = true; fill(0, 255, 0)}
        else {updateNexo(e.en_pos, e.en_vel, e.hasBeenAttracted); fill(255)}
        if(dist(e.en_pos.x, e.en_pos.y, nexo.x, nexo.y) < 50) ens.splice(i, 1)
        ellipse(e.en_pos.x, e.en_pos.y, 8) 
    }
    fill(255)
    ellipse(nexo.x, nexo.y, 100)
    fill(255, 100, 30)
    ellipse(bh.x, bh.y, 75)

    p.html("r: " + r + " m: " + m + " c: " + c + " G: " + G)
    
}