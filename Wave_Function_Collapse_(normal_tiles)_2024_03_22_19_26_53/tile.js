class Tile{
  constructor(n, e, s, w){
    this.n = n
    this.e = e
    this.s = s
    this.w = w
  }
  
  show(tam){
    push()
    noStroke()
    fill(255)
    if(this.n) rect((1/3)*tam, 0, (1/3)*tam, (2/3)*tam)
    if(this.s) rect((1/3)*tam, (1/3)*tam, (1/3)*tam, (2/3)*tam)
    if(this.w) rect(0, (1/3)*tam, (2/3)*tam, (1/3)*tam)
    if(this.e) rect((1/3)*tam, (1/3)*tam, (2/3)*tam, (1/3)*tam)
    stroke(255, 0, 0)
    noFill()
    //rect(0, 0, wn, wn)
    pop()
  }
  
}