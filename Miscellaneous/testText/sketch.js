//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let font, textGfx

//all the text-glitch settings in one place, passed straight into createGlitchyText
const textOpts = {
    fontSize: 50,          //text height in px
    col: [255, 255, 255],     //base streak colour [r,g,b]
    variance: 60,           //how much each channel is randomly nudged per line
    spacing: 1,             //vertical gap (px) between silhouette samples -> bigger = fewer curves
    sampleFactor: 1,      //textToPoints density (higher = more outline points)
    drawText: true,          //also draw the actual letters in the middle
    monoVariance: true,
    justFirstAndLastLetters: true,

    //energy curves dissipating from the letter silhouette
    energy: {
        chance: 0.1,        //fraction of silhouette rows that emit a strand (both sides get the SAME count)
        minLen: 8,           //ignore strands shorter than this (px)

        //two colour+alpha gradients laid end-to-end along each strand (strand start -> strand end).
        //each blends from `From` to `To` as [r, g, b, alpha]. `Speed` controls how fast that gradient
        //completes: higher speed = it occupies LESS of the strand. The two speeds share the strand,
        //so a fast grad1 + slow grad2 = quick fade-in near the letter, long slow tail toward the edge.
        //speeds are picked at random per strand within their [min, max] range.
        grad1From: [255, 255, 255, 0],   //strand start: fully transparent...
        grad1To:   [255, 255, 255, 255], //...to opaque white
        grad1Speed: [1, 2],              //fast

        grad2From: [255, 255, 255, 255], //then opaque white...
        grad2To:   [0, 0, 0, 0],         //...to transparent black
        grad2Speed: [0.4, 0.8],          //slow

        startDist: [5, 18],   //how far from the origin (the letter) the strand begins, in segments.
                             //0 = starts right at the letter; larger = a gap before the strand starts.
                             //picked at random per strand within this [min, max] range.

        curveAmp: 0.18,      //vertical curveness as a fraction of the curve length
        curveAmpRand: 0.6,   //+/- randomness applied to curveAmp per strand
        curvePower: 1.8,     //how fast the curve gets wild as it leaves the letter (>1 = ramps up far away)
        waves: 1.4,          //how many vertical oscillations along the strand
        wavesRand: 0.5,      //+/- randomness on the wave count per strand
        endDrift: 0.25,      //extra vertical wander of the far (edge) end, as a fraction of length

        weight: 2,           //stroke weight
        weightRand: 0.4,     //+/- randomness on the stroke weight per strand
        segments: 100         //resolution of each strand (more = smoother)
    }
}

async function setup(){
    createCanvas(WIDTH, HEIGHT)
    //direct .ttf so textToPoints has real outline data to work with
    font = await loadFont('font.ttf')
    textGfx = createGlitchyText('GLITCH', width/2, height/2, textOpts)
}

function draw(){
    background(0)
    image(textGfx, 0, 0)
}

function mouseClicked(){
    //roll a whole new random energy look on every click (logged so you can copy keepers)
    textOpts.energy = randomEnergy()
    console.log(textOpts.energy)
    textGfx = createGlitchyText('Symbolic', mouseX, mouseY, textOpts)
}

//a random [min, max] pair: lo somewhere in [min,max], hi a little above it
function randRange(min, max, spread){
    const lo = random(min, max)
    return [lo, lo + random(0, spread)]
}

//random colour: often white, sometimes a saturated tint
function randTint(){
    if(random() < 0.4) return [255, 255, 255]
    return [Math.round(random(80, 255)), Math.round(random(80, 255)), Math.round(random(80, 255))]
}

//build a fresh randomized energy config to explore lots of different looks
function randomEnergy(){
    const mid  = randTint()                                   //the bright, opaque middle colour
    const tail = random() < 0.5 ? [0, 0, 0] : randTint()      //colour the strand fades out into

    return {
        chance: random(0.05, 0.2),
        minLen: 8,

        grad1From: [...mid, 0],     //transparent...
        grad1To:   [...mid, 255],   //...to opaque
        grad1Speed: randRange(0.8, 3, 2),   //fast-ish

        grad2From: [...mid, 255],   //opaque...
        grad2To:   [...tail, 0],    //...to transparent
        grad2Speed: randRange(0.3, 1, 0.8), //slow-ish

        startDist: randRange(0, 20, 15),

        curveAmp: random(0.05, 0.35),
        curveAmpRand: random(0.2, 0.8),
        curvePower: random(1, 3),
        waves: random(0.5, 3),
        wavesRand: random(0.2, 0.8),
        endDrift: random(0, 0.5),

        weight: random(1, 3),
        weightRand: random(0.2, 0.6),
        segments: 100
    }
}

