// Topographic contour lines using Marching Squares algorithm
// Miguel Rodríguez Rodríguez 
// 14-03-2025

let resolution        = 8;          // subdivisions per cell (higher = smoother)
let noiseZoom         = 300;        // noise sampling scale (higher = bigger features)
let noiseMovementSpeed = 0.00007;   // how fast the noise field animates (higher = faster)
let steps = 15                      // number of contour lines

let cellPixelSize, spacing;
let cellsPerRow, cellsPerCol;
let cellsPerRowTopo, cellsPerColTopo;
let topoGrid = [];

/*
Usage:
in setup():
    initTopo();
in draw():
    updateTopo();
    showTopo();

modify these to change the look:
    resolution         = 8;          // subdivisions per cell (higher = smoother)
    noiseZoom          = 300;        // noise sampling scale (higher = bigger features)
    noiseMovementSpeed = 0.00007;   // how fast the noise field animates (higher = faster)
    steps              = 15;         // number of contour lines
*/

function initTopo() { 
    cellPixelSize   = 30;
    spacing         = cellPixelSize / resolution;

    cellsPerRow     = Math.floor(WIDTH / cellPixelSize) + 2;
    cellsPerCol     = Math.floor(HEIGHT / cellPixelSize) + 2;
    cellsPerRowTopo = cellsPerRow * resolution;
    cellsPerColTopo = cellsPerCol * resolution;

    topoGrid = Array.from({ length: cellsPerRowTopo }, () => []);
    for (let i = 0; i < cellsPerRowTopo; i++) {
        for (let j = 0; j < cellsPerColTopo; j++) {
            topoGrid[i][j] = noise(
                i / noiseZoom,
                j / noiseZoom,
                0
            );
        }
    }
}

function updateTopo() {
    const z = frameCount * noiseMovementSpeed;
    for (let i = 0; i < cellsPerRowTopo; i++) {
        for (let j = 0; j < cellsPerColTopo; j++) {
            topoGrid[i][j] = noise(
                i / noiseZoom + noiseZoom,
                j / noiseZoom + noiseZoom,
                z
            );
        }
    }
}

function showTopo() {
    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.lineWidth = zoom >= 1
        ? mapp(zoom, 1, MAX_ZOOM, 1.25, 2.5)
        : mapp(zoom, MIN_ZOOM, 1, 0.5, 1.25);


    const dK    = 1 / steps;
    const cols  = cellsPerRowTopo - 1;
    const rows  = cellsPerColTopo - 1;
    const rez   = spacing;

    for (let s = 0; s < steps; s++) {
        const threshVal = s * dK;

        for (let i = 0; i < cols; i++) {
            const x = i * rez;
            for (let j = 0; j < rows; j++) {
                const a = topoGrid[i][j];
                const b = topoGrid[i+1][j];
                const c = topoGrid[i+1][j+1];
                const d = topoGrid[i][j+1];

                // pack corners into a 4-bit case index
                const caseVal =
                    ((a > threshVal) << 3) |
                    ((b > threshVal) << 2) |
                    ((c > threshVal) << 1) |
                     (d > threshVal);

                if (caseVal === 0 || caseVal === 15) continue;

                const y = j * rez;
                // interpolate edge intersections
                const ax = x + ((threshVal - a) / (b - a)) * rez, ay = y;
                const bx = x + rez, by = y + ((threshVal - b) / (c - b)) * rez;
                const cx = x + ((threshVal - d) / (c - d)) * rez, cy = y + rez;
                const dx = x, dy = y + ((threshVal - a) / (d - a)) * rez;

                drawLine(caseVal, ax, ay, bx, by, cx, cy, dx, dy);
            }
        }
    }
}

function drawLine(caseVal, ax, ay, bx, by, cx, cy, dx, dy) {
    ctx.beginPath();
    switch (caseVal) {
        case 1:  ctx.moveTo(cx,cy); ctx.lineTo(dx,dy); break;
        case 2:  ctx.moveTo(bx,by); ctx.lineTo(cx,cy); break;
        case 3:  ctx.moveTo(bx,by); ctx.lineTo(dx,dy); break;
        case 4:  ctx.moveTo(ax,ay); ctx.lineTo(bx,by); break;
        case 5:
            ctx.moveTo(ax,ay); ctx.lineTo(dx,dy);
            ctx.moveTo(bx,by); ctx.lineTo(cx,cy);
            break;
        case 6:  ctx.moveTo(ax,ay); ctx.lineTo(cx,cy); break;
        case 7:  ctx.moveTo(ax,ay); ctx.lineTo(dx,dy); break;
        case 8:  ctx.moveTo(ax,ay); ctx.lineTo(dx,dy); break;
        case 9:  ctx.moveTo(ax,ay); ctx.lineTo(cx,cy); break;
        case 10:
            ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
            ctx.moveTo(cx,cy); ctx.lineTo(dx,dy);
            break;
        case 11: ctx.moveTo(ax,ay); ctx.lineTo(bx,by); break;
        case 12: ctx.moveTo(bx,by); ctx.lineTo(dx,dy); break;
        case 13: ctx.moveTo(bx,by); ctx.lineTo(cx,cy); break;
        case 14: ctx.moveTo(cx,cy); ctx.lineTo(dx,dy); break;
    }
    ctx.stroke();
}
