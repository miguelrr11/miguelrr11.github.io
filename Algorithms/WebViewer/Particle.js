const RADIUS_PARTICLE = 5

class Particle{
	constructor(x, y, pinned, id, str = '', parent){
		this.pos = createVector(x, y)
		this.prevPos = createVector(x, y)
		this.acc = createVector(0, 0)
		this.isPinned = pinned
		this.id = id
		this.radius = RADIUS_PARTICLE
		this.link = str
		this.str = removeBarrabaja(getLastPartOfLink(decodeURIComponent(str)))
		this.parent = parent
		this.angle = 0
		this.isParent = false
		this.color = color(255)
		this.siblings = []
	}

	removeInertia(){
		this.prevPos = this.pos.copy()
		this.acc = createVector(0, 0)
	}

	applyForce(force){
		if(!this.isPinned) this.acc.add(force)
	}

	getRelativeMousePos(){
		let worldX = (mouseX - xOff) / zoom;
		let worldY = (mouseY - yOff) / zoom;
		return createVector(worldX, worldY);
	}

	update(timeStep){
		// verlet intergration
        if (!this.isPinned) {
        	let vel = p5.Vector.sub(this.pos, this.prevPos).mult(0.97)
			this.prevPos = this.pos.copy()
			this.pos.add(p5.Vector.add(vel, this.acc.copy().mult(timeStep * timeStep)))
			this.acc = createVector(0, 0)
        }
		let mousePos = this.getRelativeMousePos()
		ellipse(mousePos.x, mousePos.y, 10)   //for debugging
		let mouseInside = dist(mousePos.x, mousePos.y, this.pos.x, this.pos.y) < this.radius
        if(((mouseInside && mouseIsPressed) || (draggedParticle == this && mouseIsPressed)) && (draggedParticle == null || draggedParticle == this)){
        	this.pos.x = mousePos.x
        	this.pos.y = mousePos.y
			draggedParticle = this
        }
		this.hovered = mouseInside
		if(this.hovered) hoveredParticle = this
		else if(hoveredParticle == this) hoveredParticle = null

		if(this.parent) this.angle = atan2(this.pos.y - this.parent.pos.y, this.pos.x - this.parent.pos.x)
	}

	repelGroup(particles, separationDistance) {
		if(this.isPinned) return
		particles.forEach(other => {
			if (other !== this && other.parent !== this.parent) {
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
					diff.mult(strength*5);
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
	

	show(bool = false){
		push()
		fill(this.color)
		stroke(50)
		strokeWeight(2)
		let rad = bool ? this.radius * 5 : this.radius * 2
		ellipse(this.pos.x, this.pos.y, rad)
		if(this.isParent || bool){
			strokeWeight(1.5)
			textSize(17)
			textAlign(CENTER, CENTER)
			let w = textWidth(this.str)
			let h = textHeight()
			rectMode(CENTER)
			fill(50, 50, 50, 150)
			noStroke()
			rect(this.pos.x, this.pos.y + 20, w + 10, h + 10, 7)
			fill(this.color)
			stroke(50, 125)
			text(this.str, this.pos.x, this.pos.y + 20)
		}
		pop()
	}
}

function textHeight() {
    return textAscent() + textDescent();
}

