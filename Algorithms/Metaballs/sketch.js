//Metaballs with Marching Squares
//Miguel Rodríguez
//02-09-2024

const WIDTH = 550
const HEIGHT = 550

let balls = []
let movingBall

let grid = []
let N = 110
let spacing = WIDTH/N
let threshVal = 65

let showBallsCheck
let threshSlider

function setup(){
    createCanvas(WIDTH, HEIGHT);
    colorMode(HSB);
    movingBall = new Ball()
    movingBall.vel = createVector(0, 0)
    balls.push(new Ball(), new Ball(), new Ball(), new Ball(), new Ball(), new Ball(), movingBall)

    noStroke()

    for(let i = 0; i < N; i++){
        grid[i] = []
        for(let j = 0; j < N; j++) grid[i][j] = 0
    }

    initMS()

    showBallsCheck = createCheckbox('Show Balls')
    showBallsCheck.checked(false)

    threshSlider = createSlider(0, 200, 100, 1)
}

function draw(){
    background(0)

    threshVal = threshSlider.value()    
    let showBalls = showBallsCheck.checked()

    movingBall.set(mouseX, mouseY)

    noStroke()
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            let sum = 0;
            let x = i * spacing
            let y = j * spacing

            for (let k = 0; k < balls.length; k++) {
                let xdif = x - balls[k].x;
                let ydif = y - balls[k].y;
                let d = sqrt((xdif * xdif) + (ydif * ydif));
                sum += 8 * balls[k].rad / d;
            }

            grid[i][j] = sum
            if(showBalls) {fill(sum); rect(x, y, spacing, spacing)}
        }
    }

        translate(spacing/2, spacing/2)
        if(showBalls) stroke(0, 255, 255);
        else stroke(160, 255, 255);
        strokeWeight(2);

        for(let i = 0; i < N-1; i++){
            for(let j = 0; j < N-1; j++){
                let marchingCase = evaluate(i, j, threshVal)
                drawLineInterpolated(marchingCase, i, j)
            }
        }

    for(let b of balls){
        b.update()
        b.edges()
        //b.show()
    }

}


function IX(i, j){
    return i+(WIDTH)*j
}





