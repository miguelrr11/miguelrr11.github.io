let r = []
let g = []
let y = []
let w = []
let particles = []
const WIDTH = 800
let HEIGHT = 800
let dt = 0.5
const d_wall = 55
const strength = 0.3
let gravity = false
let grav_cb
let fps
let radius
let btn_rand
let btn_reset
let pause_cb
let lines_cb
let trail_cb
let lines
let slider_radius
let slider_ww, slider_wr, slider_wg, slider_wy
let slider_rr, slider_rw, slider_rg, slider_ry
let slider_gg, slider_gw, slider_gr, slider_gy
let slider_yy, slider_yw, slider_yr, slider_yg
let slider_dt
let slider_force_touch
let slider_viscosity
let example_select
let touch
let force_touch
let pause = false
let viscosity = 0.01
let selected

const N = 1500

let qtree
let range
let boundary

let rules = []


let sliders = [slider_ww, slider_wr,slider_wg, slider_wy,
               slider_rr, slider_rw,slider_rg, slider_ry,
               slider_gg, slider_gw, slider_gr, slider_gy,
               slider_yy, slider_yw, slider_yr, slider_yg]

let sliders_names = ["white -> white","white -> red","white -> green","white -> yellow",
                     "red -> red","red -> white","red -> green","red -> yellow",
                     "green -> green","green -> white","green -> red","green -> yellow",
                     "yellow -> yellow","yellow -> white","yellow -> red","yellow -> green"]



function setup() {
    createCanvas(2000, 1000)
    background(0)
    createRules()
    console.log(rules)
    for(let i = 0; i < N/4; i++) r.push(new particle("RED"))
    for(let i = 0; i < N/4; i++) g.push(new particle("GREEN"))
    for(let i = 0; i < N/4; i++) y.push(new particle("YELLOW"))
    for(let i = 0; i < N/4; i++) w.push(new particle("WHITE"))
    particles.push(r)
    particles.push(g)
    particles.push(y)
    particles.push(w)
    
    boundary = new Rectangle(WIDTH/2, WIDTH/2, WIDTH/2, WIDTH/2);
    qtree = new QuadTree(boundary, 16);

    for (let p of particles) {
        for(let ps of p) qtree.insert(ps);
    }
    console.log(qtree)
    HEIGHT = 900
    

    for(let i = 0; i < sliders.length; i++){
        sliders[i] = createSlider(-1,1,0, 0.05)
        sliders[i].position(WIDTH + 10, i*30 + 100)
        let p = createP(sliders_names[i])
        p.position(WIDTH + 160, i*30+85)
        if(i%16<=3)p.style("color:white; font: 15px Courier")
        else if(i%16<=7)p.style("color:red; font: 15px Courier")
        else if(i%16<=11)p.style("color:lime; font: 15px Courier")
        else if(i%16<=15)p.style("color:yellow; font: 15px Courier")
    }


    btn_rand = createButton("Randomize values")
    btn_rand.position(WIDTH + 10, HEIGHT-290)
    btn_rand.mousePressed(randomize)

    btn_reset = createButton("Default values")
    btn_reset.position(WIDTH + 10, HEIGHT-260)
    btn_reset.mousePressed(reset)

    fps = createP("FPS: " + frameRate())
    fps.position(WIDTH + 350, 50)
    fps.style("color:white; font: 15px Courier")

    lines_cb = createCheckbox()
    lines_cb.position(WIDTH + 10, HEIGHT-230)
    let p = createP("Draw lines")
    p.position(WIDTH + 35, HEIGHT-245)
    p.style("color:white; font: 15px Courier")

    grav_cb = createCheckbox()
    grav_cb.position(WIDTH + 10, HEIGHT-205)
    p = createP("Gravity")
    p.position(WIDTH + 35, HEIGHT-220)
    p.style("color:white; font: 15px Courier")

    pause_cb = createCheckbox()
    pause_cb.position(WIDTH + 10, HEIGHT-180)
    p = createP("Pause")
    p.position(WIDTH + 35, HEIGHT-195)
    p.style("color:white; font: 15px Courier")

    trail_cb = createCheckbox()
    trail_cb.position(WIDTH + 10, HEIGHT-155)
    p = createP("Trail")
    p.position(WIDTH + 35, HEIGHT-170)
    p.style("color:white; font: 15px Courier")


    slider_dt = createSlider(0,1,0.25,0.01)
    slider_dt.position(WIDTH + 350, 100)
    p = createP("Force")
    p.position(WIDTH + 500, 85)
    p.style("color:white; font: 15px Courier")

    slider_force_touch = createSlider(20,100,60,1)
    slider_force_touch.position(WIDTH + 350, 130)
    p = createP("Touch")
    p.position(WIDTH + 500, 115)
    p.style("color:white; font: 15px Courier")

    slider_viscosity = createSlider(0.01, 1, 0.01, 0.01)
    slider_viscosity.position(WIDTH + 350, 160)
    p = createP("Viscosity")
    p.position(WIDTH + 500, 145)
    p.style("color:white; font: 15px Courier")

    slider_radius = createSlider(15,300,80, 1)
    slider_radius.position(WIDTH + 350, 190)
    p = createP("Radius")
    p.position(WIDTH + 500, 175)
    p.style("color:white; font: 15px Courier")

    example_select = createSelect();
    example_select.position(WIDTH + 10, HEIGHT-317);
    example_select.option('Choose example');
    example_select.option('Nano spaceships');
    example_select.option('Red VS Green');
    example_select.option('Chispas');
    example_select.disable('Choose example')
    example_select.selected('Choose example')
    selected = 'Choose example'

    HEIGHT = 800
}

