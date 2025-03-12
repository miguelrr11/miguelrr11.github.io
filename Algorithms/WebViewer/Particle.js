const RADIUS_PARTICLE = 5

class Particle{
	constructor(x, y, pinned, id, str){
		this.pos = createVector(x, y)
		this.prevPos = createVector(x, y)
		this.acc = createVector(0, 0)
		this.isPinned = pinned
		this.id = id
		this.radius = RADIUS_PARTICLE
		this.link = str
	}

	applyForce(force){
		if(!this.isPinned) this.acc.add(force)
	}

	update(timeStep){
		// verlet intergration
        if (!this.isPinned) {
        	let vel = p5.Vector.sub(this.pos, this.prevPos).mult(0.97)
			this.prevPos = this.pos.copy()
			this.pos.add(p5.Vector.add(vel, this.acc.copy().mult(timeStep * timeStep)))
			this.acc = createVector(0, 0)
        }
		let mouseInside = dist(mouseX, mouseY, this.pos.x, this.pos.y) < this.radius
        if(!this.isPinned && mouseInside && mouseIsPressed){
        	this.pos.x = mouseX
        	this.pos.y = mouseY
        }
		this.hovered = mouseInside
		if(this.hovered) hoveredParticle = this
		else if(hoveredParticle == this) hoveredParticle = null
	}


	repel(particles, separationDistance) {
		if(this.isPinned) return
		particles.forEach(other => {
			if (other !== this) {
				let diff = p5.Vector.sub(this.pos, other.pos);
				let distance = diff.mag();

				if (distance < separationDistance) {
					if(distance == 0) distance = 0.1
					// Normalize and scale the force so that closer particles are pushed away stronger
					let strength = (separationDistance - distance) / separationDistance; // 0-1 strength
					diff.normalize();
					diff.mult(strength);
					this.applyForce(diff);
				}
			}
		});
	}

	constrainToBounds(){
		if(this.pos.x < 0) this.pos.x = 0
		if(this.pos.y < 0) this.pos.y = 0
		if(this.pos.x > WIDTH + 220) this.pos.x = WIDTH + 220
		if(this.pos.y > HEIGHT) this.pos.y = HEIGHT
	}
	

	//changed and suited for the pendulum project
	show(){
		push()
		fill(255)
		let rad = this.hovered ? this.radius * 5 : this.radius * 2
		ellipse(this.pos.x, this.pos.y, rad)
		if(this.hovered){
			fill(255)
			stroke(0)
			strokeWeight(.75)
			textSize(13)
			textAlign(CENTER, CENTER)
			text(getLastPartOfLink(this.link), this.pos.x, this.pos.y + 20)
		}
		pop()
	}
}



