//Maze generator (and its solving path)
//Miguel Rodríguez
//13-02-2024

const WIDTH = 900;
const HEIGHT = 900;
const n = 30;
const wn = WIDTH / n;
let prev;
let current;
let salida;
let terminado = false;
let board = [];
let camino = [];
let count = 0;
let salidaEncontrada = false

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(0);

  for (let i = 0; i < n; i++) {
    board[i] = [];
    for (let j = 0; j < n; j++) {
      board[i][j] = new Cell(i, j);
    }
  }

  current = board[0][0];
  current.w = false;
  current.visited = true;

  camino.push(current);

  salida = board[n - 1][n - 1];
  salida.e = false
}

function drawCurrent(){
  push()
  noStroke()
  fill(255, 255, 0)
  translate(wn/2, wn/2)
  ellipse(current.i*wn, current.j*wn, wn/2, wn/2)
  pop()
}

function draw() {
  
  if (count + 1 == n * n){ 
    terminado = true
    drawMaze()
    count++
  }
  
  if(terminado){
    translate(wn/2, wn/2)
    strokeWeight(5);
    stroke(255, 255, 0);
    let a = camino[0]
    let b = camino[1]
    camino.splice(0, 1)
    line(a.i*wn, a.j*wn, b.i*wn, b.j*wn)
    if(camino.length == 1){ 
      line(salida.i*wn, salida.j*wn, b.i*wn, b.j*wn)
      noLoop()
    }
    
    
  }
  
  else if (!terminado) {
    drawMaze()
    prev = current;
    drawCurrent()
    current = current.move();
    
    if (current === undefined) {
      current = prev.prev;
      if(!salidaEncontrada) camino.pop();
    } 
    
    else {
      if(!(salida.i == current.i && salida.j == current.j) && !salidaEncontrada){
        camino.push(current);
      }
      if((salida.i == current.i && salida.j == current.j)) salidaEncontrada = true
      count++;
      
    }
    
   
  }
  //drawCamino()
}

function drawCamino(){
  push()
  translate(wn/2, wn/2)
  strokeWeight(6);
  stroke(255, 255, 0);
  for(let i = 0; i < camino.length-1; i++){
    let a = camino[i].i
    let b = camino[i].j
    let c = camino[i+1].i
    let d = camino[i+1].j
    line(a * wn, b * wn, c * wn, d * wn);
  }
  if(salidaEncontrada) line(camino[camino.length-1].i * wn, camino[camino.length-1].j * wn, salida.i * wn, salida.j * wn);
  pop()
}

function drawMaze() {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      board[i][j].show();
    }
  }
}
