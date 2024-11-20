//Reaction Diffusion
//Miguel Rodríguez
//15-02-2024

const WIDTH = 200
const HEIGHT = 200

let grid = []
let nextGrid = []
let lapValues

let dt = 1
let da = 1
let db = 0.5
//cambiar f y k para variar patrones (default: feed=0.055 kill=0.062)
//let feed = 0.03504
//let kill = 0.06390

let feed = 0.055
let kill = 0.062

//let feed = 0.04702
//let kill = 0.06004

//let feed = 0.05
//let kill = 0.06434

function setup() {
  createCanvas(WIDTH, HEIGHT);
  pixelDensity(1)
  lapValues = {a: 0, b: 0}
  background(255)
  
  for(let i = 0; i < WIDTH; i++){
    grid[i] = []
    nextGrid[i] = []
    for(let j = 0; j < HEIGHT; j++){
      grid[i][j] = {a: 1.0, b: 0.0}
      nextGrid[i][j] = {a: 1.0, b: 0.0}
    }
  }
  
  for(let i = 90; i < 100; i++){
    for(let j = 90; j < 100; j++){
      grid[i][j].b = 1.0
    }
  }
  
  
  
}

function laplace(i, j){
  lapValues = {a: 0, b: 0}
  for(let x = -1; x < 2; x++){
    for(let y = -1; y < 2; y++){
      if(x == 0 && y == 0){
        lapValues.a += grid[i + x][j + y].a * -1
        lapValues.b += grid[i + x][j + y].b * -1
      }
      else if(x == 0 || y == 0){
        lapValues.a += grid[i + x][j + y].a * 0.2      
        lapValues.b += grid[i + x][j + y].b * 0.2
      }
      else{
        lapValues.a += grid[i + x][j + y].a * 0.05
        lapValues.b += grid[i + x][j + y].b * 0.05
      }
    }
  }
}

function draw() {
  
  
  for(let i = 1; i < WIDTH-1; i++){
    for(let j = 1; j < HEIGHT-1; j++){
      laplace(i, j)
      let a = grid[i][j].a
      let b = grid[i][j].b
      nextGrid[i][j].a = a +
        (da * lapValues.a) -
        (a * b * b) +
        (feed * (1 - a));
      nextGrid[i][j].b = b +
        (db * lapValues.b) +
        (a * b * b) -
        ((kill + feed) * b);
      nextGrid[i][j].a = constrain(nextGrid[i][j].a, 0, 1)
      nextGrid[i][j].b = constrain(nextGrid[i][j].b, 0, 1)
    }
  }
  
  
  loadPixels()
  for (var x = 0; x < WIDTH; x++) {
    for (var y = 0; y < HEIGHT; y++) {
      var pix = (x + y * WIDTH) * 4;
      var a = nextGrid[x][y].a;
      var b = nextGrid[x][y].b;
      var c = floor((a - b) * 255);
      c = constrain(c, 0, 255);
      pixels[pix + 0] = c;
      pixels[pix + 1] = c;
      pixels[pix + 2] = c;
      pixels[pix + 3] = 255;
    }
  }
  updatePixels()
  
  let tmp = grid
  grid = nextGrid
  nextGrid = tmp
  

}