//Marching Squares
//Miguel Rodríguez
//30-08-2024

const half_spacing = spacing/2

//variables for interpolation
let a, b, c, d, amt

//variables for non-interpolation
let p, q

function initMS(){
    a = createVector()
    b = createVector()
    c = createVector()
    d = createVector()

    p = createVector()
    q = createVector()
}

function drawSegmentInterpolated(a, b){
    line(a.x, a.y, b.x, b.y)
}

function drawLineInterpolated(marchingCase, i, j) {
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

function customLerp(a, b, amt){
    return (1-amt)*a + amt*b
}