class Ball{
	constructor(pos, n){
		this.pos = pos
		this.oldPos = pos
		this.initialN = n
		this.n = this.initialN
		this.r = map(this.initialN, 4, 17, 15, 60)
		this.r = constrain(this.r, 15, 60)
		this.speed = createVector(random(-2, 2), 0)
		this.acc = createVector(0, 0.25)
	}

	collideBullet(bullet){
		if(dist(this.pos.x, this.pos.y, bullet.x, bullet.y) < (this.r + 5)){
			this.n -= bullet.damage
			if(this.n < 0) this.n = 0
			this.speed.add(createVector(0, -1.5))
			return true
		}
		return false
	}

	collideWalls(a, b){
		if(this.isCircleIntersectingLine(this.pos, this.r, a, b)){
			if(a.x == 0 && a.y == HEIGHT) this.pos.x = this.r + 1
			if(a.x == WIDTH && a.y == HEIGHT) this.pos.x = WIDTH - this.r - 1
			return true
		}
		return false
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
			b.speed = createVector(vels.v2Final.x, vels.v2Final.y)

			let distanceBetweenCircles = 
			Math.sqrt(
			    (b.pos.x - this.pos.x) * (b.pos.x - this.pos.x) + 
			    (b.pos.y - this.pos.y) * (b.pos.y - this.pos.y)
			);

			let distanceToMove = b.r + this.r - distanceBetweenCircles;
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
	    const impactAngle = Math.acos(cosTheta);


	    return impactAngle;
	}

	update(){
		this.speed.add(this.acc)
		this.oldPos = this.pos.copy()
		this.pos.add(this.speed)
		if(this.collideWalls(floorA, floorB)){
			this.speed.y = map(this.n, 0, 17, -10, -18)
		}
		if(this.collideWalls(createVector(0, HEIGHT), createVector(0, 0)) ||
		   this.collideWalls(createVector(WIDTH, HEIGHT), createVector(WIDTH, 0))){
			this.speed.x *= -1
		}
		if(this.collideWalls(player, createVector(player.x + w, player.y)) || 
		   this.collideWalls(createVector(player.x + w, player.y), createVector(player.x + w, player.y + h)) || 
		   this.collideWalls(createVector(player.x + w, player.y + h), createVector(player.x, player.y + h)) || 
		   this.collideWalls(player, createVector(player.x, player.y + h))) score = 0
		if(this.pos.y < -100) this.speed = createVector(0, 0)


		this.speed.mult(0.99)
	}

	show(){
		push()
		fill(255)
		ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2)
		fill(0)
		textSize(map(this.n, 0, 17, 35, 50))
		textAlign(CENTER, CENTER)
		text(this.n, this.pos.x, this.pos.y)
		pop()
	}
}