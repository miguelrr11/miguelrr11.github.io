class ParticlePend{
	constructor(x, y, pinned, id = 0){
		this.pos = createVector(x, y)
		this.prevPos = createVector(x, y)
		this.acc = createVector(0, 0)
		this.vel = createVector(0, 0)
		this.isPinned = pinned
		this.id = id
	}

	applyForce(force){
		if(!this.isPinned) this.acc.add(force)
	}

	update(timeStep){
		// verlet intergration
        if (!this.isPinned) {
        	this.vel = p5.Vector.sub(this.pos, this.prevPos).mult(FRICTION)
			this.prevPos = this.pos.copy()
			this.pos.add(p5.Vector.add(this.vel, this.acc.copy().mult(timeStep * timeStep)))
			this.acc = createVector(0, 0)
        }
        // if(!this.isPinned && mouseIsPressed && dist(mouseX, mouseY, this.pos.x, this.pos.y) < 30){
        // 	this.pos.x = mouseX
        // 	this.pos.y = mouseY
        // }
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

	constrainToBounds(start, length){
		if(this.pos.x < start) this.pos.x = start
		if(this.pos.x > start + length) this.pos.x = start + length
	}

	show(isAnchor, vel = 0){
		push()
		stroke(0)
		strokeWeight(5)
		fill(255)
		// if(keyIsPressed){ 
		// 	fill(255, 35)
		// 	stroke(0, 35)
		// }
		let length = 30
		if(isAnchor){
			rectMode(CENTER)
			rect(this.pos.x, this.pos.y, length * 2, 15)
			ellipse(this.pos.x - length, this.pos.y, length)
			ellipse(this.pos.x + length, this.pos.y, length)
			strokeWeight(8)
			point(this.pos.x - length, this.pos.y)
			point(this.pos.x + length, this.pos.y)
		}
		else{
			fill(map(abs(vel), 0, 1, 0, 255))
			//if(keyIsPressed) fill(255, 35)
			ellipse(this.pos.x, this.pos.y, length)
		}
		pop()
	}
}



