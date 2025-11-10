let MIN_REST_DISTANCE = 200
let MAX_REST_DISTANCE = MIN_REST_DISTANCE + 200
const SPRING_STIFFNESS = 0.01
const DAMPING = 0.99

class Constraint{
	constructor(p1, p2, initialLength = null){
		this.p1 = p1
		this.p2 = p2
		let actualDistance = p5.Vector.dist(p1.pos, p2.pos)
		this.restLength = initialLength !== null ? initialLength :
			Math.max(MIN_REST_DISTANCE, Math.min(MAX_REST_DISTANCE, actualDistance))
		this.active = true
		this.currentLength = undefined
		this.adaptiveRestLength = this.restLength
	}

	satisfy(){
		if(!this.active) return

	    let delta = p5.Vector.sub(this.p2.pos, this.p1.pos)
	    this.currentLength = delta.mag()

	    // Avoid division by zero when particles are at same position
	    if(this.currentLength < 0.1) {
	    	// Push particles apart slightly if they're too close
	    	let randomDir = p5.Vector.random2D().mult(MIN_REST_DISTANCE * 0.5)
	    	if (!this.p1.isPinned) this.p1.pos.add(randomDir)
	    	if (!this.p2.isPinned) this.p2.pos.sub(randomDir)
	    	return
	    }

	    // Gradually adapt the rest length toward current length for stability
	    this.adaptiveRestLength = this.adaptiveRestLength * 0.995 + this.currentLength * 0.005

	    // Use position-based constraint (Verlet integration compatible)
	    // This is more stable when called multiple times per frame
	    let difference = (this.currentLength - this.adaptiveRestLength) / this.currentLength
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
		line(this.p1.pos.x, this.p1.pos.y, this.p2.pos.x, this.p2.pos.y)
	}
}

function hypot(x, y){
    return Math.sqrt(x * x + y * y)
}