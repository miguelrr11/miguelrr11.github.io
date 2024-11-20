function circleCollision(c1, r1, c2, r2) {
    // Calculate the distance between the centers of the circles
    const x1 = c1.x  
    const x2 = c2.x
    const y1 = c1.y  
    const y2 = c2.y
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distanceSq = dx * dx + dy * dy;

    // Check if the circles intersect
    const radiiSumSq = (r1 + r2) ** 2;
    if (distanceSq <= radiiSumSq) {
        const distance = Math.sqrt(distanceSq);
        const d = (r1 * r1 - r2 * r2 + distanceSq) / (2 * distance);
        const intersectionX = x1 + (dx * d) / distance;
        const intersectionY = y1 + (dy * d) / distance;
        const h = Math.sqrt(r1 * r1 - d * d);
        const offsetX = (h * dy) / distance;
        const offsetY = (h * dx) / distance;

        return [createVector(intersectionX + offsetX, intersectionY - offsetY),
                createVector(intersectionX - offsetX, intersectionY + offsetY)]

        
    } else {
        // Circles do not intersect
        return undefined
    }
}

function setup() {
  createCanvas(400, 400);
  circles = [];
  for (let i = 0; i < 20; i++) {
    circles.push({ x: random(400), y: random(400) });
  }
  radius = 75;
}

function draw() {
  background(0);
  noFill()
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
        let coll = circleCollision(circles[i], radius, circles[j], radius)
      if (coll) {
        let angleToJ = atan2(circles[j].y - circles[i].y, circles[j].x - circles[i].x);
        let angleToColl0 = atan2(coll[0].y - circles[i].y, coll[0].x - circles[i].x);
        let isOuterI = angleToColl0 > angleToJ;

        if (isOuterI) {
          let a1 = atan2(coll[0].y - circles[i].y, coll[0].x - circles[i].x);
          let a2 = atan2(coll[1].y - circles[i].y, coll[1].x - circles[i].y);
          stroke(255, 0, 0);
          strokeWeight(6);
          arc(circles[i].x, circles[i].y, radius * 2, radius * 2, a2, a1);
        }

        // Similar logic for circle j
        let angleToI = atan2(circles[i].y - circles[j].y, circles[i].x - circles[j].x);
        let angleToColl0_j = atan2(coll[0].y - circles[j].y, coll[0].x - circles[j].x);
        let isOuterJ = angleToColl0_j > angleToI;

        if (isOuterJ) {
          let a1 = atan2(coll[0].y - circles[j].y, coll[0].x - circles[j].x);
          let a2 = atan2(coll[1].y - circles[j].y, coll[1].x - circles[j].y);
          stroke(255, 0, 0);
          strokeWeight(6);
          arc(circles[j].x, circles[j].y, radius * 2, radius * 2, a2, a1);
        }
      }
    }
  }

  stroke(255);
    strokeWeight(1);
  for (let circle of circles) {
    ellipse(circle.x, circle.y, radius * 2);
  }
}
