//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 750
const WIDTH_UI = 450
const RUNES_SELECTED_Y = 265

let runeBooks = []
let runeGroups = [6, 3]
let baseRadius = 150
let padding = 420

let multRG = runeGroups.reduce((a, b) => a * b, 1)

let nParticlesAttack = multRG * 20
let nParticlesFood = multRG * 20
let attackParticles = []
let foodParticles = []

const helpEntries = [
  {
    left:  'ABSORB',
    right: 'MANA',
    handSide: 'ANY',
    description: 'If food is found: gains 30% of missing energy'
  },
  {
    left:  'ATTACK',
    right: 'SHARD',
    handSide: 'INWARD',
    description: 'If shard is found: kills shard.'
  },
  {
    left:  'ATTACK',
    right: 'MANA',
    handSide: 'INWARD',
    description: 'If mana is found: kills mana.'
  },
  {
    left:  'ATTACK',
    right: 'SHIELD',
    handSide: 'OUTWARD',
    description: 'Reduces shield by 10.'
  },
  {
    left:  'ATTACK',
    right: 'SPELL',
    handSide: 'INWARD',
    description: 'Removes rune at the hands position.'
  },
  {
    left:  'REPAIR',
    right: 'SHIELD',
    handSide: 'OUTWARD',
    description: 'Increases shield by 30% of missing shield.'
  },
  {
    left:  'REPAIR',
    right: 'SPELL',
    handSide: 'INWARD',
    description: 'Repairs the rune at the hands position.'
  },
  {
    left:  'GO TO',
    right: 'WEAK',
    handSide: 'INWARD',
    description: 'Moves hand to weakest rune.'
  },
  {
    left:  'GO TO',
    right: 'RPOS',
    handSide: 'ANY',
    description: 'If start == end: moves hand to (head + start) % runes.length.'
  },
  {
    left:  'GO TO',
    right: 'INWARD',
    handSide: 'ANY',
    description: 'Sets the hands side to INWARD.'
  },
  {
    left:  'GO TO',
    right: 'OUTWARD',
    handSide: 'ANY',
    description: 'Sets the hands side to OUTWARD.'
  },
  {
    left:  'WRITE',
    right: 'RPOS',
    handSide: 'INWARD',
    description: 'If start == end: inserts memory runes at the heads position.'
  },
  {
    left:  'WRITE',
    right: 'ANY',
    handSide: 'OUTWARD',
    description: 'Spawns new URB with memory runes.'
  },
  {
    left:  'READ',
    right: 'RPOS',
    handSide: 'INWARD',
    description: 'Copy runes [(start + end):(head + end)] to memory.'
  },
  {
    left:  'LOOP',
    right: 'RPOS',
    handSide: 'INWARD',
    description: 'Loops to head + start, end times (start must be negative).'
  }
];

let speedRot = 0.00012

let xOff = 0
let yOff = 0
let prevMouseX = 0
let prevMouseY = 0
let zoom = 1

let selectedRuneBook = null
let selectedButton = null
let focused = false
let showingHelp = false

let currentEdges = [0, WIDTH, 0, HEIGHT]
let mousePos 
let finalPos = {x:0, y:0}

let minPos, maxPos

let statusMessageCreate = {
    text: '',
    timer: 0
}
let buttonActivated = false
let savedURBS = []
let panelReplaceLeft = []
let panelReplaceRight = []
let newRuneButtonActive = false
let createURBButton 
let createURBinput
let loadURBButton
let cancelURBButton
let cancelLoadURBButton
let helpButton
let helpLeftButtons = []
let helpShowingCommand = 'ATTACK'
let creatingURB = false
let urb
let urbs = []
let startPostionURB = null
let stopPostionURB = null
let saveButton
let loadingURB = false
let savedURBbuttons = []
let savedURBbuttonsDelete = []



let rPosGlobal = {from: 0, to: 0}

let fonts = new Map()

