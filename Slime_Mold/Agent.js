class Agent{
	constructor(x, y, facingAway = false){
		this.pos = createVector(x, y)
		this.angle = random(TWO_PI)
		if(facingAway) this.angle = atan2(y-HEIGHT/2, x-WIDTH/2)
		this.speed = p5.Vector.fromAngle(this.angle)

		this.maxAngle = radians(25)

		this.range = 9
		this.neigh = [[0, 0]]
		this.fov = radians(35)
	}

	see(angle) {
	    let normalizedAngle = (this.angle + angle) % TWO_PI
	    if (normalizedAngle < 0) normalizedAngle += TWO_PI

	    let index = Math.floor(normalizedAngle * 1000) % 6282

	    let sx = coss[index] * this.range + this.pos.x
	    let sy = sins[index] * this.range + this.pos.y

	    let i = Math.max(0, Math.min(Math.floor(sx), N - 1));
    	let j = Math.max(0, Math.min(Math.floor(sy), N - 1));

	    return grid[i][j]
	}


	goLeft(){
		this.angle -= angle
		this.angle = this.angle % TWO_PI
	}

	goRight(){
		this.angle += angle
		this.angle = this.angle % TWO_PI
	}

	update(){
		this.pos.add(this.speed)
		this.edges()

		let left = this.see(-fov)
		let straight = this.see(0)
		let right = this.see(fov)

		if(straight > left && straight > right) return
		else if(straight < left && straight < right) Math.random() > 0.5 ? this.goLeft() : this.goRight()
		else if(left < right) this.goRight()
		else if(right < left) this.goLeft()

		this.speed.x = Math.cos(this.angle)
		this.speed.y = Math.sin(this.angle)
	}

	edges(){
		if(this.pos.x < 0){
			this.speed.x *= -1
			this.pos.x = 0
			this.angle = Math.atan2(this.speed.y, this.speed.x)
		}
		if(this.pos.x > WIDTH){
			this.speed.x *= -1
			this.pos.x = WIDTH
			this.angle = Math.atan2(this.speed.y, this.speed.x)
		}
		if(this.pos.y < 0){
			this.speed.y *= -1
			this.pos.y = 0
			this.angle = Math.atan2(this.speed.y, this.speed.x)
		}
		if(this.pos.y > HEIGHT){
			this.speed.y *= -1
			this.pos.y = HEIGHT
			this.angle = Math.atan2(this.speed.y, this.speed.x)
		}
		
	}

	showDebug(){
		push()
		stroke(255, 0, 0)
		strokeWeight(4)
		let sx = cos(this.angle)*150 + this.pos.x + spacing/2
		let sy = sin(this.angle)*150 + this.pos.y + spacing/2
		line(this.pos.x + spacing/2, 
			this.pos.y + spacing/2, 
			sx, sy)

		stroke(0, 255, 0)
		let lx = cos(this.angle + this.fov)*150 + this.pos.x + spacing/2
		let ly = sin(this.angle + this.fov)*150 + this.pos.y + spacing/2
		line(this.pos.x + spacing/2, 
			this.pos.y + spacing/2, 
			lx, ly)

		stroke(0, 0, 255)
		let rx = cos(this.angle - this.fov)*150 + this.pos.x + spacing/2
		let ry = sin(this.angle - this.fov)*150 + this.pos.y + spacing/2
		line(this.pos.x + spacing/2, 
			this.pos.y + spacing/2, 
			rx, ry)
		this.seeStraight()
		this.seeLeft()
		this.seeRight()
		pop()
	}
}


