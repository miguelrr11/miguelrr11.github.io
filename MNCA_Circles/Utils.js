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
    let density = pixelDensity(); // Get the pixel density (e.g., 2 on Retina displays)
    let adjustedWidth = WIDTH * density; // Adjust width for pixel density

    for (let i = 0; i < w * density; i++) {
        for (let j = 0; j < h * density; j++) {
            
            // Adjust the index to account for pixel density
            let index = 4 * (((y * density) + j) * adjustedWidth + ((x * density) + i));

            pixels[index] = r;     // Red
            pixels[index + 1] = g; // Green
            pixels[index + 2] = b; // Blue
            pixels[index + 3] = a; // Alpha
        }
    }
}


