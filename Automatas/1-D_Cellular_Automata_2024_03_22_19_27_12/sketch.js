//1-D Cellular Automata
//Miguel Rodríguez
//30-01-2024

//Prueba con 99, 60, 73, 18, 30, 45 (0-255)

const WIDTH = (HEIGHT = 800);
tam_arr = 1000; //valor a cambiar para ajustar tamaño
tam_cell = WIDTH / tam_arr;
let arr = [tam_arr];
let new_arr = [tam_arr];
let altura = 0;
let started = false
let rule

function setup() {
  createCanvas(WIDTH, HEIGHT);
  numberInput = createInput('30');
  numberInput.position(20, HEIGHT+20);
  let submitButton = createButton('Submit (number between 0 and 255)');
  submitButton.position(200, HEIGHT+20);
  submitButton.mousePressed(processInput);
  background(0);
  fill(255);
  noStroke();
  
}



function draw() {
  if(started){
    for (let i = 0; i <= tam_arr; i++) {
      let bit = result(i)
      new_arr[i + 1] = bit;
    }
    new_arr[0] = arr[0];
    new_arr[tam_arr - 1] = arr[tam_arr - 1];
    draw_arr();
    replace_arr();
  }
  
}

function draw_arr() {
  for (let i = 0; i < tam_arr; i++) {
    if (new_arr[i] == 1) rect(i * tam_cell, altura * tam_cell, tam_cell, tam_cell);
  }
  altura = (altura + 1)
}

function replace_arr() {
  for (let i = 0; i < tam_arr; i++) {
    arr[i] = new_arr[i];
    new_arr[i] = 0;
  }
}

function result(index) {
  let a = arr[index%(tam_arr)];
  let b = arr[(index+1)%(tam_arr)];
  let c = arr[(index+2)%(tam_arr)];

  if (a == 1 && b == 1 && c == 1) return rule[0];
  if (a == 1 && b == 1 && c == 0) return rule[1];
  if (a == 1 && b == 0 && c == 1) return rule[2];
  if (a == 1 && b == 0 && c == 0) return rule[3];
  if (a == 0 && b == 1 && c == 1) return rule[4];
  if (a == 0 && b == 1 && c == 0) return rule[5];
  if (a == 0 && b == 0 && c == 1) return rule[6];
  if (a == 0 && b == 0 && c == 0) return rule[7];
}

function processInput(){
  let enteredNumber = parseFloat(numberInput.value());
  rule = enteredNumber.toString(2);

  while (rule.length < 8) {
    rule = '0' + rule;
  }
  background(0)
  for (let i = 0; i < tam_arr; i++) {
    arr[i] = 0;
    new_arr[i] = 0
  }
  new_arr[floor(tam_arr/2)] = 1
  arr[floor(tam_arr/2)] = 1
  draw_arr();
  replace_arr();
  
  started = true;
  altura = 0
}





