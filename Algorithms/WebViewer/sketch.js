//WebViewer
//Miguel Rodríguez
//12-03-2025

p5.disableFriendlyErrors = true

let fpsArr = []

function preload() {
    font = loadFont('bnr.ttf')
    btnGit.svgData = loadXML('github.svg')
}

function setup() {
    WIDTH = windowWidth
    HEIGHT = windowHeight
    canvas = createCanvas(WIDTH, HEIGHT)
    ctx = drawingContext
    btnReset.x = WIDTH - 20
    btnReset.y = HEIGHT - 20
    btnCenter.x = WIDTH - 20
    btnCenter.y = HEIGHT - 45
    btnGit.x = 20
    btnGit.y = HEIGHT - 20
    btnColorMode.x = 20
    btnColorMode.y = HEIGHT - 45
    btnHelp.x = 20
    btnHelp.y = HEIGHT - 70
    let [pathsGit, cxGit, cyGit] = parseSVG(btnGit.svgData)
    btnGit.paths = pathsGit
    btnGit.centerX = cxGit
    btnGit.centerY = cyGit
    textFont('Arial')

    colors = [
        color(255, 133, 133),
        color(255, 200, 133),
        color(252, 255, 153),
        color(170, 255, 153),
        color(133, 245, 255),
        color(153, 192, 255),
        color(186, 173, 255),
        color(255, 173, 255)
    ]

    darkModeColors = {
        background: 25,
        topographic: 50,
        btnStrokeStart: (90),
        btnStrokeStop: (200),
        btnFill: 255,
        btnTextMax: 200,
        partFillRectText: 50,
        partTextStroke: color(255),
        partStroke: [50, 50, 50, 1],
        lineStroke: 170,
        lineTrans: 0
    }

    lightModeColors = {
        background: 230,
        topographic: 211,
        btnStrokeStart: (200),
        btnStrokeStop: (120),
        btnFill: 0,
        btnTextMax: 50,
        partFillRectText: 200,
        partTextStroke: color(0),
        partStroke: [100, 100, 100, 1],
        lineStroke: 85,
        lineTrans: 255
    }

    curCol = darkModeColors
    curColMode = 'dark'
    curColLerp = 0

    textFont(font)

    input = new Input(
        width / 2,
        height / 2,
        'Enter a Wikipedia URL',
        () => {
            let link = input.getText();
            let primordial = new Particle(width / 2, height / 2, true, -1, link);
            primordial.color = random(colors);
            particles.push(primordial);
            parentParticles.push({
                pos: primordial.pos.copy(),
                radius: 50
            })
            firstParents.push(primordial)

            createGraph(link, primordial)
                .then(() => {
                    started = true;
                })
                .catch(() => {
                    particles = []
                    errorFrames = 6 * 3;
                });
        },
        true,
        [255, 255, 255],
        [0, 0, 0]
    )
    textFont(font)
    initTopo()
}

function updateColorState() {
    let target = curColMode === 'dark' ? 0 : 1;
    if (abs(curColLerp - target) > 0.01) {
        curColLerp = lerp(curColLerp, target, 0.3);
        curCol = lerpColorMap(darkModeColors, lightModeColors, curColLerp);
    } 
    else {
        curColLerp = target;
        curCol = (target === 0) ? darkModeColors : lightModeColors;
    }
}


function draw() {
    background(curCol.background)
    REM_FRAMECOUNT_CLOSEST = frameCount % INTERVAL_CLOSEST
    //if(particles.length > MAX_PARTICLE_COUNT && removeAnimations.length == 0) removeCluster()

    updateColorState()

    if(btnCenter.bool) {
        zoom = lerpp(zoom, getTargetZoom(), 0.05)
        let [finalxOff, finalyOff] = centerGraph()
        xOff = lerpp(xOff, finalxOff, 0.1)
        yOff = lerpp(yOff, finalyOff, 0.1)


        if(squaredDistance(xOff, yOff, finalxOff, finalyOff) < .1 && animations.length == 0) {
            btnCenter.bool = false
        }
        if(mouseIsPressed) btnCenter.bool = false
    }

    offsetsText[0] = 10 / zoom
    offsetsText[1] = 7 / zoom

    if(keyIsPressed && keyCode == 32) {
        push()
        fill(255, 255, 0)
        //text(Math.round(frameRate()), width - 20, 20)
        pop()
    }

    mousePos = this.getRelativePos(mouseX, mouseY)

    manageDimming()

    updateTopo()
    showTopo()

    push()
    translate(xOff, yOff);
    scale(zoom);

    currentEdges = getEdges()

    updateAnimations()
    updateGraph()
    updateReset()

    showRelationsHovered()

    manageInput()
    manageAnimConn()

    if(mouseIsPressed && hoveredParticle && hoveredParticle.isParent) {
        let forceMult = (Math.log(hoveredParticle.children.length * 100) * 300) / Math.pow(zoom, 2)
        for(let child of hoveredParticle.children) {
            child.showText(false, true)
            let forceOutward = p5.Vector.sub(child.pos, hoveredParticle.pos)
            forceOutward.normalize()
            forceOutward.mult(forceMult)
            child.applyForce(forceOutward)
        }
    }

    if(winningParticle) winningParticle.showWin()
    if(started) showGraph()
    for(let [key, tb] of textBoxes){ 
        let shoudlDelete = showTextBox(tb, tb.closing)
        if(shoudlDelete) {
            textBoxes.delete(key)
        }
    }
    if(btnHelp.bool || helpTB.closing){
        let shouldDelete = showTextBox(helpTB, helpTB.closing) 
        helpTB.particle.update(0.01)
        helpTB.particle.updateHovering()
        if(shouldDelete) {
            helpTB.closing = false
            helpTB.particle = undefined
        }
    }
    showHovered()


    pop()

    push()
    for(let btn of buttons) updateAndShowButton(btn)
    pop()

    if(draggedParticle) {
        let dP = draggedParticle
        if(dP.ctx == undefined || dP.ctx == '') return
        if(textBoxes.has(dP)) return
        let parent = dP.parent
        if(!parent) return
        let d = dist(parent.pos.x, parent.pos.y, dP.pos.x, dP.pos.y) 
                - dP.constraint.baseLength
        if(d > D_TB) {
            let wTB = WIDTH_TB
            if(dP.isImage) {
                if(!dP.image) dP.setImage()
                wTB = WIDTH_TB * .5
            }
            let tb = {
                text: dP.ctx,
                particle: dP,
                w: wTB,
                counter: 0,
                closing: false,
            }
            textBoxes.set(dP, tb)
            //dP.isPinned = true
        }
    }
    
    //showFps()

}

function showFps() {
    fpsArr.push(frameRate())
    if(fpsArr.length > 20) fpsArr.shift()
    let avgFps = fpsArr.reduce((a, b) => a + b) / fpsArr.length
    let fpsText = Math.round(avgFps)
    push()
    fill(255)
    noStroke()
    text(fpsText, 20, 20)
    pop()
}