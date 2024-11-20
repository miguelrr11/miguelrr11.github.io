class Node{
  constructor(i, j){
    this.i = i
    this.j = j
    this.parent = 0
    this.g = 99999
    this.h = this.heur()
    this.f = 99999
  }
  
  heur(){
    return dist(this.i, this.j, goal.x, goal.y)
    //return this.cheb(this, goal)
  }
  
  cheb(v1, v2) {
    const deltaX = abs(v1.x - v2.x);
    const deltaY = abs(v1.y - v2.y);

    return max(deltaX, deltaY);
}
  
  //this = current
  getNeighbours(){
    let steps = this.getSteps()
    let neighbours = []
    for(let s of steps){
      if(s.x + this.i >= 0 && s.x + this.i < n 
         && s.y + this.j >= 0 && s.y + this.j < n
         && !board[s.x + this.i][s.y + this.j]){
        
            let aux = new Node(s.x + this.i, s.y + this.j)
            //aux.g = dist(start.i, start.j, aux.i, aux.j)
            aux.h = this.heur()
            aux.f = aux.g + aux.h
            aux.parent = this
            neighbours.push(aux)
      }
    }
    //console.log(neighbours.length)
    return neighbours
  }
  
  notSkipping(s){
    if(s.x == -1 && s.y == -1){
      if(board[this.i - 1][this.j] && board[this.i][this.j - 1]) return false
    }
    else if(s.x == 1 && s.y == -1){
      if(board[this.i + 1][this.j] && board[this.i][this.j - 1]) return false
    }
    else if(s.x == 1 && s.y == 1){
      if(board[this.i + 1][this.j] && board[this.i][this.j + 1]) return false
    }
    else if(s.x == -1 && s.y == 1){
      if(board[this.i - 1][this.j] && board[this.i][this.j + 1]) return false
    }
    else return true
  }
  
  getSteps(){
    return [createVector(-1,-1), createVector(0,-1), createVector(1,-1),
           createVector(-1,0), createVector(1,0),
           createVector(-1,1), createVector(0,1), createVector(1,1)]
  }
  
}