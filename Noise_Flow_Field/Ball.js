class Ball{
	constructor(pos){
		this.pos = pos
		this.oldPos = pos.copy()
		this.vel = p5.Vector.random2D();
		this.acc = p5.Vector.random2D();
		this.maxSpeed = 5
	}

	followField(angle){
		let drag = dragSlider.value()
		this.acc.x = cos(angle) * drag
		this.acc.y = sin(angle) * drag
	}

	update(){
		this.oldPos = this.pos.copy()
		this.pos.add(this.vel)

	}

	applyForce(){
		this.vel.add(this.acc)
		this.vel.limit(this.maxSpeed)
	}

	edges(){
		if(this.pos.x > WIDTH) {
			this.pos.x = 0
			this.oldPos.x = 0
		}
		if(this.pos.x < 0) {
			this.pos.x = WIDTH
			this.oldPos.x = WIDTH
		}
		if(this.pos.y > HEIGHT) {
			this.pos.y = 0
			this.oldPos.y = 0
		}
		if(this.pos.y < 0) {
			this.pos.y = HEIGHT
			this.oldPos.y = HEIGHT
		}
	}

	show(){
		if(!vizPathsBool) ellipse(this.pos.x, this.pos.y, 5, 5)
		else{
			line(this.pos.x, this.pos.y, this.oldPos.x, this.oldPos.y)
		}
	}
}