let btnReset = {
    x: WIDTH - 20,
    y: HEIGHT - 20,
    size: 20,
    dimm: 0,
    hovering: false,
    func: drawResetIcon,
    bool: false,
    str: 'Reset [R]',
    canBeShowed: () => {
        return started
    }
}
let btnCenter = {
    x: WIDTH - 20,
    y: HEIGHT - 40,
    size: 20,
    dimm: 0,
    hovering: false,
    func: drawCenterIcon,
    bool: false,
    str: 'Center [C]',
    canBeShowed: () => {
        return started
    }
}
let btnGit = {
    x: 20,
    y: HEIGHT - 20,
    size: 20,
    svgData: undefined,
    paths: [],
    dimm: 0,
    hovering: false,
    func: drawGitSvg,
    bool: false,
    str: 'Source code',
    canBeShowed: () => {
        return true
    }
}
let btnGame = {
    x: 20,
    y: 20,
    size: 20,
    dimm: 0,
    hovering: false,
    func: drawGame,
    bool: false,
    str: 'Start Game',
    canBeShowed: () => {
        return true
    }
}
let btnColorMode = {
    x: 20,
    y: HEIGHT - 60,
    size: 20,
    dimm: 0,
    hovering: false,
    func: drawColorMode,
    bool: false,
    str: 'Light Mode',
    counter: 0,
    canBeShowed: () => {
        return true
    }
}
let btnHelp = {
    x: 20,
    y: HEIGHT - 70,
    size: 20,
    dimm: 0,
    hovering: false,
    func: drawHelp,
    bool: false,
    str: 'Help',
    canBeShowed: () => {
        return true
    },
    cooldown: 0
}

let buttons = [
    btnReset,
    btnCenter,
    btnGit,
    btnGame,
    btnColorMode,
    btnHelp
]

let goalSvg = {
    data: undefined,
    paths: [],
    centerX: 0,
    centerY: 0
}

let helpTB = {
    text:   'WELCOME TO WEB VIEWER\n\n'+

            'First paste a Wikipedia link into the input field and press Enter.\n\n'+
            'Every link present in the article will be extracted and organized by the section they appear in.\n\n'+
            'Each link will become a particle, grouped under its corresponding section.\n\n'+
            'Click and drag a particle outwards to reveal the exact context where that link appeared in the article.\n\n'+
            'Double-click a category particle to open its Wikipedia page and the associated category.\n\n'+
            'Double-click a link particle to map its links into the visualization.',
    particle: undefined,
    w: WIDTH_TB*2,
    counter: 0,
    closing: false
}

function updateAndShowButton(btn) {
    if(!btn.canBeShowed()) return
    let hovNow = inBounds(mouseX, mouseY, btn.x - btn.size / 2, btn.y - btn.size / 2, btn.size, btn.size)
    if(hovNow && !btn.hovering) {
        btn.hovering = true
    }
    else if(!hovNow && btn.hovering) {
        btn.hovering = false
    }
    let max = mouseIsPressed ? 200 : 100
    btn.hovering ? btn.dimm = lerpp(btn.dimm, max, 0.3) : btn.dimm = lerpp(btn.dimm, 0, 0.3)
    let strokeCol = (mapp(btn.dimm, 0, 100, curCol.btnStrokeStart, curCol.btnStrokeStop))
    let textTrans = (mapp(btn.dimm, 0, 100, 0, 200))
    let strokeWeightCol = mapp(btn.dimm, 0, 100, 1, 1.3)
    let sizeMult = mapp(btn.dimm, 0, 100, 1, 1.08)
    size = btn.size * sizeMult
    stroke(strokeCol)
    strokeWeight(strokeWeightCol)
    rectMode(CENTER)
    noFill()
    let col = color(curCol.btnFill, mapp(btn.dimm, 0, 100, 0, 35))
    btn.func(btn.x, btn.y, size * 0.6, btn, color(curCol.btnTextMax, textTrans), strokeCol)
    fill(col)
    rect(btn.x, btn.y, size, size, 5)
}

