// Dotted circles & Circle Intersection
// Miguel Rodríguez
// 29-04-24

const WIDTH = 600
const HEIGHT = 600
let t = 0

function setup(){
    createCanvas(WIDTH, HEIGHT)
}

function draw(){
    background(0)
    t += 0.003
    DiscLinesEllipse(color(255, 255, 255, 100), createVector(mouseX, mouseY), 200, 50, t)
    DiscLinesEllipse(color(255, 255, 255, 200), createVector(170, 300), 150, 60, t, true)
    let colls = circleCollision(mouseX, mouseY, 200, 170, 300, 150)
    if(colls){
        stroke(255)
        strokeWeight(9)
        noFill()
        point(colls[0].x, colls[0].y)
        point(colls[1].x, colls[1].y)
    }
}

function DiscLinesEllipse(col, pos, rad, dis, offset = 0, isDotted = false) {
    push()
    stroke(col)
    strokeWeight(3)
    noFill()
    translate(pos)

    let angleStep = TWO_PI / dis
    let angleStep2 = TWO_PI / dis
    let curAngleStep = offset % TWO_PI
    let limit = TWO_PI + offset % TWO_PI
    if(isDotted) angleStep2 = 0.000001

    for (let i = 0; curAngleStep < limit; i++) {
        let x1 = rad * cos(curAngleStep)
        let y1 = rad * sin(curAngleStep)
        curAngleStep += angleStep2
        let x2 = rad * cos(curAngleStep)
        let y2 = rad * sin(curAngleStep)
        curAngleStep += angleStep
        line(x1, y1, x2, y2)
    }
    pop();
}

function circleCollision(x1, y1, r1, x2, y2, r2) {
    // Calculate the distance between the centers of the circles
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
