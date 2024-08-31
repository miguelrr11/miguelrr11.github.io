//Marching Squares (Interpolated)
//Miguel Rodríguez
//30-08-2024

const WIDTH = 1000
const HEIGHT = 800

const N = 100
const spacing = WIDTH/N
let grid = []

let noiseSlider
let oldSlider = 10

let interCheck


function setup(){
    createCanvas(WIDTH, HEIGHT, P2D)
    for(let i = 0; i < N; i++){
        grid[i] = []
        for(let j = 0; j < N; j++){ 
            let x = (i - (WIDTH/2)/10)/oldSlider
            let y = (j - (HEIGHT/2)/10)/oldSlider
            grid[i][j] = noise(x+2000, y-1000, frameCount)
        }
    }

    noiseSlider = createSlider(1, 50, 35, 0.5)
    interCheck = createCheckbox("Interpolation")
    interCheck.checked(true)
}

function mouseDragged(){
    let tamSpawner = 5
    let x = floor(mouseX/spacing)
    let y = floor(mouseY/spacing)
    for(let i = x-tamSpawner; i < x+tamSpawner+1; i++){
        for(let j = y-tamSpawner; j < y+tamSpawner+1; j++){
            if(i >= 0 && j >= 0 && i < N && j < N){
                if(!keyIsPressed){
                    grid[i][j] += random(0.03, 0.1)
                    grid[i][j] = constrain(grid[i][j], 0, 1)
                }
                else{
                    grid[i][j] -= random(0.03, 0.1)
                    grid[i][j] = constrain(grid[i][j], 0, 1)
                }
            }
        }
    }
}



function draw(){
    oldSlider = noiseSlider.value()

    for(let i = 0; i < N; i++){
        for(let j = 0; j < N; j++){ 
            let x = (i - mouseX/2)/oldSlider
            let y = (j - mouseY/2)/oldSlider
            grid[i][j] = noise(x+2000, y-1000, frameCount/150)
        }
    }
    
    drawRects()
    
    translate(spacing/2, spacing/2)
    let inter = interCheck.checked()
    for(let i = 0; i < N-1; i++){
        for(let j = 0; j < N-1; j++){
            let marchingCase = evaluate(i, j)
            if(!inter) drawLine(marchingCase, i, j)
            else drawLineInterpolated(marchingCase, i, j)
        }
    }
}

function drawGrid(){
    strokeWeight(2)
    stroke(200)
    for (var x = 0; x < spacing*(N); x += spacing) {
        for (var y = 0; y < spacing*(N); y += spacing) {
            line(x, 0, x, height-spacing);
            line(0, y, width-spacing, y);
        }
    }
}



function drawSegmentInterpolated(a, b){
    line(a.x, a.y, b.x, b.y)
}

function drawLineInterpolated(marchingCase, i, j) {
    let rez = spacing;
    
    let x = i * rez;
    let y = j * rez;

    // interpolation

    let a_val = round(grid[i][j], 20);
    let b_val = round(grid[i + 1][j], 20);
    let c_val = round(grid[i + 1][j + 1], 20);
    let d_val = round(grid[i][j + 1], 20);

    let a = createVector();
    let amt = (0.5 - a_val) / (b_val - a_val);
    a.x = lerp(x, x + rez, amt);
    a.y = y;


    let b = createVector();
    amt = (0.5 - b_val) / (c_val - b_val);
    b.x = x + rez;
    b.y = lerp(y, y + rez, amt);

    let c = createVector();
    amt = (0.5 - d_val) / (c_val - d_val);
    c.x = lerp(x, x + rez, amt);
    c.y = y + rez;

    let d = createVector();
    amt = (0.5 - a_val) / (d_val - a_val);
    d.x = x;
    d.y = lerp(y, y + rez, amt);

    stroke(255);
    strokeWeight(2);

    switch (marchingCase) {
        case 1: 
            drawSegmentInterpolated(c, d);
            break;
        case 2:
            drawSegmentInterpolated(b, c);
            break;
        case 3:
            drawSegmentInterpolated(b, d);
            break;
        case 4:
            drawSegmentInterpolated(a, b);
            break;
        case 5:
            drawSegmentInterpolated(a, d);
            drawSegmentInterpolated(b, c);
            break;
        case 6:
            drawSegmentInterpolated(a, c);
            break;
        case 7:
            drawSegmentInterpolated(a, d);
            break;
        case 8:
            drawSegmentInterpolated(a, d);
            break;
        case 9:
            drawSegmentInterpolated(a, c);
            break;
        case 10:
            drawSegmentInterpolated(a, b);
            drawSegmentInterpolated(c, d);
            break;
        case 11:
            drawSegmentInterpolated(a, b);
            break;
        case 12:
            drawSegmentInterpolated(b, d);
            break;
        case 13:
            drawSegmentInterpolated(b, c);
            break;
        case 14:
            drawSegmentInterpolated(c, d);
            break;
    }
}

