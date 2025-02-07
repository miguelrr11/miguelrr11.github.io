// Constants for all directions (refactored names)
const EAST = 0;
const WEST = 1;
const NORTH = 2;
const SOUTH = 3;

// A Tile is a segment of the source image
class Tile {
  constructor(img, i) {
    this.img = img;
    this.img.loadPixels();
    this.index = i;
    
    // An array to keep track of adjacency rules
    this.neighbors = [];
    this.neighbors[EAST] = [];
    this.neighbors[WEST] = [];
    this.neighbors[NORTH] = [];
    this.neighbors[SOUTH] = [];

    this.freq = 1

    this.isGround = false
  }

  // Calculate which tiles can be neighbors in each direction
  calculateNeighbors(tiles) {
    for (let i = 0; i < tiles.length; i++) {
      if(this.isGround && i == this.index) continue
      if (this.overlapping(tiles[i], EAST)) {
        this.neighbors[EAST].push(i);
      }
      if (this.overlapping(tiles[i], WEST)) {
        this.neighbors[WEST].push(i);
      }
      if (this.overlapping(tiles[i], NORTH)) {
        this.neighbors[NORTH].push(i);
      }
      if (this.overlapping(tiles[i], SOUTH)) {
        this.neighbors[SOUTH].push(i);
      }
    }
  }

// Check if two tiles overlap in the specified direction
overlapping(other, direction) {
  if (direction == EAST) {
    for (let i = 1; i < TILE_SIZE; i++) {
      for (let j = 0; j < TILE_SIZE; j++) {
        let indexA = (i + j * TILE_SIZE) * 4;
        let indexB = (i - 1 + j * TILE_SIZE) * 4;
        if (differentColor(this.img, indexA, other.img, indexB)) {
          return false;
        }
      }
    }
    return true;
  } else if (direction == WEST) {
    for (let i = 0; i < TILE_SIZE - 1; i++) {
      for (let j = 0; j < TILE_SIZE; j++) {
        let indexA = (i + j * TILE_SIZE) * 4;
        let indexB = (i + 1 + j * TILE_SIZE) * 4;
        if (differentColor(this.img, indexA, other.img, indexB)) {
          return false;
        }
      }
    }
    return true;
  } else if (direction == NORTH) {
    for (let j = 0; j < TILE_SIZE - 1; j++) {
      for (let i = 0; i < TILE_SIZE; i++) {
        if (this.isGround) continue; // Ignore upper rows if it's ground
        let indexA = (i + j * TILE_SIZE) * 4;
        let indexB = (i + (j + 1) * TILE_SIZE) * 4;
        if (differentColor(this.img, indexA, other.img, indexB)) {
          return false;
        }
      }
    }
    return true;
  } else if (direction == SOUTH) {
    for (let j = 1; j < TILE_SIZE; j++) {
      for (let i = 0; i < TILE_SIZE; i++) {
        // If this tile is ground, only check the last row
        if (this.isGround && j < TILE_SIZE - 1) continue;
        let indexA = (i + j * TILE_SIZE) * 4;
        let indexB = (i + (j - 1) * TILE_SIZE) * 4;
        if (differentColor(this.img, indexA, other.img, indexB)) {
          return false;
        }
      }
    }
    return true;
  }
}

}

// Check if two pixels have different colors
function differentColor(imgA, indexA, imgB, indexB) {
  if(imgA == undefined || imgB == undefined) return true
  let rA = imgA.pixels[indexA + 0];
  let gA = imgA.pixels[indexA + 1];
  let bA = imgA.pixels[indexA + 2];
  let rB = imgB.pixels[indexB + 0];
  let gB = imgB.pixels[indexB + 1];
  let bB = imgB.pixels[indexB + 2];
  return rA !== rB || gA !== gB || bA !== bB;
}