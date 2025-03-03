function mapp(value, start1, stop1, start2, stop2, forceConstrain = false){
    if(forceConstrain){
        return constrain(start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2), start2, stop2)
    }
    return start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2); 
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

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
}

function randomizeColor(col, amt){
    return col.map(c => c + randomm(-amt, amt))
}

function modifyColor(col, amt){
    return col.map(c => c + amt)
}

function getTwoDecimals(number) {
    // Asegúrate de que el número tenga exactamente 2 decimales
    let numStr = number.toFixed(2);
    // Divide el número en la parte entera y la parte decimal
    let decimals = numStr.split('.')[1];
    // Devuelve un array con el primer y segundo decimal
    return [parseInt(decimals[0]), parseInt(decimals[1])];
}

function between(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function lerppColor(color1, color2, t) {
    return color1.map((c, i) => (1 - t) * c + t * color2[i]);
}

function randomm(start, stop){
    return Math.random() * (stop - start) + start
}

function squaredDistance(x1, y1, x2, y2) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2
}