function drawResetIcon(x, y, size, btn, col) {
    if(mouseIsPressed && btn.hovering && !btn.bool) btn.bool = true
    let str = btn.str
    arc(x, y, size, size, 0.6981317007977318, 0);
    let tipX = x + (size * 0.5)
    let tipY = y
    let tangentAngle = 1.3962634015954636;

    let arrowLength = size * 0.2;
    let arrowAngleOffset = 0.6981317007977318;

    let leftX = tipX - arrowLength * Math.cos(tangentAngle - arrowAngleOffset);
    let leftY = tipY - arrowLength * Math.sin(tangentAngle - arrowAngleOffset);
    let rightX = tipX - arrowLength * Math.cos(tangentAngle + arrowAngleOffset);
    let rightY = tipY - arrowLength * Math.sin(tangentAngle + arrowAngleOffset);

    line(tipX, tipY, leftX, leftY);
    line(tipX, tipY, rightX, rightY);

    textAlign(RIGHT, CENTER)
    textSize(10.5)
    noStroke()
    fill(col)
    text(str, x - size * 0.5 - 10, y)
    
}

function drawHelp(x, y, size, btn, col, secCol) {
    btn.cooldown--
    if(mouseIsPressed && btn.hovering && !btn.bool && btn.cooldown <= 0 && !helpTB.closing){
        btn.bool = true
        helpTB.particle = new Particle(300 + 20, HEIGHT - 450, true)
        helpTB.counter = 0
        btn.cooldown = 30
    }
    else if(mouseIsPressed && btn.hovering && btn.bool && btn.cooldown <= 0 && !helpTB.closing){
        btn.bool = false
        helpTB.closing = true
        btn.cooldown = 30
    }
    let str = btn.str
    textAlign(CENTER, CENTER)
    textSize(15)
    
    noStroke()
    fill(secCol)
    text('?', x, y)

    textAlign(LEFT, CENTER)
    textSize(10.5)
    noStroke()
    fill(col)
    text(str, x + size * 0.5 + 10, y)
}

function drawCenterIcon(x, y, size, btn, col) {
    if(mouseIsPressed && btn.hovering && !btn.bool) btn.bool = true
    let str = btn.str
    ellipse(x, y, size, size)
    let off = size * 0.15
    let st = size * .5
    //draw 4 segments like a crosshair
    line(x + st - off, y, x + st + off, y)
    line(x, y + st - off, x, y + st + off)
    line(x - st - off, y, x - st + off, y)
    line(x, y - st - off, x, y - st + off)

    

    textAlign(RIGHT, CENTER)
    textSize(10.5)
    noStroke()
    fill(col)
    text(str, x - size * 0.5 - 10, y)
}

function drawGitSvg(x, y, size, btn, col) {
    if(mouseIsPressed && btn.hovering && !btn.bool) window.open('https://github.com/miguelrr11/miguelrr11.github.io/tree/main/Algorithms/WebViewer')
    let str = btn.str
    drawPaths(btnGit.paths, x, y, size * 0.055, btnGit.centerX, btnGit.centerY)

    textAlign(LEFT, CENTER)
    textSize(10.5)
    noStroke()
    fill(col)
    text(str, x + size * 0.5 + 10, y)
}

function drawGame(x, y, size, btn, col, fillCol) {
    push()
    translate(x, y)
    rotate(Math.PI * .5)
    translate(-x, -y)
    if(btn.bool) fill(fillCol)
    let triSize = size * 0.375
    let h = Math.sqrt(3) * triSize
    let x1 = x - triSize
    let y1 = y + h / 2
    let x2 = x + triSize
    let y2 = y + h / 2
    let x3 = x
    let y3 = y - h / 2
    triangle(x1, y1, x2, y2, x3, y3)
    pop()

    let str = btn.str
    // btnGame.secondStr = 'Goal: ' + removeBarrabaja(getLastPartOfLink(decodeURIComponent(currentGame.to))) 
    //                   + '\nArticles visited: ' + currentGame.score
    btnGame.secondStr = 'Find the article: "' + removeBarrabaja(getLastPartOfLink(decodeURIComponent(currentGame.to))) + '"\nvisiting the fewest articles possible' +
        '\nArticles visited: ' + currentGame.score + '\n\nClick on the button to take a look'
    let str2 = btn.bool ? btn.secondStr : ''

    drawPaths(goalSvg.paths, x - size * .5, y + size * 0.5 + 10, size * 0.055, goalSvg.centerX, goalSvg.centerY)

    textAlign(LEFT, CENTER)
    textSize(11.5)
    noStroke()
    fill(col)
    text(str, x + size * 0.5 + 10, y)
    textAlign(LEFT, TOP)
    textSize(9)
    text(str2, x - size * .5, y + size * 0.5 + 10)
}

