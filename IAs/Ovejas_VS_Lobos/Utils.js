function mapp(value, start1, stop1, start2, stop2){
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

function lerppColor(col1, col2, amt) {
    // Parse the hex colors into their RGB components
    const hexToRgb = (hex) => {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16)
        };
    };

    // Convert RGB components back to a hex string
    const rgbToHex = ({ r, g, b }) => {
        const toHex = (component) => component.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    // Linearly interpolate between two values
    const lerp = (start, end, t) => Math.round(start + (end - start) * t);

    // Convert input colors to RGB
    const rgb1 = hexToRgb(col1);
    const rgb2 = hexToRgb(col2);

    // Interpolate each color channel
    const result = {
        r: lerp(rgb1.r, rgb2.r, amt),
        g: lerp(rgb1.g, rgb2.g, amt),
        b: lerp(rgb1.b, rgb2.b, amt)
    };

    // Convert the interpolated color back to hex
    return rgbToHex(result);
}

function randomm(min, max) {
    return Math.random() * (max - min) + min;
}

