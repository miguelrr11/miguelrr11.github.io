//Double Pendulum
//Miguel Rodríguez
//11-02-2024

const WIDTH = 800;
const HEIGHT = 500;

let pos1;
let m1 = 10;
let v1 = 0;
let a1 = 0

let pos2;
let m2 = 10;
let v2 = 0;
let a2 = 0;

let r1 = 150;
let r2 = 150;

let g = 1;

let prev

let sliderG
let sliderm1
let sliderm2
let sliderL
let sliderF
let btnRestart

function setup() {
  createCanvas(WIDTH, HEIGHT*2);
  background(255);
  
  let outsideText = createP("Gravity");
  outsideText.style('position', 'absolute');
  outsideText.style('top', '-10px');
  outsideText.style('left', '820px');
  outsideText.style('color', 'white');
  sliderG = createSlider(0.1, 10, 1)
  sliderG.position(WIDTH + 20, 30)
  
  outsideText = createP("Masa 1");
  outsideText.style('position', 'absolute');
  outsideText.style('top', '50px');
  outsideText.style('left', '820px');
  outsideText.style('color', 'white');
  sliderm1 = createSlider(0.1, 30, 10)
  sliderm1.position(WIDTH + 20, 90)
  
  outsideText = createP("Masa 2");
  outsideText.style('position', 'absolute');
  outsideText.style('top', '110px');
  outsideText.style('left', '820px');
  outsideText.style('color', 'white');
  sliderm2 = createSlider(0.1, 30, 10)
  sliderm2.position(WIDTH + 20, 150)
  
  outsideText = createP("Longitudes");
  outsideText.style('position', 'absolute');
  outsideText.style('top', '170px');
  outsideText.style('left', '820px');
  outsideText.style('color', 'white');
  sliderL = createSlider(1, 300, 150)
  sliderL.position(WIDTH + 20, 210)
  
  outsideText = createP("Fricción");
  outsideText.style('position', 'absolute');
  outsideText.style('top', '230px');
  outsideText.style('left', '820px');
  outsideText.style('color', 'white');
  sliderF = createSlider(990, 1000, 990)
  sliderF.position(WIDTH + 20, 270)
  
  btnRestart = createButton('Restart')
  btnRestart.mousePressed(() => {
    v1 = 0
    v2 = 0
    a1 = PI/2
    a2 = PI/2
    pos1.x = r1 * sin(a1);
    pos1.y = r1 * cos(a1);
    pos2.x = pos1.x + r2 * sin(a2);
    pos2.y = pos1.y + r2 * cos(a2);
    r1 = 150
    r2 = 150
    push()
    fill(0)
    rect(0, HEIGHT, WIDTH, HEIGHT*2)
    prev = createVector(pos2.x, pos2.y)
    pop()
    sliderG.value(1)
    sliderm1.value(10)
    sliderm2.value(10)
    sliderL.value(150)
    sliderF.value(990)
  });
  
  strokeWeight(2);
  stroke(0);
  fill(0);
  rect(0, HEIGHT, WIDTH, HEIGHT*2)
  push()
  translate(WIDTH / 2, 100);
  a1 = PI/2
  a2 = PI/2
  pos1 = createVector(0, 0);
  pos2 = createVector(0, 0);
  pos1.x = r1 * sin(a1);
  pos1.y = r1 * cos(a1);
  pos2.x = pos1.x + r2 * sin(a2);
  pos2.y = pos1.y + r2 * cos(a2);
  line(0, 0, pos1.x, pos1.y);
  line(pos1.x, pos1.y, pos2.x, pos2.y);
  ellipse(pos1.x, pos1.y, 40);
  ellipse(pos2.x, pos2.y, 40);
  prev = createVector(pos2.x, pos2.y)
  pop()
}

function draw() {
  g = sliderG.value()
  m1 = sliderm1.value()
  m2 = sliderm2.value()
  r1 = sliderL.value()
  r2 = 300-r1
  let f = map(sliderF.value(), 990, 1000, 1, 0.95)
  
  push()
  fill(255)
  rect(0, 0, WIDTH, HEIGHT)
  pop()
  push()
  translate(WIDTH / 2, 100);
  
  let num1 = -g * (2 * m1 + m2) * sin(a1);
  let num2 = -m2 * g * sin(a1 - 2 * a2);
  let num3 = -2 * sin(a1 - a2) * m2;
  let num4 = v2 * v2 * r2 + v1 * v1 * r1 * cos(a1 - a2);
  let den = r1 * (2 * m1 + m2 - m2 * cos(2 * a1 - 2 * a2));
  let ac1 = (num1 + num2 + num3 * num4) / den;

  num1 = 2 * sin(a1 - a2);
  num2 = (v1 * v1 * r1 * (m1 + m2));
  num3 = g * (m1 + m2) * cos(a1);
  num4 = v2 * v2 * r2 * m2 * cos(a1 - a2);
  den = r2 * (2 * m1 + m2 - m2 * cos(2 * a1 - 2 * a2));
  let ac2 = (num1 * (num2 + num3 + num4)) / den;

  pos1.x = r1 * sin(a1);
  pos1.y = r1 * cos(a1);
  pos2.x = pos1.x + r2 * sin(a2);
  pos2.y = pos1.y + r2 * cos(a2);

  line(0, 0, pos1.x, pos1.y);
  line(pos1.x, pos1.y, pos2.x, pos2.y);
  ellipse(pos1.x, pos1.y, 40);
  ellipse(pos2.x, pos2.y, 40);

  v1 += constrain(ac1, -100, 100);
  v2 += constrain(ac2, -100, 100);
  a1 += v1;
  a2 += v2;
  
  a1 *= f
  a2 *= f
  
  pop()
  push()
  translate(WIDTH/2, HEIGHT+ 100)
  fill(255)
  stroke(255)
  strokeWeight(1)
  line(prev.x, prev.y, pos2.x, pos2.y)
  pop()
  
  prev = createVector(pos2.x, pos2.y)
  
  
}
