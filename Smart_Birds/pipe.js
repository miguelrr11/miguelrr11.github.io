class Pipe{
  constructor(x1, y1, x2, y2, alt){
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.altura = alt
  }
  
  update(){
    this.x1 -= 4
    this.x2 -= 4
  }

  collision(pos){
    if(bird_x >= this.x1-25 && bird_x <= this.x2+25 && pos >= this.y1 && pos <= this.y2) return true
    else return false
  }
  
  
  show(val){
    push()
    fill(137, 194, 71)
    if(val) fill(255)
    strokeWeight(3)
    stroke(0)
    rectMode(CORNERS)
    rect(this.x1-25, this.y1, this.x2+25, this.y2)
    rectMode(CENTER)
    rect(this.x2, this.y2-10, 65, 20)
    rect(this.x2, this.y2-10+this.altura, 65, 20)
    pop()
  }
  
}