class Portal{
	constructor(a, b){
		this.a = a 
		this.b = b
		this.coolDown = 0
	}

	collide(){
		this.coolDown--
		if(this.coolDown <= 0) this.coolDown = 0
		if(dist(ball.x, ball.y, this.a.x, this.a.y) < 15 && this.coolDown == 0){ 
			this.coolDown = 60
			return this.b
		}
		if(dist(ball.x, ball.y, this.b.x, this.b.y) < 15 && this.coolDown == 0){ 
			this.coolDown = 60
			return this.a
		}
	}

	show(){
		push()
		fill(light_orange)
		stroke(dark_orange)
		strokeWeight(5)
		ellipse(this.a.x, this.a.y, 15, 15)
		ellipse(this.b.x, this.b.y, 15, 15)
		pop()
	}
}