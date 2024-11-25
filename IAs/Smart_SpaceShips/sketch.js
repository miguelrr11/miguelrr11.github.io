const { Engine, World, Bodies, Body, Events } = Matter;
const maxSpeed = 15
const maxAngularSpeed = 0.05



let spaceship

function setup(){
    createCanvas(1000, 800)
    spaceship = new Spaceship(width/2, 300, 25, 80);
}

function draw() {
    background(0);
    if(keyIsPressed){
        if(keyCode == RIGHT_ARROW) spaceship.steerRight(0.003);
        if(keyCode == LEFT_ARROW) spaceship.steerLeft(0.003);
        if(keyCode == UP_ARROW) spaceship.addThrust(0.01);
    }
    spaceship.update()
    spaceship.show();
}


/*
speed X
speed Y
angle
distance X
distance Y
*/