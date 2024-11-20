//Flow Free Game
//Arrastrar desde nodo inicial para crear el camino
//Hacer click en el camino para acortarlo
//Miguel Rodríguez
//14-03-2024

const WIDTH = 400
const HEIGHT = 400
let tam_board
let tam_cell 
let board = []
let cur
let flows = []
let bool = false
let levels = []

function loadLevel(){
  
}


function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(0);
  
  let l = [[1, 0, 2, 0, 3],
          [0, 0, 4, 0, 5],
          [0, 0, 0, 0, 0],
          [0, -2, 0, -3, 0],
          [0, -1, -4, -5, 0]]
  
  levels.push(l)
  
      l = [[1, 0, 0, 0, 0],
           [0, 0, 0, 0, 0],
           [0, 0, 2, 0, 0],
           [3, -2, 4, 0, -1],
           [-4, 0, 0, 0, -3]]
  
  levels.push(l)
  
  l = [[0, 1, 2, 3, 0],
      [0, 0, 0, 4, 0],
      [0, 0, -4, 0, 0],
      [-1, 0, 0, 5, 0],
      [-2, 0, -5, -3, 0]]
  
  levels.push(l)
  
  l = [[0, 0, 0, 0, 0, 0, 0],
       [0, 0, 0, 0, 0, 1, 0],
       [2, -1, 3, -2, 0, 0, 0],
       [4, 5, 0, 0, 0, 0, 6],
       [0, 0, 0, -6, 0, 0, 0],
       [0, 0, 0, 0, 0, 7, 0],
       [-4, -5, -7, 0, 0, 0, -3]]
  
  levels.push(l)
  
  loadLevel()
  
}

function loadLevel(){
  
  flows = []
  bool = false
  cur = undefined
  
  let level = levels.shift()
  if(level == undefined) return
  
  tam_board = level.length
  tam_cell = WIDTH/tam_board
  console.log(tam_board)
  
  for(let i = 0; i < tam_board; i++){
    board[i] = []
    for(let j = 0; j < tam_board; j++){
      board[i][j] = undefined
    }
  }
  
 
  
  for(let i = 0; i < level.length; i++){
    for(let j = 0; j < level.length; j++){
      if(level[j][i] != 0){
        board[i][j] = new cell(i, j, floor(map(abs(level[j][i]), 1, 8, 0, 360)))
        if(level[j][i] > 0){
          board[i][j].isStart = true
          board[i][j].isEnd = true
        }
        else board[i][j].isGoal = true
        let aux = findEnd(board[i][j])
        if(aux != undefined){
          flows[aux].goal = board[i][j]
        }
        else{
          let f = new flow(board[i][j])
          flows.push(f)
        }
      }
    }
  }
  
  drawGrid()
  drawBoard()
}

function findEnd(b){
  for(let i = 0; i < flows.length; i++){
    if(flows[i].end.col == b.col) return i
  }
  return undefined
}

//!f.fin || b.isStart

function acortarFlow(x, y){
  let i = floor(x/(WIDTH/tam_board));
  let j = floor(y/(WIDTH/tam_board));
  let b = board[i][j]
  if(b != undefined) console.log( flows[findEnd(b)])
  if(i<tam_board && j < tam_board && b != undefined && !b.isEnd && !b.isGoal){
    let f = flows[findEnd(b)]
    if(true){
      let p = f.end
      while(!(p.i == b.i && p.j == b.j)){
        let tmp = p
        p = p.prev
        if(tmp.e) p.w = false
        if(tmp.w) p.e = false
        if(tmp.n) p.s = false
        if(tmp.s) p.n = false
        board[tmp.i][tmp.j] = undefined
      }
      p.isEnd = true
      f = flows[findEnd(b)]
      f.goal.allFalse()
      f.end = board[i][j]
      f.fin = false
    }
    
  }
  
}


function mouseClicked(){
  acortarFlow(mouseX, mouseY)
}