function drawSegment(i, j, from, to){
    push()
    translate(i*spacing, j*spacing)
    let a, b
    if(from == "w") a = createVector(0, spacing/2)
    else if(from == "n") a = createVector(spacing/2, 0)
    else if(from == "e") a = createVector(spacing, spacing/2)
    else if(from == "s") a = createVector(spacing/2, spacing)

    if(to == "w") b = createVector(0, spacing/2)
    else if(to == "n") b = createVector(spacing/2, 0)
    else if(to == "e") b = createVector(spacing, spacing/2)
    else if(to == "s") b = createVector(spacing/2, spacing)

    line(a.x, a.y, b.x, b.y)
    pop()
}

function drawLine(marchingCase, i, j){
    stroke(255)
    strokeWeight(1.5)
    switch(marchingCase) {
        case 0:
            break;
        case 1:
            drawSegment(i, j, 'w', 's')
            break;
        case 2:
            drawSegment(i, j, 's', 'e')
            break;
        case 3:
            drawSegment(i, j, 'e', 'w')
            break;
        case 4:
            drawSegment(i, j, 'n', 'e')
            break;
        case 5:
            drawSegment(i, j, 'w', 'n')
            drawSegment(i, j, 's', 'e')
            break;
        case 6:
            drawSegment(i, j, 'n', 's')
            break;
        case 7:
            drawSegment(i, j, 'w', 'n')
            break;
        case 8:
            drawSegment(i, j, 'w', 'n')
            break;
        case 9:
            drawSegment(i, j, 'n', 's')
            break;
        case 10:
            drawSegment(i, j, 'n', 'e')
            drawSegment(i, j, 'w', 's')
            break;
        case 11:
            drawSegment(i, j, 'n', 'e')
            break;
        case 12:
            drawSegment(i, j, 'w', 'e')
            break;
        case 13:
            drawSegment(i, j, 'e', 's')
            break;
        case 14:
            drawSegment(i, j, 'w', 's')
            break;
        case 15:
            break;
        default: return
    }
}

function evaluate(i, j){
    let b = Math.round(grid[i+1][j])
    let c = Math.round(grid[i+1][j+1])
    let d = Math.round(grid[i][j+1])
    let a = Math.round(grid[i][j])
    let comb = `${a}${b}${c}${d}`
    return parseInt(comb, 2)
}

function drawRects(){
    noStroke()
    for(let i = 0; i < N; i++){
        for(let j = 0; j < N; j++){
            fill(grid[i][j]*255, 0, 255-grid[i][j]*255)
            rect(i*spacing, j*spacing, spacing, spacing)
        }
    }
}

function drawPoints(){
    push()
    strokeWeight(spacing/3)
    for(let i = 0; i < N; i++){
        for(let j = 0; j < N; j++){
            stroke(grid[i][j]*255)
            point(i*spacing, j*spacing)
        }
    }
    pop()
}