function mousePressed(){
    if (mouseX <= 0 || mouseX >= WIDTH || mouseY <= 0 || mouseY >= HEIGHT) return
    touch = {x: mouseX, y: mouseY, dir: 1}
    if(keyIsPressed) touch.dir = -1
}

function mouseDragged(){
    if (mouseX <= 0 || mouseX >= WIDTH || mouseY <= 0 || mouseY >= HEIGHT) return
    touch = {x: mouseX, y: mouseY, dir: 1}
    if(keyIsPressed) touch.dir = -1
}

function reset(){
    for(let s of sliders){
        s.value(0)
    }
    slider_radius.value(80)
}

function randomize(){
    for(let s of sliders){
        s.value(random(-1, 1))
    }
}

function applyExample(example){
    if(example == 'Nano spaceships'){
        reset()
        sliders[0].value(-1)
        sliders[4].value(-1)
        sliders[8].value(-1)
        sliders[12].value(-1)
        updateRules()
        slider_dt.value(0.15)
        slider_radius.value(300)
        selected = 'Nano spaceships'
    }
    else if(example == 'Red VS Green'){
        reset()
        sliders[0].value(-0.4)
        sliders[1].value(0)
        sliders[2].value(0.4)
        sliders[3].value(-0.25)

        sliders[4].value(0.95)
        sliders[5].value(-1)
        sliders[6].value(-0.8)
        sliders[7].value(0.05)

        sliders[8].value(-0.5)
        sliders[9].value(-0.45)
        sliders[10].value(-0.45)
        sliders[11].value(-0.4)

        sliders[12].value(0.75)
        sliders[13].value(0.5)
        sliders[14].value(0.15)
        sliders[15].value(0.25)
        updateRules()
        slider_dt.value(0.35)
        slider_radius.value(300)
        selected = 'Red VS Green'

    }
    else if(example == 'Chispas'){
        reset()
        sliders[0].value(0.05)
        sliders[1].value(-0.95)
        sliders[2].value(0)
        sliders[3].value(-0.5)

        sliders[4].value(0.75)
        sliders[5].value(0.1)
        sliders[6].value(-0.35)
        sliders[7].value(-0.65)

        sliders[8].value(-0.25)
        sliders[9].value(-0.3)
        sliders[10].value(0.2)
        sliders[11].value(-0.45)

        sliders[12].value(-0.35)
        sliders[13].value(0.45)
        sliders[14].value(0.65)
        sliders[15].value(-0.1)
        updateRules()
        slider_dt.value(0.45)
        slider_radius.value(300)
        selected = 'Chispas'

    }
}



