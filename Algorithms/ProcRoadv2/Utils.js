// For p5js 2.x.x

// ===================
// Math Utilities
// ===================

function mapp(value, start1, stop1, start2, stop2, clamped = false) {
    let res = start2 + ((value - start1) / (stop1 - start1)) * (stop2 - start2);
    if (clamped) {
        if (res < start2) res = start2;
        else if (res > stop2) res = stop2;
    }
    return start2 + ((value - start1) / (stop1 - start1)) * (stop2 - start2);
}

function randomm(start, stop) {
    return Math.random() * (stop - start) + start;
}

function lerpp(start, end, t) {
    return start + (end - start) * t;
}

function squaredDistance(x1, y1, x2, y2) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2;
}

function getTwoDecimals(number) {
    let numStr = number.toFixed(2);
    let decimals = numStr.split('.')[1];
    return [parseInt(decimals[0]), parseInt(decimals[1])];
}

function getDecimalPart(num) {
  return Math.abs(num % 1);
}


function getSimpleInt(n) {
    if (n === 0) return "0";
    
    const absN = Math.abs(n);

    if (absN < 0.001) return n.toExponential(2); // Very tiny, use scientific notation
    if (absN < 1) return n.toFixed(4);            // Small decimals, show 4 digits
    if (absN < 1000) return Math.floor(n);
    if (absN < 1000000) return (n / 1000).toFixed(2) + "K";
    if (absN < 1000000000) return (n / 1000000).toFixed(2) + "M";
    
    return (n / 1000000000).toFixed(2) + "B";
}

function constrainn(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

//cuanto mas bajo sea el exponent, mas sube los valores bajos
function nonlinearMap(value, start1, stop1, start2, stop2, exponent = 0.25) {
    let norm = constrainn((value - start1) / (stop1 - start1), 0, 1);
    let curved = Math.pow(norm, exponent); 
    return start2 + curved * (stop2 - start2);
}

function getRadius(circumference) {
    return circumference / (2 * Math.PI);
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function lineIntersection(p1, p2, p3, p4, infinite = false) {
  const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denom === 0) return undefined;

  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

  if (!infinite && (ua < 0 || ua > 1 || ub < 0 || ub > 1)) return undefined;

  return {
    x: p1.x + ua * (p2.x - p1.x),
    y: p1.y + ua * (p2.y - p1.y)
  };
}


function lerppos(pos1, pos2, t){
    return {x: pos1.x + (pos2.x - pos1.x) * t, y: pos1.y + (pos2.y - pos1.y) * t}
}

function getCornersOfLine(pos1, pos2, width){
    let angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) + PI / 2
    let halfW = width / 2
    let cosAngle = Math.cos(angle) * halfW
    let sinAngle = Math.sin(angle) * halfW
    return [
        {x: pos1.x + cosAngle, y: pos1.y + sinAngle},
        {x: pos1.x - cosAngle, y: pos1.y - sinAngle},
        {x: pos2.x - cosAngle, y: pos2.y - sinAngle},
        {x: pos2.x + cosAngle, y: pos2.y + sinAngle},
    ]
}

function getPointsInsideLine(pos1, pos2, spacing){
    let points = []
    let totalDist = dist(pos1.x, pos1.y, pos2.x, pos2.y)
    let numPoints = Math.floor(totalDist / spacing)
    for(let i = 0; i <= numPoints; i++){
        let t = i / numPoints
        points.push(lerppos(pos1, pos2, t))
    }   
    return points
}

function orderClockwise(center, points) {
    return points.slice().sort((a, b) => {
        const angleA = Math.atan2(a.y - center.y, a.x - center.x);
        const angleB = Math.atan2(b.y - center.y, b.x - center.x);
        return angleA - angleB;
    });
}


function getBoundingBoxCorners(points) {
    if (points.length === 0) return null;

    let xMin = points[0].x;
    let xMax = points[0].x;
    let yMin = points[0].y;
    let yMax = points[0].y;

    for (let p of points) {
        if (p.x < xMin) xMin = p.x;
        if (p.x > xMax) xMax = p.x;
        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
    }

    return [
        {x: xMin, y: yMin}, // Top-left
        {x: xMax, y: yMin}, // Top-right
        {x: xMax, y: yMax}, // Bottom-right
        {x: xMin, y: yMax}  // Bottom-left
    ];
}

// ===================
// Color Utilities
// ===================

