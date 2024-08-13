class Ball{
	constructor(pos){
		this.pos = pos
		this.r = 6
		this.speed = createVector(random(-3, 3), random(-3, 3))
		this.acc = createVector(0, 0.0)
	}

	collideWalls(a, b){
		return this.isCircleIntersectingLine(this.pos, this.r, a, b)
	}

	collideBall(b){
		let distance = dist(this.pos.x, this.pos.y, b.pos.x, b.pos.y)
		const minDistance = this.r + b.r
		if(distance < (this.r + b.r)){
			let angleOfImpact = this.calculateImpactAngle(this.pos.x, this.pos.y, this.speed.x, this.speed.y,
														  b.pos.x, b.pos.y, b.speed.x, b.speed.y)

			let vels = this.calculateCollision(this.r, this.speed.x, this.speed.y,
											   b.r, b.speed.x, b.speed.y,
											   angleOfImpact)

			this.speed = createVector(vels.v1Final.x, vels.v1Final.y)
			b.speed = createVector(vels.v2Final.x, -vels.v2Final.y)

			//separar circulos antes de moverlos
			let distanceBetweenCircles = 
			Math.sqrt(
			    (b.pos.x - this.pos.x) * (b.pos.x - this.pos.x) + 
			    (b.pos.y - this.pos.y) * (b.pos.y - this.pos.y)
			);

			let distanceToMove = (b.r + this.r - distanceBetweenCircles);
			let angle = atan2(b.pos.y - this.pos.y, b.pos.x - this.pos.x)
			b.pos.x += Math.cos(angle) * distanceToMove;
			b.pos.y += Math.sin(angle) * distanceToMove;
		}
	}

	isCircleIntersectingLine(C, R, P1, P2) {
	  	let t = ((C.x - P1.x) * (P2.x - P1.x) + (C.y - P1.y) * (P2.y - P1.y)) / ((P2.x - P1.x) ** 2 + (P2.y - P1.y) ** 2);
	  
	  	t = max(0, min(1, t));
	  
	  	let closestX = P1.x + t * (P2.x - P1.x);
	  	let closestY = P1.y + t * (P2.y - P1.y);
	  
	  	let distance = dist(C.x, C.y, closestX, closestY);
	  
	  	return distance <= R
	}

	calculateCollision(m1, v1x, v1y, m2, v2x, v2y, impactAngle) {
	    // Calculate the velocity components along the line of impact
	    const v1 = {x: v1x, y: v1y};
	    const v2 = {x: v2x, y: v2y};

	    const normal = {x: Math.cos(impactAngle), y: Math.sin(impactAngle)};
	    const tangent = {x: -normal.y, y: normal.x};

	    // Velocity components along the normal
	    const v1n = v1.x * normal.x + v1.y * normal.y;
	    const v2n = v2.x * normal.x + v2.y * normal.y;

	    // Velocity components along the tangent
	    const v1t = v1.x * tangent.x + v1.y * tangent.y;
	    const v2t = v2.x * tangent.x + v2.y * tangent.y;

	    // Calculate the new normal velocities after collision
	    const v1nPrime = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
	    const v2nPrime = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

	    // Convert the scalar normal and tangential velocities into vectors
	    const v1nPrimeVec = {x: v1nPrime * normal.x, y: v1nPrime * normal.y};
	    const v2nPrimeVec = {x: v2nPrime * normal.x, y: v2nPrime * normal.y};

	    const v1tVec = {x: v1t * tangent.x, y: v1t * tangent.y};
	    const v2tVec = {x: v2t * tangent.x, y: v2t * tangent.y};

	    // The final velocity vectors are the sum of the normal and tangential components
	    const v1Final = {x: v1nPrimeVec.x + v1tVec.x, y: v1nPrimeVec.y + v1tVec.y};
	    const v2Final = {x: v2nPrimeVec.x + v2tVec.x, y: v2nPrimeVec.y + v2tVec.y};

	    return {
	        v1Final: v1Final,
	        v2Final: v2Final
	    };
	}

	calculateImpactAngle(x1, y1, v1x, v1y, x2, y2, v2x, v2y) {
	    // Calculate relative position vector r12
	    const r12x = x2 - x1;
	    const r12y = y2 - y1;

	    // Calculate relative velocity vector v12
	    const v12x = v2x - v1x;
	    const v12y = v2y - v1y;

	    // Calculate dot product of r12 and v12
	    const dotProduct = r12x * v12x + r12y * v12y;

	    // Calculate magnitudes of r12 and v12
	    const r12Mag = Math.sqrt(r12x * r12x + r12y * r12y);
	    const v12Mag = Math.sqrt(v12x * v12x + v12y * v12y);

	    // Calculate the angle of impact (in radians)
	    const cosTheta = dotProduct / (r12Mag * v12Mag);
	    const impactAngle = acos(cosTheta);

	    //console.log(impactAngle+HALF_PI)
	    return impactAngle;
	}

	update(){
		if(mouseIsPressed){
			let angle = atan2(mouseY - this.pos.y, mouseX - this.pos.x)
	        this.acc = createVector(cos(angle), sin(angle))
	        this.acc.mult(0.2)
		}
		else{
			if(gravity.checked()) this.acc = createVector(0, 0.025)
			else this.acc = createVector(0, 0.0)
		}
		this.speed.add(this.acc)
		let speed = this.speed.copy().mult(0.25)
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

		//this.speed.mult(0.98)
	}

	show(){
		push()
		colorMode(HSB)
		fill(map(this.speed.mag(), 0, 9, 230, 330), 100, 100)
		ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2)
		pop()
	}






}