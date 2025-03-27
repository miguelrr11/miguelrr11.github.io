//Cooler Bezier
//Miguel Rodriguez
//27-03-2025

let p0, p1, p2, p3;
let a, b, c, d, e, P;
let t = 0.5;
let draggingPoint = null;
let col0, col1, col2, col3;
let multi = 1.5

function setup() {
  createCanvas(400*multi, 400*multi);
  stroke(255);
  p0 = createVector(50*multi, 300*multi);
  p1 = createVector(115*multi, 50*multi);
  p2 = createVector(285*multi, 50*multi);
  p3 = createVector(350*multi, 300*multi);
  col0 = color("#F41C66") 
  col1 = color("#FFDA85")
  col2 = color("#06d6a0")
  col3 = color("#3EC3FA")
}

function mouseReleased(){
  draggingPoint = null
}


function mouseDragged() {
  let points = [p0, p1, p2, p3];
  if (!draggingPoint) {
    for (let point of points) {
      if (dist(mouseX, mouseY, point.x, point.y) < 15) {
        draggingPoint = point;
        break;
      }
    }
  } else {
    draggingPoint.x = mouseX;
    draggingPoint.y = mouseY;
  }
}

function draw() {
  background(0);
  if (mouseIsPressed) t = map(mouseX, 0, width, 0, 1, true);
  else t = Math.cos(frameCount * 0.01) * 0.5 + 0.5
  
  noFill();
  stroke(255)
  strokeWeight(1.5);
  gradientLine(p0.x, p0.y, p1.x, p1.y, [col0, col1]);
  gradientLine(p1.x, p1.y, p2.x, p2.y, [col1, col2]);
  gradientLine(p3.x, p3.y, p2.x, p2.y, [col3, col2]);
  stroke(col0)
  strokeWeight(15);
  point(p0.x, p0.y);
  stroke(col1)
  point(p1.x, p1.y);
  stroke(col2)
  point(p2.x, p2.y);
  stroke(col3)
  point(p3.x, p3.y);
  

  a = p5.Vector.lerp(p0, p1, t);
  b = p5.Vector.lerp(p1, p2, t);
  c = p5.Vector.lerp(p2, p3, t);
  d = p5.Vector.lerp(a, b, t);
  e = p5.Vector.lerp(b, c, t);
  P = p5.Vector.lerp(d, e, t);
  strokeWeight(1.5);
  stroke(180)
  line(a.x, a.y, b.x, b.y);
  line(b.x, b.y, c.x, c.y);
  line(d.x, d.y, e.x, e.y);
  strokeWeight(5);
  let points = calculatePoints();
  for(let i = 1; i < points.length; i++){
    stroke(lerpColor(col0, col3, i*0.001))
    line(points[i-1].x, points[i-1].y, points[i].x, points[i].y)
  }
  stroke(255)
  fill(0);
  strokeWeight(2);
  ellipse(a.x, a.y, 10);
  ellipse(b.x, b.y, 10);
  ellipse(c.x, c.y, 10);
  ellipse(d.x, d.y, 10);
  ellipse(e.x, e.y, 10);
  ellipse(P.x, P.y, 10);
}

function calculatePoints() {
  let points = [];
  for (let i = 0; i < t; i += 0.001) {
    a = p5.Vector.lerp(p0, p1, i);
    b = p5.Vector.lerp(p1, p2, i);
    c = p5.Vector.lerp(p2, p3, i);
    d = p5.Vector.lerp(a, b, i);
    e = p5.Vector.lerp(b, c, i);
    points.push(p5.Vector.lerp(d, e, i));
  }
  return points;
}
