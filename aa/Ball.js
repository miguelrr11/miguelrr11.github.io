class Ball{
	constructor(pos, id){
		this.pos = pos
		this.angle = HALF_PI
		this.orbiting = false
		this.id = id
		this.rad = 170
		this.tam = 25
	}

	collide(ball){
		return dist(ball.pos.x, ball.pos.y, this.pos.x, this.pos.y) < this.tam
	}

	orbit(speed){
		if(!this.orbiting) return
		let vel = map(speed, 1, 100, 0.005, 0.035)
		if(speed < 0) vel = map(speed, -1, -100, -0.005, -0.035)
		this.pos.x = 300 + this.rad*cos(this.angle)
		this.pos.y = 300 + this.rad*sin(this.angle)
		this.angle += vel
		if(this.angle >= TWO_PI) this.angle = 0
	}

	move(){
		if(this.orbiting) return
		this.pos.y -= 10
	}

	show(showConnection){
		push()
		fill(0)
		noStroke()
		if(!level.finished) ellipse(this.pos.x, this.pos.y, this.tam, this.tam)
		else{
			let tam = map(this.rad, 200, 0, this.tam, 100)
			ellipse(this.pos.x, this.pos.y, tam, tam)
		}
		if(showConnection){
			stroke(0)
			strokeWeight(2)
			line(this.pos.x, this.pos.y, level.nexo.x, level.nexo.y)
		}
		noStroke()
	    textFont("Gill Sans")
	    textAlign(CENTER)
	    fill(255)
	    textSize(17)
	    if(this.id != undefined && !level.finished) text(this.id, this.pos.x, this.pos.y + 6)
		pop()
	}
}