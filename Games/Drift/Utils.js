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
    line(x, y, x1, y1);
    line(x, y, x2, y2);
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

function drawTriangle(tam) {
    beginShape();
    vertex(-tam / 2, -tam / 2);
    vertex(tam / 2, -tam / 2);
    vertex(0, tam / 2);
    endShape();
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

// ===================
// Other Utilities
// ===================

function inBounds(x, y, a, b, w, h) {
    return x < a + w && x > a && y < b + h && y > b;
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