//grab outline points; works whether textToPoints is global (p5 2.0) or a font method (fallback)
function getTextPoints(str, x, y, fontSize, options){
    if(typeof textToPoints === 'function') return textToPoints(str, x, y, options)
    return font.textToPoints(str, x, y, fontSize, options)
}

function createGlitchyText(str, x, y, opts = {}){
    //draws curvy "energy" strokes that fly off the left/right silhouette of the text toward the
    //screen edges, fading from transparent (at the edge) into bright (at the letter)
    const {
        fontSize = 200,
        col = [255, 255, 255],
        spacing = 1,
        sampleFactor = 0.5,
        drawText = true,
        justFirstAndLastLetters = false, //only emit strands from the outer edges (first + last char)
        energy = {}
    } = opts

    const e = {
        chance: 0.08, minLen: 8,
        grad1From: [255, 255, 255, 0], grad1To: [255, 255, 255, 255], grad1Speed: [3, 5],
        grad2From: [255, 255, 255, 255], grad2To: [0, 0, 0, 0], grad2Speed: [0.4, 0.8],
        startDist: [0, 0],
        curveAmp: 0.18, curveAmpRand: 0.6, curvePower: 1.8,
        waves: 1.4, wavesRand: 0.5, endDrift: 0.25,
        weight: 1, weightRand: 0.4, segments: 28,
        ...energy
    }

    //textToPoints reads the font/size/alignment off the main canvas
    textFont(font)
    textSize(fontSize)
    textAlign(CENTER, CENTER)

    const pts = getTextPoints(str, x, y, fontSize, {sampleFactor})

    //bin points by row; keep the leftmost and rightmost point of each row = the silhouette
    const leftPt = new Map()
    const rightPt = new Map()
    let minX = Infinity, maxX = -Infinity
    for(const p of pts){
        const key = Math.round(p.y / spacing)
        const l = leftPt.get(key)
        if(!l || p.x < l.x) leftPt.set(key, p)
        const r = rightPt.get(key)
        if(!r || p.x > r.x) rightPt.set(key, p)
        if(p.x < minX) minX = p.x
        if(p.x > maxX) maxX = p.x
    }

    //optionally restrict to the outer edges: only keep left points within one glyph-width of the
    //string's left edge (= the first char) and right points within one glyph-width of the right edge
    //(= the last char). this stops a tall middle letter from sprouting strands in the centre.
    let leftBand = Infinity, rightBand = -Infinity
    if(justFirstAndLastLetters && str.length > 0){
        leftBand  = minX + textWidth(str[0])
        rightBand = maxX - textWidth(str[str.length - 1])
    }

    //everything goes into a buffer so the random curves stay fixed until the next rebuild
    const g = createGraphics(width, height)
    g.noFill()

    //keep silhouette points whose strand is long enough (so the count we pick is the count we draw),
    //and, if requested, only those within the first/last char bands
    const leftArr  = [...leftPt.values()].filter(p => p.x >= e.minLen && p.x <= leftBand)
    const rightArr = [...rightPt.values()].filter(p => width - p.x >= e.minLen && p.x >= rightBand)

    //both sides emit the SAME number of strands
    const count = Math.round(e.chance * Math.min(leftArr.length, rightArr.length))

    //left silhouette -> curve out to the left edge
    for(const p of sampleN(leftArr, count))  drawEnergyCurve(g, p.x, p.y, 0, e)
    //right silhouette -> curve out to the right edge
    for(const p of sampleN(rightArr, count)) drawEnergyCurve(g, p.x, p.y, width, e)

    //the actual letters on top
    if(drawText){
        g.noStroke()
        g.fill(col[0], col[1], col[2])
        g.textFont(font)
        g.textSize(fontSize)
        g.textAlign(CENTER, CENTER)
        g.text(str, x, y)
    }

    return g
}

