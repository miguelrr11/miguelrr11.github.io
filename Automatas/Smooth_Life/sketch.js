//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600
const rows = 100
const cols = 100
const tamCell = WIDTH / rows
let grid = []
let next_grid = []

let ra = 15
let alpha_n = 0.028
let alpha_m = 0.147
let b1 = 0.278
let b2 = 0.365
let d1 = 0.267
let d2 = 0.445
let dt = 0.05

function randGrid(){
    let w = Math.round(cols/2);
    let h = Math.round(rows/2);
    for (let dy = 0; dy < h; ++dy) {
        for (let dx = 0; dx < w; ++dx) {
            let x = Math.round(dx + cols/2 - w/2)
            let y = Math.round(dy + rows/2 - h/2)
            grid[y][x] = Math.random()
        }
    }
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    for(let i = 0; i < rows; i++){
        grid[i] = []
        next_grid[i] = []
        for(let j = 0; j < cols; j++){
            grid[i][j] = 0
            next_grid[i][j] = 0
        }
    }
    noStroke()
    randGrid()
}

function sigma(x, a, alpha)
{
    return 1.0/(1.0 + Math.exp(-(x - a)*4/alpha))
}

function sigma_n(x, a, b)
{
    return sigma(x, a, alpha_n)*(1 - sigma(x, b, alpha_n))
}

function sigma_m(x, y, m)
{
    return x*(1 - sigma(m, 0.5, alpha_m)) + y*sigma(m, 0.5, alpha_m)
}

function s(n, m)
{
    return sigma_n(n, sigma_m(b1, d1, m), sigma_m(b2, d2, m));
}

function compute_grid_diff(){
    for (let cy = 0; cy < rows; ++cy) {
        for (let cx = 0; cx < cols; ++cx) {
            let m = 0, M = 0;
            let n = 0, N = 0;
            let ri = ra/3;

            for (let dy = -(ra - 1); dy <= (ra - 1); ++dy) {
                for (let dx = -(ra - 1); dx <= (ra - 1); ++dx) {
                    let x = emod(cx + dx, cols);
                    let y = emod(cy + dy, rows);
                    if (dx*dx + dy*dy <= ri*ri) {
                        m += grid[y][x];
                        M += 1;
                    } 
                    else if (dx*dx + dy*dy <= ra*ra) {
                        n += grid[y][x];
                        N += 1;
                    }
                }
            }
            m /= M;
            n /= N;
            let q = s(n, m);
            next_grid[cy][cx] = 2*q - 1;
        }
    }
}

function apply_grid_diff(){
    for (let y = 0; y < cols; ++y) {
        for (let x = 0; x < rows; ++x) {
            grid[y][x] += dt*next_grid[y][x];
            grid[y][x] = clamp(grid[y][x], 0, 1);
        }
    }
}


function draw(){
    background(0)

    compute_grid_diff()
    apply_grid_diff()
    drawGrid(grid)
}

function drawGrid(gr){
    for(let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++){
            fill(mapp(gr[i][j], 0, 1, 0, 255))
            rect(i * tamCell, j * tamCell, tamCell, tamCell)
        }
    }
}

function emod(a, b){
    return (a%b + b)%b
}

function clamp(val, min, max){
    return Math.max(Math.min(val, max), min)
}