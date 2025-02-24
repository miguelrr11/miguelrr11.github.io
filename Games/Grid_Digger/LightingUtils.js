function initLighting() {
    // Initialize grid: each cell has a "wall" flag and a "visible" flag.
    let grid = []
    for (let x = 0; x < cellsPerRow; x++) {
        grid[x] = [];
        for (let y = 0; y < cellsPerRow; y++) {
            grid[x][y] = {
                wall: false,
                visible: false
            };
        }
    }
    curLightMap = {
        grid: grid,
        lightPoints: [],
        lightingGrid: [],
        chunk: currentChunk
    }
    transitionLightMap = {
        grid: grid,
        lightPoints: [],
        lightingGrid: [],
        chunk: undefined
    }
}

// Reset and compute FOV using recursive shadowcasting.
function computeFOV(map) {
    // Reset all cells to not visible.
    for (let x = 0; x < cellsPerRow; x++) {
        for (let y = 0; y < cellsPerRow; y++) {
            map.grid[x][y].visible = false;
        }
    }

    for (let lp of map.lightPoints) {
        // Always mark the player's cell as visible.
        if (inBounds(lp.x, lp.y)) {
            map.grid[lp.x][lp.y].visible = true;
        }

        // Process each of the 8 octants.
        for (let oct = 0; oct < 8; oct++) {
            let mult = getOctantMultipliers(oct);
            castLight(lp.x, lp.y, 1, 1.0, 0.0, fovRadius,
                mult[0], mult[1], mult[2], mult[3], map.grid);
        }
    }
}

// Returns transformation coefficients for the given octant.
function getOctantMultipliers(oct) {
    let mult = [
        [1, 0, 0, 1], // Octant 0
        [0, 1, 1, 0], // Octant 1
        [0, -1, 1, 0], // Octant 2
        [-1, 0, 0, 1], // Octant 3
        [-1, 0, 0, -1], // Octant 4
        [0, -1, -1, 0], // Octant 5
        [0, 1, -1, 0], // Octant 6
        [1, 0, 0, -1] // Octant 7
    ];
    return mult[oct];
}

function castLight(cx, cy, row, startSlope, endSlope, radius, xx, xy, yx, yy, grid) {
    if (startSlope < endSlope) return;
    let radiusSquared = radius * radius;
    let newStartSlope = startSlope;
    for (let i = row; i <= radius; i++) {
        let blocked = false;
        for (let dx = -i; dx <= 0; dx++) {
            let dy = -i;
            let X = cx + dx * xx + dy * xy;
            let Y = cy + dx * yx + dy * yy;

            let leftSlope = (dx - 0.5) / (dy + 0.5);
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
                if (isOpaque(X, Y, grid)) {
                    newStartSlope = rightSlope;
                    continue;
                }
                else {
                    blocked = false;
                    startSlope = newStartSlope;
                }
            }
            else {
                if (isOpaque(X, Y, grid) && i < radius) {
                    blocked = true;
                    grid[X][Y].visible = true; // Mark walls as visible
                    castLight(cx, cy, i + 1, startSlope, leftSlope, radius, xx, xy, yx, yy, grid);
                    newStartSlope = rightSlope;
                }
            }
        }
        if (blocked) break;
    }
}

// Returns true if the cell at (x,y) is opaque (i.e. a wall).
function isOpaque(x, y, grid) {
    // Out-of-bounds cells are considered opaque.
    if (!inBounds(x, y)) return true;

    // If the cell itself is a wall, it's opaque.
    if (grid[x][y].wall) return true;

    // Diagonal checks to prevent leakage.
    if (x > 0 && y > 0 && grid[x - 1][y].wall && grid[x][y - 1].wall) return true;
    if (x < cellsPerRow - 1 && y > 0 && grid[x + 1][y].wall && grid[x][y - 1].wall) return true;
    if (x > 0 && y < cellsPerRow - 1 && grid[x - 1][y].wall && grid[x][y + 1].wall) return true;
    if (x < cellsPerRow - 1 && y < cellsPerRow - 1 && grid[x + 1][y].wall && grid[x][y + 1].wall) return true;

    return false;
}

// Helper: check whether (x,y) is within grid bounds.
function inBounds(x, y) {
    return x >= 0 && x < cellsPerRow && y >= 0 && y < cellsPerRow;
}

function updateGrid(map) {
    map.lightPoints = [];
    for (let i = 0; i < cellsPerRow; i++) {
        for (let j = 0; j < cellsPerRow; j++) {
            map.grid[i][j].wall = isWall(map.chunk, i, j);
            if (isIluminated(map.chunk, i, j)) {
                map.lightPoints.push({
                    x: i,
                    y: j,
                    strength: 1.0
                });
            }
        }
    }
    if(player.newPos != undefined && !transitioning){
        let a = player.coolDownMovement / coolDownMovement
        let b = 1 - a  
        map.lightPoints.push({
            x: player.pos.x,
            y: player.pos.y,
            strength: a
        });
        map.lightPoints.push({
            x: player.newPos.x,
            y: player.newPos.y,
            strength: b
        });
    }
    else{
        map.lightPoints.push({
            x: player.pos.x,
            y: player.pos.y,
            strength: 1.0
        });
    }
    
    //para las transiciones
    if (map === curLightMap && player.oldPos) {
        map.lightPoints.push({
            x: player.oldPos.x,
            y: player.oldPos.y,
            strength: 1.0
        });
    }
}

function computeLightingGrid(map) {
    updateGrid(map);
    computeFOV(map);
    let lightingGrid = [];
    for (let x = 0; x < cellsPerRow; x++) {
        lightingGrid[x] = [];
        for (let y = 0; y < cellsPerRow; y++) {
            let cell = map.grid[x][y];
            let light = 0;
            //let rad = cell.visible ? fovRadius : fovRadiusWall;
            let rad = fovRadius;
            let sensor = false
            for (let lp of map.lightPoints) {
                let d = dist(lp.x, lp.y, x, y);
                if (d < fovRadiusWall) sensor = true
                let intensity = lp.strength * Math.exp(-2 * (d / rad));
                light += intensity;
            }
            light = constrain(light, 0, 1);
            if(light == undefined) light = 0
            lightingGrid[x][y] = {
                wall: cell.wall,
                visible: cell.visible,
                light: light,
                sensor: sensor
            };
        }
    }
    map.lightingGrid = lightingGrid;
    return lightingGrid;
}