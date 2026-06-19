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

function lineIntersection(p1, p2, p3, p4) {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denom === 0) return undefined; 

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return undefined;

    return {
        x: p1.x + ua * (p2.x - p1.x),
        y: p1.y + ua * (p2.y - p1.y)
    };
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

function getPopularColors(
  img, count = 3, bucketSize = 32, step = 1,
  distinctHue = false, hueMinDiff = 30
) {
  img.loadPixels();
  const px = img.pixels;
  const levels = Math.ceil(256 / bucketSize);
  const buckets = {};
  const stride = 4 * Math.max(1, Math.floor(step));

  for (let i = 0; i < px.length; i += stride) {
    if (px[i + 3] < 128) continue; // skip mostly-transparent pixels

    const r = px[i], g = px[i + 1], b = px[i + 2];
    const key = (Math.floor(r / bucketSize) * levels
              +  Math.floor(g / bucketSize)) * levels
              +  Math.floor(b / bucketSize);

    if (!buckets[key]) buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
    const bk = buckets[key];
    bk.count++; bk.r += r; bk.g += g; bk.b += b;
  }

  const sorted = Object.values(buckets)
    .sort((a, b) => b.count - a.count)
    .map(bk => [
      Math.round(bk.r / bk.count),
      Math.round(bk.g / bk.count),
      Math.round(bk.b / bk.count),
    ]);

  const minDist = bucketSize * 1.5;
  const result = [];

  // Pick the distinctness rule once
  const passes = distinctHue
    ? (c) => isHueFarEnough(c, result, hueMinDiff)
    : (c) => isFarEnough(c, result, minDist);

  // Pass 1: enforce distinctness
  for (const avg of sorted) {
    if (passes(avg)) result.push(avg);
    if (result.length === count) return result;
  }

  // Pass 2: top up with the next most popular, skipping exact dupes
  for (const avg of sorted) {
    if (!result.some(c => c[0] === avg[0] && c[1] === avg[1] && c[2] === avg[2])) {
      result.push(avg);
    }
    if (result.length === count) break;
  }
  return result;
}

function isFarEnough(c, chosen, minDist) {
  return chosen.every(o => {
    const dr = o[0] - c[0], dg = o[1] - c[1], db = o[2] - c[2];
    return Math.sqrt(dr * dr + dg * dg + db * db) >= minDist;
  });
}

function isHueFarEnough(c, chosen, minDiff) {
  const h = rgbHue(c[0], c[1], c[2]);
  return chosen.every(o => {
    const ho = rgbHue(o[0], o[1], o[2]);
    if (h === null || ho === null) return h !== ho; // achromatic handling (see note)
    const d = Math.abs(h - ho);
    return Math.min(d, 360 - d) >= minDiff; // hue is circular
  });
}

