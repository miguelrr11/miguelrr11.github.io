class particle{
	constructor(color){
		this.color = color
		this.pos = createVector(random(WIDTH), random(HEIGHT))
		this.speed = createVector(2, -2)
		this.col = this.whatCol()
	}

	whatCol(){
		if(this.color == "RED") return 0
		if(this.color == "YELLOW") return 60
		if(this.color == "GREEN") return 120
		else return -1
	}

	show(){
		push()
		if(this.color == "RED") {fill(255, 0, 0); stroke(255, 0, 0)}
		else if(this.color == "GREEN") {fill(0, 255, 0); stroke(0, 255, 0)}
		else if(this.color == "BLUE") {fill(0, 0, 255); stroke(0, 0, 255)}
		else if(this.color == "YELLOW") {fill(255, 255, 0); stroke(255, 255, 0)}
		else if(this.color == "WHITE") {fill(255, 255, 255); stroke(255, 255, 255)}
		noStroke()
		ellipse(this.pos.x, this.pos.y, 4)
		//rect(this.pos.x, this.pos.y, 4, 4)
		// strokeWeight(4)
		// point(this.pos.x, this.pos.y)
		pop()
	}

}