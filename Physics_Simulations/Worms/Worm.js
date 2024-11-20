class Worm{
	constructor(x, y, type){
		this.pos = createVector(x, y)
		this.chain = new Chain(this.pos, 10, 5)
		this.angle = random(TWO_PI)
		this.speed = p5.Vector.fromAngle(this.angle)
		//this.speed.setMag(1)
		this.steering = radians(25)
		this.speedMag
		this.range = 0
		this.fov = 0 
		if(type == "green"){ 
			this.fov = radians(70)
			this.range = 50
			this.speedMag = 1.3
		}
		else{ 
			this.fov = radians(30)
			this.range = 20
			this.speedMag = 1.3
		}
		this.type = type
		this.neigh = [[0,0], [0,1], [1,0], [1,1]]
		this.dead = false
	}

	see(angle, grid) {
	    let normalizedAngle = (this.angle + angle) % TWO_PI
	    if (normalizedAngle < 0) normalizedAngle += TWO_PI

	    let index = Math.floor(normalizedAngle * 1000) % 6282

	    let sx = coss[index] * this.range + this.pos.x
	    let sy = sins[index] * this.range + this.pos.y

	    let i = Math.max(0, Math.min(Math.floor(sx / spacing), N - 1));
    	let j = Math.max(0, Math.min(Math.floor(sy / spacing), N - 1));

    	
    	let sum = 0
    	//push()
    	//fill(255, 100)
    	for(let n = 0; n < this.neigh.length; n++){
    		let x = i + this.neigh[n][0]
    		let y = j + this.neigh[n][1]
    		x = Math.max(0, Math.min(x, N - 1));
    		y = Math.max(0, Math.min(y, N - 1));
    		//rect(x*spacing, y*spacing, spacing, spacing)
    		sum += grid[x][y].length	
    	}
    	//pop()
	    return sum
	}

	goLeft(angle = this.steering){
		this.angle -= angle
	}

	goRight(angle = this.steering){
		this.angle += angle
	}

	kill(){
		// let i = Math.floor(this.pos.x / spacing)
		// let j = Math.floor(this.pos.y / spacing)
		// i = Math.max(0, Math.min(i, N - 1));
    	// j = Math.max(0, Math.min(j, N - 1));
		// if(gridA[i][j].length != 0) gridA[i][j][0].dead = true
		for(let w of worms){
			if(w.type == "green"){
				let d = dist(this.pos.x, this.pos.y, w.pos.x, w.pos.y)
				if(d < 50) w.dead = true
			}
		}
	}

	update(){

		this.chain.update(this.pos.x, this.pos.y)
		this.pos.add(this.speed)

		let straight, left, right
		if(this.type == "green"){
			left = this.see(-this.fov, gridB)
			straight = this.see(0, gridB)
			right = this.see(this.fov, gridB)
			if(left < right) {this.goLeft();}
			else if(right < left) {this.goRight();}
			else Math.random() > 0.5 ? this.goLeft(this.steering/5) : this.goRight(this.steering/5)
		}
		else{
			left = this.see(-this.fov, gridA)
			straight = this.see(0, gridA)
			right = this.see(this.fov, gridA)
			if(left < right) {this.goRight();}
			else if(right < left) {this.goLeft();}
			else Math.random() > 0.5 ? this.goLeft(this.steering/5) : this.goRight(this.steering/5)
			this.kill()
		}

		this.speed.x = Math.cos(this.angle)*this.speedMag
		this.speed.y = Math.sin(this.angle)*this.speedMag

		this.edges()
		
		//if(random() < 0.01) this.chain.addSegment()
	}

	setLineGrid() {
	    for(let i = 0; i < this.chain.segments.length-1; i++){
	    	let gridX = Math.floor(this.chain.segments[i].tip.x / spacing);
	        let gridY = Math.floor(this.chain.segments[i].tip.y / spacing);

	        gridX = Math.max(0, Math.min(gridX, N - 1));
	        gridY = Math.max(0, Math.min(gridY, N - 1));

	        this.type == "green" ? gridA[gridX][gridY].push(this) : gridB[gridX][gridY].push(this)
	    }
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
		this.speed.setMag(this.speedMag)
	}

	show(){
		this.chain.show(this.type)
	}
}
