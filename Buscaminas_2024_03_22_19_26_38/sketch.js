//Buscaminas
//Miguel Rodríguez
//17-02-2024

const WIDTH = 540
const HEIGHT = 540
const n = 15
let minasTot
const wn = WIDTH / n

let board = []
let deltaX = [1, -1, 0, 0]
let deltaY = [0, 0, 1, -1]
let won = false

let colours = [[0, 0, 255],
              [42, 115, 0],
              [200, 0, 0],
              [200, 200, 0],
              [200, 0, 200],
              [0, 200, 200],
              0, 0]
    

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(191, 191, 191)
  
  if(n == 9) minasTot = 10
  else if(n == 15) minasTot = 40
  
  for(let i = 0; i < n; i++){
    board[i] = []
    for(let j = 0; j < n; j++){
      board[i][j] = {nminas: 0, oculta: true, mina: false, visited: false, flag: false}
    }
  }
  
  for(let i = 0; i < minasTot; i++){
    let x = floor(random(0, n))
    let y = floor(random(0, n))
    board[x][y].mina = true
  }
  
  for(let i = 0; i < n; i++){
    for(let j = 0; j < n; j++){
      if(board[i][j].mina) continue
      else board[i][j].nminas = minasVecinas(i, j)
    }
  }
  drawNminas()
  drawGrid()
  
  
}


function minasVecinas(x, y){
  let res = 0
  for(let i = -1; i < 2; i++){
    for(let j = -1; j < 2; j++){
      if((i+x < 0 || j+y < 0)) continue
      if((i+x > n-1 || j+y > n-1)) continue
      if((i == 0 && j == 0)) continue
      else{ 
        if(board[x+i][y+j].mina) res++
      }
    }
  }
  return res
}

function updateOcult(x, y){
  for(let i = -1; i < 2; i++){
    for(let j = -1; j < 2; j++){
      if((i+x < 0 || j+y < 0)) continue
      if((i+x > n-1 || j+y > n-1)) continue
      if((i == 0 && j == 0)) continue
      else if(board[x+i][y+j].niminas != 0){ 
        board[x+i][y+j].oculta = false
      }
    }
  }
}



function draw() {
  
}

function drawNminas(){
  background(191, 191, 191)
  textAlign(CENTER, CENTER)
  textSize(35)
  fill(0)
  for(let i = 0; i < n; i++){
    for(let j = 0; j < n; j++){
      if(board[i][j].oculta && !board[i][j].flag) continue
      if(board[i][j].mina){
        if(won) fill(0, 255, 0)
        else fill(225, 0, 0)
        circle(i*wn + wn/2, j*wn + wn/2, wn/2)
      }
      else {
        fill(225, 225, 225)
        rect(i*wn, j*wn, wn, wn)
        if(board[i][j].nminas != 0){
          fill(colours[board[i][j].nminas-1])
          text(board[i][j].nminas, i*wn + wn/2, j*wn + wn/2)
        }
      }
    }
  }
}

function drawGrid(){
  
  strokeWeight(3)
  stroke(117,117,117)
  for (var x = 0; x < width+1; x += wn) {
		for (var y = 0; y < height+1; y += wn) {
			line(x, 0, x, height);
			line(0, y, width, y);
		}
	}
  noStroke()
}

function isValid(row, col){
  if(row < 0 || row >= n) return false
  if(col < 0 || col >= n) return false
  if(board[row][col].nminas != 0 || board[row][col].visited) return false
  return true
}

//flood fill algorithm (BDS)
function ff(current){
  board[current.x][current.y].visited = true
  board[current.x][current.y].oculta = false
  updateOcult(current.x, current.y)
  for(let a = 0; a < 4; a++){
    let nextRow = current.x + deltaX[a]
    let nextCol = current.y + deltaY[a]
    if(this.isValid(nextRow, nextCol)){
      ff(createVector(nextRow, nextCol))
    }
  }
}

function mouseClicked() {
  let x = floor(mouseX/(WIDTH/n));
  let y = floor(mouseY/(WIDTH/n));
  if(x < 0 || x > n-1 || y < 0 || y > n-1){}
  else if(mouseButton == LEFT){
    if(board[x][y].mina) gameOver()
    else if(board[x][y].oculta){
      if(board[x][y].nminas != 0) board[x][y].oculta = false
      else ff(createVector(x, y))
      gameWin()
    }
  }
  drawNminas()
  drawGrid()
}

function gameWin(){
  for(let i = 0; i < n; i++){
    for(let j = 0; j < n; j++){
      if(board[i][j].oculta && !board[i][j].mina) return
    }
  }
  won = true
  gameOver()
}

function gameOver(){
  for(let i = 0; i < n; i++){
    for(let j = 0; j < n; j++){
      board[i][j].oculta = false
    }
  }
}
