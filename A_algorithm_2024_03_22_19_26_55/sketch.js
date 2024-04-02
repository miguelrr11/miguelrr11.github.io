//A* pathfinding algorithm
//Miguel Rodríguez
//12-02-2024

const WIDTH = 900;
const HEIGHT = 900;
const n = 75;
const widthN = WIDTH / n;
let openSet = [];
let closedSet = [];
let board = [];
let start;
let goal;
let end;
let current;
let terminado = false;
let btnStart;
let btnRestart;
let btnClearWalls;
let started = false;
let changingStart = false;
let changingEnd = false;
let camino = [];

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(211, 103, 255);
  //drawGrid()
  btnStart = createButton("Start");
  btnStart.mousePressed(() => {
    started = true;
    terminado = false
  });
  btnClearWalls = createButton("Clear Walls");
  btnClearWalls.mousePressed(() => {
    restart();
    for (let i = 0; i < n; i++) {
      board[i] = [];
      for (let j = 0; j < n; j++) {
        board[i][j] = false;
      }
    }
    background(211, 103, 255);
    //drawGrid()
    drawStartEnd();
  });
  btnRestart = createButton("Restart");
  btnRestart.mousePressed(() => {
    goal = createVector(n - 2, n - 2);
    start = new Node(1, 1);
    start.g = 0;
    start.f = 0;
    restart();
    background(211, 103, 255);
    randomWalls()
    drawBoard()
  });
  goal = createVector(n - 2, n - 2);
  start = new Node(1, 1);
  start.g = 0;
  start.f = 0;
  openSet.push(start);
  
  
  drawStartEnd();

  for (let i = 0; i < n; i++) {
    board[i] = [];
    for (let j = 0; j < n; j++) {
      board[i][j] = false;
    }
  }
  
  randomWalls()
  drawBoard()
}

function randomWalls(){
  for (let i = 0; i < n; i++) {
      board[i] = [];
      for (let j = 0; j < n; j++) {
        if ((start.i == i && start.j == j) || (goal.x == i && goal.y == j))
          continue;
        let r = random();
        if (r < 0.3) board[i][j] = true;
        else board[i][j] = false;
      }
    }
}



function restart() {
  frameRate(60);
  started = false;
  terminado = false;

  openSet = [];
  closedSet = [];
  camino = [];
  for (let i = 0; i < n; i++) {
    board[i] = [];
    for (let j = 0; j < n; j++) {
      board[i][j] = false;
    }
  }
  openSet.push(start);
}

function draw() {
  if (started && !terminado) {
    if (openSet.length > 0) {
      current = getLowestF();
      //console.log(current.i, current.j)
      removeNode(current);
      closedSet.push(current);

      if (current.i == goal.x && current.j == goal.y) {
        end = current;
        console.log("camino encontrado");
      } else {
        let neighbours = current.getNeighbours();
        for (let n of neighbours) {
          if (!isInClosedSet(n)) {
            var tempG = current.g + dist(current.i, current.j, n.i, n.j);

            var newPath = false;

            if (isInOpenSet(n) && tempG < n.g) {
              n.g = tempG;
              newPath = true;
            } else {
              n.g = tempG;
              newPath = true;
              openSet.push(n);
            }

            if (newPath) {
              n.h = n.heur();
              n.f = n.g + n.h;
              n.parent = current;
            }
          }
        }
      }
    } else {
      console.log("camino no encontrado");
      terminado = true
    }

    if (!terminado) {
      if (current.i == goal.x && current.j == goal.y) terminado = true
      background(211, 103, 255, 1);
      
      drawBoard();

      //drawOpenSet()
      drawClosedSet();

      //dibujar camino

      createCamino(current);
      drawCamino();
      drawStartEnd();
    }
  }

}

function drawCamino(current) {
  push();
  translate(widthN / 2, widthN / 2);
  fill(255, 255, 0);
  stroke(255, 255, 0);
  strokeWeight(4);
  for (let i = 0; camino.length >= 2; i++) {
    let aux = camino.pop();
    let next = camino[camino.length - 1];
    line(aux.i * widthN, aux.j * widthN, next.i * widthN, next.j * widthN);
    //circle(next.i*widthN, next.j*widthN, widthN - widthN/4)
    //circle(aux.i*widthN, aux.j*widthN, widthN - widthN/4)
  }
  pop();
}

