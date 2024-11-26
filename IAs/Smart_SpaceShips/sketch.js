const { Engine, World, Bodies, Body, Events } = Matter;
const maxSpeed = 15
const maxAngularSpeed = 0.05
const WIDTH = 1000
const HEIGHT = 800

const VER_THRUST_FORCE = 0.01
const HOR_THRUST_FORCE = 0.002

// if(keyCode == RIGHT_ARROW) spaceship.steerRight(0.002);
// if(keyCode == LEFT_ARROW) spaceship.steerLeft(0.002);
// if(keyCode == UP_ARROW) spaceship.addThrust(0.01);

let spaceships = []
let nns
let size = 50
let factor = 1
let indexShowing = 0

function setup(){
    createCanvas(WIDTH+500, HEIGHT)
    init()
}

function init(){
    for(let i = 0; i < size; i++){
        spaceships.push(new Spaceship(WIDTH/2, HEIGHT-30, 20, 80, i))
    }
    nns = new Population(size, 5, 4, 
        (value, bias) => {return constrain(Math.max(value, 0), 0, 1)  }, 
        (value, bias) => {return Math.tanh(value)}, true,
        WIDTH, 50, 1000, 500)
}

function iteration(){
    setInputs()
    updateNNs()
    moveSpaceships()
    updateSpaceships()
}

function setInputs(){
    for(let i = 0; i < size; i++){
        let s = spaceships[i]
        let nn = nns.NNs[i]

        let sx = s.body.velocity.x * 0.1
        let sy = s.body.velocity.y * 0.1
        let angle = s.body.angle / Math.PI
        let dx = (s.body.position.x - s.target.x) / WIDTH
        let dy = (s.body.position.y - s.target.y) / HEIGHT

        nns.setValues([sx, sy, angle, dx, dy], s.id)
    }
}

function updateNNs(){
    nns.update()
}

function moveSpaceships(){
    for(let i = 0; i < size; i++){
        let s = spaceships[i]
        let nn = nns.NNs[s.id]

        let output = nn.getOutputIndex()
        s.move(output)
    }
}

function updateSpaceships(){
    for (let s of spaceships) {
        s.engine.timeScale = 1 / factor
        Engine.update(s.engine, deltaTime * s.engine.timeScale)
    }
}

function mouseClicked(){
    indexShowing++
    indexShowing = indexShowing % size
}


function draw() {
    background(20);

    iteration()

    push()
    nns.update()
    nns.NNs[indexShowing].show()
    pop()

    push()
    spaceships[indexShowing].checkTarget()
    spaceships[indexShowing].show()
    pop()

}


/*
speed X
speed Y
angle
distance X
distance Y
*/