function randomizeColor(col, amt) {
    if (!col._color.coords) return col.map(c => c + randomm(-amt, amt));
    else if (col._color.coords.length == 4)
        return color(col._color.coords[0] + randomm(-amt, amt), col._color.coords[1] + randomm(-amt, amt), col._color.coords[2] + randomm(-amt, amt), col._color.coords[3]);
    else if (col._color.coords.length == 3)
        return color(col._color.coords[0] + randomm(-amt, amt), col._color.coords[1] + randomm(-amt, amt), col._color.coords[2] + randomm(-amt, amt));
    else if (col._color.coords.length == 1)
        return color(col._color.coords[0] + randomm(-amt, amt));
    else if (col._color.coords.length == 2)
        return color(col._color.coords[0] + randomm(-amt, amt), col._color.coords[1] + randomm(-amt, amt));
    return col._color.coords.map(c => c + randomm(-amt, amt));
}

function modifyColor(col, amt) {
    return col.map(c => c + amt);
}

function lerppColor(color1, color2, t) {
    return color1.map((c, i) => (1 - t) * c + t * color2[i]);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

// ===================
// Drawing Utilities
// ===================

let density;

function drawFastRect(x, y, w, h, r, g, b, a = 255) {
    let adjustedWidth = width * density;
    for (let i = 0; i < w * density; i++) {
        for (let j = 0; j < h * density; j++) {
            let index = 4 * (((y * density) + j) * adjustedWidth + ((x * density) + i));
            pixels[index] = r;
            pixels[index + 1] = g;
            pixels[index + 2] = b;
            pixels[index + 3] = a;
        }
    }
}

function gradientLine(x1, y1, x2, y2, colors) {
    var grad = this.drawingContext.createLinearGradient(x1, y1, x2, y2);
    for (let i = 0; i < colors.length; i++) {
        grad.addColorStop(i / (colors.length - 1), colors[i]);
    }
    this.drawingContext.strokeStyle = grad;
    line(x1, y1, x2, y2);
}

function drawArrowTip(x, y, angle, arrowSize = 7) {
    let x1 = x + Math.cos(angle - PI / 6) * arrowSize;
    let y1 = y + Math.sin(angle - PI / 6) * arrowSize;
    let x2 = x + Math.cos(angle + PI / 6) * arrowSize;
    let y2 = y + Math.sin(angle + PI / 6) * arrowSize;
    beginShape()
    vertex(x1, y1);
    vertex(x, y);
    vertex(x2, y2);
    endShape(CLOSE);
}

function drawDashedLine(x1, y1, x2, y2, dashLength = 10) {
    let d = dist(x1, y1, x2, y2);
    let numDashes = Math.floor(d / dashLength);
    let dx = (x2 - x1) / numDashes;
    let dy = (y2 - y1) / numDashes;
    for (let i = 0; i < numDashes; i++) {
        line(x1 + i * dx, y1 + i * dy, x1 + (i + 0.5) * dx, y1 + (i + 0.5) * dy);
    }
}

// Devuelve curva (arr de puntos) de b a c, a y d son las manecillas
// La resolucion es la distacia de los segmentos
function bezierPoints(a, b, c, d, resolution, tension = 0.3) {
  const sub = (p, q) => ({ x: p.x - q.x, y: p.y - q.y });
  const add = (p, q) => ({ x: p.x + q.x, y: p.y + q.y });
  const mul = (p, s) => ({ x: p.x * s, y: p.y * s });
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);

  // Manecillas: dirigidas por (b - a) y (c - d)
  const h1 = add(b, mul(sub(b, a), tension));
  const h2 = add(c, mul(sub(c, d), tension));

  // Punto sobre la Bézier cúbica
  const bezPoint = (t) => {
    const u = 1 - t;
    const uu = u * u, tt = t * t;
    const uuu = uu * u, ttt = tt * t;

    const p = mul(b, uuu);
    const p1 = mul(h1, 3 * uu * t);
    const p2 = mul(h2, 3 * u * tt);
    const p3 = mul(c, ttt);
    return add(add(p, p1), add(p2, p3));
  };

  // Estimar longitud para decidir cuántos segmentos hacen falta
  const safeRes = (resolution > 0 && isFinite(resolution)) ? resolution : Math.max(1, dist(b, c) / 10);
  let approxLen = 0;
  const samples = 20;
  let prev = b;
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const cur = bezPoint(t);
    approxLen += dist(prev, cur);
    prev = cur;
  }

  const segments = Math.max(1, Math.ceil(approxLen / safeRes));
  // Generar solo puntos intermedios (excluye t=0 y t=1)
  const pts = [];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    pts.push(bezPoint(t));
  }
  return [b, ...pts, c]
}

