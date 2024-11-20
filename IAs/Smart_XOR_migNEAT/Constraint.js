class Constraint{
	constructor(p1, p2, initialLength = REST_DISTANCE){
		this.p1 = p1
		this.p2 = p2
		this.initialLength = initialLength
		this.active = true
		this.currentLength = undefined
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

	show(value){
		
		if(!this.active) return
		push()
		if(value < 0){
			stroke(lerpColor(W, R, Math.abs(value)))
			strokeWeight(map(value, -1, 0, 8, 1))
		}
		else{
			stroke(lerpColor(W, G, value))
			strokeWeight(map(value, 0, 1, 1, 8))
		}
		line(this.p1.pos.x, this.p1.pos.y, this.p2.pos.x, this.p2.pos.y)
		// fill(255, 0, 0)
		// let x = lerp(this.p1.pos.x, this.p2.pos.x, 0.9)
		// let y = lerp(this.p1.pos.y, this.p2.pos.y, 0.9)
		// ellipse(x, y, 10)
		pop()
	}
}

function hypot(x, y){
    return Math.sqrt(x * x + y * y)
}