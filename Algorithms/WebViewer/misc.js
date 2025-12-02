//TODO: try the direction and the opposite direction, choose the smaller one
function getFinalPos(direction, start, minDistance, radius, randomSep = Math.random() * 50 + 50) {
    //this function tries to position a circle of a fixed radius. this circle can only be placed in a line that goes from start and has a direction.
    //It will do this checking if it collides with any of the circles of parentParticles
    //kind of like a raycast
    let pos1 = getFinalPosAux(direction, start, minDistance, radius, randomSep)
    let pos2 = getFinalPosAux(direction.mult(-1), start, minDistance, radius, randomSep)
    let d1 = squaredDistance(pos1.x, pos1.y, start.x, start.y)
    let d2 = squaredDistance(pos2.x, pos2.y, start.x, start.y)
    if(d1 < d2) return pos1
    return pos2
}

function getFinalPosAux(direction, start, minDistance, radius, randomSep) {
    let pos = start.copy()
    let distance = minDistance
    let dir = direction.copy()
    dir.normalize()
    dir.mult(distance)
    pos.add(dir)
    let collision = false
    for(let p of parentParticles) {
        let d = dist(pos.x, pos.y, p.pos.x, p.pos.y)
        if(d < (radius + p.radius + randomSep)) {
            collision = true
            break
        }
    }
    if(collision) {
        distance += 10
        return getFinalPosAux(direction, start, distance, radius, randomSep)
    }
    return pos
}

function centerGraph() {
    let [minXp, maxXp, minYp, maxYp] = getMinMaxPos()
    let centerX = (maxXp + minXp) / 2
    let centerY = (maxYp + minYp) / 2
    let xOffAux = (WIDTH / 2) - centerX * zoom
    let yOffAux = (HEIGHT / 2) - centerY * zoom
    return [
        xOffAux,
        yOffAux
    ]
}

let margin = 50

function getTargetZoom() {
    let [minXp, maxXp, minYp, maxYp] = getMinMaxPos()
    let [minXe, maxXe, minYe, maxYe] = getEdges()
    let widthP = (maxXp - minXp) + margin
    let heightP = (maxYp - minYp) + margin
    let widthE = (maxXe - minXe) * zoom
    let heightE = (maxYe - minYe) * zoom
    let zoomX = widthE / widthP
    let zoomY = heightE / heightP
    return constrain(Math.min(zoomX, zoomY), MIN_ZOOM, MAX_ZOOM)
}

let radiusTextBox = 10
let offsetTB = 3


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
      }
       else {
        // wrap this paragraph
        let words = para.split(' ');
        let current = '';
  
        for (let w of words) {
          let test = current ? current + ' ' + w : w;
          if (textWidth(test) > maxW) {
            lines.push(current);
            current = w;
          } 
          else current = test;
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
  
  

function getRadiusFromCircumference(length) {
    const radius = length / (2 * Math.PI);
    return radius;
}

function worldToCanvas(x, y) {
    return {
        x: (x - xOff) / zoom,
        y: (y - yOff) / zoom
    };
}

function getEdges() {
    let minX = (0 - xOff) / zoom
    let maxX = (WIDTH - xOff) / zoom
    let minY = (0 - yOff) / zoom
    let maxY = (HEIGHT - yOff) / zoom
    return [
        minX,
        maxX,
        minY,
        maxY
    ]
}


function changeColorMode() {
    if(curColMode == 'light') {
        curColMode = 'dark'
        input.setColors([255, 255, 255], [0, 0, 0])
        btnColorMode.str = 'Light Mode'
        btnColorMode.bool = false
    }
    else {
        curColMode = 'light'
        input.setColors([0, 0, 0], [255, 255, 255])
        btnColorMode.str = 'Dark Mode'
        btnColorMode.bool = true
    }
}

function lerpColorMap(fromMap, toMap, amt) {
    let result = {};

    for (let key in fromMap) {
        const a = fromMap[key];
        const b = toMap[key];

        if (typeof a === 'number' && typeof b === 'number') {
            result[key] = lerp(a, b, amt);
        }

        else if (a instanceof p5.Color && b instanceof p5.Color) {
            result[key] = lerpColor(a, b, amt);
        }

        else if (Array.isArray(a) && Array.isArray(b)) {
            result[key] = a.map((val, i) => lerp(val, b[i], amt));
        }

        else {
            result[key] = a;
            console.warn(`lerpColorMap: Unsupported type for key "${key}", using fromMap value`);
        }
    }

    return result;
}


function getEmptySpot(){
    let anglemult = 0.25
    let distAcum = 10 // Start with a small distance to avoid center
    for(let i = 0; i < 2000; i++){
        let angle = (i * anglemult) % TWO_PI
        let x = Math.cos(angle) * distAcum + width/2
        let y = Math.sin(angle) * distAcum + height/2
        let collision = false
        for(let p of parentParticles) {
            let d = dist(x, y, p.pos.x, p.pos.y)
            // Use radius instead of bigRadius, with appropriate spacing
            let minDist = (p.radius || 50) + 100 // Default 50 if radius not defined, plus spacing
            if(d < minDist) {
                collision = true
                break
            }
        }
        if(!collision) {
            return createVector(x, y)
        }
        distAcum += 5 // Increment distance to create spiral pattern
    }
}