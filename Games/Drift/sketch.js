//Drift Car Game
//Miguel Rodríguez
//20-06-2025

p5.disableFriendlyErrors = true
const WIDTH = 1200
const HEIGHT = 700
const WIDTH_UI = 250

let car
let ice = {
    pos: {x: WIDTH / 2, y: HEIGHT / 2 },
    rad: 150,
}
let carImg
let animations = []
let panel
let showDebug = false;

let labels = [
        { label: 'Move Speed', min: minmaxMoveSpeed.min, max: minmaxMoveSpeed.max },
        { label: 'Max Speed', min: minmaxMaxSpeed.min, max: minmaxMaxSpeed.max },
        { label: 'Drag',  min: minmaxDrag.min, max: minmaxDrag.max },
        { label: 'Steer Angle',  min: minmaxSteerAngle.min, max: minmaxSteerAngle.max },
        { label: 'Traction',  min: minmaxTraction.min, max: minmaxTraction.max },
        { label: 'Delta Steer Mult',  min: minmaxDeltaSteerMult.min, max: minmaxDeltaSteerMult.max },
        { label: 'Lat Drag',  min: minmaxLatDrag.min, max: minmaxLatDrag.max }
    ];

async function setup(){
    createCanvas(WIDTH + WIDTH_UI, HEIGHT)
    car = new Car(randomCar);
    frameRate(60);
    carImg = await loadImage('carimg.png');
    panel = new Panel({
        x: WIDTH,
        automaticHeight: false,
        w: WIDTH_UI,
        retractable: true,
        title: "Car Controls",
        theme: 'mono'
    })
    let s1 = panel.createSlider(labels[0].min, labels[0].max, car.moveSpeed, labels[0].label, true);
    let s2 = panel.createSlider(labels[1].min, labels[1].max, car.maxSpeed, labels[1].label, true);
    let s3 = panel.createSlider(labels[2].min, labels[2].max, car.drag, labels[2].label, true);
    let s4 = panel.createSlider(labels[3].min, labels[3].max, car.steerAngle, labels[3].label, true);
    let s5 = panel.createSlider(labels[4].min, labels[4].max, car.traction, labels[4].label, true);
    let s6 = panel.createSlider(labels[5].min, labels[5].max, car.deltaSteerMult, labels[5].label, true);
    let s7 = panel.createSlider(labels[6].min, labels[6].max, car.latDrag, labels[6].label, true);
    s1.setFunc((value) => car.moveSpeed = value);
    s2.setFunc((value) => car.maxSpeed = value);
    s3.setFunc((value) => car.drag = value);
    s4.setFunc((value) => car.steerAngle = value);
    s5.setFunc((value) => car.traction = value);
    s6.setFunc((value) => car.deltaSteerMult = value);
    s7.setFunc((value) => car.latDrag = value);
    let b = panel.createCheckbox("Show Debug")
    b.setFunc((arg) => showDebug = arg, true);
}

function draw() {
    background(200);

    car.drawSkids(car.skidLeft);
    car.drawSkids(car.skidRight);
    manageAnimations();
    car.update();
    car.show();

    if (showDebug) car.showDebug();

    panel.update();
    panel.show();
}

function manageAnimations() {
    for (let i = animations.length - 1; i >= 0; i--) {
        animations[i].update();
        animations[i].show();
        if (animations[i].dead()) {
            animations.splice(i, 1);
        }
    }
}

