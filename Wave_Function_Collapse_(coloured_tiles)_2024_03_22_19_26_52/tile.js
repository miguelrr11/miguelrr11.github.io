class Tile{
  constructor(nw, ne, se, sw){
    this.nw = nw
    this.ne = ne
    this.se = se
    this.sw = sw
  }
  
  //0 -> blue   0, 219, 255
  //1 -> orange 255, 191, 0
  
  
  show(tam){
    const c1 = [255, 195, 0]
    const c2 = [199, 0, 57]
    push()
    noStroke()
    if(this.nw == 0) fill(c1)
    else fill(c2)
    rect(0, 0, tam/2, tam/2)
    
    if(this.ne == 0) fill(c1)
    else fill(c2)
    rect(tam/2, 0, tam/2, tam/2)
    
    if(this.se == 0) fill(c1)
    else fill(c2)
    rect(tam/2, tam/2, tam/2, tam/2)
    
    if(this.sw == 0) fill(c1)
    else fill(c2)
    rect(0, tam/2, tam/2, tam/2)
    pop()
  }
  
}