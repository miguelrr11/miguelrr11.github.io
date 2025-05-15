//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let runeBooks = []
let runeGroups = [3, 5]
let baseRadius = 200
let padding = 50

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
    zoom = Math.max(0.01, Math.min(zoom, 3));
    xOff = mouseX - worldX * zoom;
    yOff = mouseY - worldY * zoom;
    return false;
}

function setup(){
    createCanvas(WIDTH+250, HEIGHT)

    // let mult = (TWO_PI / nRuneBooks)
    // for(let i = 0; i < nRuneBooks; i++){
    //     let angle = (mult * i) - HALF_PI
    //     let x = Math.cos(angle) * 150 + WIDTH / 2
    //     let y = Math.sin(angle) * 150 + HEIGHT / 2
    //     runeBooks.push(new RuneBook(x, y))
    // }

    // let mult = (TWO_PI / nGroups)
    // for(let i = 0; i < nGroups; i++){
    //     let angle = (mult * i) - HALF_PI
    //     let sx = Math.cos(angle) * radBig
    //     let sy = Math.sin(angle) * radBig
    //     let mult2 = (TWO_PI / nRuneBooks)
    //     for(let j = 0; j < nRuneBooks; j++){
    //         let angle = (mult2 * j) - (mult * i)
    //         let x = Math.cos(angle) * radSmall + sx
    //         let y = Math.sin(angle) * radSmall + sy
    //         runeBooks.push(new RuneBook(x, y))
    //     }
    // }

    runeBooks = layoutRuneBooks(runeGroups, baseRadius, padding, {x:0, y:0})
}

function draw(){
    background('#f5ebe0')

    translate(xOff, yOff)
    scale(zoom)

    for(let runeBook of runeBooks){
        runeBook.update()
        runeBook.show()
    }
    
    push()
    noStroke()
    fill('#33415c')
    //rect(WIDTH, 0, 250, HEIGHT)
    pop()
    updateOrbit(runeGroups, baseRadius, padding)
}

function updateOrbit(counts, baseRadius = 275, padding = 100) {
  const levels = counts.length;
  if (levels === 0) return;

  // 1) Recompute the “cluster” radii so siblings never collide:
  const clusterR = [];
  if (levels > 1) {
    clusterR[levels - 1] = baseRadius + padding;
    for (let l = levels - 2; l >= 0; l--) {
      const diameter = clusterR[l + 1] * 2 * counts[l + 1];
      clusterR[l] = getRadius(diameter);
    }
  }

  // 2) Build a multiplier array so we can compute a unique
  //    linear index for any leaf at runtime:
  //    multipliers[l] = product of counts[l+1]…counts[last]
  const multipliers = Array(levels).fill(1);
  for (let l = levels - 2; l >= 0; l--) {
    multipliers[l] = multipliers[l + 1] * counts[l + 1];
  }

  // 3) How much to rotate this frame:
  const speed     = 0.0001;
  const rotAmount = HALF_PI * frameCount * speed;

  // 4) Recursive walker:
  function recurse(level, cx, cy, parentBaseAngle, pathIndices) {
    const n        = counts[level];
    const step     = TWO_PI / n;
    const signGroup= (level % 2 === 0) ? -1 : 1;

    for (let i = 0; i < n; i++) {
      const baseAngle = step * i;

      if (level < levels - 1) {
        // ─── place sub-cluster center ───
        const angle = baseAngle + signGroup * rotAmount;
        const d     = clusterR[level];
        const x0    = cx + Math.cos(angle) * d;
        const y0    = cy + Math.sin(angle) * d;
        recurse(level + 1, x0, y0, baseAngle, pathIndices.concat(i));

      } else {
        // ─── place actual runebooks ───
        // child-rings spin opposite their parent:
        const parentSign = (((level - 1) % 2) === 0) ? -1 : 1;
        const leafRot    = -parentSign * rotAmount;

        for (let j = 0; j < n; j++) {
          const leafBase = step * j;
          const ang      = leafBase - parentBaseAngle + leafRot;
          const x        = cx + Math.cos(ang) * baseRadius;
          const y        = cy + Math.sin(ang) * baseRadius;

          // compute the 1D index in runeBooks:
          const fullPath = pathIndices.concat(j);
          let idx = 0;
          for (let l = 0; l < levels; l++) {
            idx += fullPath[l] * multipliers[l];
          }

          // now safe to assign:
          runeBooks[idx].pos.x = x;
          runeBooks[idx].pos.y = y;
        }
      }
    }
  }

  // kick off at the origin
  recurse(0, 0, 0, 0, []);
}


function layoutRuneBooks(counts, baseRadius = 275, padding = 100, center = { x: 0, y: 0 }) {
  const runeBooks = [];
  const levels = counts.length;

  // No groups? nothing to do.
  if (levels === 0) return runeBooks;

  // Precompute the “cluster” radii at each level so that
  // siblings (at all depths) never collide.
  // clusterR[ i ] = the radius of the circle on which
  // the level-i clusters sit, wrapping their children.
  const clusterR = [];

  if (levels > 1) {
    // At the very bottom, we treat each RuneBook as a circle of
    // radius (baseRadius + padding) when computing its parent-group's size:
    clusterR[levels - 1] = baseRadius + padding;

    // Bubble up: for each higher level, total diameter needed
    // = (child-cluster-radius * 2) * number-of-children
    for (let i = levels - 2; i >= 0; i--) {
      const nChildren = counts[i + 1];
      const childRad   = clusterR[i + 1];
      clusterR[i]      = getRadius((childRad * 2) * nChildren);
    }
  }

  // Recursive placer:
  function recurse(level, cx, cy) {
    const n = counts[level];
    const angleStep = TWO_PI / n;
    const startAng  = -HALF_PI;  // so the first item is at “12 o’clock”

    // If not the last level, place sub–clusters:
    if (level < levels - 1) {
      const rad = clusterR[level];
      for (let i = 0; i < n; i++) {
        const θ = angleStep * i + startAng;
        const x = cx + Math.cos(θ) * rad;
        const y = cy + Math.sin(θ) * rad;
        recurse(level + 1, x, y);
      }

    // Leaf level: place actual RuneBooks:
    } else {
      for (let j = 0; j < n; j++) {
        const θ = angleStep * j + startAng;
        const x = cx + Math.cos(θ) * baseRadius;
        const y = cy + Math.sin(θ) * baseRadius;
        runeBooks.push(new RuneBook(x, y));
      }
    }
  }

  // Kick it off at the global center:
  recurse(0, center.x, center.y);

  return runeBooks;
}
