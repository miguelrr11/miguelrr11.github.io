// Topographic contour lines using Marching Squares algorithm
// Miguel Rodríguez Rodríguez 
// 14-03-2025

let noiseZoom         = 140;        // noise sampling scale (higher = bigger features)
let noiseMovementSpeed = 0.0001;   // how fast the noise field animates (higher = faster)
let steps = 15                      // number of contour lines

let cellPixelSize, spacing;
let cellsPerRow, cellsPerCol;
let cellsPerRowTopo, cellsPerColTopo;
let topoGrid = [];

let col = 65
let actualCol = 0
let strokeW = 1.5
let ctx

let WIDTHtopo, HEIGHTtopo

/*
Usage:
in setup():
    initTopo();
in draw():
    updateTopo();
    showTopo();

modify these to change the look:
    noiseZoom          = 300;        // noise sampling scale (higher = bigger features)
    noiseMovementSpeed = 0.00007;    // how fast the noise field animates (higher = faster)
    steps              = 15;         // number of contour lines
*/

function resizeTopo(w, h) {
    initTopo(h, w);
}

function initTopo(w, h, ctxRef) { 
    if(ctxRef) ctx = ctxRef
    WIDTHtopo = h
    HEIGHTtopo = w
    cellPixelSize   = 10;
    spacing         = cellPixelSize

    cellsPerRow     = Math.floor(WIDTHtopo / cellPixelSize) + 2;
    cellsPerCol     = Math.floor(HEIGHTtopo / cellPixelSize) + 2;
    cellsPerRowTopo = cellsPerRow
    cellsPerColTopo = cellsPerCol

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
    actualCol = lerp(actualCol, col, 0.1)
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
    ctx.strokeStyle = "rgb(" + actualCol + "," + actualCol + "," + actualCol + ")";
    ctx.lineWidth = strokeW


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
