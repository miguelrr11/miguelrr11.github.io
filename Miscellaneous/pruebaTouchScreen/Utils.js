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

function gradientLine(x1, y1, x2, y2, colors) {
	// linear gradient from start to end of line
	var grad = this.drawingContext.createLinearGradient(x1, y1, x2, y2);
	for(let i = 0; i < colors.length; i++){
		grad.addColorStop(i / (colors.length - 1), colors[i]);
	}
  
	this.drawingContext.strokeStyle = grad;
  
	line(x1, y1, x2, y2);
}