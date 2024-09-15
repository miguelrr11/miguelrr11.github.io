class Particle{
	constructor(){
		this.pos = p5.Vector.random2D().mult(242)
		this.speed = createVector(0, 0)
		this.acc = this.pos.copy().mult(random(0.0001, 0.00001))
		this.col = random(200, 255)
		this.rad = random(4, 6)
	}

	update(cond){
		this.speed.add(this.acc)
		this.pos.add(this.speed)
		if(cond){
			this.pos.add(this.speed)
			this.pos.add(this.speed)
			this.pos.add(this.speed)
		}
	}

	edges(){
		return this.pos.x > -width/2 && this.pos.y > -height/2
			   && this.pos.x < width/2 && this.pos.y < height/2
	}

	show(){
		push()
		fill(this.col)
		noStroke()
		ellipse(this.pos.x, this.pos.y, this.rad)
		pop()
	}
}