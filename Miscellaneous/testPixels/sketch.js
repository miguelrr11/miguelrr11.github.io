//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let img, newImg, pos, size

//all the glitch settings in one place, passed straight into createGlitchyImage


async function setup(){
    createCanvas(WIDTH, HEIGHT)
    pos = {x: width/2-100, y: height/2}
    size = 300
    img = await loadImage('test.png')
    newImg = createGlitchyImage(img, size, size, pos, glitchOpts)
}

function draw(){
    background(0)
    //newImg spans the whole canvas, so draw it from the corner
    imageMode(CORNER)
    image(newImg, 0, 0)
}

function mouseClicked(){
    pos = {x: mouseX, y: mouseY}
    newImg = createGlitchyImage(img, size, size, pos, glitchOpts)
}

const glitchOpts = {
    sides: {left: true, right: true, top: false, bottom: false},
    type: 'none',          //'noise' | 'sine' | 'none'
    amp: 80,               //max vertical shift in pixels
    scale: 0.1,            //noise zoom / sine frequency
    symmetrical: true,     //left and right mirror each other
    color: {
        mode: 'fade', //'none' | 'invert' | 'tint' | 'rainbow' | 'chromatic' | 'posterize' | 'fade'
        amount: 1,         //effect strength 0..1
        tint: [255, 60, 180], //used by 'tint'
        levels: 10,         //used by 'posterize'
        shift: 60          //used by 'chromatic' (vertical split in px)
    }
}

