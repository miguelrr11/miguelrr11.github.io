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

function randomizeColor(col, amt){
    //if col is an array do col.map(c => c + randomm(-amt, amt))
    if(!col.levels) return col.map(c => c + randomm(-amt, amt))
    else if(col.levels.length == 4) 
        return color(col.levels[0] + randomm(-amt, amt), col.levels[1] + randomm(-amt, amt), col.levels[2] + randomm(-amt, amt), col.levels[3])
    else if(col.levels.length == 3)
        return color(col.levels[0] + randomm(-amt, amt), col.levels[1] + randomm(-amt, amt), col.levels[2] + randomm(-amt, amt))
    else if(col.levels.length == 1)
        return color(col.levels[0] + randomm(-amt, amt))
    else if(col.levels.length == 2)
        return color(col.levels[0] + randomm(-amt, amt), col.levels[1] + randomm(-amt, amt))
    return col.levels.map(c => c + randomm(-amt, amt))
}

function randomm(start, stop){
    return Math.random() * (stop - start) + start
}

function squaredDistance(x1, y1, x2, y2) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2
}
