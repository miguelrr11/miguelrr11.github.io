class Cell {
    constructor(tiles, x, y, w, index) {
        // xy and size of cell
        this.x = x;
        this.y = y;
        this.w = w;
        // Index in the grid array
        this.index = index;
    
        // The indices of tiles that can be placed in this cell
        this.options = [];
    
        // Has it been collapsed to a single tile?
        this.collapsed = false;
        // Has it already been checked during recursion?
        this.checked = false;
    
        // Initialize the options with all possible tile indices
        for (let i = 0; i < tiles.length; i++) {
            this.options.push(i);
        }
    }

    show() {
        if (this.options.length == 0) {
        } 
        else if (this.collapsed) {
          let tileIndex = this.options[0];
          let img = tiles[tileIndex].img;
          renderCell(img, this.x, this.y, this.w);
        } 
        else {
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          for (let i = 0; i < this.options.length; i++) {
            let tileIndex = this.options[i];
            let img = tiles[tileIndex].img;
            let centerIndex = floor(TILE_SIZE / 2);
            let index = (centerIndex + centerIndex * TILE_SIZE) * 4;
            sumR += img.pixels[index + 0];
            sumG += img.pixels[index + 1];
            sumB += img.pixels[index + 2];
          }
          sumR /= this.options.length;
          sumG /= this.options.length;
          sumB /= this.options.length;
          fill(sumR, sumG, sumB);
          noStroke();
          square(this.x, this.y, this.w+1);
        }
      }
}