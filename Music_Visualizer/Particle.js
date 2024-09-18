class Particle{
	constructor(){
		this.pos = p5.Vector.random2D().mult(particleStartOffset)
		this.speed = createVector(0, 0)
		this.acc = this.pos.copy().mult(random(0.0001, 0.00001))
		this.stopCol = random(180, 255)
		this.col = 0  
		this.colRate = random(1, 2)
		this.rad = random(4, 6)
	}

	update(cond, cond2){
		if(!cond2)this.col += this.colRate
		if(this.col > this.stopCol) this.col = this.stopCol
		if(!cond2) this.speed.add(this.acc)
		
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

	show(cond){
		push()
		if(cond){
			this.col--
			if(this.col < 0) this.col = 0
		}
		fill(255, this.col)
		noStroke()
		ellipse(this.pos.x, this.pos.y, this.rad)
		pop()
	}
}