function mouseDragged() {
    if(creatingURB){
        if(!startPostionURB && mouseX < WIDTH){
            startPostionURB = createVector(mouseX, mouseY)
        }
        else{
            stopPostionURB = createVector(mouseX, mouseY)
        }
        return
    }
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
    buttonActivated = false
    if(creatingURB){
        spawnURB()
    }
    startPostionURB = null
    stopPostionURB = null
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
        if(selectedRuneBook && !loadingURB && !creatingURB && !showingHelp){ 
            for(let b of selectedRuneBook.buttons){
                if(b.isMouseOver()){
                    selectedButton = b
                    break
                }
            }
        }
        if(urb){
            for(let b of urb.buttons){
                if(b.isMouseOver()){
                    selectedButton = b
                    break
                }
            }
        }
    }
    
}

function setStatusMessageCreate(text, time = 60*3){
    statusMessageCreate.text = text
    statusMessageCreate.timer = time
}

function initPanelReplace(){
    let x = WIDTH + 310
    let y = RUNES_SELECTED_Y + 10
    let w = BUT_W
    let h = BUT_H
    let bMinusFrom, bPlusFrom, bMinusTo, bPlusTo, bRpos
    for(let i = 0; i < LEFT_RUNES.length; i++){
        let b = new FunctionalButton(x, y, w, h, LEFT_RUNES[i], LEFT_RUNES_COLS[i])
        b.setFunc(() => {
            if(selectedButton){
                selectedButton.runebook.runes[selectedButton.runeIndex].setLeft(i)
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
                selectedButton.runebook.runes[selectedButton.runeIndex].setRight(i)
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
    bMinusFrom = new FunctionalButton(x, y, wHalf, h, '- start', [30, 30, 30])
    bPlusFrom = new FunctionalButton(x + wHalf + 10, y, wHalf, h, '- end', [30, 30, 30])
    bMinusFrom.setFunc(() => {
        rPosGlobal.from--
        setLocalPos(rPosGlobal.from, rPosGlobal.to)
    })
    bPlusFrom.setFunc(() => {
        rPosGlobal.to--
        setLocalPos(rPosGlobal.from, rPosGlobal.to)
    })
    bMinusFrom.textSize = 17
    bPlusFrom.textSize = 17

    y += h + 10

    bMinusTo = new FunctionalButton(x, y, wHalf, h, '+ start', [30, 30, 30])
    bPlusTo = new FunctionalButton(x + wHalf + 10, y, wHalf, h, '+ end', [30, 30, 30])
    bMinusTo.setFunc(() => {
        rPosGlobal.from++
        setLocalPos(rPosGlobal.from, rPosGlobal.to)
    })
    bPlusTo.setFunc(() => {
        rPosGlobal.to++
        setLocalPos(rPosGlobal.from, rPosGlobal.to)
    })
    bMinusTo.textSize = 17
    bPlusTo.textSize = 17
    
    panelReplaceRight.push(bPlusFrom)
    panelReplaceRight.push(bMinusFrom)
    panelReplaceRight.push(bPlusTo)
    panelReplaceRight.push(bMinusTo)

    createURBButton = new FunctionalButton(x + 10, 40, 120, h, 'Create URB', '#447A9C')
    createURBButton.setFunc(() => {
        creatingURB = true
        selectedButton = null
        urb = new URB(0, 0)
    })

    loadURBButton = new FunctionalButton(x + 10, 70, 120, h, 'Load URB', '#447A9C')
    loadURBButton.setFunc(() => {
        loadingURB = true
        selectedButton = null
    })

    cancelURBButton = new FunctionalButton(x + 45, HEIGHT - 35, 80, h, 'Cancel', '#447A9C')
    cancelURBButton.setFunc(() => {
        creatingURB = false
        selectedButton = null
        urb = null
    })

    cancelLoadURBButton = new FunctionalButton(x + 45, HEIGHT - 35, 80, h, 'Cancel', '#447A9C')
    cancelLoadURBButton.setFunc(() => {
        loadingURB = false
        selectedButton = null
    })

    helpButton = new FunctionalButton(x + 10, 10, 120, h, 'Help', '#447A9C')
    helpButton.setFunc(() => {
        showingHelp = true
        selectedButton = null
    })

    x = WIDTH + 10
    y = 65
    let attackButton = new FunctionalButton(x + 10, y, 120, h, 'ATTACK', [248, 150, 30])
    attackButton.setFunc(() => {
        helpShowingCommand = 'ATTACK'
    })
    helpLeftButtons.push(attackButton)
    y += h + 10
    let writeButton = new FunctionalButton(x + 10, y, 120, h, 'WRITE', [206, 71, 96])
    writeButton.setFunc(() => {
        helpShowingCommand = 'WRITE'
    })
    helpLeftButtons.push(writeButton)
    y += h + 10
    let readButton = new FunctionalButton(x + 10, y, 120, h, 'READ', [206, 71, 96])
    readButton.setFunc(() => {
        helpShowingCommand = 'READ'
    })
    helpLeftButtons.push(readButton)
    x += 130
    y = 65
    let absorbButton = new FunctionalButton(x + 10, y, 120, h, 'ABSORB', [39, 125, 161])
    absorbButton.setFunc(() => {
        helpShowingCommand = 'ABSORB'
    })
    helpLeftButtons.push(absorbButton)
    y += h + 10
    let repairButton = new FunctionalButton(x + 10, y, 120, h, 'REPAIR', [99, 132, 117])
    repairButton.setFunc(() => {
        helpShowingCommand = 'REPAIR'
    })
    helpLeftButtons.push(repairButton)
    y += h + 10
    let goToButton = new FunctionalButton(x + 10, y, 120, h, 'GO TO', [67, 170, 139])  
    goToButton.setFunc(() => {
        helpShowingCommand = 'GO TO'
    })
    helpLeftButtons.push(goToButton)
    x += 130
    y = 65
    let loopButton = new FunctionalButton(x + 10, y, 120, h, 'LOOP', [153, 217, 140])
    loopButton.setFunc(() => {
        helpShowingCommand = 'LOOP'
    })
    helpLeftButtons.push(loopButton)

    let helpBackButton = new FunctionalButton(WIDTH + WIDTH_UI - 90, HEIGHT - 35, 80, h, 'Back', '#447A9C')
    helpBackButton.setFunc(() => {
        showingHelp = false
        selectedButton = null
    })
    helpLeftButtons.push(helpBackButton)

    createURBinput = new Input(WIDTH + 10, 200, 'Name your URB (optional)', [255, 255, 255], [51, 65, 92])
    createURBinput.h = BUT_H
    createURBinput.w = 200

    saveButton = new FunctionalButton(WIDTH + 10 + 200 + 10, 200, 70, BUT_H, 'Save', '#447A9C')
    saveButton.setFunc(() => {
        if(urb){
            let name = createURBinput.getText()
            saveURB(urb, name)
            initLoadURBButtons()
        }
    })
}

function saveURB(urb, name){
    if(name == ''){
        setStatusMessageCreate('URB name cannot be empty!')
        return
    }
    for(let i = 0; i < savedURBS.length; i++){
        if(savedURBS[i].name == name){
            setStatusMessageCreate('URB with that name already exists!')
            return
        }
    }
    let data = {
        name: name,
        runes: urb.runes.map(r => {
            return {
                left: r.left,
                right: r.right,
                from: r.from,
                to: r.to,
            }
        })
    }
    savedURBS.push(data)
    storeItem('savedURBS', JSON.stringify(savedURBS))
}

function setLocalPos(from, to){
    if(selectedButton && !creatingURB){
        if(RIGHT_RUNES[selectedRuneBook.runes[selectedButton.runeIndex].right] == 'RPOS'){
            selectedButton.runebook.runes[selectedButton.runeIndex].setRelPos(from, to)
            selectedButton.runebook.createButtons()
        }
    }
    if(creatingURB){
        if(RIGHT_RUNES[urb.runes[selectedButton.runeIndex].right] == 'RPOS'){
            urb.runes[selectedButton.runeIndex].setRelPos(from, to)
            urb.createButtons()
        }
    }
}

function initLoadData(){
    let aux = getItem('savedURBS')
    if(!aux){
        storeItem('savedURBS', JSON.stringify([]))
    }
    else{
        savedURBS = JSON.parse(aux)
        initLoadURBButtons()
    }
}

function loadURB(urbString){
    creatingURB = true
    loadingURB = false
    urb = new URB(0, 0)
    urb.runes = []
    for(let i = 0; i < urbString.runes.length; i++){
        let r = new Rune(urbString.runes[i].left, urbString.runes[i].right, urbString.runes[i].from, urbString.runes[i].to)
        urb.runes.push(r)
    }
    //if(!urb.hasNoneLast()) urb.runes.push(new Rune(LEFT_RUNES.length - 1, RIGHT_RUNES.length - 1))
    urb.createButtons()
    let clippedName = urbString.name.length > 25 ? urbString.name.substring(0, 25) + '...' : urbString.name
    urb.name = clippedName
}

function initLoadURBButtons(){
    let x = WIDTH + 10
    let y = 70
    savedURBbuttons = []
    savedURBbuttonsDelete = []
    for(let i = 0; i < savedURBS.length; i++){
        let clippedName = savedURBS[i].name.length > 20 ? savedURBS[i].name.substring(0, 18) + '...' : savedURBS[i].name
        let b = new FunctionalButton(x + 35, y, 150, BUT_H, clippedName, '#447A9C')
        b.setFunc(() => {
            loadURB(savedURBS[i])
        })
        savedURBbuttons.push(b)
        let deleteB = new FunctionalButton(x, y, BUT_H, BUT_H, 'X', getColorByWord('SPELL'))
        deleteB.setFunc(() => {
            savedURBS.splice(i, 1)
            storeItem('savedURBS', JSON.stringify(savedURBS))
            initLoadURBButtons()
        })
        savedURBbuttonsDelete.push(deleteB)
        y += BUT_H + 10
    }
}

async function setup(){
    let canvas = createCanvas(WIDTH+WIDTH_UI, HEIGHT)
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    canvas.position(x, y);

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
    initLoadData()
}

function draw(){
    background('#f5ebe0')

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
    for(let ur of urbs){
        ur.update()
        ur.show()
    }
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

    if(!creatingURB && !showingHelp && !loadingURB){
        showSelectedRuneBookMenu()
    }
    else{ 
        if(startPostionURB && stopPostionURB){ 
            stroke(50)
            strokeWeight(3)
            line(startPostionURB.x, startPostionURB.y, stopPostionURB.x, stopPostionURB.y)
            let angle = atan2(startPostionURB.y - stopPostionURB.y, startPostionURB.x - stopPostionURB.x)
            drawArrowTip(stopPostionURB.x, stopPostionURB.y, angle, 20)
        }
        showCreatingURBMenu()
    }
    showReplaceRuneMenu()
    showHelp()
    showLoadURBMenu()
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
    text('Rune Book #' + selectedRuneBook.id , x, y)
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
    helpButton.show()
    createURBButton.show()
    loadURBButton.show()
    pop()
}

function showReplaceRuneMenu(){
    if(!selectedButton) return
    push()
    translate(WIDTH, 0)
    let y = RUNES_SELECTED_Y
    let x = panelReplaceLeft[0].x
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

function showCreatingURBMenu(){
    if(!creatingURB) return
    let y = 35
    let padding = 0
    let x = 10

    push()
    translate(WIDTH, 0)

    // Title of runebook
    textSize(35)
    textAlign(LEFT)
    textFont(fonts.get('Medium'))
    fill(255)
    text('Creating URB', x, y)
    let auxX = textWidth('Creating URB') + 20
    textSize(20)
    urb.name ? text('(' + urb.name + ')', x + auxX, y) : text('(Unidentified Rune Book)', x + auxX, y)
    y += textAscent() + padding

    textSize(18)
    text('An URB is special type of rune book that has the ability to inyect its own runes into other Rune Books.\n\nOnce you are happy with your design, simply click and drag in the direction you want to spawn it. You can also save it for later use.', x, y, WIDTH_UI - padding*7)

    y += textAscent() * 8 + padding
    noStroke()
    fill(255)
    textSize(20)
    textFont(fonts.get('Italic'))
    text('Name', x, y)

    y = RUNES_SELECTED_Y
    // Instructions title
    text('Runes', x, y)

    // Instructions board
    translate(-WIDTH, 0)
    urb.drawInstructions()
    cancelURBButton.show()
    createURBinput.evaluate()
    createURBinput.update()
    createURBinput.show()
    saveButton.show()
    statusMessageCreate.timer--
    if(statusMessageCreate.timer > 0){
        push()
        if(statusMessageCreate.timer > 60*2) fill(255)
        else fill(255, mapp(statusMessageCreate.timer, 0, 60*2, 0, 255))
        textSize(10)
        textFont(fonts.get('Italic'))
        textAlign(LEFT, CENTER)
        text(statusMessageCreate.text, saveButton.x + saveButton.w + 10, saveButton.y + saveButton.h*.5, 
            100)
        pop()
    }
    pop()
}

function showHelp() {
    if (!showingHelp) return;

    for(let b of helpLeftButtons){
        b.show()
    }

    let x = 10;
    let y = 35;
    const padding = 20;

    push();
    translate(WIDTH, 0);

    // Title
    textSize(35);
    textAlign(LEFT);
    textFont(fonts.get('Medium'));
    fill(255);
    text('Help', x, y);
    y += textAscent() + padding + 120;
    x += 10;
    textSize(25);
    text('LEFT     -      RIGHT   -    HAND SIDE', x, y);
    y += textAscent() + padding;

    helpEntries.forEach(entry => {
        if(entry.left == helpShowingCommand){
            textSize(25);
            let auxX = x;

            fill(getColorByWord(entry.left));
            text(entry.left, auxX, y);
            auxX += textWidth(entry.left) + 20;

            fill(getColorByWord(entry.right));
            text(entry.right, auxX, y);
            auxX += textWidth(entry.right) + 20;

            fill(getColorByWord(entry.handSide));
            text(entry.handSide, auxX, y);

            y += textAscent();

            textSize(22);
            fill(255);
            text(entry.description, x, y);

            y += textAscent() + padding;
        }
    });

    pop();
}

function showLoadURBMenu(){
    if(!loadingURB) return
    push();
    translate(WIDTH, 0);
    let x = 10
    let y = 35
    // Title
    textSize(35);
    textAlign(LEFT);
    textFont(fonts.get('Medium'));
    fill(255);
    text('Load saved URBs', x, y);
    pop()

    for(let b of savedURBbuttons){
        b.show()
        //draw runes of the URB as small circles
        let auxX = b.x + b.w + 10
        let auxY = b.y + b.h/2
        for(let rune of savedURBS[savedURBbuttons.indexOf(b)].runes){
            let colLeft = LEFT_RUNES_COLS[rune.left]
            let colRight = RIGHT_RUNES_COLS[rune.right]
            fill(colLeft)
            ellipse(auxX, auxY, 7)
            fill(colRight)
            ellipse(auxX + 10, auxY, 7)
            auxX += 25
        }
    }
    for(let b of savedURBbuttonsDelete){
        b.show()
    }
    cancelLoadURBButton.show()
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

function spawnURB(){
    if(!urb || !startPostionURB) return
    let pos = getRelativePos(mouseX, mouseY)
    let urbToBeAdded = urb.dupe()
    urbToBeAdded.pos = pos.copy()
    let angle = atan2(stopPostionURB.y - startPostionURB.y, stopPostionURB.x - startPostionURB.x)
    urbToBeAdded.runes = urb.runes.map(r => {
        let newRune = new Rune(r.left, r.right, r.from, r.to)
        return newRune
    })
    urbToBeAdded.vel = createVector(Math.cos(angle), Math.sin(angle))
    urbToBeAdded.vel.mult(1.5)
    urbToBeAdded.angle = angle + HALF_PI
    urbs.push(urbToBeAdded)
}

function inyectRunes(urb, rb){
    let newRunes = urb.runes
    for(let r of newRunes){
        r.artificial = true
    }
    let index = mod(rb.runeIndex + 1, rb.runes.length)
    rb.runes = insertAtIndex(index, rb.runes, newRunes)
    rb.runeIndex = mod(index - 1, rb.runes.length)
    rb.setRunesWidth()
    rb.createButtons()
    // delete urb from urbs
    for(let i = 0; i < urbs.length; i++){
        if(urbs[i] == urb){
            urbs.splice(i, 1)
            break
        }
    }
}