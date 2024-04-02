
function setup() { 
  createCanvas(1280, 720);
} 

function draw() { 
  background(100);
  stroke(0);
  strokeWeight(2);
  stroke(0);
  strokeWeight(2);
//translateX, translateY, scale
  let s = 0.45
  let shift = true
  
  /*
  for(let j = 0; j < height; j += 230*s){
    for(let i = 0; i < width; i += 260*s){
      let iaux = i
      if(shift) iaux += 65 * s * 2
      hexagon(iaux, j, s);
    }
    shift = !shift
  }
  */
  
  for(let i = 260*s*3; i < 260*s*6; i += 260*s){
    hexagon(i, 100*2*s, s);
  }
  for(let i = 260*s*2; i < 260*s*6; i += 260*s){
    hexagon(i + 65 * s * 2, 142*3*s, s);
  }
  for(let i = 260*s*2; i < 260*s*7; i += 260*s){
    hexagon(i, 163*4*s, s);
  }
  for(let i = 260*s*2; i < 260*s*6; i += 260*s){
    hexagon(i + 65 * s * 2, 175*5*s, s);
  }
  for(let i = 260*s*3; i < 260*s*6; i += 260*s){
    hexagon(i, 183*6*s, s);
  }
  
  
}

function hexagon(transX, transY, s) {
  stroke(255);
  strokeWeight(5);
  fill(180, 180, 100);
  push();
  translate(transX, transY);
  scale(s);
  beginShape();
	vertex(-75, -130);
	vertex(75, -130);
	vertex(150, 0);
	vertex(75, 130);
  vertex(-75, 130);
	vertex(-150, 0);
  rotate(radians(90))
	endShape(CLOSE); 
	pop();
}