function rgbHue(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return null; // gray/black/white — no meaningful hue
  let h;
  if (max === r)      h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else                h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
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

function createGlitchyImage(img, imgW, imgH, imgPos, opts = {}){
    //what this function does is strech the edge pixels of an image towards the sides of the canvas, creating a glitchy effect
    //opts:
    //  sides       {left, right, top, bottom} - which edges get extended
    //  type        'noise' | 'sine' | 'none'  - how the stretched columns are distorted vertically
    //  amp         max vertical pixel shift of the stretched columns
    //  scale       noise zoom / sine frequency
    //  symmetrical if true the distortion is driven by distance to the image, so left and right mirror each other
    //  color       {mode, amount, tint, levels, shift} - recolours the stretched pixels, growing with distance:
    //              mode: 'none' | 'invert' | 'tint' | 'rainbow' | 'chromatic' | 'posterize' | 'fade'
    //              amount 0..1 strength, tint [r,g,b], levels = posterize steps, shift = chromatic split in px
    const {
        sides = {left: true, right: true, top: false, bottom: false},
        type = 'noise',
        amp = 60,
        scale = 0.02,
        symmetrical = true,
        color = {}
    } = opts
    const isSine = type === 'sine'
    const doDistort = type !== 'none' && amp !== 0

    //resolve the colour effect once, map its name to an int so the inner loop only switches on a number
    const cAmount = color.amount != null ? color.amount : 1
    const cTint = color.tint || [255, 60, 180]
    const cLevels = color.levels || 4
    const cShift = color.shift != null ? color.shift : 10
    const cModeCode = {none: 0, invert: 1, tint: 2, rainbow: 3, chromatic: 4, posterize: 5, fade: 6}[color.mode] || 0
    const doColor = cModeCode !== 0 && cAmount !== 0

    //rainbow mode reads from a precomputed 256-entry palette (cosine gradient) so there's no trig per pixel
    let palette = null
    if(cModeCode === 3){
        palette = new Uint8Array(256 * 3)
        for(let i = 0; i < 256; i++){
            const t = i / 255 * 6.28318
            palette[i * 3]     = 128 + 127 * Math.sin(t)
            palette[i * 3 + 1] = 128 + 127 * Math.sin(t + 2.094)
            palette[i * 3 + 2] = 128 + 127 * Math.sin(t + 4.188)
        }
    }

    img.loadPixels()
    const src = img.pixels          //raw RGBA bytes of the source image
    const iw = img.width
    const ih = img.height

    //the rectangle where the image is displayed inside the canvas (imgW/imgH is the display size, imgPos its center)
    const left = imgPos.x - imgW/2
    const right = imgPos.x + imgW/2
    const top = imgPos.y - imgH/2
    const bottom = imgPos.y + imgH/2

    //newImg covers the whole canvas so it can be drawn at (0,0)
    const newImg = createImage(width, height)
    newImg.loadPixels()
    const dst = newImg.pixels       //starts fully transparent, we only write the pixels we want
    const cw = width
    const ch = height

    const sLeft = sides.left, sRight = sides.right, sTop = sides.top, sBottom = sides.bottom

    //precompute the source column for every canvas x, so there are no divisions in the inner loop
    const colSrc = new Int32Array(cw)
    //colFactor = 0 at the image edge -> 1 at the canvas edge, so the distortion grows with distance
    const colFactor = new Float32Array(cw)
    //colDist = pixel distance from the image edge; used as the distortion coordinate so both sides can mirror
    const colDist = new Float32Array(cw)
    for(let x = 0; x < cw; x++){
        let sx = (x - left) / imgW * iw | 0
        if(sx < 0) sx = 0
        else if(sx > iw - 1) sx = iw - 1
        colSrc[x] = sx

        if(x < left){
            colFactor[x] = left > 0 ? (left - x) / left : 0
            colDist[x] = left - x
        }
        else if(x >= right){
            colFactor[x] = (cw - right) > 0 ? (x - right) / (cw - right) : 0
            colDist[x] = x - right
        }
        else { colFactor[x] = 0; colDist[x] = 0 }
    }

    for(let y = 0; y < ch; y++){
        const inRows = (y >= top && y < bottom)
        const aboveTop = (y < top)
        //map the canvas row to a row of the source image, clamped
        let sy = (y - top) / imgH * ih | 0
        if(sy < 0) sy = 0
        else if(sy > ih - 1) sy = ih - 1

        //how far this row is from the image (0 inside -> 1 at the canvas edge), used by top/bottom effects
        let rowF = 0
        if(aboveTop) rowF = top > 0 ? (top - y) / top : 0
        else if(y >= bottom) rowF = (ch - bottom) > 0 ? (y - bottom) / (ch - bottom) : 0

        const dRow = y * cw
        for(let x = 0; x < cw; x++){
            //decide which source pixel feeds this canvas pixel (ssx < 0 means leave transparent)
            //str = 0..1 distance from the image, drives the colour effects
            let ssx = -1, ssy = 0, str = 0
            if(inRows){
                if(x >= left && x < right){ ssx = colSrc[x]; ssy = sy }   //inside the image
                else {
                    const useLeft = (x < left)
                    if(useLeft ? sLeft : sRight){                         //stretch first/last column
                        ssx = useLeft ? 0 : iw - 1
                        ssy = sy
                        str = colFactor[x]
                        if(doDistort){
                            //coord is symmetric (distance to image) or raw x; -1..1 wave * amp * distance-from-image
                            const coord = symmetrical ? colDist[x] : x
                            const n = isSine ? Math.sin((coord + y) * scale)
                                             : (noise(coord * scale, y * scale) - 0.5) * 2
                            ssy = sy + (n * amp * colFactor[x] | 0)
                            if(ssy < 0) ssy = 0
                            else if(ssy > ih - 1) ssy = ih - 1
                        }
                    }
                }
            }
            else if(x >= left && x < right){
                if(aboveTop){ if(sTop){ ssx = colSrc[x]; ssy = 0; str = rowF } }      //stretch first row
                else { if(sBottom){ ssx = colSrc[x]; ssy = ih - 1; str = rowF } }     //stretch last row
            }
            if(ssx < 0) continue

            const si = (ssx + ssy * iw) << 2
            const di = (x + dRow) << 2
            let r = src[si], g = src[si + 1], b = src[si + 2], a = src[si + 3]

            if(doColor && str > 0){
                const t = Math.min(1, str * cAmount)   //blend strength, capped so it never over-shoots
                switch(cModeCode){
                    case 1:  //invert: fade toward the negative
                        r += (255 - 2 * r) * t
                        g += (255 - 2 * g) * t
                        b += (255 - 2 * b) * t
                        break
                    case 2:  //tint: fade toward a single colour
                        r += (cTint[0] - r) * t
                        g += (cTint[1] - g) * t
                        b += (cTint[2] - b) * t
                        break
                    case 3: {//rainbow: fade toward a palette colour picked by distance
                        const li = (str * 255 | 0) * 3
                        r += (palette[li]     - r) * t
                        g += (palette[li + 1] - g) * t
                        b += (palette[li + 2] - b) * t
                        break
                    }
                    case 4: {//chromatic: split red up and blue down by a growing vertical offset
                        const sh = (str * cShift) | 0
                        let ry = ssy + sh; if(ry < 0) ry = 0; else if(ry > ih - 1) ry = ih - 1
                        let by = ssy - sh; if(by < 0) by = 0; else if(by > ih - 1) by = ih - 1
                        r = src[(ssx + ry * iw) << 2]
                        b = src[((ssx + by * iw) << 2) + 2]
                        break
                    }
                    case 5: {//posterize: crush to fewer colour levels the farther out we go
                        let lv = (cLevels - (cLevels - 2) * str) | 0
                        if(lv < 2) lv = 2
                        const step = 255 / (lv - 1)
                        r = Math.round(r / step) * step
                        g = Math.round(g / step) * step
                        b = Math.round(b / step) * step
                        break
                    }
                    case 6:  //fade: dissolve into the background with distance
                        a *= (1 - t)
                        break
                }
            }

            dst[di]     = r
            dst[di + 1] = g
            dst[di + 2] = b
            dst[di + 3] = a
        }
    }
    newImg.updatePixels()
    return newImg
}


//draws the string at (x, y) with a flipped, faded, stretched reflection below it.
//stretchFactor: 1 = mirror the same height, >1 = elongated reflection, <1 = squashed.
function createReflectedText(str, x, y, opts = {}, stretchFactor = 1, font, alignment){
    const {
        fontSize = 120,
        col = [255, 255, 255],
        gap = 4,
        fade = 0.6
    } = opts

    const g = createGraphics(width, height)
    g.textFont(font)
    g.textSize(fontSize)
    g.textAlign(alignment, BASELINE)   //baseline anchoring is what lets the reflection meet the text's bottom
    g.noStroke()
    g.fill(col[0], col[1], col[2])

    //the normal text, baseline sitting at y
    g.text(str, x, y)

    //the reflection goes on its own buffer so we can multiply its alpha by a gradient
    const ref = createGraphics(width, height)
    ref.textFont(font)
    ref.textSize(fontSize)
    ref.textAlign(alignment, BASELINE)
    ref.noStroke()
    ref.fill(col[0], col[1], col[2])

    //flip vertically (negative Y) and stretch by the factor; baseline anchored just below the text
    const refTop = y + gap
    ref.push()
    ref.translate(x, refTop)
    ref.scale(1, -stretchFactor)
    ref.text(str, 0, 0)
    ref.pop()

    //fade: keep the reflection only where a top-down gradient is opaque (destination-in mask)
    const ctx = ref.drawingContext
    const refBottom = refTop + fontSize * stretchFactor
    const grad = ctx.createLinearGradient(0, refTop, 0, refBottom)
    grad.addColorStop(0, 'rgba(0,0,0,' + fade + ')')  //right under the text: most visible
    grad.addColorStop(1, 'rgba(0,0,0,0)')             //farther down: fully gone
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = grad
    ctx.fillRect(0, refTop, width, height - refTop)
    ctx.globalCompositeOperation = 'source-over'      //restore default for safety

    g.image(ref, 0, 0)
    return g
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

//grab outline points; works whether textToPoints is global (p5 2.0) or a font method (fallback)
function getTextPoints(str, x, y, fontSize, options, font){
    if(typeof textToPoints === 'function') return textToPoints(str, x, y, options)
    return font.textToPoints(str, x, y, fontSize, options)
}

function createGlitchyText(str, x, y, font, opts = {}){
    //draws curvy "energy" strokes that fly off the left/right silhouette of the text toward the
    //screen edges, fading from transparent (at the edge) into bright (at the letter)
    const {
        fontSize = 200,
        col = [255, 255, 255],
        spacing = 1,
        sampleFactor = 0.5,
        drawText = true,
        justFirstAndLastLetters = false, //only emit strands from the outer edges (first + last char)
        energy = {}
    } = opts

    const e = {
        chance: 0.08, minLen: 8, reach: null,
        grad1From: [255, 255, 255, 0], grad1To: [255, 255, 255, 255], grad1Speed: [3, 5],
        grad2From: [255, 255, 255, 255], grad2To: [0, 0, 0, 0], grad2Speed: [0.4, 0.8],
        startDist: [0, 0],
        curveAmp: 0.18, curveAmpRand: 0.6, curvePower: 1.8,
        waves: 1.4, wavesRand: 0.5, endDrift: 0.25,
        weight: 1, weightRand: 0.4, segments: 28,
        ...energy
    }

    //textToPoints reads the font/size/alignment off the main canvas
    textFont(font)
    textSize(fontSize)
    textAlign(CENTER, CENTER)

    //sample the silhouette from a rasterised copy of the text (font-agnostic + always dense):
    //draw the word into a tight buffer, then read the leftmost/rightmost lit pixel of each row.
    //(textToPoints' point density is wildly font-dependent - OTF fonts can yield almost nothing.)
    const asc = textAscent(), desc = textDescent()
    const pad = Math.ceil(fontSize * 0.5)                       //room for curves/overshoot
    const bw = Math.max(1, Math.ceil(textWidth(str)) + pad * 2)
    const bh = Math.max(1, Math.ceil(asc + desc) + pad * 2)
    const ref = createGraphics(bw, bh)
    ref.pixelDensity(1)
    ref.textFont(font); ref.textSize(fontSize); ref.textAlign(CENTER, CENTER)
    ref.noStroke(); ref.fill(255)
    ref.text(str, bw / 2, bh / 2)                               //buffer centre maps to (x, y) on the main canvas
    ref.loadPixels()

    //bin by row; keep the leftmost and rightmost lit pixel of each row = the silhouette
    const leftPt = new Map()
    const rightPt = new Map()
    let minX = Infinity, maxX = -Infinity
    const ox = x - bw / 2, oy = y - bh / 2                      //buffer -> canvas offset
    const step = Math.max(1, Math.round(spacing))
    for(let by = 0; by < bh; by += step){
        let lx = -1, rx = -1
        for(let bx = 0; bx < bw; bx++){
            if(ref.pixels[(by * bw + bx) * 4 + 3] > 10){        //lit pixel (alpha)
                if(lx < 0) lx = bx
                rx = bx
            }
        }
        if(lx < 0) continue                                     //empty row
        const cy = oy + by
        leftPt.set(by,  {x: ox + lx, y: cy})
        rightPt.set(by, {x: ox + rx, y: cy})
        if(ox + lx < minX) minX = ox + lx
        if(ox + rx > maxX) maxX = ox + rx
    }
    ref.remove()                                                //free the buffer (this runs every frame)

    //optionally restrict to the outer edges: only keep left points within one glyph-width of the
    //string's left edge (= the first char) and right points within one glyph-width of the right edge
    //(= the last char). this stops a tall middle letter from sprouting strands in the centre.
    let leftBand = Infinity, rightBand = -Infinity
    if(justFirstAndLastLetters && str.length > 0){
        leftBand  = minX + textWidth(str[0])
        rightBand = maxX - textWidth(str[str.length - 1])
    }

    //everything goes into a buffer so the random curves stay fixed until the next rebuild
    const g = createGraphics(width, height)
    g.noFill()

    //keep silhouette points whose strand is long enough (so the count we pick is the count we draw),
    //and, if requested, only those within the first/last char bands
    const leftArr  = [...leftPt.values()].filter(p => p.x >= e.minLen && p.x <= leftBand)
    const rightArr = [...rightPt.values()].filter(p => width - p.x >= e.minLen && p.x >= rightBand)

    //both sides emit the SAME number of strands
    const count = Math.round(e.chance * Math.min(leftArr.length, rightArr.length))


    //strand target x: a fixed `reach` px outward when set, otherwise all the way to the canvas edge.
    //(reach lets strands have a consistent length even when the text nearly fills the canvas; the
    //tail just runs off-canvas and fades out there.)
    //left silhouette -> curve out to the left
    for(const p of sampleN(leftArr, count))  drawEnergyCurve(g, p.x, p.y, e.reach ? p.x - e.reach : 0, e)
    //right silhouette -> curve out to the right
    for(const p of sampleN(rightArr, count)) drawEnergyCurve(g, p.x, p.y, e.reach ? p.x + e.reach : width, e)

    //the actual letters on top
    if(drawText){
        g.noStroke()
        g.fill(col[0], col[1], col[2])
        g.textFont(font)
        g.textSize(fontSize)
        g.textAlign(CENTER, CENTER)
        g.text(str, x, y)
    }

    return g
}

//one curvy energy stroke from the silhouette point (sx,sy) out to the screen edge at ex.
//curveness grows with distance from the letter (the "origin") and with the strand's length.
//colour+alpha runs through two gradients laid end-to-end (see grad1*/grad2* options); the
//crossover point between them is set by the two per-strand speeds.
function drawEnergyCurve(g, sx, sy, ex, e){
    const len = Math.abs(ex - sx)
    if(len < e.minLen) return

    //per-strand randomness, fixed for the life of this stroke
    const amp = len * e.curveAmp * (1 + random(-e.curveAmpRand, e.curveAmpRand))
    const drift = len * e.endDrift * random(-1, 1)
    const waves = e.waves * (1 + random(-e.wavesRand, e.wavesRand))
    const phase = random(TWO_PI)

    //per-strand gradient speeds -> how much of the strand each gradient eats up.
    //higher speed = completes faster = shorter portion. crossover splits the two.
    const s1 = random(e.grad1Speed[0], e.grad1Speed[1])
    const s2 = random(e.grad2Speed[0], e.grad2Speed[1])
    const cross = (1 / s1) / (1 / s1 + 1 / s2)

    const g1a = color(e.grad1From[0], e.grad1From[1], e.grad1From[2], e.grad1From[3])
    const g1b = color(e.grad1To[0],   e.grad1To[1],   e.grad1To[2],   e.grad1To[3])
    const g2a = color(e.grad2From[0], e.grad2From[1], e.grad2From[2], e.grad2From[3])
    const g2b = color(e.grad2To[0],   e.grad2To[1],   e.grad2To[2],   e.grad2To[3])

    g.strokeWeight(e.weight * (1 + random(-e.weightRand, e.weightRand)))

    //per-strand: skip this many segments at the origin so the strand starts away from the letter
    const startSeg = constrain(Math.round(random(e.startDist[0], e.startDist[1])), 0, e.segments - 1)

    //point on the (absolute) curve path at parameter t -> geometry is unchanged by startDist
    const px_ = t => lerp(sx, ex, t)
    const py_ = t => sy + drift * t + Math.sin(t * PI * waves + phase) * amp * Math.pow(t, e.curvePower)

    let px = px_(startSeg / e.segments), py = py_(startSeg / e.segments)
    for(let s = startSeg + 1; s <= e.segments; s++){
        const t = s / e.segments               //0 at the letter -> 1 at the edge (curve geometry)
        const x = px_(t), y = py_(t)

        //gradient runs over the VISIBLE part of the strand, so it still fades in cleanly at the start
        const tc = (s - startSeg) / (e.segments - startSeg)
        let c
        if(tc <= cross) c = lerpColor(g1a, g1b, cross > 0 ? tc / cross : 1)
        else            c = lerpColor(g2a, g2b, cross < 1 ? (tc - cross) / (1 - cross) : 1)
        g.stroke(c)
        g.line(px, py, x, y)
        px = x; py = y
    }
}

//return n random distinct elements of arr (partial Fisher-Yates shuffle)
function sampleN(arr, n){
    const a = arr.slice()
    for(let i = a.length - 1; i > 0; i--){
        const j = Math.floor(random() * (i + 1))
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp
    }
    return a.slice(0, Math.min(n, a.length))
}

//base colour with each channel randomly nudged by +/- variance, clamped to 0..255
function randCol(col, variance, mono, withNoise = false, noiseVal = 0){
    if(mono){
        let ran = withNoise ? noise(noiseVal) : random(-variance, variance)
        const r = constrain(col[0] + ran, 0, 255)
        const gc = constrain(col[1] + ran, 0, 255)
        const b = constrain(col[2] + ran, 0, 255)
        return color(r, gc, b)
    }
    const r = constrain(col[0] + random(-variance, variance), 0, 255)
    const gc = constrain(col[1] + random(-variance, variance), 0, 255)
    const b = constrain(col[2] + random(-variance, variance), 0, 255)
    return color(r, gc, b)
}
