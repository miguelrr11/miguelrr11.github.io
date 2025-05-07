const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
];

class Spot {
  constructor(i, j) {
      this.i = i;
      this.j = j;
      this.x = i * widthN + widthN / 2;
      this.y = j * widthN + widthN / 2;
      this.visited = false;
      this.options = DIRECTIONS.map(d => ({ ...d, tried: false }));
  }

  clear() {
    this.visited = false;
    for (let dir of this.options) {
      dir.tried = false;
    }
  }
  

  chooseNext() {
      const available = this.options.filter(dir => {
          if (dir.tried) return false;
          const nx = this.i + dir.x;
          const ny = this.j + dir.y;
          return (
              nx >= 0 && nx < n &&
              ny >= 0 && ny < n &&
              !board[nx][ny].visited
          );
      });

      if (available.length > 0) {
          const choice = random(available);
          choice.tried = true;
          return board[this.i + choice.x][this.j + choice.y];
      }

      return undefined;
  }
}
