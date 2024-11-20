const WIDTH = 600
const HEIGHT = 600
const N = 120
const tamCell = WIDTH/N

const col_sand = "#e6b863"
const col_water = "#576deb"
const col_wood = "#7d4616"

let grid = []
let next_grid = []

let selector


function setup(){
    createCanvas(WIDTH, HEIGHT)
    selector = createSelect()
    selector.option("sand")
    selector.option("water")
    selector.option("wood")
    selector.selected("water")
}

function draw(){
    background(0)
    let waterCount = 0  
    let sandCount = 0
    if(mouseIsPressed){
        let x = floor(mouseX/tamCell)
        let y = floor(mouseY/tamCell)
        if(x < N && y < N){ 
            spawnParticles(selector.selected(), x, y)
        }
    }

    for(let i = N*N-1; i > 0; i--){
        let g = grid[i]
        if(g != undefined){
            if(g.type == 'sand') sandCount++
            if(g.type == 'water') waterCount++
            g.update()
            g.show()
            g.step()
        }
    }
   // console.log(sandCount, waterCount)

    for(let i = 0; i < N*N; i++){ 
        grid[i] = next_grid[i]
    }
    next_grid = []
}

function IX(i, j){
    return i+(N)*j
}

const tamSpawner = 5

function spawnParticles(type, x, y){
    for(let i = x-tamSpawner; i < x+tamSpawner+1; i++){
        for(let j = y-tamSpawner; j < y+tamSpawner+1; j++){
            if(i >= 0 && j >= 0 && i < N && j < N){
                if(keyIsPressed) grid[IX(i, j)] = undefined
                else if(type == "sand") grid[IX(i, j)] = new Sand_Particle(createVector(i, j))
                else if(type == "water") grid[IX(i, j)] = new Water_Particle(createVector(i, j))
                else if(type == "wood") grid[IX(i, j)] = new Wood_Particle(createVector(i, j))
            }
        }
    }
//     if(type == "sand") grid[IX(x, y)] = new Sand_Particle(createVector(x, y))
//     else if(type == "water") grid[IX(x, y)] = new Water_Particle(createVector(x, y))
//     else if(type == "wood") grid[IX(x, y)] = new Wood_Particle(createVector(x, y))
}

function swap(arr, x, y){
    let temp = arr[x];
    arr[x] = arr[y];
    arr[y] = temp;
}

