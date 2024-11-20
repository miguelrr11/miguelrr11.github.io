class ConstraintPend{
	constructor(p1, p2, initialLength = REST_DISTANCE){
		this.p1 = p1
		this.p2 = p2
		this.initialLength = initialLength
		this.active = true
		this.currentLength = undefined
		this.curAngle = undefined
		this.prevAngle = Math.atan2(p2.pos.y - p1.pos.y, p2.pos.x, p1.pos.x)
	}

	getAngularVel(){
		this.curAngle = atan2(this.p2.pos.y - this.p1.pos.y, this.p2.pos.x - this.p1.pos.x);

		let angleDifference = this.curAngle - this.prevAngle;

		if (angleDifference > PI) {
			angleDifference -= TWO_PI;
		} 
		else if (angleDifference < -PI) {
			angleDifference += TWO_PI;
		}

		let angularVelocity = angleDifference / (deltaTime / 1000.0);

		this.prevAngle = this.curAngle;

		return angularVelocity;
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
		if(!this.active) return
		line(this.p1.pos.x, this.p1.pos.y, this.p2.pos.x, this.p2.pos.y)
	}
}

function hypot(x, y){
    return Math.sqrt(x * x + y * y)
}