function drawRules(){
    push()
    translate(WIDTH + 380, HEIGHT-170)
    let dis = 130
    push()
    //colorMode(HSB, 360, 100, 100, 80)
    for(let i = 0; i < rules.length; i++){
        if(rules[i].a == rules[i].b){
            noFill()
            strokeWeight(map(dt, 0, 1, 4, 12))
            //stroke(map(rules[i].value, -1, 1, 0, 120), 100, 100, 100)
            stroke(map(rules[i].value, -1, 1, 100, 255))
            if(rules[i].a == 'r') ellipse(0,0,50)
            else if(rules[i].a == 'w') ellipse(0,dis,50)
            else if(rules[i].a == 'y') ellipse(dis,dis,50)
            else if (rules[i].a == 'g') ellipse(dis,0,50)
            continue
        }
        let or = createVector(0,0)
        let dest = createVector(0,0)
        if(rules[i].a == 'w') or = createVector(0, dis)
        else if(rules[i].a == 'r') or = createVector(0, 0)
        else if(rules[i].a == 'y') or = createVector(dis, dis)
        else if (rules[i].a == 'g') or = createVector(dis, 0)

        if(rules[i].b == 'w') dest = createVector(0, dis)
        else if(rules[i].b == 'r') dest = createVector(0, 0)
        else if(rules[i].b == 'y') dest = createVector(dis, dis)
        else if (rules[i].b == 'g') dest = createVector(dis, 0)

        //stroke(map(rules[i].value, -1, 1, 0, 120), 100, 100, 50)
        stroke(map(rules[i].value, -1, 1, 100, 255))
        strokeWeight(map(dt, 0, 1, 4, 12))
        line(or.x, or.y, dest.x, dest.y)
    }
    pop()
    fill(255, 0, 0)
    noStroke()
    ellipse(0, 0, 30)
    fill(0, 255, 0)
    noStroke()
    ellipse(130, 0, 30)
    fill(255, 255, 0)
    noStroke()
    ellipse(130, 130, 30)
    fill(255, 255, 255)
    noStroke()
    ellipse(0, 130, 30)
    pop()
}

//Cosas de optimizacion que he aprendido:
//dist() es muchiiiiisimo mas lento que math.sqrt
//no hace falta llamar a slider_radius.value() aqui, ralentiza muchisimo
function applyRule(par1, par2, g){
    push()
    strokeWeight(1)
    colorMode(HSB)
    for (let i = 0; i < par1.length; i++) {
        let fx = 0;
        let fy = 0;
        let cont = 5

        range.x = par1[i].pos.x
        range.y = par1[i].pos.y
        let points = qtree.query(range, par2[0].col);
        if(points == undefined) points = []
        var a = par1[i];
        //fuerza de atraccion/repulsion con otros atoms
        for (let j = 0; j < points.length; j++) {
            
            var b = points[j];
            let dx = a.pos.x - b.pos.x;
            let dy = a.pos.y - b.pos.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            if (d > 0 && d < radius) {
                if(lines && cont > 0){
                    if(a.col == -1) stroke(0, 0, 100, 50)
                    else stroke(a.col, 100, 100, 50)
                    line(a.pos.x, a.pos.y, b.pos.x, b.pos.y)
                    cont--
                }
                let F = (g * 1) / d;
                fx += F * dx;
                fy += F * dy;

            }
        }
        
        //repelar paredes
        if (a.pos.x <                d_wall)  fx += (d_wall -         a.pos.x) * strength
        if (a.pos.x > WIDTH - d_wall)         fx += (WIDTH - d_wall - a.pos.x) * strength
        if (a.pos.y <                 d_wall) fy += (d_wall         - a.pos.y) * strength
        if (a.pos.y > HEIGHT - d_wall)        fy += (HEIGHT - d_wall - a.pos.y) * strength
        
        //aplicar gravedad
        if(gravity) fy += 0.6

        //aplicar click (si se hizo pulsans¡do tecla, la fuerza es inversa)
        if(touch != undefined){
            dx = a.pos.x - touch.x
            dy = a.pos.y - touch.y
            d = Math.sqrt(dx * dx + dy * dy);
            if (d > 0 && d < map(force_touch, 20, 100, 50, 250)) {
                F = force_touch * 1/d
                if(touch.dir == 1){
                    fx += F * dx;
                    fy += F * dy;
                }
                else{
                    fx -= F * dx;
                    fy -= F * dy;
                }
                
            }
            
        }

        //aplicar viscosidad
        fx *= (1-viscosity)
        fy *= (1-viscosity)

        //actualizar velocidad y posicion con fuerza final
        a.speed.x = (a.speed.x + fx) * dt;
        a.speed.y = (a.speed.y + fy) * dt;
        a.pos.add(a.speed)

        //rebotar si toaca pared
        if (a.pos.x <= 0 || a.pos.x >= WIDTH) { a.speed.x *= -1; }
        if (a.pos.y <= 0 || a.pos.y >= HEIGHT) { a.speed.y *= -1; } 
    }
    pop()
}