function softRestart(){
  background(211, 103, 255);
  drawBoard()
  started = false;
  terminado = false;
  openSet = [];
  closedSet = [];
  camino = [];
  openSet.push(start);
}

function mouseDragged() {
  // Log the coordinates to the console
  push();
  //if (terminado) restart();
  let x = floor(mouseX / (WIDTH / n));
  let y = floor(mouseY / (WIDTH / n));
  if (changingStart && !board[x][y] && !(goal.x == x && goal.y == y)) {
    console.log("1")
    changingStart = false;
    start.i = x;
    start.j = y;
    softRestart()
  } else if (changingEnd && !board[x][y] && !(start.i == x && start.j == y)) {
    console.log("2")
    changingEnd = false;
    goal.x = x;
    goal.y = y;
    softRestart()
  } else if (!(start.i == x && start.j == y) && !(goal.x == x && goal.y == y)) {
    console.log("3")
    if (!board[x][y]) board[x][y] = true;
    else board[x][y] = false;
  } else if (start.i == x && start.j == y) {
    console.log("4")
    changingStart = true;
    start.i = -1;
    start.j = -1;
  } else if (goal.x == x && goal.y == y) {
    console.log("5")
    changingEnd = true;
    goal.x = -1;
    goal.y = -1;
  }
  background(211, 103, 255);
  background(211, 103, 255, 1);
  drawBoard();
  drawStartEnd()
  pop();
}

function drawCurrent(current) {
  push();
  fill(255, 0, 0);
  noStroke();
  rect(
    current.i * widthN + 5,
    current.j * widthN + 5,
    widthN - 10,
    widthN - 10
  );
  pop();
}

function drawGrid() {
  push();
  stroke(159, 0, 224);
  for (var x = 0; x < WIDTH; x += widthN) {
    for (var y = 0; y < HEIGHT; y += widthN) {
      strokeWeight(1);
      line(x, 0, x, HEIGHT);
      line(0, y, WIDTH, y);
    }
  }
  pop();
}

function createCamino(n) {
  camino = [];
  let node = n;
  while (!(node.i == start.i && node.j == start.j)) {
    camino.push(node);
    if (node.i == start.i && node.j == start.j) break;
    node = node.parent;
  }
  camino.push(start);
}

function drawOpenSet() {
  push();
  fill(255);
  strokeWeight(1);
  stroke(255);
  let dTot = dist(start.i, start.j, goal.x, goal.y);
  for (let o of openSet) {
    let d = dist(o.i, o.j, goal.x, goal.y);
    rect(o.i * widthN, o.j * widthN, widthN, widthN);
  }
  pop();
}

function drawClosedSet() {
  push();
  fill(211, 103, 255, 3);
  noStroke();
  for (let o of closedSet) {
    rect(o.i * widthN, o.j * widthN, widthN, widthN);
  }
  pop();
}

function drawBoard() {
  push();
  noStroke();
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j]) {
        fill(88, 0, 198, 200);
        circle(i * widthN + widthN / 2, j * widthN + widthN / 2, widthN / 2);
      }
    }
  }
  pop();
}

function drawStartEnd() {
  push();
  translate(widthN/2, widthN/2)
  fill(38, 255, 133);
  circle(start.i * widthN, start.j * widthN, widthN);
  fill(38, 160, 255);
  circle(goal.x * widthN, goal.y * widthN, widthN);

  noFill();
  stroke(38, 160, 255);
  strokeWeight(2);
  circle(start.i * widthN, start.j * widthN, widthN);
  stroke(38, 255, 133);
  circle(goal.x * widthN, goal.y * widthN, widthN);
  pop();
}

function isBlocked(i, j) {
  return board[i][j];
}

function getLowestF() {
  let res = openSet[0];
  for (let n of openSet) {
    if (n.f < res.f) res = n;
  }
  //console.log(res.i, res.j)
  return res;
}

function removeNode(node) {
  for (let i = 0; i < openSet.length; i++) {
    if (node.i == openSet[i].i && node.j == openSet[i].j) {
      //console.log(openSet.length)
      openSet.splice(i, 1);
      return;
      //console.log(openSet.length)
    }
  }
}

function isInOpenSet(succesor) {
  for (let o of openSet) {
    if (succesor.i == o.i && succesor.j == o.j) return true;
  }
  return false;
}

function isInClosedSet(succesor) {
  for (let o of closedSet) {
    if (succesor.i == o.i && succesor.j == o.j) return true;
  }
  return false;
}
