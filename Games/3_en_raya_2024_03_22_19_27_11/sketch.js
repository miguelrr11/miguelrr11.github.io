//3 en raya
//Miguel Rodriguez
//01-02-2024

let WIDTH = 600;
let HEIGHT = 600;
let board = [];
let turn = 0;
let x = 0;
let y = 0;
let gameOver = false;
let modo;
let restart;

function drawBack(){
  background(255);
  stroke(0);
  strokeWeight(2);
  line(0, 200, 600, 200);
  line(0, 400, 600, 400);
  line(200, 600, 200, 0);
  line(400, 600, 400, 0);
  noFill();
}


function setup() {
  cnv = createCanvas(600, 600);
  modo = createSelect();
  modo.position(20, 630);
  modo.option('1 jugador');
  modo.option('2 jugadores');
  modo.selected('1 jugador');
  
  restart = createButton('Restart')
  restart.position(150, 630)
  
  restart.mousePressed(() => {
    for (let i = 0; i < 3; i++) {
      board[i] = [];
      for (let j = 0; j < 3; j++) {
        board[i][j] = -1;
      }
    }
    x = 0
    y = 0
    turn = 0
    gameOver = false
    drawBack()
  });
  
  drawBack()
  
  frameRate(1);

  for (let i = 0; i < 3; i++) {
    board[i] = [];
    for (let j = 0; j < 3; j++) {
      board[i][j] = -1;
    }
  }
}

function mouseClicked() {
  if (!gameOver) {
    x = floor(mouseX / 200);
    y = floor(mouseY / 200);
    if (board[x][y] == -1) {
      board[x][y] = turn;
      push();
      updateBoard(x, y);
      pop();
      push();
      check(x, y);
      pop();
      turn = turn == 0 ? 1 : 0;
    }
  }
}

function draw() {
  if(!gameOver && turn == 1 &&  modo.selected() == '1 jugador'){
    while(true){
      let a = floor(random(0,3))
      let b = floor(random(0,3));
      if(board[a][b] == -1){
        board[a][b] = turn
        push();
        updateBoard(a, b);
        pop();
        push();
        check(a, b);
        pop();
        turn = turn == 0 ? 1 : 0;
        break
      }
      if(gameOver) break
    }
  }
}

function updateBoard(x, y) {
  translate(x * 200, y * 200);
  if (turn == 0) {
    ellipse(100, 100, 160, 160);
  } else {
    line(30, 30, 170, 170);
    line(170, 30, 30, 170);
  }
}


function check(x, y) {
  stroke(255, 0, 0);
  if (board[x][0] == board[x][1] && board[x][1] == board[x][2]) {
    line(x * 200 + 100, 100, x * 200 + 100, 500);
    gameOver = true
  } 
  else if (board[0][y] == board[1][y] && board[1][y] == board[2][y]) {
    line(100, y * 200 + 100, 500, y * 200 + 100);
    gameOver = true
  } 
  else if (
    board[0][0] != -1 &&
    board[0][0] == board[1][1] &&
    board[1][1] == board[2][2]
  ) {
    line(100, 100, 500, 500);
    gameOver = true
  } 
  else if (
    board[0][2] != -1 &&
    board[0][2] == board[1][1] &&
    board[1][1] == board[2][0]
  ) {
    line(500, 100, 100, 500);
    gameOver = true
  }
}
