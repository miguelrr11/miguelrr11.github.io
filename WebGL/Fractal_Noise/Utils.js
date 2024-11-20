function mapp(value, start1, stop1, start2, stop2){
    return start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2); 
}

function drawFastRect(x, y, w, h, r, g, b, a = 255) {
    let density = 1
    let adjustedWidth = width * density
    let maxI = w * density
    let maxJ = h * density
    let xd = x * density
    let yd = y * density

    for (let i = 0; i < maxI; i++) {
        for (let j = 0; j < maxJ; j++) {
            let index = 4 * (((yd) + j) * adjustedWidth + ((xd) + i));

            pixels[index] = r
            pixels[index + 1] = g
            pixels[index + 2] = b
            pixels[index + 3] = a
        }
    }
}

