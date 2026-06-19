//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let font, gfx



async function setup(){
    createCanvas(WIDTH, HEIGHT)
    font = await loadFont('font.ttf')
    gfx = createReflectedText('Symbolic', width/2, height/2, textOpts, .5)
}

function draw(){
    background(0)
    image(gfx, 0, 0)
}

function mouseClicked(){
    //stretch factor scales with how far down you click, just to feel it out
    const stretch = map(mouseY, 0, height, 0.4, 3)
    gfx = createReflectedText('Reflect', width/2, height/2, textOpts, stretch)
}

//text + reflection settings, passed straight into createReflectedText
const textOpts = {
    fontSize: 40,         //text height in px
    col: [255, 255, 255],  //text colour [r,g,b]
    gap: 0,                //vertical gap between the text and where the reflection starts
    fade: 0.6              //reflection opacity right under the text (0..1), fading to 0 below
}
//draws the string at (x, y) with a flipped, faded, stretched reflection below it.
//stretchFactor: 1 = mirror the same height, >1 = elongated reflection, <1 = squashed.
function createReflectedText(str, x, y, opts = {}, stretchFactor = 1){
    const {
        fontSize = 120,
        col = [255, 255, 255],
        gap = 4,
        fade = 0.6
    } = opts

    const g = createGraphics(width, height)
    g.textFont(font)
    g.textSize(fontSize)
    g.textAlign(CENTER, BASELINE)
    g.noStroke()
    g.fill(col[0], col[1], col[2])

    //the normal text, baseline sitting at y
    g.text(str, x, y)

    //the reflection goes on its own buffer so we can multiply its alpha by a gradient
    const ref = createGraphics(width, height)
    ref.textFont(font)
    ref.textSize(fontSize)
    ref.textAlign(CENTER, BASELINE)
    ref.noStroke()
    ref.fill(col[0], col[1], col[2])

    //flip vertically (negative Y) and stretch by the factor; baseline anchored just below the text
    const refTop = y + gap
    ref.push()
    ref.translate(x, refTop)
    ref.scale(1, -stretchFactor)
    ref.text(str, 0, 0)
    ref.pop()

    //fade: keep the reflection only where a top-down gradient is opaque (destination-in mask)
    const ctx = ref.drawingContext
    const refBottom = refTop + fontSize * stretchFactor
    const grad = ctx.createLinearGradient(0, refTop, 0, refBottom)
    grad.addColorStop(0, 'rgba(0,0,0,' + fade + ')')  //right under the text: most visible
    grad.addColorStop(1, 'rgba(0,0,0,0)')             //farther down: fully gone
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = grad
    ctx.fillRect(0, refTop, width, height - refTop)
    ctx.globalCompositeOperation = 'source-over'      //restore default for safety

    g.image(ref, 0, 0)
    return g
}
