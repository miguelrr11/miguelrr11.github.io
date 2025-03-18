let REST_DISTANCE = 200

class Constraint{
	constructor(p1, p2, initialLength = REST_DISTANCE){
		this.p1 = p1
		this.p2 = p2
		this.baseLength = initialLength
		this.baseLengthSq = initialLength * initialLength
		this.initialLength = initialLength
		this.active = true
		this.currentLength = dist(this.p1.pos.x, this.p1.pos.y, this.p2.pos.x, this.p2.pos.y)
	}

	satisfy(){
		if(!this.active) return

	    let delta = p5.Vector.sub(this.p2.pos, this.p1.pos)
	    this.currentLength = delta.mag()
	    let difference = (this.currentLength - this.initialLength) / this.currentLength
	    let correction = delta.copy().mult(0.5 * difference)

	    if (!this.p1.isPinned) {
	        this.p1.pos.add(correction);
	    }

	    if (!this.p2.isPinned) {
	        this.p2.pos.sub(correction);
	    }
	}

	deactivate(){
		this.active = false
	}

	show(){
		if(dimmingLines == -1){
			transLines = lerp(transLines, 50, 0.0015)
		}
		else if(dimmingLines == 1){
			transLines = lerp(transLines, 255, 0.0015)
		}
		customLine(this.p1.pos.x, this.p1.pos.y, this.p2.pos.x, this.p2.pos.y, [170, 170, 170, transLines], 1)
	}
}

function gradientLine(x1, y1, x2, y2, colors) {
	var grad = this.drawingContext.createLinearGradient(x1, y1, x2, y2);
	for(let i = 0; i < colors.length; i++){
		grad.addColorStop(i / (colors.length - 1), colors[i]);
	}
  
	this.drawingContext.strokeStyle = grad;
  
	line(x1, y1, x2, y2);
}

function hypot(x, y){
    return Math.sqrt(x * x + y * y)
}