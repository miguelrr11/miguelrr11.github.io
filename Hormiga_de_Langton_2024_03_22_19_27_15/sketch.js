//Hormiga de Langton
//Miguel Rodríguez
//27-01-2024

const WIDTH = (HEIGHT = 800);
tam_mat = 100; //valor a cambiar para ajustar tamaño
tam_cell = WIDTH / tam_mat;
let mat = [];
let new_mat = [];
let desv = false;
let drawButton;

function setup() {
  drawButton = createButton("Desvanecimiento Off");
  drawButton.position(10, 810);
  drawButton.mousePressed(toggleDesv);
  createCanvas(WIDTH, HEIGHT);
  background(0);
  noStroke();
  for (let i = 0; i < tam_mat; i++) {
    mat[i] = [];
    for (let j = 0; j < tam_mat; j++) {
      mat[i][j] = 0;
    }
  }
}

let facing = "N";
let posX = WIDTH / 2 / tam_cell;
let posY = WIDTH / 2 / tam_cell;

function draw() {
  if (mat[posX][posY] >= 1) {
    mat[posX][posY] = 0;
    fill(0);
    rect(posX * tam_cell, posY * tam_cell, tam_cell, tam_cell);
    if (facing == "N") {
      facing = "W";
      posX--;
    } else if (facing == "E") {
      facing = "N";
      posY++;
    } else if (facing == "S") {
      facing = "E";
      posX++;
    } else if (facing == "W") {
      facing = "S";
      posY--;
    }
  } else {
    mat[posX][posY] = 1;
    fill(255);
    rect(posX * tam_cell, posY * tam_cell, tam_cell, tam_cell);
    if (facing == "N") {
      facing = "E";
      posX++;
    } else if (facing == "E") {
      facing = "S";
      posY--;
    } else if (facing == "S") {
      facing = "W";
      posX--;
    } else if (facing == "W") {
      facing = "N";
      posY++;
    }
  }

  if (desv) {
    for (let i = 0; i < tam_mat; i++) {
      for (let j = 0; j < tam_mat; j++) {
        if (mat[i][j] >= 1) mat[i][j]++;
      }
    }
    draw_mat(mat);
  }
  
  fill(255, 0, 0);
  rect(posX * tam_cell, posY * tam_cell, tam_cell, tam_cell);
}

function draw_mat(arr) {
  for (let i = 0; i < tam_mat; i++) {
    for (let j = 0; j < tam_mat; j++) {
      if (arr[i][j] >= 1) {
        fill(255 - arr[i][j]);
        rect(i * tam_cell, j * tam_cell, tam_cell, tam_cell);
      }
    }
  }
}

function toggleDesv() {
  desv = !desv;
  if (desv) drawButton.html("Desvanecimiento On");
  else drawButton.html("Desvanecimiento Off");
}
