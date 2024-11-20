//Wave Function Collapse (normal tiles)
//Miguel Rodríguez
//14-02-2024

const WIDTH = 500;
const HEIGHT = 500;
let board = [];
const n = 25;
const wn = WIDTH / n;
let currentSpot;
let btnStart;
let tilesStart = []
let tiles = []
let go = false;

function setup() {
  createCanvas(WIDTH, HEIGHT + (WIDTH/6)*2);
  background(0);
  
  tilesStart = [0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0]
  
  tiles = [new Tile(0, 0, 0, 0),
            new Tile(1, 1, 1, 1),

            new Tile(0, 1, 1, 1),
            new Tile(1, 0, 1, 1),
            new Tile(1, 1, 0, 1),
            new Tile(1, 1, 1, 0),


            new Tile(1, 0, 1, 0),
            new Tile(0, 1, 0, 1),

            new Tile(1, 1, 0, 0),
            new Tile(0, 1, 1, 0),
            new Tile(0, 0, 1, 1),
            new Tile(1, 0, 0, 1)]
  
  drawTilesStart()
  

  btnStart = createButton("Start");
  btnStart.mousePressed(() => {
    let newTiles = []
    for(let i = 0; i < 12; i++){
      if(tilesStart[i] == 0) newTiles.push(tiles[i])
    }
    tiles = newTiles
    
    for (let i = 0; i < n; i++) {
      board[i] = [];
      for (let j = 0; j < n; j++) {
        board[i][j] = new Spot(i, j);
      }
    }
    
    go = true;
  });

}


function drawTilesStart(){
  if(go) return
  push()
  translate(0, HEIGHT)
  noFill()
  strokeWeight(4)
  let tam = WIDTH/6
  for(let i = 0; i < 6; i++){
    if(tilesStart[i] == 0) stroke(0, 255, 0)
    else stroke(255, 0, 0)
    tiles[i].show(tam)
    rect(2, 2, tam-4, tam-4)
    translate(tam, 0)
  }
  translate(-tam*6, tam)
  for(let i = 6; i < 12; i++){
    if(tilesStart[i] == 0) stroke(0, 255, 0)
    else stroke(255, 0, 0) 
    tiles[i].show(tam) 
    rect(2, 2, tam-4, tam-4)
    translate(tam, 0)
  }
  pop()
}



function mouseClicked() {
  if(!go){
    let x = floor(mouseX/(WIDTH/6))
    let y = 7-floor(mouseY/((WIDTH/6)))
    if(y == 1){
      if(tilesStart[x] == 1) tilesStart[x] = 0
      else tilesStart[x] = 1
    }
    else if(y == 0){
      if(tilesStart[x+6] == 1) tilesStart[x+6] = 0
      else tilesStart[x+6] = 1
    }
    if(x >= 0 && x <= 6 && y >= 0 && y <= 1) drawTilesStart()
  }
  else{
    let x = floor(mouseX/(WIDTH/n));
    let y = floor(mouseY/(WIDTH/n));
    console.log(board[x][y])
  }
  
}

function draw() {
  //background(0)
  if (go) {
    if (checkBoard()) noLoop();
    else {
      currentSpot = getLowestEntropy();
      if (currentSpot.options.length != 0) currentSpot.collapse();
      else{
        stroke(255, 0, 0)
        strokeWeight(3)
        noFill()
        currentSpot.collapsed = true
        rect(currentSpot.i * wn, currentSpot.j * wn, wn, wn)
        //noLoop()
      }
    }
  }
}

function checkBoard() {
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j].collapsed) count++;
    }
  }
  return count == n * n;
}

function getLowestEntropy() {
  let res;
  let rec = 999;

  let poss = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let b = board[i][j];
      if (b.collapsed) continue;
      if (poss.length == 0) poss.push(b);
      if (b.options.length == poss[0].options.length) poss.push(b);
      else if (b.options.length < poss[0].options.length) {
        poss = [];
        poss.push(b);
      }

      /*
      if(!board[i][j].collapsed && board[i][j].options.length < rec){
        res = board[i][j]
        rec = res.options.length
      }
      */
    }
  }
  return random(poss);
}
