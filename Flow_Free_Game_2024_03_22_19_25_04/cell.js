class cell{
  constructor(i, j, col){
    this.n = false
    this.s = false
    this.e = false
    this.w = false
    
    this.i = i
    this.j = j
    this.isStart = false
    this.isEnd = false
    this.isGoal = false
    
    this.prev = undefined
    
    this.col = col
  
  }
  
  allFalse(){
    this.n = false
    this.s = false
    this.e = false
    this.w = false
  }
  
  show(){
    push()
    colorMode(HSB)
    fill(this.col, 100, 100)
    translate(this.i*tam_cell, this.j*tam_cell)
    if(this.n) rect((1/3)*tam_cell, 0, (1/3)*tam_cell, (2/3)*tam_cell)
    if(this.s) rect((1/3)*tam_cell, (1/3)*tam_cell, (1/3)*tam_cell, (2/3)*tam_cell)
    if(this.w) rect(0, (1/3)*tam_cell, (2/3)*tam_cell, (1/3)*tam_cell)
    if(this.e) rect((1/3)*tam_cell, (1/3)*tam_cell, (2/3)*tam_cell, (1/3)*tam_cell)
    if(this.isStart || this.isEnd || this.isGoal) ellipse(tam_cell/2, tam_cell/2, tam_cell*0.6, tam_cell*0.6)
    pop()
  }
  
}