function createGlitchyImage(img, imgW, imgH, imgPos, opts = {}){
    //what this function does is strech the edge pixels of an image towards the sides of the canvas, creating a glitchy effect
    //opts:
    //  sides       {left, right, top, bottom} - which edges get extended
    //  type        'noise' | 'sine' | 'none'  - how the stretched columns are distorted vertically
    //  amp         max vertical pixel shift of the stretched columns
    //  scale       noise zoom / sine frequency
    //  symmetrical if true the distortion is driven by distance to the image, so left and right mirror each other
    //  color       {mode, amount, tint, levels, shift} - recolours the stretched pixels, growing with distance:
    //              mode: 'none' | 'invert' | 'tint' | 'rainbow' | 'chromatic' | 'posterize' | 'fade'
    //              amount 0..1 strength, tint [r,g,b], levels = posterize steps, shift = chromatic split in px
    const {
        sides = {left: true, right: true, top: false, bottom: false},
        type = 'noise',
        amp = 60,
        scale = 0.02,
        symmetrical = true,
        color = {}
    } = opts
    const isSine = type === 'sine'
    const doDistort = type !== 'none' && amp !== 0

    //resolve the colour effect once, map its name to an int so the inner loop only switches on a number
    const cAmount = color.amount != null ? color.amount : 1
    const cTint = color.tint || [255, 60, 180]
    const cLevels = color.levels || 4
    const cShift = color.shift != null ? color.shift : 10
    const cModeCode = {none: 0, invert: 1, tint: 2, rainbow: 3, chromatic: 4, posterize: 5, fade: 6}[color.mode] || 0
    const doColor = cModeCode !== 0 && cAmount !== 0

    //rainbow mode reads from a precomputed 256-entry palette (cosine gradient) so there's no trig per pixel
    let palette = null
    if(cModeCode === 3){
        palette = new Uint8Array(256 * 3)
        for(let i = 0; i < 256; i++){
            const t = i / 255 * 6.28318
            palette[i * 3]     = 128 + 127 * Math.sin(t)
            palette[i * 3 + 1] = 128 + 127 * Math.sin(t + 2.094)
            palette[i * 3 + 2] = 128 + 127 * Math.sin(t + 4.188)
        }
    }

    img.loadPixels()
    const src = img.pixels          //raw RGBA bytes of the source image
    const iw = img.width
    const ih = img.height

    //the rectangle where the image is displayed inside the canvas (imgW/imgH is the display size, imgPos its center)
    const left = imgPos.x - imgW/2
    const right = imgPos.x + imgW/2
    const top = imgPos.y - imgH/2
    const bottom = imgPos.y + imgH/2

    //newImg covers the whole canvas so it can be drawn at (0,0)
    const newImg = createImage(width, height)
    newImg.loadPixels()
    const dst = newImg.pixels       //starts fully transparent, we only write the pixels we want
    const cw = width
    const ch = height

    const sLeft = sides.left, sRight = sides.right, sTop = sides.top, sBottom = sides.bottom

    //precompute the source column for every canvas x, so there are no divisions in the inner loop
    const colSrc = new Int32Array(cw)
    //colFactor = 0 at the image edge -> 1 at the canvas edge, so the distortion grows with distance
    const colFactor = new Float32Array(cw)
    //colDist = pixel distance from the image edge; used as the distortion coordinate so both sides can mirror
    const colDist = new Float32Array(cw)
    for(let x = 0; x < cw; x++){
        let sx = (x - left) / imgW * iw | 0
        if(sx < 0) sx = 0
        else if(sx > iw - 1) sx = iw - 1
        colSrc[x] = sx

        if(x < left){
            colFactor[x] = left > 0 ? (left - x) / left : 0
            colDist[x] = left - x
        }
        else if(x >= right){
            colFactor[x] = (cw - right) > 0 ? (x - right) / (cw - right) : 0
            colDist[x] = x - right
        }
        else { colFactor[x] = 0; colDist[x] = 0 }
    }

    for(let y = 0; y < ch; y++){
        const inRows = (y >= top && y < bottom)
        const aboveTop = (y < top)
        //map the canvas row to a row of the source image, clamped
        let sy = (y - top) / imgH * ih | 0
        if(sy < 0) sy = 0
        else if(sy > ih - 1) sy = ih - 1

        //how far this row is from the image (0 inside -> 1 at the canvas edge), used by top/bottom effects
        let rowF = 0
        if(aboveTop) rowF = top > 0 ? (top - y) / top : 0
        else if(y >= bottom) rowF = (ch - bottom) > 0 ? (y - bottom) / (ch - bottom) : 0

        const dRow = y * cw
        for(let x = 0; x < cw; x++){
            //decide which source pixel feeds this canvas pixel (ssx < 0 means leave transparent)
            //str = 0..1 distance from the image, drives the colour effects
            let ssx = -1, ssy = 0, str = 0
            if(inRows){
                if(x >= left && x < right){ ssx = colSrc[x]; ssy = sy }   //inside the image
                else {
                    const useLeft = (x < left)
                    if(useLeft ? sLeft : sRight){                         //stretch first/last column
                        ssx = useLeft ? 0 : iw - 1
                        ssy = sy
                        str = colFactor[x]
                        if(doDistort){
                            //coord is symmetric (distance to image) or raw x; -1..1 wave * amp * distance-from-image
                            const coord = symmetrical ? colDist[x] : x
                            const n = isSine ? Math.sin((coord + y) * scale)
                                             : (noise(coord * scale, y * scale) - 0.5) * 2
                            ssy = sy + (n * amp * colFactor[x] | 0)
                            if(ssy < 0) ssy = 0
                            else if(ssy > ih - 1) ssy = ih - 1
                        }
                    }
                }
            }
            else if(x >= left && x < right){
                if(aboveTop){ if(sTop){ ssx = colSrc[x]; ssy = 0; str = rowF } }      //stretch first row
                else { if(sBottom){ ssx = colSrc[x]; ssy = ih - 1; str = rowF } }     //stretch last row
            }
            if(ssx < 0) continue

            const si = (ssx + ssy * iw) << 2
            const di = (x + dRow) << 2
            let r = src[si], g = src[si + 1], b = src[si + 2], a = src[si + 3]

            if(doColor && str > 0){
                const t = Math.min(1, str * cAmount)   //blend strength, capped so it never over-shoots
                switch(cModeCode){
                    case 1:  //invert: fade toward the negative
                        r += (255 - 2 * r) * t
                        g += (255 - 2 * g) * t
                        b += (255 - 2 * b) * t
                        break
                    case 2:  //tint: fade toward a single colour
                        r += (cTint[0] - r) * t
                        g += (cTint[1] - g) * t
                        b += (cTint[2] - b) * t
                        break
                    case 3: {//rainbow: fade toward a palette colour picked by distance
                        const li = (str * 255 | 0) * 3
                        r += (palette[li]     - r) * t
                        g += (palette[li + 1] - g) * t
                        b += (palette[li + 2] - b) * t
                        break
                    }
                    case 4: {//chromatic: split red up and blue down by a growing vertical offset
                        const sh = (str * cShift) | 0
                        let ry = ssy + sh; if(ry < 0) ry = 0; else if(ry > ih - 1) ry = ih - 1
                        let by = ssy - sh; if(by < 0) by = 0; else if(by > ih - 1) by = ih - 1
                        r = src[(ssx + ry * iw) << 2]
                        b = src[((ssx + by * iw) << 2) + 2]
                        break
                    }
                    case 5: {//posterize: crush to fewer colour levels the farther out we go
                        let lv = (cLevels - (cLevels - 2) * str) | 0
                        if(lv < 2) lv = 2
                        const step = 255 / (lv - 1)
                        r = Math.round(r / step) * step
                        g = Math.round(g / step) * step
                        b = Math.round(b / step) * step
                        break
                    }
                    case 6:  //fade: dissolve into the background with distance
                        a *= (1 - t)
                        break
                }
            }

            dst[di]     = r
            dst[di + 1] = g
            dst[di + 2] = b
            dst[di + 3] = a
        }
    }
    newImg.updatePixels()
    return newImg
}
