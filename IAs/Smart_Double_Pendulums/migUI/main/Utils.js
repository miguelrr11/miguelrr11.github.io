function clampp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function mapp(value, start1, stop1, start2, stop2, clamp = false){
    let val = start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2)
    if(clamp) val = clampp(val, start2, stop2)
    return val
}

function drawFastRect(x, y, w, h, r, g, b, a = 255) {
    let density = pixelDensity()
    let adjustedWidth = WIDTH * density

    for (let i = 0; i < w * density; i++) {
        for (let j = 0; j < h * density; j++) {
            let index = 4 * (((y * density) + j) * adjustedWidth + ((x * density) + i));

            pixels[index] = r
            pixels[index + 1] = g
            pixels[index + 2] = b
            pixels[index + 3] = a
        }
    }
}

