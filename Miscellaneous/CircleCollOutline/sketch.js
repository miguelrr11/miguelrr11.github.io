//Algorithm to construct the outside outline of multiple circles that are colliding with each other
//Miguel Rodríguez
//11-02-2026

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let circles = []

function setup(){
    createCanvas(WIDTH, HEIGHT)
    for(let i = 0; i < 6; i++){
        circles.push({
            pos: createVector(random(100, WIDTH - 100), random(100, HEIGHT - 100)),
            rad: random(50, 130),
            vel: p5.Vector.random2D().mult(random(0.5, 2))
        })
    }
}

function draw(){
    background(0)
    
    for(let c of circles){
        c.pos.x += c.vel.x
        c.pos.y += c.vel.y
        if(c.pos.x - c.rad < 0 || c.pos.x + c.rad > width) c.vel.x *= -1
        if(c.pos.y - c.rad < 0 || c.pos.y + c.rad > height) c.vel.y *= -1
    }


    
    let outlines = getOutlines()


    push()
    noFill()
    stroke(70)
    for(let c of circles) ellipse(c.pos.x, c.pos.y, c.rad * 2)
    pop()

    for(let o of outlines) drawOutline(o)
}

function isCircleInsideAllCircles(circle, circles){
    for(let c of circles){
        if(p5.Vector.dist(circle.pos, c.pos) + circle.rad < c.rad - 0.01) return true
    }
    return false
}

function getOutlines(){
    let circlesSet = new Set(circles)
    let outlines = []
    let iter = 0
    while(circlesSet.size > 0 && iter < 100){
        let outline = getOutline(Array.from(circlesSet))
        if(outline.length > 0) outlines.push(outline)
        for(let o of outline) circlesSet.delete(o.circle)
        iter++
    }
    return outlines
}

function getOutline(circles){
    let outline = []

    let collLineCircle = []
    let start = createVector(0, 0)
    let end = random(circles).pos.copy()
    for(let c of circles){
        let coll = lineCircleCollision(start, end, c)
        if(coll.length > 0) collLineCircle.push({circle: c, points: coll})
    }

    let closest = getClosestPoint(start, collLineCircle)
    if(closest) collLineCircle = [closest]
    let activeCircle = closest ? closest.circle : null
    let activePoint = closest ? closest.points[0] : null

    let iter = 0

    while(iter < 1000 && activeCircle && activePoint){
        let collCircleCircle = []
        for(let i = 0; i < circles.length; i++){
            if(circles[i] === activeCircle) continue
            let coll = circleCircleCollision(activeCircle, circles[i])
            if(coll.length > 0){
                if(dist(coll[0].x, coll[0].y, activePoint.x, activePoint.y) > 0.001) collCircleCircle.push({coll: coll[0], circle: circles[i]})
                if(dist(coll[1].x, coll[1].y, activePoint.x, activePoint.y) > 0.001) collCircleCircle.push({coll: coll[1], circle: circles[i]})
            }
        }

        if(collCircleCircle.length === 0){
            outline.push({
                circle: activeCircle,
                angle: angleABC_0_to_2PI(activePoint, activeCircle.pos, end),
                start: activePoint.copy(),
                whole: true
            })
        }

        let angles = []
        for(let coll of collCircleCircle){
            let angle = angleABC_0_to_2PI(activePoint, activeCircle.pos, coll.coll)
            if(abs(angle) > 0.001) angles.push({angle, point: coll})
        }
        angles.sort((a, b) => a.angle - b.angle)
        let minAnglePoint = angles[0]
        
        if(!minAnglePoint) break
        activeCircle = minAnglePoint.point.circle
        activePoint = minAnglePoint.point.coll

        if(minAnglePoint) outline.push({
            circle: activeCircle,
            angle: angleABC_0_to_2PI(activePoint, activeCircle.pos, minAnglePoint.point.coll),
            start: activePoint.copy(),
            whole: false
        })


        if(finishedOutline(outline)) break
        iter++
    }

    return outline
}