// Devuelve un punto en la curva bezier para un valor t (0 a 1)
// a y d son las manecillas, b y c son los puntos de inicio y fin
function bezierPointAt(a, b, c, d, t, tension = 0.3) {
  const sub = (p, q) => ({ x: p.x - q.x, y: p.y - q.y });
  const add = (p, q) => ({ x: p.x + q.x, y: p.y + q.y });
  const mul = (p, s) => ({ x: p.x * s, y: p.y * s });

  // Manecillas: dirigidas por (b - a) y (c - d)
  const h1 = add(b, mul(sub(b, a), tension));
  const h2 = add(c, mul(sub(c, d), tension));

  // Punto sobre la Bézier cúbica en t
  const u = 1 - t;
  const uu = u * u, tt = t * t;
  const uuu = uu * u, ttt = tt * t;

  const p = mul(b, uuu);
  const p1 = mul(h1, 3 * uu * t);
  const p2 = mul(h2, 3 * u * tt);
  const p3 = mul(c, ttt);

  return add(add(p, p1), add(p2, p3));
}


// ===================
// String Utilities
// ===================

function removeBarrabaja(str) {
    if (str == undefined) return '';
    let newStr = '';
    for (let i = 0; i < str.length; i++) {
        if (str[i] == '_') newStr += ' ';
        else newStr += str[i];
    }
    return newStr;
}

function replaceBlankWithBarraBaja(str) {
    if (str == undefined) return '';
    let newStr = '';
    for (let i = 0; i < str.length; i++) {
        if (str[i] == ' ') newStr += '_';
        else newStr += str[i];
    }
    return newStr;
}

function shortenStr(str, maxLength = 25) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + '...';
    }
    return str;
}

function getAllStr() {
    let str = "";
    for (let p of particles) {
        if (p.str == undefined) continue;
        str += p.str + ', ';
    }
    return str;
}

function getWrappedTextHeight(txt, maxW) {
    // Determine line height (fallback to textSize)
    let lh = textLeading() || textSize();
  
    // Break into chunks on explicit newlines:
    let paragraphs = txt.split('\n');
    let lines = [];
  
    paragraphs.forEach(para => {
      if (para === '') {
        // explicit blank line
        lines.push('');
      } else {
        // wrap this paragraph
        let words = para.split(' ');
        let current = '';
  
        for (let w of words) {
          let test = current ? current + ' ' + w : w;
          if (textWidth(test) > maxW) {
            lines.push(current);
            current = w;
          } else {
            current = test;
          }
        }
  
        // push any leftover text
        if (current) {
          lines.push(current);
        }
      }
    });
  
    // total height = number of lines × line-height
    return lines.length * lh;
}

function isPrintableKey(char) {
    return char.length === 1 && char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126;
}

// ===================
// Other Utilities
// ===================

function inBounds(x, y, a, b, w, h) {
    return x < a + w && x > a && y < b + h && y > b;
}

function inBoundsTwoCorners(x, y, c1, c2, offset = 0) {
    return x < c2.x + offset && x > c1.x - offset && y < c2.y + offset && y > c1.y - offset;
}

function inBoundsCorners(x, y, corners, offset = 0) {
    //corners = [xMin, xMax, yMin, yMax]
    return x < corners[1] + offset && x > corners[0] - offset && y < corners[3] + offset && y > corners[2] - offset;
}

// ===================
// Drag and Zoom Shortcut
// ===================

/*
let xOff = 0
let yOff = 0
let prevMouseX = 0
let prevMouseY = 0
let zoom = 1

function mouseDragged() {
    if(!prevMouseX) prevMouseX = mouseX
    if(!prevMouseY) prevMouseY = mouseY
    let dx = mouseX - prevMouseX; // Change in mouse X
    let dy = mouseY - prevMouseY; // Change in mouse Y
    xOff += dx;
    yOff += dy;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

function mouseReleased() {
    prevMouseX = undefined
    prevMouseY = undefined
}

function mouseWheel(event) {
    let worldX = (mouseX - xOff) / zoom;
    let worldY = (mouseY - yOff) / zoom;
    zoom += event.delta / 1000;
    zoom = Math.max(0.1, Math.min(zoom, 3));
    xOff = mouseX - worldX * zoom;
    yOff = mouseY - worldY * zoom;
    return false;
}

function draw(){
    translate(xOff, yOff)
    scale(zoom)
}

function getRelativePos(x, y){
    let worldX = (x - xOff) / zoom;
    let worldY = (y - yOff) / zoom;
    return createVector(worldX, worldY);
}
*/