function drawColorMode(x, y, size, btn, col) {
    //if(mouseIsPressed && btn.hovering) changeColorMode()
    let str = btn.str
    ellipse(x, y, size * .5)

    btn.counter = btn.bool ? lerp(btn.counter, 100, 0.1) : lerp(btn.counter, 0, 0.1)
    let lengthMult = mapp(btn.counter, 0, 100, 0.45, 0.6)

    for(let i = 0; i < 8; i++) {
        let angle = map(i, 0, 8, 0, TWO_PI)

        let x1 = x + cos(angle) * size * 0.45
        let y1 = y + sin(angle) * size * 0.45
        let x2 = x + cos(angle) * size * lengthMult
        let y2 = y + sin(angle) * size * lengthMult
        line(x1, y1, x2, y2)
    }

    textAlign(LEFT, CENTER)
    textSize(10.5)
    noStroke()
    fill(col)
    text(str, x + size * 0.5 + 10, y)
}

function showTextBox(tb, closing = false) {
    if(tb.particle != draggedParticle && (tb.particle != helpTB.particle)) tb.closing = true
    if(tb.particle.isImage){
       return showImageBox(tb, closing)
    }
    push();
    let shouldDelete = false
    closing ? tb.counter = lerp(tb.counter, 0, 0.1) : 
              tb.counter = lerp(tb.counter, 100, 0.1)
    if(tb.counter > 100) {
        tb.counter = 100
    }
    if(closing && tb.counter < 1) {
        shouldDelete = true
    }
    let counterPercent = tb.counter * 0.01
    let w = Math.max(tb.w * (counterPercent), 20)
    let tbPos = tb.particle.pos.copy()
    tbPos.x -= Math.max((tb.w / 2) * (counterPercent), 20)
    tbPos.y -= offsetTB
    let innerW = Math.max(w - offsetTB * 8, 20)
    textSize(tb.counter * .10)
    let textH = getWrappedTextHeight(tb.text, innerW);
    tb.h = (textH + offsetTB * 14) * (counterPercent)

    let trans = 255 * (counterPercent)
    fill(curCol.background, trans);
    noStroke();
    rect(tbPos.x, tbPos.y, w, tb.h, radiusTextBox);

    noFill();
    stroke(curCol.topographic, trans);
    strokeWeight(1.5 * counterPercent);
    rect(tbPos.x + offsetTB, tbPos.y + offsetTB,
        w - offsetTB * 2, tb.h - offsetTB * 2,
        radiusTextBox - 1);

    noStroke();
    fill(curCol.partTextStroke, trans);
    text(tb.text,
        tbPos.x + offsetTB * 4,
        tbPos.y + offsetTB * 10,
        innerW);

    pop();
    tb.particle.show()
    return shouldDelete
}

function showImageBox(tb, closing = false) {
    push()
    let img = tb.particle.image
    let shouldDelete = false
    closing ? tb.counter = lerp(tb.counter, 0, 0.1) : 
              tb.counter = lerp(tb.counter, 100, 0.1)
    if(tb.counter > 100) {
        tb.counter = 100
    }
    if(closing && tb.counter < 1) {
        shouldDelete = true
    }
    let counterPercent = tb.counter * 0.01

    let w = Math.max(tb.w * (tb.counter * 0.01), 0)
    let aspectRatio = img.width / img.height
    let h = w / aspectRatio
    let tbPos = tb.particle.pos.copy()
    
    
    let wRect = w + offsetTB * 8
    let hRect = h + offsetTB * 8

    tbPos.x -= wRect/2
    tbPos.y -= offsetTB

    let innerW = Math.max(wRect - offsetTB * 8, 20)
    textSize(tb.counter * .075)
    let textH = getWrappedTextHeight(tb.text, innerW);
    let hTxt = hRect
    hRect += textH + offsetTB * 2

    let trans = 255 * (counterPercent)
    fill(curCol.background, trans);
    noStroke();
    rect(tbPos.x, tbPos.y, wRect, hRect, radiusTextBox);

    noFill();
    stroke(curCol.topographic, trans);
    strokeWeight(1.5);
    rect(tbPos.x + offsetTB, tbPos.y + offsetTB,
        wRect - offsetTB * 2, hRect - offsetTB * 2,
        radiusTextBox - 1);

    image(img, 
        tbPos.x + offsetTB * 4,
        tbPos.y + offsetTB * 4,
        w,
        h,
    )

    noStroke();
    fill(curCol.partTextStroke, trans);
    text(tb.text,
        tbPos.x + offsetTB * 4,
        tbPos.y + hTxt,
        innerW);
    pop()
    tb.particle.show()
    return shouldDelete
}