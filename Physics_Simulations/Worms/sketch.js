//Inverse Kinematics
//Miguel Rodríguez Rodríguez
//30-08-2024

const WIDTH = 1000
const HEIGHT = 1000
const coss = []
const sins = []

let worms = []
let nWorms = 100

let gridA = []
let gridB = []
let new_gridA = []
let new_gridB = []
let N = 50
let spacing = WIDTH/N


let neigh = [[-1, 0], [1, 0], [0, 1], [0, -1], [0, 0]]


function setup(){
    createCanvas(WIDTH, HEIGHT)
    //frameRate(3)
    for(let i = 0; i < nWorms; i++) worms.push(new Worm(random(WIDTH/2), random(HEIGHT), "green"))
    for(let i = 0; i < nWorms; i++) worms.push(new Worm(random(WIDTH/2, WIDTH), random(HEIGHT), "red")) 

    for(let i = 0; i < N; i++){
        gridA[i] = []
        gridB[i] = []
        for(let j = 0; j < N; j++){
            gridA[i][j] = []
            gridB[i][j] = []
        }
    }

    for(let i = 0; i < 6282; i++){
        coss[i] = Math.cos(i/1000)
        sins[i] = Math.sin(i/1000)
    }

}


function draw(){
    background(0)
    //drawGrid()
    for(let i = 0; i < N; i++){
        gridA[i] = []
        gridB[i] = []
        for(let j = 0; j < N; j++){
            gridA[i][j] = []
            gridB[i][j] = []
        }
    }

    for(let w of worms) w.setLineGrid()

    for(let i = 0; i < worms.length; i++){
        let w = worms[i]
        w.update()
        w.show()
        if(w.dead) worms.splice(1, i)
    }
    

    
}


function drawGrid(){
    loadPixels()
    for(let i = 0; i < N; i++){
        for(let j = 0; j < N; j++){
            if(gridA[i][j].length > 0) drawFastRect(i*spacing, j*spacing, spacing, spacing, 0, 100, 0)
            if(gridB[i][j].length > 0) drawFastRect(i*spacing, j*spacing, spacing, spacing, 100, 0, 0)
        }
    }
    updatePixels()
}

function SWAP(x0, x) {
    let temp = x0.slice();  // Copy contents of x0
    x0.length = 0;          // Clear x0
    x0.push(...x);          // Copy contents of x to x0
    x.length = 0;           // Clear x
    x.push(...temp);        // Copy contents of temp (old x0) to x
}