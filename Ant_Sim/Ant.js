class Ant{
	constructor(x, y){
		this.pos = createVector(x, y)
		this.oldPos = this.pos.copy()
		this.angle = random(TWO_PI)
		this.speed = p5.Vector.fromAngle(this.angle)
		this.speed.setMag(speedMag)
		this.rangeFood = 5
		this.rangeFoodsq = this.rangeFood * this.rangeFood
		this.goingHome = false

		this.frameEatenFood = 0
		this.frameExitHome = 0

		this.frameTime = floor(random(25, 45))

	}

	isPointInFOV(point, orientation = "straight", range = rangesq) {
	    // Precompute FOV direction only if necessary
	    let fovDirection;
	    if (orientation === "left") {
	        fovDirection = p5.Vector.fromAngle(this.angle - fovRad);
	    } else if (orientation === "right") {
	        fovDirection = p5.Vector.fromAngle(this.angle + fovRad);
	    } else {
	        fovDirection = this.speed.copy();
	    }
	    fovDirection.normalize();

	    let vectorToPoint = p5.Vector.sub(point, this.pos);

	    // Early exit if point is outside the range
	    if (vectorToPoint.magSq() > rangesq) {
	        return false;
	    }

	    // Normalize vector to the point
	    vectorToPoint.normalize();

	    // Dot product gives cos of the angle, so no need for acos
	    let dotProduct = vectorToPoint.dot(fovDirection);

	    // Check if within the field of view using cosine of the half-fov angle
	    return dotProduct >= Math.cos(half_fov_rad);
	}


	eat(){
		let bestDist = Infinity
		let bestFood = undefined

		for(let i = 0; i < food.length; i++){
			let dis = squaredDistance(this.pos.x, this.pos.y, food[i].pos.x, food[i].pos.y)
			if(dis < this.rangeFoodsq && dis < bestDist){
				bestDist = dis  
				bestFood = i
			}
		}
		//ant eats
		if(bestFood != undefined){
			let f = food[bestFood]
			f.life -= 0.05  
			if(f.life <= 0) food.splice(bestFood, 1)
			this.goingHome = true
			this.goTheOtherDirection()
			this.frameEatenFood = 0
		}
	}

	inHome(){
		return squaredDistance(this.pos.x, this.pos.y, home.x, home.y) < 2500
	}

	goTheOtherDirection(){
		this.angle -= HALF_PI
		this.speed = p5.Vector.fromAngle(this.angle)
		this.speed.setMag(speedMag)
	}

	updateFOVS(straight, left, right, pos, val, range = rangesq){
		straight = this.isPointInFOV(pos, "straight", range) ? straight + val : straight
		left = this.isPointInFOV(pos, "left", range) ? left + val : left
		right = this.isPointInFOV(pos, "right", range) ? right + val : right
		return [straight, left, right]
	}

	pushHome(){
		let h = new Particle(this.pos.x, this.pos.y, "going_for_food")
		this.frameExitHome++
		homePhero.push(h)
	}

	update(){
		let speed = this.speed.copy().mult(dt)
		this.pos.add(speed)

		if(!this.goingHome && this.frameExitHome < 15 && frameCount % this.frameTime == 15){ 
			this.pushHome()
		}
		if(this.goingHome &&  this.frameEatenFood < 15 && frameCount % this.frameTime == 15) {
			let f = new Particle(this.pos.x, this.pos.y, "going_home")
			this.frameEatenFood++
			foodPhero.push(f)
		}

		//random() > 0.5 ? this.goLeft() : this.goRight()
		let straight = 0  
		let left = 0  
		let right = 0
		let fewFood = []
		let fewHome = []
		let fewFoodToEat = []
		if(!this.goingHome){
            rangeF.x = this.pos.x
            rangeF.y = this.pos.y
            rangeF.w = range
            rangeF.h = range
            fewFood = qtreeF.query(rangeF);
            if(fewFood == undefined) fewFood = []
			for(let f of fewFood){
				[straight, left, right] = this.updateFOVS(straight, left, right, f.pos, 1)
			}
			rangeFood.x = this.pos.x
            rangeFood.y = this.pos.y
            rangeFood.w = range
            rangeFood.h = range
            fewFoodToEat = qtreeFood.query(rangeFood);
            if(fewFoodToEat == undefined) fewFoodToEat = []
			for(let f of fewFoodToEat){
				[straight, left, right] = this.updateFOVS(straight, left, right, f.pos, 100)
			}
		}

		else{
            rangeH.x = this.pos.x
            rangeH.y = this.pos.y
            rangeH.w = range
            rangeH.h = range
            fewHome = qtreeH.query(rangeH);
            if(fewHome == undefined) fewHome = []	
            for(let f of fewHome){
				[straight, left, right] = this.updateFOVS(straight, left, right, f.pos, 1)
			}
			[straight, left, right] = this.updateFOVS(straight, left, right, home, 1000, 4000)     
		}


		let max = Math.max(straight, left, right)
		if(max == left) this.goLeft()
		if(max == right) this.goRight()

		if(max > 0 && !this.goingHome) this.eat()
		if(this.inHome()){
			if(this.goingHome){
				this.goingHome = false
				this.goTheOtherDirection()
				depositFood()
			}
			this.frameExitHome = 0
		}

		else if(max == 0) random() > 0.5 ? this.goLeft() : this.goRight()
		
		this.edges()
		this.oldPos = this.pos.copy()
	}

	edges() {
	    if(this.pos.x < 0 || this.pos.x > WIDTH ||
	       this.pos.y < 0 || this.pos.y > HEIGHT) this.goTheOtherDirection()
	    if(this.pos.x < 0) this.pos.x = 0
	    if(this.pos.x > WIDTH) this.pos.x = WIDTH
	    if(this.pos.y < 0) this.pos.y = 0
	    if(this.pos.y > HEIGHT) this.pos.y = HEIGHT
	}


	goLeft(){
		this.angle -= maxAngle
		this.speed = p5.Vector.fromAngle(this.angle)
		this.speed.setMag(speedMag)
	}

	goRight(){
		this.angle += maxAngle
		this.speed = p5.Vector.fromAngle(this.angle)
		this.speed.setMag(speedMag)
	}

	show(){
		fill(255, 120)
		ellipse(this.pos.x, this.pos.y, 7, 7)
		if(this.goingHome){
			fill(0, 255, 0)
			ellipse(this.pos.x, this.pos.y, 4, 4)
		}
		// stroke(200, 200, 0)
		// strokeWeight(1)
		// line(this.pos.x, this.pos.y, this.pos.x + cos(this.angle-fovRad)*this.range, this.pos.y + sin(this.angle-fovRad)*this.range)
		// line(this.pos.x, this.pos.y, this.pos.x + cos(this.angle+fovRad)*this.range, this.pos.y + sin(this.angle+fovRad)*this.range)
	}
}