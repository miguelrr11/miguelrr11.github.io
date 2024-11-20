//Falling Sand
//Miguel Rodríguez
//8-02-2024

const WIDTH = (HEIGHT = 800);
tam_mat = 200; //valor a cambiar para ajustar tamaño
tam_cell = WIDTH / tam_mat;
let mat = [];
let new_mat = [];

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(0);
  noStroke();

  for (let i = 0; i < tam_mat; i++) {
    mat[i] = [];
    new_mat[i] = [];
    for (let j = 0; j < tam_mat; j++) {
      mat[i][j] = 0;
      new_mat[i][j] = 0;
    }
  }
}

function draw() {
  try {
    for (let x = 1; x < tam_mat-1; x++) {
      for (let y = 0; y < tam_mat; y++) {
        if (mat[x][y] == 1 && y != tam_mat) {
          if (mat[x][y + 1] == 0) {
            new_mat[x][y] = 0;
            new_mat[x][y + 1] = 1;
            
            blanco(x, y + 1);
            negro(x, y);
          } 
          else {
            if (
              mat[x - 1][y] == 0 &&
              mat[x - 1][y + 1] == 0 &&
              mat[x + 1][y] == 0 &&
              mat[x + 1][y + 1] == 0
            ) {
              let aux = random();
              if (aux < 0.5) {
                new_mat[x - 1][y + 1] = 1;
                blanco(x - 1, y + 1);
              } else {
                new_mat[x + 1][y + 1] = 1;
                blanco(x + 1, y + 1);
              }
              new_mat[x][y] = 0;
              negro(x, y);
            } else if (mat[x - 1][y] == 0 && mat[x - 1][y + 1] == 0) {
              new_mat[x - 1][y + 1] = 1;
              blanco(x - 1, y + 1);
              new_mat[x][y] = 0;
              negro(x, y);
            } else if (mat[x + 1][y] == 0 && mat[x + 1][y + 1] == 0) {
              new_mat[x + 1][y + 1] = 1;
              blanco(x + 1, y + 1);
              new_mat[x][y] = 0;
              negro(x, y);
            }
          }
        }
      }
    }
  } 
  catch {}
  for(let i = 0; i < tam_mat; i++){
      for(let j = 0; j < tam_mat; j++){
        mat[i][j] = new_mat[i][j];
      }
    }
}

function mouseDragged() {
  let x = floor(mouseX / (WIDTH / tam_mat));
  let y = floor(mouseY / (WIDTH / tam_mat));
  try{
    mat[x][y] = 1;
    mat[x-1][y-1] = 1;
    mat[x+1][y-1] = 1;
  }
  catch{}
  
}

function negro(i, j) {
  push();
  fill(0);
  rect(i * tam_cell, j * tam_cell, tam_cell, tam_cell);
  pop();
}

function blanco(i, j) {
  push();
  fill(255);
  rect(i * tam_cell, j * tam_cell, tam_cell, tam_cell);
  pop();
}
