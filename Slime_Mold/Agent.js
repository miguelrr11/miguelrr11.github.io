class Agent{
	constructor(x, y, facingAway = false){
		this.pos = createVector(x, y)
		this.angle = random(TWO_PI)
		if(facingAway) this.angle = atan2(y-HEIGHT/2, x-WIDTH/2)
		this.speed = p5.Vector.fromAngle(this.angle)

		this.maxAngle = radians(25) //25


		this.range = 9  //35
		this.neigh = [[0, 0]]
		// this.neigh = [[-1, -1], [0, -1], [1, -1],
		// 			  [-1, 0], [0, 0], [1, 0],
		// 			  [-1, 1], [0, 1], [1, 1]]
		this.fov = radians(35) //30
	}

	see(angle){
		let sx = Math.cos(this.angle+angle)*this.range + this.pos.x
		let sy = Math.sin(this.angle+angle)*this.range + this.pos.y
		let i = Math.floor(sx / spacing)
        let j = Math.floor(sy / spacing)
		if(i < 0 || i > N-1 || j < 0 || j > N-1) return 0
		if(grid[i][j] < 0.5) return 0
		return grid[i][j]
	}

	goLeft(){
		this.angle -= angle
	}

	goRight(){
		this.angle += angle
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


