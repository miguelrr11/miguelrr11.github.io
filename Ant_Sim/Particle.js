class Particle{
	constructor(x, y, type){
		this.pos = createVector(x, y)
		this.type = type
		this.life = 1
		this.frameTime = floor(random(15, 25))

		this.r = type == "food" ? random(9, 7) : random(6, 4)
	}

	update(){
		if(frameCount % this.frameTime == 0) this.life -= 0.03
	}

	show(){
		if(this.type == "food") fill(0, 255, 0, 100)
		else if(this.type == "foodInHome") fill(0, 255, 0, 2)
		else if(this.type == "going_home") fill(255, 0, 0, 120)
		else if(this.type == "going_for_food") fill(0, 0, 255, 120)
		let r = map(this.life, 0, 1, 0, this.r)
		ellipse(this.pos.x, this.pos.y, r, r)
	}
}