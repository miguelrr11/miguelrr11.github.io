class Cell{
  constructor(i, j){
    this.i = i
    this.j = j
    this.prev = undefined
    this.visited = false
    
    this.n = true
    this.e = true
    this.s = true
    this.w = true
  }
  
  show(){
    push()
    noStroke()
    if(this.visited) fill(38, 196, 255)
    else fill(0)
    rect(this.i*wn, this.j*wn, wn, wn)
    
    stroke(255)
    strokeWeight(3)
    if(this.n) line(this.i*wn, this.j*wn, this.i*wn + wn, this.j*wn)
    if(this.e) line(this.i*wn + wn, this.j*wn, this.i*wn + wn, this.j*wn + wn)
    if(this.s) line(this.i*wn, this.j*wn + wn, this.i*wn + wn, this.j*wn + wn)
    if(this.w) line(this.i*wn, this.j*wn, this.i*wn, this.j*wn + wn)
    //console.log(this)
    pop()
  }
  
  isValid(x, y){
    if(x >= 0 && x < n && y >= 0 && y < n && !board[x][y].visited) return true
    // && !(salida.i == x && salida.j == y)
  }
  
  
  salida(){
    if(this.i + 1 == salida.i && this.j == salida.j){
      this.e = false
      salida.prev = this
      return salida
    }
    if(this.i + 1 == salida.i && this.j == salida.j){
      this.e = false
      salida.prev = this
      return salida
    }
    if(this.i + 1 == salida.i && this.j == salida.j){
      this.e = false
      salida.prev = this
      return salida
    }
    if(this.i + 1 == salida.i && this.j == salida.j){
      this.e = false
      salida.prev = this
      return salida
    }
    return undefined
  }
  
  move(){
    
    let res
    let options = [0, 1, 2, 3]
    
    while(options.length > 0){
      let rI = floor(random(0, options.length))
      let r = options[rI]
      if(r == 0) res = this.moveE()
      if(r == 1) res = this.moveS()
      if(r == 2) res = this.moveW()
      if(r == 3) res = this.moveN()
      if(res) return res
      else options.splice(rI, 1)
    }
    
    return undefined

  }
  
  moveE(){
    if(!this.isValid(this.i + 1, this.j)) return undefined
    let b = board[this.i + 1][this.j]
    b.w = false
    b.prev = this
    b.visited = true
    this.e = false
    return b
  }
  moveS(){
    if(!this.isValid(this.i, this.j + 1)) return undefined
    let b = board[this.i][this.j + 1]
    b.n = false
    b.prev = this
    b.visited = true
    this.s = false
    return b
  }
  moveW(){
    if(!this.isValid(this.i - 1, this.j)) return undefined
    let b = board[this.i - 1][this.j]
    b.e = false
    b.prev = this
    b.visited = true
    this.w = false
    return b
  }
  moveN(){
    if(!this.isValid(this.i, this.j - 1)) return undefined
    let b = board[this.i][this.j - 1]
    b.s = false
    b.prev = this
    b.visited = true
    this.n = false
    return b
  }
  
  
  
}