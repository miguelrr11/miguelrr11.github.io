//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let runeBooks = []
let runeGroups = [1, 1, 1]
let baseRadius = 150
let padding = 420

function setup(){
    createCanvas(WIDTH, HEIGHT)
    runeBooks = layoutRuneBooks(runeGroups, baseRadius, padding, {x:0, y:0})
    normalizeScales()
    frameRate(10)
}

function draw(){
    background(0)
    //loop through all the combinations of rune groups
    runeGroups[0]++
    if(runeGroups[0] > 5){
        runeGroups[0] = 1
        runeGroups[1]++
        if(runeGroups[1] > 5){
            runeGroups[1] = 1
            runeGroups[2]++
            if(runeGroups[2] > 5){
                runeGroups = [1, 1, 1]
            }
        }
    }
    runeBooks = layoutRuneBooks(runeGroups, baseRadius, padding, {x:0, y:0})
    normalizeScales()
    fill(255)
    noStroke()
    for(let rb of runeBooks){
        ellipse(rb.x, rb.y, 20, 20)
    }
}

function layoutRuneBooks(counts, baseRadius = 275, padding = 100, center = { x: 0, y: 0 }) {
  const runeBooks = [];
  const levels = counts.length;

  if (levels === 0) return runeBooks;
  const clusterR = [];

  if (levels > 1) {
    clusterR[levels - 1] = baseRadius + padding;

    for (let i = levels - 2; i >= 0; i--) {
      const nChildren = counts[i + 1];
      const childRad   = clusterR[i + 1];
      clusterR[i]      = getRadius((childRad * 2) * nChildren);
    }
  }

  function recurse(level, cx, cy) {
    const n = counts[level];
    const angleStep = TWO_PI / n;
    const startAng  = -HALF_PI; 

    if (level < levels - 1) {
      const rad = clusterR[level];
      for (let i = 0; i < n; i++) {
        const θ = angleStep * i + startAng;
        const x = cx + Math.cos(θ) * rad;
        const y = cy + Math.sin(θ) * rad;
        recurse(level + 1, x, y);
      }

    } else {
      for (let j = 0; j < n; j++) {
        const θ = angleStep * j + startAng;
        const x = cx + Math.cos(θ) * baseRadius;
        const y = cy + Math.sin(θ) * baseRadius;
        let rb = createVector(x, y);
        runeBooks.push(rb);
      }
    }
  }

  recurse(0, center.x, center.y);

  return runeBooks;
}

function normalizeScales(){
    //gets the min and max of the rune books
    let padding = 150
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for(let rb of runeBooks){
        minX = min(minX, rb.x)
        maxX = max(maxX, rb.x)
        minY = min(minY, rb.y)
        maxY = max(maxY, rb.y)
    }
    minX -= padding
    maxX += padding
    minY -= padding
    maxY += padding
    //maps the rune books to the screen
    for(let rb of runeBooks){
        rb.x = map(rb.x, minX, maxX, 0, width)
        rb.y = map(rb.y, minY, maxY, 0, height)
    }
}