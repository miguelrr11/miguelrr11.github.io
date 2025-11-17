const RAD_PART = 5

class Particle{
	constructor(x, y, pinned, id){
		this.pos = createVector(x, y)
		this.prevPos = createVector(x, y)
		this.acc = createVector(0, 0)
		this.isPinned = pinned
		this.id = id
		this.primordial = false
	}

	applyForce(force){
		if(!this.isPinned) this.acc.add(force)
	}

	update(timeStep){
        if (!this.isPinned && !this.inBounds(mouseX, mouseY)) {
        	let vel = p5.Vector.sub(this.pos, this.prevPos).mult(0.97)
			vel.limit(1)
			this.prevPos = this.pos.copy()
			this.pos.add(p5.Vector.add(vel, this.acc.copy().mult(timeStep * timeStep).limit(0.1)))
			this.acc = createVector(0, 0)
        }
	}

	inBounds(x, y){
		return dist(x, y, this.pos.x, this.pos.y) < RAD_PART
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
					let strength = (separationDistance - distance) / separationDistance; // 0-1 strengthº
					strength = constrainn(strength, 0, 1)
					diff.normalize();
					diff.mult(strength).limit(0.05); // Limit max force to avoid instability
					this.applyForce(diff);
				}
			}
		});
	}

	constrainToBounds(){
		if(this.pos.x < 0) this.pos.x = 0
		if(this.pos.y < 0) this.pos.y = 0
		if(this.pos.x > WIDTH) this.pos.x = WIDTH
		if(this.pos.y > HEIGHT) this.pos.y = HEIGHT
	}

	show(){
		if(this.primordial) fill(255, 255, 0)
		ellipse(this.pos.x, this.pos.y, RAD_PART*2)
	}
}



