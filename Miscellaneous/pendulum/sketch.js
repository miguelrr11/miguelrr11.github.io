// Implement a sliding pendulum using Matter.js with p5.js for rendering

// Matter.js module aliases
const { Engine, Runner, World, Bodies, Body, Constraint, Events } = Matter;

let engine;
let world;
let pendulum
let WIDTH = 1300
let HEIGHT = 700
let dark_brown = 0

// Boundary variables for p1 movement
let a = 100;
let b = 700;
let rod_length = 160
let speed

function setup() {
    createCanvas(WIDTH, HEIGHT);
    engine = Engine.create();
    world = engine.world;

    // Create multiple pendulums
    pendulum = new Pendulum()

    Runner.run(engine);
    speed = 0.0004465227205858983
}



function draw() {
    background(50);

    //if(mouseIsPressed) Body.setPosition(pendulum.p2, { x: mouseX, y: pendulum.p2.position.y });

    // Move pendulums along the x-axis using arrow keys with boundary constraints
    if (keyIsDown(LEFT_ARROW)) {
        pendulum.move(speed);
    }
    if (keyIsDown(RIGHT_ARROW)) {
        pendulum.move(-speed);
    }

    // Update and show all pendulums
    Engine.update(pendulum.engine);
       pendulum.show();

    // let ang = Math.atan2(pendulum.p2.position.y - pendulum.p1.position.y, pendulum.p2.position.x - pendulum.p1.position.x) + TWO_PI
    let angle = -Math.atan2(pendulum.p2.position.y - pendulum.p1.position.y, pendulum.p2.position.x - pendulum.p1.position.x) % TWO_PI;
    if (angle < 0) angle += TWO_PI;

    console.log(round(angle, 2))

    let vel = pendulum.getAngularVel()
    //console.log(pendulums[0].getAngularVel())

    fill(map(abs(vel), 0, 8, 0, 255))
    ellipse(0, 0, 50, 50)
}