//one curvy energy stroke from the silhouette point (sx,sy) out to the screen edge at ex.
//curveness grows with distance from the letter (the "origin") and with the strand's length.
//colour+alpha runs through two gradients laid end-to-end (see grad1*/grad2* options); the
//crossover point between them is set by the two per-strand speeds.
function drawEnergyCurve(g, sx, sy, ex, e){
    const len = Math.abs(ex - sx)
    if(len < e.minLen) return

    //per-strand randomness, fixed for the life of this stroke
    const amp = len * e.curveAmp * (1 + random(-e.curveAmpRand, e.curveAmpRand))
    const drift = len * e.endDrift * random(-1, 1)
    const waves = e.waves * (1 + random(-e.wavesRand, e.wavesRand))
    const phase = random(TWO_PI)

    //per-strand gradient speeds -> how much of the strand each gradient eats up.
    //higher speed = completes faster = shorter portion. crossover splits the two.
    const s1 = random(e.grad1Speed[0], e.grad1Speed[1])
    const s2 = random(e.grad2Speed[0], e.grad2Speed[1])
    const cross = (1 / s1) / (1 / s1 + 1 / s2)

    const g1a = color(e.grad1From[0], e.grad1From[1], e.grad1From[2], e.grad1From[3])
    const g1b = color(e.grad1To[0],   e.grad1To[1],   e.grad1To[2],   e.grad1To[3])
    const g2a = color(e.grad2From[0], e.grad2From[1], e.grad2From[2], e.grad2From[3])
    const g2b = color(e.grad2To[0],   e.grad2To[1],   e.grad2To[2],   e.grad2To[3])

    g.strokeWeight(e.weight * (1 + random(-e.weightRand, e.weightRand)))

    //per-strand: skip this many segments at the origin so the strand starts away from the letter
    const startSeg = constrain(Math.round(random(e.startDist[0], e.startDist[1])), 0, e.segments - 1)

    //point on the (absolute) curve path at parameter t -> geometry is unchanged by startDist
    const px_ = t => lerp(sx, ex, t)
    const py_ = t => sy + drift * t + Math.sin(t * PI * waves + phase) * amp * Math.pow(t, e.curvePower)

    let px = px_(startSeg / e.segments), py = py_(startSeg / e.segments)
    for(let s = startSeg + 1; s <= e.segments; s++){
        const t = s / e.segments               //0 at the letter -> 1 at the edge (curve geometry)
        const x = px_(t), y = py_(t)

        //gradient runs over the VISIBLE part of the strand, so it still fades in cleanly at the start
        const tc = (s - startSeg) / (e.segments - startSeg)
        let c
        if(tc <= cross) c = lerpColor(g1a, g1b, cross > 0 ? tc / cross : 1)
        else            c = lerpColor(g2a, g2b, cross < 1 ? (tc - cross) / (1 - cross) : 1)
        g.stroke(c)
        g.line(px, py, x, y)
        px = x; py = y
    }
}

//return n random distinct elements of arr (partial Fisher-Yates shuffle)
function sampleN(arr, n){
    const a = arr.slice()
    for(let i = a.length - 1; i > 0; i--){
        const j = Math.floor(random() * (i + 1))
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp
    }
    return a.slice(0, Math.min(n, a.length))
}

//base colour with each channel randomly nudged by +/- variance, clamped to 0..255
function randCol(col, variance, mono, withNoise = false, noiseVal = 0){
    if(mono){
        let ran = withNoise ? noise(noiseVal) : random(-variance, variance)
        const r = constrain(col[0] + ran, 0, 255)
        const gc = constrain(col[1] + ran, 0, 255)
        const b = constrain(col[2] + ran, 0, 255)
        return color(r, gc, b)
    }
    const r = constrain(col[0] + random(-variance, variance), 0, 255)
    const gc = constrain(col[1] + random(-variance, variance), 0, 255)
    const b = constrain(col[2] + random(-variance, variance), 0, 255)
    return color(r, gc, b)
}