function drawOutline(outline){
    //using the arc function
    push()
    noFill()
    stroke(255, 0, 0)
    strokeWeight(8)
    for(let i = 0; i < outline.length; i++){
        let current = outline[i]
        let next = outline[(i + 1) % outline.length]
        let startPos = current.start
        let endPos = next.start
        let center = current.circle.pos
        let radius = current.circle.rad

        let startAngle = atan2(startPos.y - center.y, startPos.x - center.x)
        let endAngle = atan2(endPos.y - center.y, endPos.x - center.x)

        // Ensure the arc is drawn in the correct direction
        if (endAngle < startAngle) {
            endAngle += TWO_PI
        }

        if(current.whole){
            startAngle = 0
            endAngle = TWO_PI
        }

        arc(center.x, center.y, radius * 2, radius * 2, startAngle, endAngle)
    }
    pop()
}

function finishedOutline(outline){
    if(outline.length < 2) return false
    let first = outline[0]
    let last = outline[outline.length - 1]
    return first.circle === last.circle && dist(first.start.x, first.start.y, last.start.x, last.start.y) < 0.01
}

// function collNotInOutline(coll, minAnglePoints){
//     for(let minAnglePoint of minAnglePoints){
//         if(minAnglePoint && minAnglePoint.point && minAnglePoint.point.coll){
//             if(coll[0].equals(minAnglePoint.point.coll) || coll[1].equals(minAnglePoint.point.coll)) return false
//         }
//     }
//     return true
// }

function angleABC_0_to_2PI(A, B, C) {
  let BA = p5.Vector.sub(A, B);
  let BC = p5.Vector.sub(C, B);

  let angle = atan2(
    BA.x * BC.y - BA.y * BC.x, // cross
    BA.x * BC.x + BA.y * BC.y  // dot
  );

  // Convert from (-PI → PI) to (0 → TWO_PI)
  if (angle < 0) angle += TWO_PI;

  return angle; // radians in range [0, TWO_PI)
}



function circleCircleCollision(c1, c2){
    let d = p5.Vector.dist(c1.pos, c2.pos)
    if(d > c1.rad + c2.rad || d < abs(c1.rad - c2.rad)) return [] // no intersection

    let a = (c1.rad * c1.rad - c2.rad * c2.rad + d * d) / (2 * d)
    let h = sqrt(c1.rad * c1.rad - a * a)

    let mid = p5.Vector.add(c1.pos, p5.Vector.mult(p5.Vector.sub(c2.pos, c1.pos), a / d))

    let offset = p5.Vector.mult(p5.Vector.sub(c2.pos, c1.pos).rotate(HALF_PI).normalize(), h)

    return [p5.Vector.add(mid, offset), p5.Vector.sub(mid, offset)]
}   

function lineCircleCollision(start, end, circle) {
  let dir = p5.Vector.sub(end, start);
  let f = p5.Vector.sub(start, circle.pos);

  let a = dir.dot(dir);
  let b = 2 * f.dot(dir);
  let c = f.dot(f) - circle.rad * circle.rad;

  let discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return []; // no intersection

  discriminant = sqrt(discriminant);

  let t1 = (-b - discriminant) / (2 * a);
  let t2 = (-b + discriminant) / (2 * a);

  let collisions = [];

  if (t1 >= 0 && t1 <= 1) {
    collisions.push(
      p5.Vector.add(start, p5.Vector.mult(dir, t1))
    );
  }

  if (t2 >= 0 && t2 <= 1 && discriminant !== 0) {
    collisions.push(
      p5.Vector.add(start, p5.Vector.mult(dir, t2))
    );
  }

  return collisions; // [] | [point] | [point1, point2]
}

function getClosestPoint(start, points){
    let closest = null
    let minDist = Infinity
    for(let coll of points){
        let d = p5.Vector.dist(start, coll.points[0])
        if(d < minDist){
            minDist = d
            let closestLocal = coll.points[0]
            for(let p of coll.points){
                let distP = p5.Vector.dist(start, p)
                if(distP < minDist){
                    minDist = distP
                    closestLocal = p
                }
            }
            closest = {circle: coll.circle, points: [closestLocal]}
        }
    }
    return closest
}