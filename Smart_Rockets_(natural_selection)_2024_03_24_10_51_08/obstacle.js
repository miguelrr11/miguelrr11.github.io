class obstacle{
  constructor(px, py, w, h){
    this.px = px
    this.py = py
    this.w = w
    this.h = h
  }
  
  crashed(x, y){
     if(x < this.px + this.w/2 && x > this.px - this.w/2 &&
       y < this.py + this.h/2 && y > this.py - this.h/2) return true
  }
  
  show(){
    push()
    rectMode(CENTER)
    rect(this.px, this.py, this.w, this.h)
    pop()
  }
  
}