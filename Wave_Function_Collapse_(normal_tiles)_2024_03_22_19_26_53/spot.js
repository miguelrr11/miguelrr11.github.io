class Spot {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.collapsed = false;
    this.options = tiles;
    this.tile = undefined;
  }


  show() {
    if (this.collapsed) {
      translate(this.i * wn, this.j * wn);
      this.tile.show(wn);
    } 
    else {
      translate(this.i * wn, this.j * wn);
      push();
      fill(0);
      rect(0, 0, wn, wn);
      noFill();
      stroke(255);
      text(this.options.length, wn / 2, wn / 2);
      pop();
    }
  }
  

  collapse() {
    this.collapsed = true;
    this.tile = random(this.options);
    this.options = -1;
    this.updateN();
    push();
    translate(this.i * wn, this.j * wn);
    this.tile.show(wn);
    pop();
  }

  //update neighbours of collapsed tile
  updateN() {
    //east
    if (this.i + 1 <= n-1 && !board[this.i + 1][this.j].collapsed) {
      let neig = board[this.i + 1][this.j];
      let newOp = [];
      for (let i = 0; i < neig.options.length; i++) {
        if (neig.options[i].w == this.tile.e) {
          newOp.push(neig.options[i]);
        }
      }
      neig.options = newOp
    }
    //east
    if (this.i - 1 >= 0 && !board[this.i - 1][this.j].collapsed) {
      let neig = board[this.i - 1][this.j];
      let newOp = [];
      for (let i = 0; i < neig.options.length; i++) {
        if (neig.options[i].e == this.tile.w) {
          newOp.push(neig.options[i]);
        }
      }
      neig.options = newOp
    }
    //north
    if (this.j + 1 <= n-1 && !board[this.i][this.j + 1].collapsed) {
      let neig = board[this.i][this.j + 1];
      let newOp = [];
      for (let i = 0; i < neig.options.length; i++) {
        if (neig.options[i].n == this.tile.s) {
          newOp.push(neig.options[i]);
        }
      }
      neig.options = newOp
    }
    //south
    if (this.j - 1 >= 0 && !board[this.i][this.j - 1].collapsed) {
      let neig = board[this.i][this.j - 1];
      let newOp = [];
      for (let i = 0; i < neig.options.length; i++) {
        if (neig.options[i].s == this.tile.n) {
          newOp.push(neig.options[i]);
        }
      }
      neig.options = newOp
    }
    
    
  }
}








