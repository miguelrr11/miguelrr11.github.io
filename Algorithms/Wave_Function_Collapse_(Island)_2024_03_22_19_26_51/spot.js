class Spot {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.collapsed = false;
    this.options = tiles;
    this.tile = undefined;
  }

  show() {
    push();
    if (this.collapsed) {
      translate(this.i * widthn, this.j * widthn);
      this.tile.show(widthn);
    } else {
      translate(this.i * widthn, this.j * widthn);
      push();
      fill(0);
      rect(0, 0, widthn, widthn);
      noFill();
      stroke(255);
      text(this.options.length, widthn / 2, widthn / 2);
      pop();
    }
    pop();
  }

  chooseTile() {
    if (this.options.length == 1){ 
      this.tile = this.options[0]
      return
    }

    let poss = [];
    
    for(let i = 0; i < this.options.length; i++){
      for(let j = 0; j < this.options[i].weight; j++){
        poss.push(this.options[i])
      }
    }

    this.tile = random(poss);
  }

  collapse() {
    this.collapsed = true;
    this.chooseTile();
    this.tile = random(this.options)
    //this.options = -1;
    this.updateN();
    push();
    translate(this.i * widthn, this.j * widthn);
    this.tile.show(widthn);
    pop();
  }

  //update neighbours of collapsed tile
  updateN() {
    //east
    if (this.i + 1 <= n - 1 && !board[this.i + 1][this.j].collapsed) {
      let neig = board[this.i + 1][this.j];
      let newOp = [];
      for (let i = 0; i < neig.options.length; i++) {
        if (
          neig.options[i].nw == this.tile.ne &&
          neig.options[i].sw == this.tile.se
        ) {
          newOp.push(neig.options[i]);
        }
      }
      neig.options = newOp;
    }
    //west
    if (this.i - 1 >= 0 && !board[this.i - 1][this.j].collapsed) {
      let neig = board[this.i - 1][this.j];
      let newOp = [];
      for (let i = 0; i < neig.options.length; i++) {
        if (
          neig.options[i].ne == this.tile.nw &&
          neig.options[i].se == this.tile.sw
        ) {
          newOp.push(neig.options[i]);
        }
      }
      neig.options = newOp;
    }
    //south
    if (this.j + 1 <= n - 1 && !board[this.i][this.j + 1].collapsed) {
      let neig = board[this.i][this.j + 1];
      let newOp = [];
      for (let i = 0; i < neig.options.length; i++) {
        if (
          neig.options[i].nw == this.tile.sw &&
          neig.options[i].ne == this.tile.se
        ) {
          newOp.push(neig.options[i]);
        }
      }
      neig.options = newOp;
    }
    //north
    if (this.j - 1 >= 0 && !board[this.i][this.j - 1].collapsed) {
      let neig = board[this.i][this.j - 1];
      let newOp = [];
      for (let i = 0; i < neig.options.length; i++) {
        if (
          neig.options[i].sw == this.tile.nw &&
          neig.options[i].se == this.tile.ne
        ) {
          newOp.push(neig.options[i]);
        }
      }
      neig.options = newOp;
    }
  }
}
