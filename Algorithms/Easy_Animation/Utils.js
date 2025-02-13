function mapp(value, start1, stop1, start2, stop2){
    return start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2); 
}


let adjustedWidth, density, w_den, h_den, buf

function drawFastRect(x, y, w, h, r, g, b, a = 255) {
    const startX = (x * density) | 0;
    const startY = (y * density) | 0;
  
    const colorValue = ((a & 0xff) << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff);
  
    let offset = startY * adjustedWidth + startX;
  
    for (let j = 0; j < h_den; j++) {
      buf.fill(colorValue, offset, offset + w_den);
      offset += adjustedWidth; // Move to the start of the next row.
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

