class Ball{
	constructor(){
		this.x = random(WIDTH)
		this.y = random(HEIGHT)
		this.vel = p5.Vector.fromAngle(random(0, 360))
		this.vel.setMag(2.5)
		this.rad = 5;
	}

	update(){
		this.x += this.vel.x
		this.y += this.vel.y
	}

	set(x, y){
		this.x = x
		this.y = y
	}

	edges(){
		if(this.x > WIDTH) {
			this.vel.x *= -1
		}
		if(this.x < 0) {
			this.vel.x *= -1
		}
		if(this.y > HEIGHT) {
			this.vel.y *= -1
		}
		if(this.y < 0) {
			this.vel.y *= -1
		}
	}

	show(){
		push()
		fill(0)
		ellipse(this.x, this.y, this.rad * 2, this.rad * 2)
		pop()
	}
}