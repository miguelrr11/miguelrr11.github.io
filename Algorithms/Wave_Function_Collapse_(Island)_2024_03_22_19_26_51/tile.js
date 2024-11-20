class Tile{
  constructor(nw, ne, se, sw, weight){
    this.nw = nw
    this.ne = ne
    this.se = se
    this.sw = sw
    this.weight = weight
  }
  
  //0 -> blue   0, 219, 255
  //1 -> orange 255, 191, 0
  
  
  show(tam){
    const mar = [56, 174, 204]
    const tierra = [173, 226, 93]
    const montaña = [94, 93, 92]
    
    push()
    noStroke()
    
    if(this.nw == 0) fill(mar)
    else if(this.nw == 1)fill(tierra)
    else fill(montaña)
    rect(0, 0, tam/2, tam/2)
    
    if(this.ne == 0) fill(mar)
    else if(this.ne == 1)fill(tierra)
    else fill(montaña)
    rect(tam/2, 0, tam/2, tam/2)
    
    if(this.se == 0) fill(mar)
    else if(this.se == 1)fill(tierra)
    else fill(montaña)
    rect(tam/2, tam/2, tam/2, tam/2)
    
    if(this.sw == 0) fill(mar)
    else if(this.sw == 1)fill(tierra)
    else fill(montaña)
    rect(0, tam/2, tam/2, tam/2)
    
    pop()
  }

  rotar(){
    let tmp = this.nw
    this.nw = this.ne
    this.ne = this.se
    this.se = this.sw
    this.sw = tmp
  }
  
}