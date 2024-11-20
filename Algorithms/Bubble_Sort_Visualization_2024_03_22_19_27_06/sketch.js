//Bubble Sort Visualization
//Miguel Rodríguez
//10-02-2024

const WIDTH = 600;
const HEIGHT = 600;
const n = WIDTH; //numero de entradas del array
const widthRect = WIDTH / n;
let a = 0;
let b = 0;
let arr = [];
let prev = 0
let swapped = false
let terminado = false

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(0);
  translate(0, HEIGHT);
  fill(255);
  noStroke();
  for (let i = 0; i < n; i++) {
    arr.push(i);
  }
  shuffleArr();
  noStroke()
  displayArr()
}

function draw() {
  if(!terminado){
    for(let j = 0; j <= n-a-1; j++){
      bubbleOnce(a, b)
    }
  }
  if(terminado) fill(0, 255, 0)
  displayArr()
}

function bubbleOnce(i, j){
  if(j == 0) swapped = false
  if(i == n-1){ 
    terminado = true
    return true
  }
  if(j == n-i-1){ 
    b = 0
    a++
    if(swapped == false) return false
  }
  else{
    if(arr[j] > arr[j+1]){
      let temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
      swapped = true
    }
    b++
  }
  return true
}

function displayArr() {
  background(0);
  translate(0, HEIGHT);
  push();
  for (let i = 0; i < arr.length; i++) {
    //line(widthRect/2, 0, widthRect/2, -map(arr[i], 0, n, 0, HEIGHT))
    rect(0, 0, widthRect, -map(arr[i], 0, n, 0, HEIGHT));
    translate(widthRect, 0);
  }
  pop();
}

//Método cogido de stackoverflow
function shuffleArr() {
  let currentIndex = arr.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
  }
}