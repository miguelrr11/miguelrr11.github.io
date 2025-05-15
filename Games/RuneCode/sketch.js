//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 750
const WIDTH_UI = 430

let runeBooks = []
let runeGroups = [1, 1]
let baseRadius = 200
let padding = 100

let speedRot = 0

let xOff = 0
let yOff = 0
let prevMouseX = 0
let prevMouseY = 0
let zoom = 1

let selectedRuneBook = null
let selectedButton = null

let currentEdges = [0, WIDTH, 0, HEIGHT]
let mousePos 
let finalPos = {x:0, y:0}

let panelReplaceLeft = []
let panelReplaceRight = []

let fonts = new Map()

function mouseDragged() {
    if(mouseX > WIDTH) return
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
    if(mouseX > WIDTH) return
    let worldX = (mouseX - xOff) / zoom;
    let worldY = (mouseY - yOff) / zoom;
    zoom += event.delta / 1000;
    zoom = Math.max(0.01, Math.min(zoom, 3));
    xOff = mouseX - worldX * zoom;
    yOff = mouseY - worldY * zoom;
    if(selectedRuneBook){
        const tx = selectedRuneBook.pos.x;
        const ty = selectedRuneBook.pos.y;
        const cx = WIDTH/2;
        const cy = HEIGHT/2;
        finalPos.x = cx - tx * zoom;
        finalPos.y = cy - ty * zoom;
    }
    return false;
}

function mousePressed() {
    let selected = false
    if(mouseX < WIDTH){
        for(let runeBook of runeBooks){
            if(runeBook.out) continue
            if(runeBook.mouseInBounds()){
                selectedRuneBook = runeBook
                selected = true
                break
            }
        }
    }
    
    else{
        if(selectedRuneBook){
            for(let b of selectedRuneBook.buttons){
                if(b.isMouseOver()){
                    selectedButton = b
                    break
                }
            }
        }
    }
    
}

function initPanelReplace(){
    let x = WIDTH + 270
    let y = 260
    let w = BUT_W
    let h = BUT_H
    for(let i = 0; i < LEFT_RUNES.length; i++){
        let b = new FunctionalButton(x, y, w, h, LEFT_RUNES[i], LEFT_RUNES_COLS[i])
        b.setFunc(() => {
            if(selectedButton){
                selectedButton.runebook.runes[selectedButton.runeIndex].left = i
                selectedButton.runebook.createButtons()
            }
        })
        panelReplaceLeft.push(b)
        y += h + 10
    }
    y = 260
    for(let i = 0; i < RIGHT_RUNES.length; i++){
        let b = new FunctionalButton(x, y, w, h, RIGHT_RUNES[i], RIGHT_RUNES_COLS[i])
        b.setFunc(() => {
            if(selectedButton){
                selectedButton.runebook.runes[selectedButton.runeIndex].right = i
                selectedButton.runebook.createButtons()
            }
        })
        panelReplaceRight.push(b)
        y += h + 10
    }
}

async function setup(){
    createCanvas(WIDTH+WIDTH_UI, HEIGHT)

    let f1 = await loadFont('fonts/Cool_HV_Comp.otf')
    let f2 = await loadFont('fonts/Cool_IT.otf')
    let f3 = await loadFont('fonts/Cool_MD_Comp.otf')
    let f4 = await loadFont('fonts/Cool_TA_Comp.otf')
    let f5 = await loadFont('fonts/Cool.otf')

    fonts.set('Heavy', f1)
    fonts.set('Italic', f2)
    fonts.set('Medium', f3)
    fonts.set('Thin', f4)
    fonts.set('Regular', f5)

    runeBooks = layoutRuneBooks(runeGroups, baseRadius, padding, {x:0, y:0})
    selectedRuneBook = runeBooks[0]

    initPanelReplace()
}

function draw(){
    background('#f5ebe0')

    currentEdges = getEdges()
    mousePos = getRelativePos(mouseX, mouseY)

    if(selectedRuneBook){
        const tx = selectedRuneBook.pos.x;
        const ty = selectedRuneBook.pos.y;
        const cx = WIDTH/2;
        const cy = HEIGHT/2;
        finalPos.x = cx - tx * zoom;
        finalPos.y = cy - ty * zoom;
        xOff = lerp(xOff, finalPos.x, 0.1)
        yOff = lerp(yOff, finalPos.y, 0.1)
    }
    

    push()
    translate(xOff, yOff)
    scale(zoom)
    for(let runeBook of runeBooks){
        runeBook.update()
        runeBook.show()
    }
    pop()
    
    noStroke()
    fill('#33415c')
    rect(WIDTH, 0, WIDTH_UI, HEIGHT)

    showSelectedRuneBookMenu()
    showReplaceRuneMenu()
    
    updateOrbit(runeGroups, baseRadius, padding)
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

function getRelativePos(x, y){
    let worldX = (x - xOff) / zoom;
    let worldY = (y - yOff) / zoom;
    return createVector(worldX, worldY);
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
  const speed     = speedRot;
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
        let rb = new RuneBook(x, y);
        rb.id = runeBooks.length;
        runeBooks.push(rb);
      }
    }
  }

  // Kick it off at the global center:
  recurse(0, center.x, center.y);

  return runeBooks;
}

function showSelectedRuneBookMenu(){
    if(!selectedRuneBook) return
    let y = 35
    let padding = 0
    let x = 10
    let wBar = 250 - 20
    let hBar = 30

    push()
    translate(WIDTH, 0)

    // Title of runebook
    textSize(35)
    textAlign(LEFT)
    textFont(fonts.get('Medium'))
    fill(255)
    text('Runebook #' + selectedRuneBook.id , x, y)
    y += textAscent() + padding
    
    // Title of energy
    textSize(18)
    text('Mana', x, y)
    y += textAscent() * .8 + padding

    //Energy bar
    noFill()
    stroke(255)
    strokeWeight(3)
    drawBar(x, y, wBar, hBar, mapp(selectedRuneBook.energy, 0, 100, 0, wBar))
    y += hBar*2 + padding

    // Title of energy
    fill(255)
    text('Shield', x, y)
    y += textAscent() * .8 + padding

    //Energy bar
    noFill()
    stroke(255)
    strokeWeight(3)
    drawBar(x, y, wBar, hBar, mapp(selectedRuneBook.wall, 0, 100, 0, wBar))
    y += hBar*3 + padding

    // Instructions title
    noStroke()
    fill(255)
    textSize(20)
    textFont(fonts.get('Italic'))
    text('Runes', x, y)

    // Instructions board
    translate(-WIDTH, 0)
    selectedRuneBook.drawInstructions()

    pop()
}

function showReplaceRuneMenu(){
    if(!selectedButton) return
    push()
    translate(WIDTH, 0)
    let y = 246
    let x = 270
    textAlign(LEFT)
    fill(255)
    noStroke()
    textSize(20)
    textFont(fonts.get('Italic'))
    text('Replace with:', x, y)
    translate(-WIDTH, 0)
    let panel = selectedButton.side == 'left' ? panelReplaceLeft : panelReplaceRight
    for(let b of panel){
        b.show()
    }
    pop()
}

function drawBar(x, y, w, h, wFill){
    rect(x, y, w, h, 10)
    fill(255, 150)
    let off = 3
    noStroke()
    if(wFill > 0) rect(x+off, y+off, wFill-off*2, h-off*2, 7)
}

