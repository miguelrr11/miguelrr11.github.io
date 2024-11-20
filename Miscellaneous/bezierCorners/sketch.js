function drawBezierFromPointsArray(points, curveSize = 10, resolution = 10) {
  if (points.length < 3) {
    console.error("Need at least 3 points to draw a Bezier curve");
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

  noFill();
  beginShape();
  for (let p of drawPoints) {
    vertex(p.x, p.y);
  }
  endShape();
}

let points = []
// Example usage
function setup() {
  createCanvas(400, 400);
  let p1 = createVector(50, 50)
  let p2 = createVector(50, 100)
  let p3 = createVector(100, 100)
  let p4 = createVector(100, 150)
  points = [
    p1, p2, p3, p4
  ];

  drawBezierFromPointsArray(points);

  
}

function mouseClicked(){
  points.push(createVector(mouseX, mouseY))
}

function draw() {
  // No continuous drawing needed
  background(255)
  drawBezierFromPointsArray(points, 10);

}


