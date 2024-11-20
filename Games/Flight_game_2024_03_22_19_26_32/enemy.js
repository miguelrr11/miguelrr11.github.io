class enemy{
  constructor(x, y, speedX, speedY){
    this.pos = createVector(x, y)
    this.speed = createVector(speedX, speedY)
  }
  
  update(){
    this.pos.add(this.speed)
  }
  
  show(){
    push()
    fill(255, 0, 0)
    noStroke();
    ellipse(this.pos.x, this.pos.y, 50)
    pop()
  }
  
}