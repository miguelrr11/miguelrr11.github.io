let grid = [];
let lightPoints = [];

function initLighting() {
  // Initialize grid: each cell has a "wall" flag and a "visible" flag.
  for (let x = 0; x < cellsPerRow; x++) {
    grid[x] = [];
    for (let y = 0; y < cellsPerRow; y++) {
      grid[x][y] = { wall: false, visible: false };
    }
  }
}


// Reset and compute FOV using recursive shadowcasting.
function computeFOV() {
  // Reset all cells to not visible.
  for (let x = 0; x < cellsPerRow; x++) {
    for (let y = 0; y < cellsPerRow; y++) {
      grid[x][y].visible = false;
    }
  }
  
  for(let lp of lightPoints){
        // Always mark the player's cell as visible.
        if (inBounds(lp.x, lp.y)) {
            grid[lp.x][lp.y].visible = true;
        }
        
        // Process each of the 8 octants.
        for (let oct = 0; oct < 8; oct++) {
            let mult = getOctantMultipliers(oct);
            castLight(lp.x, lp.y, 1, 1.0, 0.0, fovRadius,
                    mult[0], mult[1], mult[2], mult[3]);
        }
  }
  
}

// Returns transformation coefficients for the given octant.
// The octants are ordered as follows (roughly):
// 0: N-NE, 1: E-NE, 2: E-SE, 3: S-SE, 4: S-SW, 5: W-SW, 6: W-NW, 7: N-NW.
function getOctantMultipliers(oct) {
  let mult = [
    [ 1,  0,  0,  1],  // Octant 0
    [ 0,  1,  1,  0],  // Octant 1
    [ 0, -1,  1,  0],  // Octant 2
    [-1,  0,  0,  1],  // Octant 3
    [-1,  0,  0, -1],  // Octant 4
    [ 0, -1, -1,  0],  // Octant 5
    [ 0,  1, -1,  0],  // Octant 6
    [ 1,  0,  0, -1]   // Octant 7
  ];
  return mult[oct];
}

function castLight(cx, cy, row, startSlope, endSlope, radius, xx, xy, yx, yy) {
  if (startSlope < endSlope) return;
  let radiusSquared = radius * radius;
  let newStartSlope = startSlope;
  for (let i = row; i <= radius; i++) {
    let blocked = false;
    for (let dx = -i; dx <= 0; dx++) {
      let dy = -i;
      let X = cx + dx * xx + dy * xy;
      let Y = cy + dx * yx + dy * yy;
      
      let leftSlope  = (dx - 0.5) / (dy + 0.5);
      let rightSlope = (dx + 0.5) / (dy - 0.5);
      
      if (rightSlope > startSlope) continue;
      if (leftSlope < endSlope) break;
      
      // Ensure we are within grid bounds.
      if (!inBounds(X, Y)) continue;
      
      // If within light radius, mark cell as visible.
      if (dx * dx + dy * dy < radiusSquared) {
        grid[X][Y].visible = true;
      }
      
      if (blocked) {
        if (isOpaque(X, Y)) {
          newStartSlope = rightSlope;
          continue;
        } 
        else {
          blocked = false;
          startSlope = newStartSlope;
        }
      } 
      else {
        if (isOpaque(X, Y) && i < radius) {
          blocked = true;
          grid[X][Y].visible = true; // Mark walls as visible
          castLight(cx, cy, i + 1, startSlope, leftSlope, radius, xx, xy, yx, yy);
          newStartSlope = rightSlope;
        }
      }
    }
    if (blocked) break;
  }
}

// Returns true if the cell at (x,y) is opaque (i.e. a wall).
function isOpaque(x, y) {
    // Out-of-bounds cells are considered opaque.
    if (!inBounds(x, y)) return true;
    
    // If the cell itself is a wall, it's opaque.
    if (grid[x][y].wall) return true;
    
    // Check for diagonal leakage: if the cell is diagonal to the player,
    // and both of the orthogonally adjacent cells are walls, then treat it as blocked.
    // You might need to adjust these checks depending on which diagonal directions matter.
    
    // Top-left diagonal check
    if (x > 0 && y > 0 && grid[x - 1][y].wall && grid[x][y - 1].wall) return true;
    
    // Top-right diagonal check
    if (x < cellsPerRow - 1 && y > 0 && grid[x + 1][y].wall && grid[x][y - 1].wall) return true;
    
    // Bottom-left diagonal check
    if (x > 0 && y < cellsPerRow - 1 && grid[x - 1][y].wall && grid[x][y + 1].wall) return true;
    
    // Bottom-right diagonal check
    if (x < cellsPerRow - 1 && y < cellsPerRow - 1 && grid[x + 1][y].wall && grid[x][y + 1].wall) return true;
    
    return false;
  }
  

// Helper: check whether (x,y) is within grid bounds.
function inBounds(x, y) {
  return x >= 0 && x < cellsPerRow && y >= 0 && y < cellsPerRow;
}

function updateGrid(){
    lightPoints = []
    for(let i = 0; i < cellsPerRow; i++){
        for(let j = 0; j < cellsPerRow; j++){
            grid[i][j].wall = isWall(i, j)
            if(isIluminated(i, j)) lightPoints.push({x: i, y: j})
        }
    }
    lightPoints.push({x: player.pos.x, y: player.pos.y})
}


function computeLightingGrid() {
    computeFOV()
    let lightingGrid = [];
    for (let x = 0; x < cellsPerRow; x++) {
        lightingGrid[x] = [];
        for (let y = 0; y < cellsPerRow; y++) {
            let cell = grid[x][y];
            let light = 0

            let minDist = 1000
            for(let lp of lightPoints){
                let d = dist(lp.x, lp.y, x, y)
                if(d < minDist) minDist = d
            }
            let intensity = grid[x][y].visible ? 1 - (minDist / fovRadius) : 1 - (minDist / fovRadiusWall);
            light = constrain(intensity, 0, 1);
            // if (grid[x][y].visible) {
            //     let d = dist(player.pos.x, player.pos.y, x, y);
            //     let intensity = 1 - (d / fovRadius);
            //     light = constrain(intensity, 0, 1);
            // } 
            // else{
            //     let d = dist(player.pos.x, player.pos.y, x, y);
            //     let intensity = 1 - (d / fovRadiusWall);
            //     light = constrain(intensity, 0, 1);
            // }
            lightingGrid[x][y] = {wall: cell.wall, visible: cell.visible, light:light};
        }
    }
    return lightingGrid;
    }
  