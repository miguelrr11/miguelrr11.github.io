//Noise Flow Field
//Miguel Rodríguez
//01-09-24

const WIDTH = 2532
const HEIGHT = 1170

const rez = 100
const spacing = WIDTH/rez

let grid = []
let balls = []

let nBalls = 10000

let dragVal = 0.14

let downImageButton

let drawFinalRays

let p

function setup(){
    createCanvas(WIDTH, HEIGHT)
    background(0)
    stroke(255, 100)
    strokeWeight(1.5)
    
    for(let i = 0; i < nBalls; i++){
        balls.push(new Ball(createVector(random(WIDTH), random(HEIGHT))))
    }

    downImageButton = createButton('Save Image')
    downImageButton.mousePressed(download)
    
    drawFinalRays = createCheckbox('Draw final rays')
    drawFinalRays.checked(true)
    p = createP()
    

    for(let i = 0; i < rez; i++){
        grid[i] = []
        for(let j = 0; j < rez; j++){
            let x = i * spacing
            let y = j * spacing
            let v = createVector(x, y, 0)
            let angle
            angle = map(noise(i/12, j/12), 0, 1, -TWO_PI, TWO_PI)
            v.z = angle
            grid[i][j] = v.copy()
        }
    }
}

function download(){
    saveFrames('Noise_Flow_Field', 'png', 1, 1)
}

function draw(){
    if(frameCount == 700 && drawFinalRays.checked()){
        dragVal = 0.05
    }
    if(frameCount == 750 && drawFinalRays.checked()){
        dragVal = 4
    }
    if(frameCount == 900){
        download()
        noLoop()
    }

    stroke(255, 5)
    strokeWeight(0.5)
    for(let b of balls){
        let x = floor(constrain(b.pos.x, 0, WIDTH-1)/spacing)
        let y = floor(constrain(b.pos.y, 0, HEIGHT-1)/spacing)
        b.followField(grid[x][y].z)
        b.applyForce()
        b.update()
        b.edges()
        b.show()
    }

    p.html('Downloading image in ' + round((900 - frameCount)/35, 1) + ' s')
}
