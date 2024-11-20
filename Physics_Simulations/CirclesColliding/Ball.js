class Ball{
	constructor(pos){
		this.pos = pos
		this.r = 8
		this.speed = createVector(random(-3, 3), random(-3, 3))
		this.acc = createVector(0, 0)
	}

	collideWalls(a, b){
		return this.isCircleIntersectingLine(this.pos, this.r, a, b)
	}

	collideBall(b){
		let cx1 = this.pos.x
		let cy1 = this.pos.y
		let cx2 = b.pos.x
		let cy2 = b.pos.y
		let d = Math.sqrt(Math.pow(cx1 - cx2, 2) + Math.pow(cy1 - cy2, 2))
		if(d > this.r + b.r) return
		let nx = (cx2 - cx1) / d; 
		let ny = (cy2 - cy1) / d;
		let p = 2 * (this.speed.x * nx + this.speed.y * ny - b.speed.x * nx - b.speed.y * ny) / 
		        (this.r + b.r); //circle1.mass + circle2.mass
		this.speed.x -= p * this.r * nx
		this.speed.y -= p * this.r * ny
		b.speed.x += p * b.r * nx
		b.speed.y += p * b.r * ny

		
		let midpointx = (this.pos.x + b.pos.x) / 2; 
		let midpointy = (this.pos.y + b.pos.y) / 2;

		this.pos.x = midpointx + this.r * (this.pos.x - b.pos.x) / d; 
		this.pos.y = midpointy + this.r * (this.pos.y - b.pos.y) / d; 
		b.pos.x = midpointx + b.r * (b.pos.x - this.pos.x) / d; 
		b.pos.y = midpointy + b.r * (b.pos.y - this.pos.y) / d;
	}



	isCircleIntersectingLine(C, R, P1, P2) {
	  	let t = ((C.x - P1.x) * (P2.x - P1.x) + (C.y - P1.y) * (P2.y - P1.y)) / ((P2.x - P1.x) ** 2 + (P2.y - P1.y) ** 2);
	  
	  	t = max(0, min(1, t));
	  
	  	let closestX = P1.x + t * (P2.x - P1.x);
	  	let closestY = P1.y + t * (P2.y - P1.y);
	  
	  	let distance = dist(C.x, C.y, closestX, closestY);
	  
	  	return distance <= R
	}


	update(){
		if(mouseIsPressed && mouseX < WIDTH && mouseY < HEIGHT){
			let angle = atan2(mouseY - this.pos.y, mouseX - this.pos.x)
			if(keyIsPressed) angle = atan2(this.pos.y - mouseY, this.pos.x - mouseX)
	        this.acc = createVector(cos(angle), sin(angle))
	        this.acc.mult(0.2)
		}
		else{
			if(gravity.checked()) this.acc = createVector(0, 0.025)
			else this.acc = createVector(0, 0.0)
		}
		this.speed.add(this.acc)
		let speed = this.speed.copy().mult(0.2)
		this.speed.limit(10)
		this.pos.add(speed)
		//pared arriba
		if(this.collideWalls(corner1, corner2)){ 
			this.pos.y = this.r + 1
			this.speed.y *= -1
		}
		//pared derecha
		else if(this.collideWalls(corner2, corner3)){ 
			this.pos.x = WIDTH - this.r - 1
			this.speed.x *= -1
		}
		//pared abajo
		else if(this.collideWalls(corner3, corner4)){
			this.pos.y = HEIGHT - this.r - 1
			this.speed.y *= -1
		}
		//pared izquierda
		else if(this.collideWalls(corner4, corner1)){ 
			this.pos.x = this.r + 1
			this.speed.x *= -1
		}

		//this.speed.mult(0.99)
	}

	show(){
		push()
		colorMode(HSB)
		fill(map(this.speed.mag(), 0, 9, 230, 330), 100, 100)
		ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2)
		pop()
	}






}