//Self-avoiding Walk (with backtracking)
//Miguel Rodríguez
//11-02-2024

const WIDTH = 600
const HEIGHT = 600
const n = 30
const widthN = WIDTH/n
let path = []
let board = []
let tried = []

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(0)
  
  initB()
  
  spot = board[floor(n/2)][floor(n/2)];
  path.push(spot);
  spot.visited = true;
  
}

function initB(){
  for(let i = 0; i < n; i++){
    board[i] = []
    for(let j = 0; j < n; j++){
      board[i][j] = new Spot(i, j)
    }
  }
}


function draw() {
  translate(widthN/2, widthN/2)
  drawPath(0)
  
  let spot = path[path.length-1].chooseNext()
  if(!spot){
    let s = path.pop()
    s.clear()
  }
  else{
    spot.visited = true
    path.push(spot)
  }
  
  if(path.length == n*n){
    drawPath(1)
    console.log("Terminado")
    noLoop()
  }
  
}



function drawPath(n){
  background(0)
  strokeWeight(widthN/4)
  for(i = 0; i < path.length-1; i++){
    if(n == 0) stroke(map(i, 0, path.length-1, 100, 255))
    else stroke(0, 255, 0)
    line(path[i].x, path[i].y, path[i+1].x, path[i+1].y)
  }
  strokeWeight(widthN/2)
  point(path[path.length-1].x, path[path.length-1].y)
}