function updateRules(){
    for(let i = 0; i < sliders.length; i++){
        rules[i].value = sliders[i].value()
    }
}


function draw() {
    if(trail_cb.checked()) background(0, 15)
    else background(0)

    if(selected != example_select.selected()) applyExample(example_select.selected())

    radius = slider_radius.value()
    dt = slider_dt.value()
    force_touch = slider_force_touch.value()
    viscosity = slider_viscosity.value()
    
    gravity = grav_cb.checked()
    pause   = pause_cb.checked()
    lines   = lines_cb.checked()

    range = new Rectangle(0, 0, radius, radius);

    drawRules()

    if(!mouseIsPressed) touch = undefined

    textSize(35)
    textFont("Courier")
    text("Particle Life", WIDTH, 75)
    fps.html("FPS: " + Math.floor(frameRate()))

    if(!pause){
        applyRule(w, w, sliders[0].value())
        applyRule(w, r, sliders[1].value())
        applyRule(w, g, sliders[2].value())
        applyRule(w, y, sliders[3].value())

        applyRule(r, r, sliders[4].value())
        applyRule(r, w, sliders[5].value())
        applyRule(r, g, sliders[6].value())
        applyRule(r, y, sliders[7].value())

        applyRule(g, g, sliders[8].value())
        applyRule(g, w, sliders[9].value())
        applyRule(g, r, sliders[10].value())
        applyRule(g, y, sliders[11].value())

        applyRule(y, y, sliders[12].value())
        applyRule(y, w, sliders[13].value())
        applyRule(y, r, sliders[14].value())
        applyRule(y, g, sliders[15].value())

        updateRules()
    }

    if(!lines) qtree.show()

    qtree = new QuadTree(boundary, 128);
    for (let p of particles) {
        for(let ps of p) qtree.insert(ps);
    }
  
}

function createRules(){
        rules.push(new rule('w', 'w', 0))
        rules.push(new rule('w', 'r', 0))
        rules.push(new rule('w', 'g', 0))
        rules.push(new rule('w', 'y', 0))

        rules.push(new rule('r', 'r', 0))
        rules.push(new rule('r', 'w', 0))
        rules.push(new rule('r', 'g', 0))
        rules.push(new rule('r', 'y', 0))

        rules.push(new rule('g', 'g', 0))
        rules.push(new rule('g', 'w', 0))
        rules.push(new rule('g', 'r', 0))
        rules.push(new rule('g', 'y', 0))

        rules.push(new rule('y', 'y', 0))
        rules.push(new rule('y', 'w', 0))
        rules.push(new rule('y', 'r', 0))
        rules.push(new rule('y', 'g', 0))
    }
