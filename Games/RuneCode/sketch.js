//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 750
const WIDTH_UI = 430
const RUNES_SELECTED_Y = 265

let runeBooks = []
let runeGroups = [6, 3]
let baseRadius = 150
let padding = 420

let speedRot = 0.00012

let xOff = 0
let yOff = 0
let prevMouseX = 0
let prevMouseY = 0
let zoom = 1

let selectedRuneBook = null
let selectedButton = null
let focused = false

let currentEdges = [0, WIDTH, 0, HEIGHT]
let mousePos 
let finalPos = {x:0, y:0}

let minPos, maxPos

let panelReplaceLeft = []
let panelReplaceRight = []
let newRuneButtonActive = false

let nParticlesAttack = 500
let nParticlesFood = 500
let attackParticles = []
let foodParticles = []

let rPosGlobal = {from: 0, to: 0}

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
    focused = false
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

function mouseClicked() {
    let selected = false
    if(mouseX < WIDTH){
        for(let runeBook of runeBooks){
            if(!runeBook) continue
            if(runeBook.out) continue
            if(runeBook.mouseInBounds()){
                selectedRuneBook = runeBook
                selectedButton = null
                selected = true
                focused = true
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
    let x = WIDTH + 290
    let y = RUNES_SELECTED_Y + 10
    let w = BUT_W
    let h = BUT_H
    let bMinusFrom, bPlusFrom, bMinusTo, bPlusTo, bRpos
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
    y = RUNES_SELECTED_Y + 10
    for(let i = 0; i < RIGHT_RUNES.length; i++){
        let b = new FunctionalButton(x, y, w, h, RIGHT_RUNES[i], RIGHT_RUNES_COLS[i])
        if(i == 2) bRpos = b
        b.setFunc(() => {
            if(selectedButton){
                selectedButton.runebook.runes[selectedButton.runeIndex].right = i
                if(i == 2){
                    selectedButton.runebook.runes[selectedButton.runeIndex].setRelPos(rPosGlobal.from, rPosGlobal.to)
                }
                selectedButton.runebook.createButtons()
            }
        })
        panelReplaceRight.push(b)
        y += h + 10
    }
    let wHalf = ((w) / 2) - 5
    bMinusFrom = new FunctionalButton(x, y, wHalf, h, '- from', [30, 30, 30])
    bPlusFrom = new FunctionalButton(x + wHalf + 10, y, wHalf, h, '+ from', [30, 30, 30])
    bMinusFrom.setFunc(() => {
        rPosGlobal.from--
    })
    bPlusFrom.setFunc(() => {
        rPosGlobal.from++
    })
    bMinusFrom.textSize = 17
    bPlusFrom.textSize = 17

    y += h + 10

    bMinusTo = new FunctionalButton(x, y, wHalf, h, '- to', [30, 30, 30])
    bPlusTo = new FunctionalButton(x + wHalf + 10, y, wHalf, h, '+ to', [30, 30, 30])
    bMinusTo.setFunc(() => {
        rPosGlobal.to--
    })
    bPlusTo.setFunc(() => {
        rPosGlobal.to++
    })
    bMinusTo.textSize = 17
    bPlusTo.textSize = 17
    
    panelReplaceRight.push(bPlusFrom)
    panelReplaceRight.push(bMinusFrom)
    panelReplaceRight.push(bPlusTo)
    panelReplaceRight.push(bMinusTo)

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
    setMinMax()
    selectedRuneBook = runeBooks[0]

    for(let i = 0; i < nParticlesAttack; i++){
        let pos = getRandomPosParticle()
        let pA = new AttackParticle(pos.x, pos.y)
        attackParticles.push(pA)
    }
    for(let i = 0; i < nParticlesFood; i++){
        let pos = getRandomPosParticle()
        let pF = new FoodParticle(pos.x, pos.y)
        foodParticles.push(pF)
    }
    initPanelReplace()
}

function draw(){
    background('#f5ebe0')
    //background(50)

    currentEdges = getEdges()
    mousePos = getRelativePos(mouseX, mouseY)
    if(selectedRuneBook && selectedRuneBook.dead) selectedRuneBook = null

    updateOrbit(runeGroups, baseRadius, padding)
    setMinMax()

    if(selectedRuneBook && focused){
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
    for(let i = runeBooks.length - 1; i >= 0; i--){
        let runeBook = runeBooks[i]
        if(!runeBook) continue
        runeBook.update()
        runeBook.show()
        if(runeBook.dead){
            runeBooks[i] = undefined
        }
    }
    for(let i = attackParticles.length - 1; i >= 0; i--){
        let p = attackParticles[i]
        p.update()
        p.show()
        if(p.dead){
            attackParticles.splice(i, 1)
            let pos = getRandomPosParticle()
            let pA = new AttackParticle(pos.x, pos.y)
            attackParticles.push(pA)
        }
    }
    for(let i = foodParticles.length - 1; i >= 0; i--){
        let p = foodParticles[i]
        p.update()
        p.show()
        if(p.dead){
            foodParticles.splice(i, 1)
            let pos = getRandomPosParticle()
            let pF = new FoodParticle(pos.x, pos.y)
            foodParticles.push(pF)
        }
    }

    rectMode(CORNERS)
    stroke(0, 100)
    noFill()
    //rect(minPos.x, maxPos.y, maxPos.x, minPos.y)
    pop()
    
    noStroke()
    fill('#33415c')
    rect(WIDTH, 0, WIDTH_UI, HEIGHT)

    showSelectedRuneBookMenu()
    showReplaceRuneMenu()
    
    
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
    for(let rb of runeBooks){
        if(!rb) continue
        rb.oldPos = rb.pos.copy()
    }
  const levels = counts.length;
  if (levels === 0) return;

  const clusterR = [];
  if (levels > 1) {
    clusterR[levels - 1] = baseRadius + padding;
    for (let l = levels - 2; l >= 0; l--) {
      const diameter = clusterR[l + 1] * 2 * counts[l + 1];
      clusterR[l] = getRadius(diameter);
    }
  }

  const multipliers = Array(levels).fill(1);
  for (let l = levels - 2; l >= 0; l--) {
    multipliers[l] = multipliers[l + 1] * counts[l + 1];
  }

  const speed     = speedRot;
  const rotAmount = HALF_PI * frameCount * speed;

  function recurse(level, cx, cy, parentBaseAngle, pathIndices) {
    const n        = counts[level];
    const step     = TWO_PI / n;
    const signGroup= (level % 2 === 0) ? -1 : 1;

    for (let i = 0; i < n; i++) {
      const baseAngle = step * i;

      if (level < levels - 1) {
        const angle = baseAngle + signGroup * rotAmount;
        const d     = clusterR[level];
        const x0    = cx + Math.cos(angle) * d;
        const y0    = cy + Math.sin(angle) * d;
        recurse(level + 1, x0, y0, baseAngle, pathIndices.concat(i));

      } 
      else {
        const parentSign = (((level - 1) % 2) === 0) ? -1 : 1;
        const leafRot    = -parentSign * rotAmount;

        for (let j = 0; j < n; j++) {
          const leafBase = step * j;
          const ang      = leafBase - parentBaseAngle + leafRot;
          const x        = cx + Math.cos(ang) * baseRadius;
          const y        = cy + Math.sin(ang) * baseRadius;

          const fullPath = pathIndices.concat(j);
          let idx = 0;
          for (let l = 0; l < levels; l++) {
            idx += fullPath[l] * multipliers[l];
          }
            if(runeBooks[idx] != undefined){
            runeBooks[idx].pos.x = x;
            runeBooks[idx].pos.y = y;
            }
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
        let rb = new RuneBook(x, y);
        rb.id = runeBooks.length;
        runeBooks.push(rb);
      }
    }
  }

  recurse(0, center.x, center.y);

  return runeBooks;
}

function showSelectedRuneBookMenu(){
    if(!selectedRuneBook) return
    let y = 35
    let padding = 0
    let x = 10
    let wBar = 260
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
    drawBar(x, y, wBar, hBar, mapp(selectedRuneBook.shield, 0, MAX_SHIELD, 0, wBar))
    y += hBar*2 + padding

    fill(255)
    text('Memory: ', x, y)
    let auxX = x + textWidth('Memory: ') + 20
    let auxY = y - 5
    for(let rune of selectedRuneBook.memory){
        let colLeft = LEFT_RUNES_COLS[rune[0]]
        let colRight = RIGHT_RUNES_COLS[rune[1]]
        fill(colLeft)
        ellipse(auxX, auxY, 7)
        fill(colRight)
        ellipse(auxX + 10, auxY, 7)
        auxX += 25
    }

    y = RUNES_SELECTED_Y
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
    let y = RUNES_SELECTED_Y
    let x = 290
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

function setMinMax(){
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for(let runeBook of runeBooks){
        if(!runeBook) continue
        if(runeBook.pos.x < minX) minX = runeBook.pos.x
        if(runeBook.pos.x > maxX) maxX = runeBook.pos.x
        if(runeBook.pos.y < minY) minY = runeBook.pos.y
        if(runeBook.pos.y > maxY) maxY = runeBook.pos.y 
    }
    let padd = 500
    minPos = createVector(minX-padd, minY-padd)
    maxPos = createVector(maxX+padd, maxY+padd)
}

function getRandomPosParticle(){
    let angle = random(TWO_PI)
    let radius = (maxPos.x - minPos.x) * .5
    let pos = createVector(Math.cos(angle) * radius, Math.sin(angle) * radius)
    return pos
}   