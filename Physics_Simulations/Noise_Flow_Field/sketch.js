//Noise Flow Field
//Miguel Rodríguez
//01-09-24

const WIDTH = 600
const HEIGHT = 600

const rez = 50
const spacing = WIDTH/rez

let grid = []
let balls = []

let nBalls = 2000

let vizPaths 
let vizPathsBool

let movingZ
let movingZbool

let dragSlider

let downImageButton

function setup(){
    strokeCap(PROJECT)
    createCanvas(WIDTH, HEIGHT)
    background(0)
    stroke(255, 100)
    strokeWeight(1.5)
    
    for(let i = 0; i < nBalls; i++){
        balls.push(new Ball(createVector(random(WIDTH), random(HEIGHT))))
    }

    vizPaths = createCheckbox('Visualize Paths')
    vizPaths.checked(true)

    movingZ = createCheckbox('Dynamic Field')
    movingZ.checked(false)

    dragSlider = createSlider(0, 2, 0.25, 0.01)

    downImageButton = createButton('Save Image')
    downImageButton.mousePressed(download)

    p = createP()
}

function download(){
    saveFrames('Noise_Flow_Field', 'png', 1, 1)
}

function draw(){
    if(vizPathsBool != vizPaths.checked()){ 
        background(0)
        balls = []
        for(let i = 0; i < nBalls; i++){
            balls.push(new Ball(createVector(random(WIDTH), random(HEIGHT))))
        }
    }
    vizPathsBool = vizPaths.checked()
    movingZbool = movingZ.checked()
    if(!vizPathsBool) background(0)
    translate(spacing/2, spacing/2)
    stroke(255, 100)
    strokeWeight(1)
    for(let i = 0; i < rez; i++){
        grid[i] = []
        for(let j = 0; j < rez; j++){
            let x = i * spacing
            let y = j * spacing
            let v = createVector(x, y, 0)
            let angle
            if(!movingZbool) angle = map(noise(i/12, j/12), 0, 1, -TWO_PI, TWO_PI)
            else angle = map(noise(i/12, j/12, frameCount/200), 0, 1, -TWO_PI, TWO_PI)
            v.z = angle
            grid[i][j] = v.copy()
            if(!vizPathsBool) line(v.x, v.y, spacing*cos(v.z)+v.x, spacing*sin(v.z)+v.y)
        }
    }

    if(!vizPathsBool) fill(255)
    else{ 
        stroke(255, 10)
        strokeWeight(0.5)
    }
    translate(-spacing/2, -spacing/2)
    for(let b of balls){
        let x = floor(constrain(b.pos.x, 0, WIDTH-1)/spacing)
        let y = floor(constrain(b.pos.y, 0, HEIGHT-1)/spacing)
        b.followField(grid[x][y].z)
        b.applyForce()
        b.update()
        b.edges()
        b.show()
    }
}
