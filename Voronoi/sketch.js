//Voronoi Diagram
//Miguel Rodríguez
//03-09-2024

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = WIDTH

const N = WIDTH
const spacing = WIDTH/N

let grid = []
let points = []
let movingPoint

const Npoints = 15

function setup(){
    createCanvas(WIDTH, HEIGHT)

    for(let i = 0; i < N; i++){
        grid[i] = []
    }
    pixelDensity(1)

    for(let i = 0; i < Npoints; i++) points.push(new Ball())
    movingPoint = new Ball()
    movingPoint.vel = createVector(0, 0)
    points.push(movingPoint)

    noStroke()
}

function mapp(value, start1, stop1, start2, stop2){
    return start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2); 
}

function drawFastRect(x, y, w, h, r, g, b, a = 255) {
    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {

            let index = (4 * ((y + j) * WIDTH + (x + i)));
            
            pixels[index] = r;     
            pixels[index + 1] = g; 
            pixels[index + 2] = b;
            pixels[index + 3] = a; 
        }
    }
}

function draw(){
    background(0)
    movingPoint.x = mouseX
    movingPoint.y = mouseY

    loadPixels();
    for(let i = 0; i < N; i++){
        grid[i] = []
        for(let j = 0; j < N; j++){
            let closestDist = Infinity
            let closestIndex = -1
            let x = i * spacing
            let y = j * spacing
            for(let k = 0; k < points.length; k++){
                let xdif = x - points[k].x;
                let ydif = y - points[k].y;
                let d = Math.sqrt((xdif * xdif) + (ydif * ydif));
                if(d < closestDist){
                    closestDist = d  
                    closestIndex = k
                }
            }
            //fill(mapp(closestIndex, 0, points.length, 0, 360), 70, 100)
            //rect(x, y, spacing, spacing)
            let r = mapp(closestIndex, 0, points.length, 0, 255)
            drawFastRect(x, y, spacing, spacing, r, 180-r, 255-r)
        }
    }
    updatePixels();

    fill(0)
    for(let p of points){ 
        p.update()
        p.edges()
        p.show()
    }
    
}


