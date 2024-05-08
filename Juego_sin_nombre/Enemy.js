class Enemy extends Nexus{
	constructor(pos, health, maxSpeed){
		super()
		this.pos = pos
		if(maxSpeed) this.maxSpeed = maxSpeed //1->10
		else this.maxSpeed = 0.1
		this.speed = this.getTangentialVector(p5.Vector.sub(nexus.pos, this.pos))
		this.col = 'white'
		this.tam = map(this.health, 1, 200, 15, 30)
		this.alive = true
		this.maxHealth = health
		this.health = health
		this.reward = health
		this.xpReward = 1

		this.range = Infinity
		this.fromBoss = false
		this.chainChance = 0
		this.avoidEnemies = []
		this.lostNexusOrbit = false

		this.range = 350
		this.isFreezed = false
		this.isSlowed = false
		this.freezeCounterTot = 4 * 60
		this.freezeCounter = 4 * 60

		this.damage = Math.ceil(health/10) //TODO: que no sea lineal

		//animacion trail
		let p = {color:[this.col], 
				 angle: [0, 0], 
				 size: [20, 20], 
				 sizePercent: 0.88
				};
		
		this.emitter = new Fountain(null, p)

		//animacion hit
		this.pActiveHit = {color:['white'], 
						angle: [0, 360], 
						size: [this.tam+5,this.tam+10], 
						sizePercent: 0.88,
						gravity: false,
						speed: 3
					   };

		//animacion muerte
		this.pActiveMuerte = {color:['white'], 
						angle: [0, 360], 
						size: [8,10], 
						sizePercent: 0.88,
						gravity: false
					   };

		this.colors = [color(255, 255, 255),
					  color(218, 247, 166),
					  color(255, 195, 0),
					  color(255, 87, 51),
					  color(199, 0, 57),
					  color(144, 12, 63),
					  color(120, 46, 98)]
	}

	inCanvas(offset = 0){
		return this.pos.x <= WIDTH+offset && this.pos.y >= 0-offset
				&& this.pos.y <= HEIGHT+offset && this.pos.y >= 0-offset
	}

	getTangentialVector(positionVector) {
	    let tang = createVector(-positionVector.y, positionVector.x)
	    tang.setMag(5)
	    return tang;
	}

	die(){
		if(this instanceof EnemyRich) nexus.money += this.reward
		else if(random() < nexus.earnChance) nexus.money += this.reward
		nexus.xp += this.xpReward

		if(this instanceof EnemyExplosive) activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 10))
		else if(this instanceof EnemyRich) activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 10))
		else activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 2))

		this.alive = false
	}

	hit(n){
		this.health -= n
		activeAnim.push(new Animation(this.pActiveHit, this.pos, 2))  	
		if(this.health <= 0){
			if(this.alive) {this.die(); return true}
		}
	}

	attackChain(){
		this.attack(floor(random(1, 3)), this.avoidEnemies)
	    this.chainChance = 0
	}

	target(){
		let vec = p5.Vector.sub(nexus.pos, this.pos)
		vec.setMag(this.maxSpeed)
		return vec
	}

	squaredDistance(x1, y1, x2, y2) {
	  	return (x2 - x1) ** 2 + (y2 - y1) ** 2
	}

	updatePhysicsNexus(bool){
		let c
		if(this.isSlowed) c = map(this.maxSpeed, 1, 10, 0.5, 10, true)
		else c = map(this.maxSpeed, 1, 10, 2.5, 10, true)
    	let G = map(this.maxSpeed, 1, 10, 4, 6, true)
    	let m = 10000
    	if(bool) m = map(nexus.carga, 0, 200, -20000, -20000)
		const force = p5.Vector.sub(nexus.pos, this.pos);
	    const R = force.mag();
	    const fg = G * m / (R * R);
	    force.setMag(fg);
	    this.speed.add(force);
	   // if(!this.lostNexusOrbit) this.speed.add(this.getTangentialVector(p5.Vector.sub(nexus.pos, this.pos)))
	    this.speed.add(this.getTangentialVector(p5.Vector.sub(nexus.pos, this.pos)))
	    this.speed.setMag(c);
	    this.pos.add(this.speed)
	}

	updatePhysicsBH(){
		this.lostNexusOrbit = true
		let c
		if(this.isSlowed) c = map(this.maxSpeed, 1, 10, 0.5, 10, true)
		else c = map(this.maxSpeed, 1, 10, 2.5, 10, true)
    	let G = map(this.maxSpeed, 1, 10, 4, 6, true)
    	let m = 10000
		const force = p5.Vector.sub(bh.pos, this.pos);
	    const R = force.mag();
	    let mBH = 30000
    	let GBH = 5
    	const fg = GBH * mBH / (R * R);
	    force.setMag(fg);
	    this.speed.add(force);
	    this.speed.add(this.getTangentialVector(p5.Vector.sub(bh.pos, this.pos)))
	    this.speed.setMag(c);
	    this.pos.add(this.speed)
	}

	showWarning(){
		push()
		noStroke()
		fill(255, 0, 97)
		textSize(25)
		textFont('Courier')
		text("!", this.pos.x, this.pos.y-this.tam)
		pop()
	}

	update(bool){
		let distToNexus = this.squaredDistance(this.pos.x, this.pos.y, nexus.pos.x, nexus.pos.y)
		let distToBH
		if(bh) distToBH = this.squaredDistance(this.pos.x, this.pos.y, bh.pos.x, bh.pos.y)
		if(distToNexus <= nexus.range**2) this.showWarning()

		if(!this.isFreezed){
			if(bh && distToBH < bh.range**2) this.updatePhysicsBH(bool)
			else this.updatePhysicsNexus(bool)
		}
		else{
			this.freezeCounter--
			if(this.freezeCounter <= 0){
				this.freezeCounter = this.freezeCounterTot
				this.isFreezed = false
			}
		}

		if(distToNexus < (nexus.tam/2 + this.tam/2)**2){ 
			nexus.health -= this.damage
			return undefined
		}
		if(bh && distToBH < (bh.tam/2 + this.tam/2)**2){ 
			if(!bh.imploding && this.hit(0.3)) bh.tam++
		}
		return true
	}

	showEmitter(){
		this.emitter.location = this.pos
		this.emitter.colors[0] = this.col
		let deg = (degrees(Math.atan2(this.speed.y, this.speed.x)))
		this.emitter.f.angle = [deg, deg]
		push()
		if(frameCount%5 == 0)this.emitter.Create()
	    this.emitter.Draw()
	    this.emitter.Step()
		pop()
	}

	getStroke(){
		if(this.isFreezed){
			stroke(87, 219, 255)
			strokeWeight(4)
		}
		else if(this.isSlowed){
			stroke(229, 151, 233)
			strokeWeight(4)
		}
		else{
			stroke(255, 255, 255)
			strokeWeight(2)
		}
	}

	show(){
		if(this.inCanvas(20)){
			this.showEmitter()
		
			let tam = map(this.health, 1, this.maxHealth, 10, this.tam)
			let finalCol = map(this.health, 0, this.maxHealth, 0, 255)
			this.col = finalCol

			push()
			this.getStroke()
			fill(finalCol)
			ellipse(this.pos.x, this.pos.y, tam)
			pop()
		}
	}
}

