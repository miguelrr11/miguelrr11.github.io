// Torus Knot Optimized
// Miguel Rodríguez
// 26-03-2025

p5.disableFriendlyErrors = true;
const WIDTH = 600;
const HEIGHT = 600;

let MAX_PAR = 25;
let MIN_PAR = 0;

let p = 3;
let q = 2;
let size = 60;

let points = [];
let needsUpdate = true;

let fontPanel, panel;

function preload(){
    fontPanel = loadFont("migUI/main/bnr.ttf");
}

function setP(value){
    p = Math.floor(value);
    needsUpdate = true;
}

function setQ(value){
    q = Math.floor(value);
    needsUpdate = true;
}

function setSize(value){
    size = value
    needsUpdate = true;
}

function setStrokeWeight(value){
    strokeWeight(value);
}

function computePoints() {
    points = [];
    for(let i = 0; i < 360 * 2; i += 0.1){
        let r = (Math.cos(q * i) + 2) * size;
        let x = r * Math.cos(p * i);
        let y = r * Math.sin(p * i);
        let z = -Math.sin(q * i) * size;
        points.push({ x: x, y: y, z: z });
    }
}

function setup(){
    createCanvas(WIDTH+200, HEIGHT, WEBGL);
    panel = new Panel({
        title: 'Torus Knot',
        x: WIDTH,
        y: 0,
        w: 200,
        automaticHeight: false,
        font: fontPanel,
    });
    panel.createSeparator();
    panel.createText('It follows the formula:');
    panel.createText('x = r * cos(p * t)\ny = r * sin(p * t)\nz = -sin(q * t)');
    panel.createText('Where:');
    panel.createText('p = number of loops\nq = number of twists\nr = cos(q * t) + 2');
    panel.createSeparator();
    let sp = panel.createSlider(0, MAX_PAR, p, 'p - number of loops');
    sp.setFunc(setP, true);
    let sq = panel.createSlider(0, MAX_PAR, q, 'q - number of twists');
    sq.setFunc(setQ, true);
    let ss = panel.createSlider(0, 100, size, 'Size');
    ss.setFunc(setSize, true);
    let sst = panel.createSlider(1, 20, 15, 'Thickness');
    sst.setFunc(setStrokeWeight, true);
    panel.createSeparator();
    let bt = panel.createButton('Save Image')
    bt.setFunc(() => {
        let img = get(0, 0, WIDTH, HEIGHT);
        img.save('torus_knot', 'png');
    });

    angleMode(DEGREES);
    noFill();
    stroke(255);
    strokeWeight(15);
}

function draw(){
    if(needsUpdate){
        computePoints();
        needsUpdate = false;
    }

    background(0);
    push();
    translate(-100, 0, 0);
    if(!mouseIsPressed || mouseX > WIDTH){
        rotateY(frameCount / 4);
        rotateX(frameCount / 4);
    }
    else if(mouseIsPressed && mouseX < WIDTH){
        let rotationX = mapp(mouseY, 0, HEIGHT, -Math.PI, Math.PI) * 30
        let rotationY = mapp(mouseX, 0, WIDTH, -Math.PI, Math.PI) * 30
        rotateX(-rotationX);
        rotateY(rotationY);
    }
    

    for(let i = 0; i < points.length; i++){
        let pt = points[i];
        stroke(map(pt.z, -size, size, 0, 255));
        point(pt.x, pt.y, pt.z);
    }
    pop();

    // Render panel
    translate(-400, -HEIGHT/2, 0);
    panel.update();
    panel.show();
}
