//Lineas Topográficas (Marching Squares + Perlin Noise)
//Miguel Rodríguez
//30-08-2024

const WIDTH = 1000
const HEIGHT = 800

const N = 150
const spacing = WIDTH/N
const half_spacing = spacing/2
let grid = []

let interCheck

//variables for interpolation
let a, b, c, d, amt

//variables for non-interpolation
let p, q


function setup(){
    createCanvas(WIDTH, HEIGHT, P2D)
    for(let i = 0; i < N; i++){
        grid[i] = []
        for(let j = 0; j < N; j++){ 
            let x = (i - (WIDTH/2)/10)/35
            let y = (j - (HEIGHT/2)/10)/35
            grid[i][j] = noise(x+2000, y-1000, frameCount)
        }
    }
    a = createVector()
    b = createVector()
    c = createVector()
    d = createVector()

    p = createVector()
    q = createVector()
}


function draw(){
    tamval = 200

    let z = frameCount/1500
    for(let i = 0; i < N; i++){
        for(let j = 0; j < N; j++){ 
            let x = i/tamval
            let y = j/tamval
            grid[i][j] = noise(x+2000, y-1000, z)
        }
    }
    
    //drawRects()
    background("#f4f1de")
    
    translate(spacing/2, spacing/2)
    
    for(let k = 0; k < 1; k += 0.0155){
        let kk = round(k, 3)
        let kkk = kk.toFixed(2)
        if(kk == kkk){
            stroke("#CEB7A7");
            strokeWeight(2);
        }
        else{
            stroke("#D8C6B5");
            strokeWeight(1);
        }
        for(let i = 0; i < N-1; i++){
            for(let j = 0; j < N-1; j++){
                let marchingCase = evaluate(i, j, k)
                drawLineInterpolated(marchingCase, i, j, k)
            }
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

function drawLineInterpolated(marchingCase, i, j, threshVal) {
    let rez = spacing;
    
    let x = i * rez;
    let y = j * rez;

    let a_val = grid[i][j]
    let b_val = grid[i + 1][j]
    let c_val = grid[i + 1][j + 1]
    let d_val = grid[i][j + 1]

    amt = (threshVal - a_val) / (b_val - a_val);
    a.x = customLerp(x, x + rez, amt);
    a.y = y;


    amt = (threshVal - b_val) / (c_val - b_val);
    b.x = x + rez;
    b.y = customLerp(y, y + rez, amt);

    amt = (threshVal - d_val) / (c_val - d_val);
    c.x = customLerp(x, x + rez, amt);
    c.y = y + rez;

    amt = (threshVal - a_val) / (d_val - a_val);
    d.x = x;
    d.y = customLerp(y, y + rez, amt);

    

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



function evaluate(i, j, threshold){
    let a = grid[i][j] > threshold ? 1 : 0
    let b = grid[i+1][j] > threshold ? 1 : 0
    let c = grid[i+1][j+1] > threshold ? 1 : 0
    let d = grid[i][j+1] > threshold ? 1 : 0
    return a*8 + b*4 + c*2 + d*1
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

function customLerp(a, b, amt){
    return (1-amt)*a + amt*b
}