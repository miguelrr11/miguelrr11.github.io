//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 1200
const HEIGHT = 700

let car
let ice = {
    pos: {x: WIDTH / 2, y: HEIGHT / 2 },
    rad: 150,
}

function setup(){
    createCanvas(WIDTH, HEIGHT, WEBGL)
    car = new Car()
    frameRate(30);
}

function draw() {
    background(120, 200, 255);
    lights()

    // simple flat ground
    push();
    rotateZ(-PI/2);
    noStroke();
    ambientMaterial(100, 255, 100);
    plane(2000, 2000);
    pop();

    
    car.update();
    car.show();
}

