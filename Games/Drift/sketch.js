//Drift Car Game
//Miguel Rodríguez
//20-06-2025

p5.disableFriendlyErrors = true
const WIDTH = 1200
const HEIGHT = 700
const WIDTH_UI = 250

const ANIM_CAP = 1000

const backCol = 130

let car, policeCars = []
let nPoliceCars = 0
let ice = {
    pos: {x: WIDTH / 2, y: HEIGHT / 2 },
    rad: 150,
}
let carImg, policeCarImg
let animations = []
let tabs, panel, stats, policeOptions
let showDebug

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
    car = new Car(superCar);
    for(let i = 0; i < nPoliceCars; i++) {
        let properties = getRandomPoliceCar();
        let policeCar = new PoliceCar(properties, car);
        policeCars.push(policeCar);
    }
    frameRate(60);
    carImg = await loadImage('carimg.png');
    policeCarImg = await loadImage('police.png');
    let fontP = await loadFont("migUI/main/bnr.ttf")
    tabs = new TabManager({
        x: WIDTH,
        automaticHeight: false,
        w: WIDTH_UI,
        title: "Car Controls",
        darkCol: [0, 0, 0, 70],
        font: fontP,
    })
    panel = tabs.createTab('Car Controls');
    stats = tabs.createTab('Stats');
    policeOptions = tabs.createTab('Police Options');
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
    let cb = panel.createCheckbox("Allow Back Drifting", car.allowBackDrift);
    cb.setFunc((arg) => car.allowBackDrift = arg);
    let cb2 = panel.createCheckbox("Continuous Drifting", car.continuousDrift);
    cb2.setFunc((arg) => car.continuousDrift = arg);
    let cb3 = panel.createCheckbox("Always Moving", car.alwaysMoving);
    cb3.setFunc((arg) => car.alwaysMoving = arg);

    panel.createSeparator()

    let b = panel.createCheckbox("Show Debug", true)
    b.setFunc((arg) => showDebug = arg);
    showDebug = b.isChecked();
    let pos = stats.createText()
    let moveForce = stats.createText()
    let speed = stats.createText()
    let angle = stats.createText()
    let acc = stats.createText()
    let latAcc = stats.createText()
    let latSpeed = stats.createText()
    let actualTraction = stats.createText()
    let slipAngle = stats.createText()
    let driftCounter = stats.createText()
    let miniTurboCounter = stats.createText()
    stats.createSeparator();
    let nanims = stats.createText()
    pos.setFunc(() => `Position: ${car.position.x.toFixed(2)}, ${car.position.y.toFixed(2)}`);
    moveForce.setFunc(() => `Move Force: ${car.moveForce.x.toFixed(2)}, ${car.moveForce.y.toFixed(2)}`);
    angle.setFunc(() => `Angle: ${degrees(car.angle%PI).toFixed(0)}`);
    acc.setFunc(() => `Acceleration: ${car.acc.toFixed(2)}`);
    latAcc.setFunc(() => `Lateral Acceleration: ${car.latAcc.toFixed(2)}`);
    latSpeed.setFunc(() => `Lateral Speed: ${car.latSpeed.toFixed(2)}`);
    speed.setFunc(() => `Speed: ${car.moveForce.mag().toFixed(2)}`);
    slipAngle.setFunc(() => `Slip Angle: ${(round(degrees(car.slipAngle%PI)))}`);
    driftCounter.setFunc(() => `Drift Counter: ${car.counterDrift.toFixed(2)}`);
    miniTurboCounter.setFunc(() => `Mini Turbo Counter: ${car.miniTurboCounter.toFixed(2)}`);
    nanims.setFunc(() => `Particles: ${animations.length}`);
    actualTraction.setFunc(() => `Actual Traction: ${car.actualTraction.toFixed(2)}`);
    
    stats.createSeparator();
    let pl = stats.createPlot("FPS")
    pl.setFunc(() => frameRate().toFixed(2));
    pl.setMaxMinAbs(60, 0)
    pl.setLimitData(60)
    pl.showValueInTitle = true;

    let nChange = policeOptions.createNumberPicker("Number of Police Cars", 0, 20, 1, nPoliceCars)
    nChange.setFunc((value) => {
        nPoliceCars = value;
        if (policeCars.length < nPoliceCars) {
            for (let i = policeCars.length; i < nPoliceCars; i++) {
                let properties = getRandomPoliceCar();
                let policeCar = new PoliceCar(properties, car);
                policeCar.position.x = car.position.x + randomm(-WIDTH / 2, WIDTH / 2);
                policeCar.position.y = car.position.y + randomm(-HEIGHT / 2, HEIGHT / 2);
                policeCar.angle = car.angle + randomm(-PI, PI);
                policeCars.push(policeCar);
            }
        } else if (policeCars.length > nPoliceCars) {
            policeCars.splice(nPoliceCars, policeCars.length - nPoliceCars);
        }
    });
}

function draw() {
    background(backCol);

    let aux = car.position.y - HEIGHT / 2;
    translate(0, -car.position.y + HEIGHT / 2);
    car.drawSkids(car.skidLeft);
    car.drawSkids(car.skidRight);
    for(let i = 0 ; i < policeCars.length; i++) {
        policeCars[i].drawSkids(policeCars[i].skidLeft);
        policeCars[i].drawSkids(policeCars[i].skidRight);
    }
    manageAnimations();
    car.update();
    car.show();
    for(let i = 0; i < policeCars.length; i++) {
        policeCars[i].update();
        policeCars[i].show();
    }
    

    if (showDebug) car.showDebug();

    translate(0, aux);
    tabs.update();
    tabs.show();
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

