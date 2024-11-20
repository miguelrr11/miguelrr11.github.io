class Step{
  constructor(x, y){
    this.x = x
    this.y = y
    this.tried = false
  }
}

function allOptions() {
    return [new Step(1, 0), new Step(-1, 0), new Step(0, 1), new Step(0, -1)];
}

class Spot{
  constructor(i, j){
    this.i = i
    this.j = j
    this.x = i * widthN
    this.y = j * widthN
    this.options = allOptions()
    this.visited = false
  }
  
  clear(){
    this.visited = false;
    this.options = allOptions();
  }
  
  chooseNext(){
    let available = []
    for(let s of this.options){
      let nx = this.i + s.x
      let ny = this.j + s.y
      if(!s.tried && 
         nx >= 0 && nx <= n-1 && 
         ny >= 0 && ny <= n-1 && 
         !board[nx][ny].visited) available.push(s)
    }
    
    if(available.length > 0){
      let op = random(available)
      op.tried = true
      return board[this.i + op.x][this.j + op.y];
    }
    
    return undefined
    
  }
  
}