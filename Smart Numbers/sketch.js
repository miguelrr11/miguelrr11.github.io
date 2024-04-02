const WIDTH = 600
const HEIGHT = 600
const nCells = 30
const tamCells = WIDTH/nCells
let board = []

function setup(){
  createCanvas(WIDTH, HEIGHT)
  background(0)
  for(let i = 0; i < nCells; i++){
    board[i] = []
    for(let j = 0; j < nCells; j++){
      board[i][j] = 0
    }
  }
}

function mouseDragged(){
  let x = floor(mouseX/(WIDTH/nCells))
  let y = floor(mouseY/(HEIGHT/nCells))
  if(x >= 0 && x < nCells && y >= 0 && y < nCells) board[x][y] = 1
}


function draw(){
  background(0)
  drawBoard()
}

function drawBoard(){
  fill(255)
  for(let i = 0; i < nCells; i++){
    for(let j = 0; j < nCells; j++){
      if(board[i][j] == 1) rect(i*tamCells, j*tamCells, tamCells, tamCells)
    }
  }
}