function mouseDragged(){
  let i = floor(mouseX/(WIDTH/tam_board));
  let j = floor(mouseY/(WIDTH/tam_board));
  let b = board[i][j]
  
  if(i<tam_board && j<tam_board && i>=0 && j>=0 &&(bool || b != undefined)){
    if(!bool && b != undefined && b.isEnd){ 
      console.log("1")
      bool = true
      cur = b
    }
    else if(b != undefined && b.col != cur.col && !b.isEnd && !b.isGoal){ 
      console.log("2")
      acortarFlow(b.prev.i*tam_cell, b.prev.j*tam_cell)
    }
    else if(b != undefined && b.col != cur.col && !b.isEnd && b.isGoal){ 
      console.log("3")
      bool = false
    }
    else if(bool && b != undefined && b.col == cur.col && b.isGoal){ 
      console.log("4")
      if(!flows[findEnd(b)].fin){
        console.log("pq")
        b.isEnd = true
        b.prev = cur
        cur.isEnd = false
        if(i < cur.i) {
          board[i][j].e = true
          cur.w = true
        }
        if(i > cur.i) {
          board[i][j].w = true
          cur.e = true
        }
        if(j < cur.j) {
          board[i][j].s = true
          cur.n = true
        }
        if(j > cur.j) {
          board[i][j].n = true
          cur.s = true
        }
        flows[findEnd(cur)].fin = true
      }
      
    }
    else if(b == undefined && dist(i, j, cur.i, cur.j) <= 1){
      console.log("5")
      board[i][j] = new cell(i, j, cur.col)
      board[i][j].isEnd = true
      board[i][j].prev = cur
      let index = findEnd(cur)
      flows[index].end = board[i][j]

      cur.isEnd = false
      if(i < cur.i) {
        board[i][j].e = true
        cur.w = true
      }
      if(i > cur.i) {
        board[i][j].w = true
        cur.e = true
      }
      if(j < cur.j) {
        board[i][j].s = true
        cur.n = true
      }
      if(j > cur.j) {
        board[i][j].n = true
        cur.s = true
      }
      cur = board[i][j]
    }
  }
}

/*
function mouseDragged(){
  let i = floor(mouseX/(WIDTH/tam_board));
  let j = floor(mouseY/(WIDTH/tam_board));
  
  let b = board[i][j]
  
  if(i<tam_board && j < tam_board && (bool || b != undefined)){
    if(b != undefined && b.isEnd) bool = true
    if(b != undefined && !b.isEnd){
      //prev.isEnd = true
      //board[i][j] = undefined
    }
    else if(b == undefined && dist(i, j, prev.i, prev.j) <= 1){
      board[i][j] = new cell(i, j, prev.col)
      board[i][j].isEnd = true
      board[i][j].prev = prev
      prev.isEnd = false
      if(i < prev.i) {
        board[i][j].e = true
        prev.w = true
      }
      if(i > prev.i) {
        board[i][j].w = true
        prev.e = true
      }
      if(j < prev.j) {
        board[i][j].s = true
        prev.n = true
      }
      if(j > prev.j) {
        board[i][j].n = true
        prev.s = true
      }
      prev = board[i][j]
    }
    
  }
  else bool = false
}
*/

function draw() {
  if(!mouseIsPressed) bool = false
  background(0)
  drawGrid()
  drawBoard()
  if(checkWin()) loadLevel()
}


function drawBoard(){
  push()
  noStroke()
  fill(255)
  for(let i = 0; i < tam_board; i++){
    for(let j = 0; j < tam_board; j++){
      let b = board[i][j]
      if(b != undefined) b.show()
    }
  }
  pop()
}

function checkWin(){
  for(let f of flows){
    if(!f.fin) return false
  }
  return true
}

function drawGrid(){
  stroke(80)
  for (var x = 0; x < WIDTH; x += tam_cell) {
		for (var y = 0; y < HEIGHT; y += tam_cell) {
			strokeWeight(1);
			line(x, 0, x, HEIGHT);
			line(0, y, WIDTH, y);
		}
	}
}