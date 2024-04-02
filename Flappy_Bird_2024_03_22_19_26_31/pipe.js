class Pipe{
  constructor(x1, y1, x2, y2){
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
  }
  
  update(){
    this.x1 -= 4
    this.x2 -= 4
  }
  
  
  show(){
    push()
    fill(255)
    noStroke()
    rectMode(CORNERS)
    rect(this.x1-25, this.y1, this.x2+25, this.y2)
    pop()
  }
  
}