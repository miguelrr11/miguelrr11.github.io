//Brian's Brain
//Miguel Rodríguez
//27-01-2024

const WIDTH = (HEIGHT = 800);
tam_mat = 50   //valor a cambiar para ajustar tamaño
tam_cell = WIDTH/tam_mat
let mat = []
let new_mat = []
let pausado = true;
let drawButton
let randButton

//0 = off
//1 = on
//2 = dying

function setup() {
  drawButton = createButton("Start");
  drawButton.position(10, 810);
  drawButton.mousePressed(toggleDrawing);
  randButton = createButton("Randomize");
  randButton.position(10, 830);
  randButton.mousePressed(rand);
  createCanvas(WIDTH, HEIGHT);
  background(0);
  color(255);
  noStroke();
  for(let i = 0; i < tam_mat; i++){
    mat[i] = [];
    new_mat[i] = [];
    for(let j = 0; j < tam_mat; j++){
      mat[i][j] = 0;
      new_mat[i][j] = 0;
    }
  }
  
  push();
  draw_grid();
  pop();

}

function draw() {
  if(!pausado){
    draw_grid()
    //crear new_mat segun reglas y mat
    for(let i = 0; i < tam_mat; i++){
      for(let j = 0; j < tam_mat; j++){
        let vecin = vecinos(i, j)
        if(mat[i][j] == 0){
          if(vecin == 2) new_mat[i][j] = 1
          //else new_mat[i][j] = 0
        }
        else if(mat[i][j] == 1){
          new_mat[i][j] = 2
        }
        else{
          new_mat[i][j] = 0
        }


      }
    }
    //imprimir
    push()
    draw_mat(new_mat);
    pop()
    for(let i = 0; i < tam_mat; i++){
      for(let j = 0; j < tam_mat; j++){
        mat[i][j] = new_mat[i][j];
        new_mat[i][j] = 0;
      }
    }
  
  }
}

function rand(){
  for(let i = 0; i < tam_mat; i++){
      for(let j = 0; j < tam_mat; j++){
        mat[i][j] = floor(random(0,3));
      }
    }
  draw_mat(mat)
}

function draw_grid(){
  stroke(80)
  background(0);
  for (var x = 0; x < width; x += tam_cell) {
		for (var y = 0; y < height; y += tam_cell) {
			strokeWeight(1);
			line(x, 0, x, height);
			line(0, y, width, y);
		}
	}
}

//Moore neighborhood
function vecinos(x, y){
  let res = 0;
  for(let i = -1; i < 2; i++){
    for(let j = -1; j < 2; j++){
      if(x+i == x && y+j == y) continue;
      if((x+i) < 0 || (y+j) < 0) continue;
      if((x+i) > tam_mat-1 || (y+j) > tam_mat-1) continue;
      if(mat[x+i][y+j] == 1) res++; 
    }
  }
  return res;
}

//imprimir mat si mat[index] == 1
function draw_mat(arr){
  for(let i = 0; i < tam_mat; i++){
    for(let j = 0; j < tam_mat; j++){
      if(arr[i][j] == 1) {
        fill(255)
        rect(i*tam_cell, j*tam_cell, tam_cell, tam_cell);
      }
      else if(arr[i][j] == 2){
        fill(0, 0, 255)
        rect(i*tam_cell, j*tam_cell, tam_cell, tam_cell);
      }
    }
  }
}



function mouseClicked() {
  // Log the coordinates to the console
  let x = floor(mouseX/(WIDTH/tam_mat));
  let y = floor(mouseY/(WIDTH/tam_mat));
  if(mat[x][y] == 1) mat[x][y] = 0;
  else mat[x][y] = 1;
  draw_grid()
  draw_mat(mat)
}
  
function toggleDrawing() {
  pausado = !pausado;
  if (pausado) drawButton.html("Start");
  else drawButton.html("Stop");
  frameRate(10)
}