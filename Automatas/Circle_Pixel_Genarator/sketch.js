let grid = []
let N = 50
let spacing = 400/N

let thresh
let rad

let cx = N/2
let cy = N/2
let coords = []

//outerRing: rad = 6, thresh = 1.37
//innerRing: rad = 2, thresh = 1.18


function setup() {
  createCanvas(400, 400);
  for(let i = 0; i < N; i++){
    grid[i] = []
    for(let j = 0; j < N; j++){
      grid[i][j] = 0
    }
  }
  thresh = createSlider(0, 10, 1, 0.01)
  rad = createSlider(1, 20, 5, 1)

  fill(0)
  stroke(255)
}

function setCirclePix(rad){
  
  coords = []
  let k = 0 
  
  let threshVal = thresh.value()
  for(let i = 0; i < N; i++){
    for(let j = 0; j < N; j++){
      let d = dist(i, j, cx, cy)
      grid[i][j] = 0
      if(d > rad-threshVal && d < rad+threshVal){ 
        grid[i][j] = 1
        coords[k] = [i-cx, j-cy] 
        k++
      }
    }
  }
  
}

function draw() {
  background(120);
  
  setCirclePix(rad.value())
  fill(0)

  for(let c of coords){
    rect((c[0]+cx)*spacing, (c[1]+cy)*spacing, spacing, spacing)
  }
  
  fill(255, 0, 0)
  rect(cx * spacing, cy * spacing, spacing, spacing)
}