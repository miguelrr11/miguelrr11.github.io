class Boundarie{
  constructor(v1, v2, tipo){
    this.v1 = v1
    this.v2 = v2
    this.tipo = tipo
  }
  
  show(){
    push()
    stroke(this.tipo)
    line(this.v1.x, this.v1.y, this.v2.x, this.v2.y)
    pop()
  }
  
  setTipo(tipo){
    this.tipo = tipo
  }
  
}