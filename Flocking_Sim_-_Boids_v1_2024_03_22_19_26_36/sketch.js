//Flocking Sim - Boids

const WIDTH = 900
const HEIGHT = 900

let birds = []
let nBirds = 10
let objetivo
let slider

function setup() {
  createCanvas(WIDTH, HEIGHT)
  
  for(let i = 0; i<100; i++){
    birds.push(new Bird(floor(random(0, WIDTH)), floor(random(0, WIDTH))))
  }
  
  slider = createSlider(0, 100)
  slider.position(20, HEIGHT + 20)
  objetivo = createVector(mouseX, mouseY)
}

function draw() {
   background(0);
  
  
  
  
  for(let i = 0; i < birds.length; i++){
    push()
    b = birds[i]
    birds[0].col = 255
    
    let mates = b.getMates(b)
    let avgPos = createVector(0,0)
    for(let m of mates) {
      avgPos.add(m.pos)
    }
    avgPos.div(mates.length)
    if(dist(avgPos.x, avgPos.y, b.pos.x, b.pos.y) < slider.value()){ 
      b.evade(avgPos)
      if (i == 0) b.col = [255, 0, 0]
    }
    else{ 
      b.seek(avgPos)
      if (i == 0) b.col = [0, 255, 0]
    }
    
    
  
    b.update()
    b.edges()
    b.show()
    pop()
  }
  
  
  
}