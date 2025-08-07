class Particle{
	constructor(x, y, pinned){
		this.pos = createVector(x, y)
		this.prevPos = createVector(x, y)
		this.acc = createVector(0, 0)
		this.isPinned = pinned
		this.id = Particle.idCounter++
	}

	static idCounter = 0

	applyForce(force){
		if(!this.isPinned) this.acc.add(force)
	}

	update(timeStep){
		// verlet intergration
        if (!this.isPinned) {
        	let vel = p5.Vector.sub(this.pos, this.prevPos)
			vel.mult(0.92) 
			this.prevPos = this.pos.copy()
			this.pos.add(p5.Vector.add(vel, this.acc.copy().mult(timeStep * timeStep)))
			this.acc = createVector(0, 0)
        }
	}

	constrainToBounds(){
		if(this.pos.x < 0) this.pos.x = 0
		if(this.pos.y < 0) this.pos.y = 0
		if(this.pos.x > WIDTH) this.pos.x = WIDTH
		if(this.pos.y > HEIGHT) this.pos.y = HEIGHT
	}

	show(){
		push()
		noStroke()
		fill(255)
		ellipse(this.pos.x, this.pos.y, 8)
		pop()
	}
}