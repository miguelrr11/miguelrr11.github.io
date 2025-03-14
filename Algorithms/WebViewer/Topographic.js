const sclTopo = 4; //ya no se puede cambiar 
const cellPixelSize = 25; // size of each cell in pixels
const spacing = cellPixelSize / sclTopo; // cellPixelSize * (1/sclTopo)
const cellsPerRow = Math.floor(WIDTH / cellPixelSize);
const cellsPerCol = Math.floor(HEIGHT / cellPixelSize);
const cellsPerRowTopo = cellsPerRow * sclTopo;
const cellsPerColTopo = cellsPerCol * sclTopo;
let topoGrid = [];
let sclTopoNoiseMovement = 0.0005

function initTopo() {
    const tam = 10 * sclTopo;
    const cols = cellsPerRowTopo,
        rows = cellsPerColTopo;
    const z = frameCount * sclTopoNoiseMovement;
    for(let i = 0; i < cols; i++) {
        topoGrid[i] = [];
        // Precompute x offset for efficiency.
        const noiseI = i / tam;
        for(let j = 0; j < rows; j++) {
            const yval = (j - (HEIGHT / 2) / 10) / 35;
            topoGrid[i][j] = noise(noiseI, j / tam, z);
        }
    }
}

function updateTopo() {
    const tam = 10 * sclTopo;
    const z = frameCount * sclTopoNoiseMovement;
    const cols = cellsPerRowTopo,
        rows = cellsPerColTopo;
    for(let i = 0; i < cols; i++) {
        const noiseI = i / tam;
        for(let j = 0; j < rows; j++) {
            topoGrid[i][j] = noise(noiseI, j / tam, z);
        }
    }
}

function showTopo() {
    push();
    stroke(50);
    strokeWeight(1.25);

    const steps = 10;
    const dK = 1 / steps;
    const cols = cellsPerRowTopo - 1;
    const rows = cellsPerColTopo - 1;
    const rez = spacing;

    // Iterate through different threshold values
    for(let s = 0; s < steps; s++) {
        const threshVal = s * dK;
        for(let i = 0; i < cols; i++) {
            // Use bit-shifting for floor division (sclTopo is 4)
            const x = i * rez;
            for(let j = 0; j < rows; j++) {

                // Retrieve the noise values at the cell corners
                const a_val = topoGrid[i][j];
                const b_val = topoGrid[i + 1][j];
                const c_val = topoGrid[i + 1][j + 1];
                const d_val = topoGrid[i][j + 1];

                // Build the marching squares case as a bit mask
                const caseVal = ((a_val > threshVal) << 3) |
                    ((b_val > threshVal) << 2) |
                    ((c_val > threshVal) << 1) |
                    (d_val > threshVal);
                // Skip cells that have no intersections
                if(caseVal === 0 || caseVal === 15) continue;

                const y = j * rez;

                // Compute the interpolated points (inline lerp: result = start + amt * (end - start))
                let amt, ax, ay, bx, by, cx, cy, dx, dy;
                amt = (threshVal - a_val) / (b_val - a_val);
                ax = x + amt * rez;
                ay = y;

                amt = (threshVal - b_val) / (c_val - b_val);
                bx = x + rez;
                by = y + amt * rez;

                amt = (threshVal - d_val) / (c_val - d_val);
                cx = x + amt * rez;
                cy = y + rez;

                amt = (threshVal - a_val) / (d_val - a_val);
                dx = x;
                dy = y + amt * rez;

                // Draw line segments based on the marching squares case
                switch(caseVal) {
                    case 1:
                        line(cx, cy, dx, dy);
                        break;
                    case 2:
                        line(bx, by, cx, cy);
                        break;
                    case 3:
                        line(bx, by, dx, dy);
                        break;
                    case 4:
                        line(ax, ay, bx, by);
                        break;
                    case 5:
                        line(ax, ay, dx, dy);
                        line(bx, by, cx, cy);
                        break;
                    case 6:
                        line(ax, ay, cx, cy);
                        break;
                    case 7:
                        line(ax, ay, dx, dy);
                        break;
                    case 8:
                        line(ax, ay, dx, dy);
                        break;
                    case 9:
                        line(ax, ay, cx, cy);
                        break;
                    case 10:
                        line(ax, ay, bx, by);
                        line(cx, cy, dx, dy);
                        break;
                    case 11:
                        line(ax, ay, bx, by);
                        break;
                    case 12:
                        line(bx, by, dx, dy);
                        break;
                    case 13:
                        line(bx, by, cx, cy);
                        break;
                    case 14:
                        line(cx, cy, dx, dy);
                        break;
                }
            }
        }
    }
    pop();
}