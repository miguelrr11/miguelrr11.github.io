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
			this.coolDown = 120
			return this.b
		}
		if(dist(ball.x, ball.y, this.b.x, this.b.y) < 15 && this.coolDown == 0){ 
			this.coolDown = 120
			return this.a
		}
	}

	show(){
		push()
		fill(light_red)
		noStroke()
		ellipse(this.a.x, this.a.y, 15, 15)
		DiscLinesEllipse(dark_red, this.a, 8, 5, -t, true)
		fill(light_orange)
		ellipse(this.b.x, this.b.y, 15, 15)
		DiscLinesEllipse(dark_orange, this.b, 8, 5, t, true)
		pop()
	}
}

//DiscLinesEllipse(col, pos, rad, dis, offset = 0, isDotted = false)