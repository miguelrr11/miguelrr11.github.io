function mapp(value, start1, stop1, start2, stop2, withinBounds = false) {
    let mappedValue = start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2);
    
    if (withinBounds) {
        if (start2 < stop2) {
            mappedValue = Math.max(Math.min(mappedValue, stop2), start2);
        } else {
            mappedValue = Math.max(Math.min(mappedValue, start2), stop2);
        }
    }

    return mappedValue;
}

function drawFastRect(x, y, w, h, r, g, b, a = 255) {
    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {

            let index = (4 * ((y + j) * WIDTH + (x + i)));
            
            pixels[index] = r;     
            pixels[index + 1] = g; 
            pixels[index + 2] = b;
            pixels[index + 3] = a; 
        }
    }
}

