//2048 Game
//Miguel Rodríguez
//16-02-2024

const WIDTH = 400
const HEIGHT = 400
let board = []
let wn = WIDTH/4
let score = 0

let back = [196, 185, 172]
let c2 = [234,225,213]
let c4 = [233,221,194]
let c8 = [231,172,111]
let c16 = [231,145,91]
let c32 = [230,121,86]
let c64 = [228,96,55]
let c128 = [229,203,104]
let c256 = [228,199,87]
let c512 = [227,195,70]
let c1024 = [227,192,55]
let c2048 = [229,189,40]

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(back)
  
  for(let i = 0; i < 4; i++){
    board[i] = []
    for(let j = 0; j < 4; j++){
      board[i][j] = undefined
    }
  }
  
  spawn()
  spawn()
  spawn()
}

function draw() {
  drawBoard()
  drawGrid()
  select('#score').html("Score: " + score);
  
}

function spawn(){
  while(true){
    let i = floor(random(0,4))
    let j = floor(random(0,4))
    if(board[i][j] == undefined){
      let r = random()
      if(r>0.83) board[i][j] = 4
      else board[i][j] = 2
      break
    }
  }
}
  
function calculateScore(){
  score = 0
  for(let i = 0; i < 4; i++){
    for(let j = 0; j < 4; j++){
      if(board[i][j] != undefined) score += board[i][j]
    }
  }
}
  
function checkGameOver(){
   for(let i = 0; i < 4; i++){
    for(let j = 0; j < 4; j++){
      if(board[i][j] == undefined) return true
    }
  }
  textAlign(CENTER, CENTER)
  stroke(129,112,91)
  strokeWeight(3)
  fill(c4)
  textSize(45)
  text("GAME OVER", WIDTH/2, HEIGHT/2)
  noLoop()
  return false
}

function keyPressed(){
  if(checkGameOver()){
    if(keyCode == UP_ARROW) moveUp()
    else if(keyCode == DOWN_ARROW) moveDown()
    else if(keyCode == LEFT_ARROW) moveLeft()
    else if(keyCode == RIGHT_ARROW) moveRight()
    spawn()
    drawBoard()
    drawGrid()
    calculateScore()
  }
  
}
  
function moveLeft(){
  for(let j = 0; j < 4; j++){
    
    let bc = []
    
    for(let i = 0; i<4; i++){
      if(board[i][j] != undefined)  bc.unshift(board[i][j])
    }
    for(let i = 0; i < bc.length; i++){
      if(bc[i] == undefined) continue
      else if(bc[i] == bc[i+1]){
        bc[i] = bc[i] + bc[i+1]
        bc.splice(i+1, 1)
      } 
    }
    bc.reverse()
    let k = 0
    for(let i = 0; i<4; i++){
      board[i][j] = undefined
    }
    for(let i = 0; i<bc.length; i++){
      if(bc[i] == undefined) continue
      else{
        board[k][j] = bc[i]
        k++
      }
    }
  }
}

function moveRight(){
   for(let j = 0; j < 4; j++){
    
    let bc = []
    
    for(let i = 0; i<4; i++){
      if(board[i][j] != undefined) bc.push(board[i][j])
    }
    for(let i = 0; i < bc.length; i++){
      if(bc[i] == undefined) continue
      else if(bc[i] == bc[i+1]){
        bc[i] = bc[i] + bc[i+1]
        bc.splice(i+1, 1)
      } 
    }
    let k = 3
    for(let i = 0; i<4; i++){
      board[i][j] = undefined
    }
    for(let i = bc.length-1; i>=0; i--){
      if(bc[i] == undefined) continue
      else{
        board[k][j] = bc[i]
        k--
      }
    }
  } 
}

function moveDown(){
  for(let j = 0; j < 4; j++){
    let bc = [...board[j]].reverse()
    let b = board[j]
    bc = removeU(bc)

    for(let i = 0; i < bc.length; i++){
      if(bc[i] == bc[i+1]){
        bc[i] = bc[i] + bc[i+1]
        bc.splice(i+1, 1)
      } 
    }
    console.log(bc, b)
    let k = 3
    b = [undefined, undefined, undefined, undefined]
    bc.reverse()
    for(let i = bc.length-1; i>=0; i--){
      if(bc[i] == undefined) continue
      else{ 
        b[k] = (bc[i])
        k--
      }
    }
    board[j] = b
  } 
}

function moveUp(){
  for(let j = 0; j < 4; j++){
    let bc = [...board[j]]
    let b = board[j]
    bc = removeU(bc)
    for(let i = 0; i < bc.length; i++){
      if(bc[i] == bc[i+1]){
        bc[i] = bc[i] + bc[i+1]
        bc.splice(i+1, 1)
      } 
    }
    b = []
    for(let i = 0; i < bc.length; i++){
      if(bc[i] != undefined) b.push(bc[i])
    }
    board[j] = b
  } 
}

function drawBoard(){
  background(back);
  rectMode(CENTER)
  noStroke()
  textAlign(CENTER, CENTER)
  textSize(37)
  for(let i = 0; i < 4; i++){
    for(let j = 0; j < 4; j++){
      if(board[i][j] == 0 || board[i][j] == undefined) continue
      if(board[i][j] == 2) fill(c2)
      else if(board[i][j] == 4) fill(c4)
      else if(board[i][j] == 8) fill(c8)
      else if(board[i][j] == 16) fill(c16)
      else if(board[i][j] == 32) fill(c32)
      else if(board[i][j] == 64) fill(c64)
      else if(board[i][j] == 128) fill(c128)
      else if(board[i][j] == 256) fill(c256)
      else if(board[i][j] == 512) fill(c512)
      else if(board[i][j] == 1024) fill(c1024)
      else if(board[i][j] == 2048) fill(c2048)
      rect(i*wn + wn/2, j*wn + wn/2, wn, wn)
      push()
      fill(129,112,91)
      text(board[i][j], i*wn + wn/2, j*wn + wn/2)
      pop()
    }
  }
}

function drawGrid(){
  strokeWeight(13)
  stroke(166,154,140)
  for (var x = 0; x < width+1; x += wn) {
		for (var y = 0; y < height+1; y += wn) {
			line(x, 0, x, height);
			line(0, y, width, y);
		}
	}
}

function removeU(arr){
  return arr.filter(element => element !== undefined);
}