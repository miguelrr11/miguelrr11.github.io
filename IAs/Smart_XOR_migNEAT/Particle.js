class Particle{
	constructor(x, y, pinned, id){
		this.pos = createVector(x, y)
		this.prevPos = createVector(x, y)
		this.acc = createVector(0, 0)
		this.isPinned = pinned
		this.id = id
	}

	applyForce(force){
		if(!this.isPinned) this.acc.add(force)
	}

	update(timeStep){
		// verlet intergration
        if (!this.isPinned) {
        	let vel = p5.Vector.sub(this.pos, this.prevPos)
			this.prevPos = this.pos.copy()
			this.pos.add(p5.Vector.add(vel, this.acc.copy().mult(timeStep * timeStep)))
			this.acc = createVector(0, 0)
        }
        if(!this.isPinned && mouseIsPressed && dist(mouseX, mouseY, this.pos.x, this.pos.y) < 30){
        	this.pos.x = mouseX
        	this.pos.y = mouseY
        }
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

	show(value, bias, bool = false, showVal = false){
		push()
		stroke(0)
		if(bool) stroke(G)
		fill(255)
		strokeWeight(map(abs(bias), 0, 1, 1, 4))
		//ellipse(this.pos.x, this.pos.y, 30)
		rectMode(CENTER)
		rect(this.pos.x, this.pos.y, 20, 20)

		//colorMode(HSB)
		if(value < 0){
			fill(lerpColor(W, R, Math.abs(value)))
			strokeWeight(map(value, -1, 0, 8, 1))
		}
		else{
			fill(lerpColor(W, G, value))
			strokeWeight(map(value, 0, 1, 1, 8))
		}
		noStroke()
		//ellipse(this.pos.x, this.pos.y, map(value, 0, 1, 0, 30, true))
		let val = map(abs(value), 0, 1, 0, 15, true)
		rect(this.pos.x, this.pos.y, val, val)

		if(showVal){
			fill(0)
			stroke(255)
			strokeWeight(1)
			textAlign(CENTER, CENTER)
			textSize(15)
			text(Math.round(value), this.pos.x, this.pos.y)
		}
		
		pop()
	}
}



