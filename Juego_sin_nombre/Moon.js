class Moon extends Nexus{
	constructor(n){
		super()
		//this.nivel = 1
		this.tam = 35
		this.t = 0 		//timestep para calcular angulo
		this.pos = createVector(0,0)
		this.speed = 0.01
		this.orbits = nexus
		this.radius = undefined

		this.range = 100
		this.fov = 70
		this.damage = 1
		this.nrays = 1

		// cadencia = ataques por s
		this.cadencia = 2
		this.rate = 60/this.cadencia
		this.count = random(0,60/this.cadencia) //para que no ataquen a la vez

		//animacion ataque
		this.pActive = {color:['white'],
						angle: [0, 360], 
						size: [15,20], 
						sizePercent: 0.85,
						gravity: false,
						speed: 3
					   }
	}

	setRate(cadencia){
		this.cadencia = cadencia
		this.rate = 60/cadencia
		this.count = random(0,60/this.cadencia)
	}


	createFirstPos(angle, secondOrbit = false){
		this.radius = this.tam/2 + this.orbits.tam/2 + 30
		let x = (this.radius * angles[floor(angle)].cos) + this.orbits.pos.x
        let y = (this.radius * angles[floor(angle)].sin) + this.orbits.pos.y
        this.t = angle
        if(secondOrbit){
        	this.radius += 60
        	this.speed = 0.006
        	this.tam = 27
        }
        return createVector(x, y)
	}

	// Determina si un punto se encuentra en el FOV del orbir (el FOV esta alineado al this.orbits)
	isPointInFOV(fovObject, point) {
	    let fovDirection = p5.Vector.sub(fovObject, this.orbits.pos);
	    fovDirection.normalize();
	    let vectorToPoint = p5.Vector.sub(point, fovObject);

	    let dotProduct = vectorToPoint.dot(fovDirection);
	    let magVectorToPoint = vectorToPoint.mag();
	    let angle = Math.acos(dotProduct / magVectorToPoint);
	    return angle <= radians(this.fov / 2);
	}

	squaredDistance(x1, y1, x2, y2) {
	  	return (x2 - x1) ** 2 + (y2 - y1) ** 2
	}


	getClosestEnemy(avoid){
		let closest = undefined
		let closest_dist = Infinity
		let range = this.range ** 2
		for(let i = 0; i < fleet.enemies.length; i++){
			let e = fleet.enemies[i]
			if(!e.alive) continue

			if(avoid.includes(e)) continue

			if(!this.isPointInFOV(this.pos, e.pos)) continue

			let distEn = this.squaredDistance(this.pos.x, this.pos.y, e.pos.x, e.pos.y)

			if(distEn > range) continue

			if(distEn < closest_dist){ 
				closest = e
				closest_dist = distEn
			}
		}
		return closest
	}

	// mueve la luna y ataca segun su cadencia
	update(){
		let x = (this.radius * cos(this.t)) + this.orbits.pos.x
        let y = (this.radius * sin(this.t)) + this.orbits.pos.y
        this.pos.x = x  
        this.pos.y = y
        this.t += this.speed

        this.count--
        this.count = constrain(this.count, 0, Infinity)
		if(this.count <= 0){
			if(this.attack(this.nrays)) activeAnim.push(new Animation(this.pActive, this.pos, 0.2))
		}
	}

	showFOV(){
		let fovDirection = p5.Vector.sub(this.pos, this.orbits.pos);
	    fovDirection.normalize();

	    let halfAngle = radians(this.fov / 2);
	    let fovLine2 = p5.Vector.add(this.pos, p5.Vector.mult(fovDirection.rotate(halfAngle), this.range));
	    let fovLine3 = p5.Vector.add(this.pos, p5.Vector.mult(fovDirection.rotate(-halfAngle * 2), this.range));

	    stroke(255, 100)
	    line(this.pos.x, this.pos.y, fovLine2.x, fovLine2.y);
	    line(this.pos.x, this.pos.y, fovLine3.x, fovLine3.y);
	}


	show(){
		push()
		fill(255)
		noStroke()
		ellipse(this.pos.x, this.pos.y, this.tam)
		this.discLinesEllipse(color(255,255,255,50), this.pos, this.range, 100, this.t/2, true, 2)
		//this.showFOV()

		pop()
	}
}