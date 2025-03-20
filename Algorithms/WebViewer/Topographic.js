let sclTopo, cellPixelSize, spacing, cellsPerRow, cellsPerCol, cellsPerRowTopo, cellsPerColTopo, topoGrid, sclTopoNoiseMovement;

function initTopo() {
    sclTopo = 4; //ya no se puede cambiar 
    cellPixelSize = 20; // size of each cell in pixels
    spacing = cellPixelSize / sclTopo; // cellPixelSize * (1/sclTopo)
    cellsPerRow = Math.floor(WIDTH / cellPixelSize) + 2;
    cellsPerCol = Math.floor(HEIGHT / cellPixelSize) + 2;
    cellsPerRowTopo = cellsPerRow * sclTopo;
    cellsPerColTopo = cellsPerCol * sclTopo;
    topoGrid = [];
    sclTopoNoiseMovement = 0.00008
    
    const tam = 10 * sclTopo;
    const cols = cellsPerRowTopo,
        rows = cellsPerColTopo;
    const z = frameCount * sclTopoNoiseMovement;
    for(let i = 0; i < cols; i++) {
        topoGrid[i] = [];
        const noiseI = i / tam;
        for(let j = 0; j < rows; j++) {
            topoGrid[i][j] = noise(noiseI, j / tam, z);
        }
    }
}

function updateTopo() {
    const tam = 30 * sclTopo;
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
    ctx.strokeStyle = curCol.topographic
    if(zoom >= 1) ctx.lineWidth = mapp(zoom, 1, MAX_ZOOM, 1.25, 2.5);
    else ctx.lineWidth = mapp(zoom, MIN_ZOOM, 1, 0.5, 1.25);

    const steps = 10;
    const dK = 1 / steps;
    const cols = cellsPerRowTopo - 1;
    const rows = cellsPerColTopo - 1;
    const rez = spacing;

    for (let s = 0; s < steps; s++) {
        const threshVal = s * dK;

        for (let i = 0; i < cols; i++) {
            const x = i * rez;
            for (let j = 0; j < rows; j++) {

                const a_val = topoGrid[i][j];
                const b_val = topoGrid[i + 1][j];
                const c_val = topoGrid[i + 1][j + 1];
                const d_val = topoGrid[i][j + 1];

                const caseVal = ((a_val > threshVal) << 3) |
                    ((b_val > threshVal) << 2) |
                    ((c_val > threshVal) << 1) |
                    (d_val > threshVal);

                if (caseVal === 0 || caseVal === 15) continue;

                const y = j * rez;

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

                // Draw lines using Canvas API
                drawLine(caseVal, ax, ay, bx, by, cx, cy, dx, dy);
            }
        }
    }
}

// Function to replace p5.js line() with Canvas API
function drawLine(caseVal, ax, ay, bx, by, cx, cy, dx, dy) {
    ctx.beginPath();
    
    switch (caseVal) {
        case 1:
            ctx.moveTo(cx, cy);
            ctx.lineTo(dx, dy);
            break;
        case 2:
            ctx.moveTo(bx, by);
            ctx.lineTo(cx, cy);
            break;
        case 3:
            ctx.moveTo(bx, by);
            ctx.lineTo(dx, dy);
            break;
        case 4:
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            break;
        case 5:
            ctx.moveTo(ax, ay);
            ctx.lineTo(dx, dy);
            ctx.moveTo(bx, by);
            ctx.lineTo(cx, cy);
            break;
        case 6:
            ctx.moveTo(ax, ay);
            ctx.lineTo(cx, cy);
            break;
        case 7:
            ctx.moveTo(ax, ay);
            ctx.lineTo(dx, dy);
            break;
        case 8:
            ctx.moveTo(ax, ay);
            ctx.lineTo(dx, dy);
            break;
        case 9:
            ctx.moveTo(ax, ay);
            ctx.lineTo(cx, cy);
            break;
        case 10:
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.moveTo(cx, cy);
            ctx.lineTo(dx, dy);
            break;
        case 11:
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            break;
        case 12:
            ctx.moveTo(bx, by);
            ctx.lineTo(dx, dy);
            break;
        case 13:
            ctx.moveTo(bx, by);
            ctx.lineTo(cx, cy);
            break;
        case 14:
            ctx.moveTo(cx, cy);
            ctx.lineTo(dx, dy);
            break;
    }

    ctx.stroke(); 
}
