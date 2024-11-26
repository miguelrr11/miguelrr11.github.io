class ParticleNEAT{
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
	

	//changed and suited for the pendulum project
	show(neuron, bias, selectedOut){
		let value = neuron.value
		let showVal = neuron.isInput || neuron.isOutput
		push()
		stroke(0)
		if(selectedOut) stroke(G)
		fill(255)
		let b = bias == 0 ? .25 : neuron.bias
		strokeWeight(map(abs(b), 0, 1, 1, 4))
		//ellipse(this.pos.x, this.pos.y, 30)
		rectMode(CENTER)
		rect(this.pos.x, this.pos.y, 20, 20)
		let c1 = color(34, 34, 59)
		let c4 = color(201, 173, 167)

		//colorMode(HSB)
		if(value < 0){
			fill(lerpColor(W, c1, Math.abs(value)))
			strokeWeight(map(value, -.5, 0, 8, 1))
		}
		else{
			fill(lerpColor(W, c4, value))
			strokeWeight(map(value, 0, .5, 1, 8))
		}
		noStroke()
		//ellipse(this.pos.x, this.pos.y, map(value, 0, 1, 0, 30, true))
		let val = mapp(abs(value), 0, 1, 0, 15, true)
		if(neuron.isOutput){ 
			strokeWeight(1.5)
			val = value
		}
		rect(this.pos.x, this.pos.y, val, val)

		if(keyIsPressed){
			fill(0)
			stroke(255)
			strokeWeight(1)
			textAlign(CENTER, CENTER)
			textSize(15)
			if(neuron.isInput) text(round(value, 1), this.pos.x, this.pos.y)
			if(neuron.isOutput) text(round(value, 1), this.pos.x, this.pos.y)
		}
		
		pop()
	}
}



