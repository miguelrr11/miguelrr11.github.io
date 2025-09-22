function inBounds(a, b, w, h) {
    return mouseX > a && mouseX < a + w && mouseY > b && mouseY < b + h;
}

function roundNum(number, decimals = 1) {
    const factor = Math.pow(10, decimals);
    return Math.round(number * factor) / factor;
}

function getTextColor(color) {
    let luminance = typeof color === 'number' ? (0.299 * color + 0.587 * color + 0.114 * color) / 255 :
                                                (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255
    return luminance > 0.5 ? 0 : 255
}

function darkenColor(color, amount = 0.25) {
    const darken = (value) => Math.max(0, Math.min(255, value * (1 - amount)));

    let newR, newG, newB
    if(typeof color !== 'number'){
        newR = darken(color[0]);
        newG = darken(color[1]);
        newB = darken(color[2]);
    }
    else{
        newR = darken(color);
        newG = darken(color);
        newB = darken(color);
    }

    return [newR, newG, newB]
}



function isMouseTouchingLine(positions, lineWidth) {
  let halfWidth = lineWidth / 2;
  
  for (let i = 0; i < positions.length - 1; i++) {
    let p1 = positions[i];
    let p2 = positions[i + 1];

    let result = closestPointOnLineSegment(p1.x, p1.y, p2.x, p2.y, mouseX, mouseY);

    if (result.distance <= halfWidth) {
      return {
        i: i,
        x: result.x,
        y: result.y
      };
    }
  }
  
  return null;
}

// Function to calculate the closest point on a line segment and its distance to a given point
function closestPointOnLineSegment(x1, y1, x2, y2, px, py) {
  let A = px - x1;
  let B = py - y1;
  let C = x2 - x1;
  let D = y2 - y1;

  let dot = A * C + B * D;
  let lenSq = C * C + D * D;
  let param = (lenSq !== 0) ? (dot / lenSq) : -1;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } 
  else if (param > 1) {
    xx = x2;
    yy = y2;
  } 
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  let dx = px - xx;
  let dy = py - yy;
  let distance = Math.sqrt(dx * dx + dy * dy);

  return {
    x: xx,
    y: yy,
    distance: distance
  };
}

function drawBezierPath(points, curveSize = radCurveConn, resolution = 10) {
  if (points.length < 1) return
  if (points.length < 3) {
    line(points[0].x, points[0].y, points[1].x, points[1].y)
    //console.error("Need at least 3 points to draw a Bezier curve");
    return;
  }

  let drawPoints = [];
  drawPoints.push(points[0]);

  for (let i = 1; i < points.length - 1; i++) {
    let targetPoint = points[i];
    let targetDir = p5.Vector.sub(points[i], points[i - 1]).normalize();
    let dstToTarget = p5.Vector.dist(points[i], points[i - 1]);
    let dstToCurveStart = Math.max(dstToTarget - curveSize, dstToTarget / 2);

    let nextTarget = points[i + 1];
    let nextTargetDir = p5.Vector.sub(points[i + 1], points[i]).normalize();
    let nextLineLength = p5.Vector.dist(points[i + 1], points[i]);

    let curveStartPoint = p5.Vector.add(points[i - 1], targetDir.mult(dstToCurveStart));
    let curveEndPoint = p5.Vector.add(targetPoint, nextTargetDir.mult(Math.min(curveSize, nextLineLength / 2)));

    for (let j = 0; j < resolution; j++) {
      let t = j / (resolution - 1);
      let a = p5.Vector.lerp(curveStartPoint, targetPoint, t);
      let b = p5.Vector.lerp(targetPoint, curveEndPoint, t);
      let p = p5.Vector.lerp(a, b, t);

      if (drawPoints.length === 0 || p.dist(drawPoints[drawPoints.length - 1]) > 0.001) {
        drawPoints.push(p);
      }
    }
  }
  drawPoints.push(points[points.length - 1]);


  beginShape();
  for (let p of drawPoints) {
    vertex(p.x, p.y);
  }
  endShape();
}

function isWithinBounds(point, rectStart, rectSize) {
    return (
        point.x >= rectStart.x && point.x <= rectStart.x + rectSize &&
        point.y >= rectStart.y && point.y <= rectStart.y + rectSize
    );
}

function createFromSaved(){
    for(let i = 0; i < savedChips.length; i++){
        let newChip = chipRegistry.find(chipData => chipData.name === savedChips[i]);
        panel_buttonColl_chips.addButton(newChip.externalName, (f) => {
            chip.addComponent(newChip.name, 'CHIP', newChip.externalName);
            compNames++
            pushToUndoStack()
        })
        compNames++
    }
}

function getLongestLineLength(inputString) {
    // Split the string by newline characters into an array of lines
    const lines = inputString.split('\n');

    // Find the length of the longest line
    let maxLength = 0;
    for (let line of lines) {
        if (line.length > maxLength) {
            maxLength = line.length;
        }
    }

    return [maxLength, lines.length];
}

function fitTextToRect(text, rectWidth, rectHeight, lineHeight) {
  // Split text into lines
  let lines = text.split('\n');
  lines = lines.filter(line => line != '')
  lines[0] = lines[0].trimStart()
  lines[lines.length-1] = lines[lines.length-1].trimEnd()
  
  // Shorten lines that exceed the rectangle width
  for (let i = 0; i < lines.length; i++) {
    while (textWidth(lines[i]) > rectWidth) {
      lines[i] = lines[i].slice(0, -1); // Remove the last character
      if (lines[i].length === 0) {
        lines.splice(i, 1); // If line becomes empty, remove it
        i--;
        break;
      }
    }
  }



  // Check total height and splice lines if necessary
  while (lines.length * lineHeight > rectHeight) {
    lines.pop(); // Remove the last line until it fits
  }

  return lines.join('\n');
}