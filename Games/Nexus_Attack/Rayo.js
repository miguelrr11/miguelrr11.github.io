class Rayo{
	constructor(A, B, nivel, enemy, damage){
		this.posA = A 
		this.posB = B
		this.col = color(255, 255, 255)
		this.finished = false

		this.tam = nivel*3
		this.tam = constrain(this.tam, 0, 20)

		this.p = {color:['white'], 
					angle: [0, 360], 
					size: [this.tam, this.tam+5], 
					sizePercent: 0.80,
					gravity: false
				};
		this.curx = this.posA.x
		this.cury = this.posA.y
		this.step = 0
		this.maxSteps = 30	//impacta en rendimiento
		this.nSteps = map(dist(this.posA.x, this.posA.y, this.posB.x, this.posB.y), 0, 500, 1, this.maxSteps)
		this.xStep = (this.posB.x - this.posA.x)/this.nSteps
		this.yStep = (this.posB.y - this.posA.y)/this.nSteps
		
		this.enemy = enemy
		this.damage = damage
	}

	reDoP(){
		this.p = {color:['white'], 
					angle: [0, 360], 
					size: [this.tam, this.tam+5], 
					sizePercent: 0.80,
					gravity: false
				};
	}

	calculateSteps(){
		this.step = 0
		this.nSteps = map(dist(this.posA.x, this.posA.y, this.posB.x, this.posB.y), 0, 500, 1, this.maxSteps)
		this.xStep = (this.posB.x - this.posA.x)/this.nSteps
		this.yStep = (this.posB.y - this.posA.y)/this.nSteps
	}

	setCritic(){
		this.col = color(255, 0, 0)
	}
	setFreeze(){
		this.col = color(87, 219, 255)
	}
	setSlowed(){
		this.col = color(229, 151, 233)
	}
	setTrans(n){
		this.trans = n
	}

	// el rayo "persigue" al enemigo actualizando sus distancias
	createParticles(){
		activeAnim.push(new Animation(this.p, createVector(this.curx, this.cury), 1, this.col))
		this.xStep = (this.posB.x - this.curx)/(this.nSteps-this.step)
		this.yStep = (this.posB.y - this.cury)/(this.nSteps-this.step)
		this.curx += this.xStep
		this.cury += this.yStep
		this.step++
	}

	// Si el enemigo al que va destinado el rayo ha muerto, se redirige el rayo a otro enemigo
	redirectRay(){
		let newEn = getClosestEnemy(createVector(this.curx, this.cury), undefined, Infinity)
		if(newEn){
			this.enemy = newEn
			this.posA = createVector(this.curx, this.cury)
			this.posB = newEn.pos 
			this.calculateSteps()
		}
	}

	inCanvas(offset = 0){
		return this.curx <= WIDTH+offset && this.curx >= 0-offset
				&& this.cury <= HEIGHT+offset && this.cury >= 0-offset
	}

	show(){
		if(!this.enemy.alive) this.redirectRay() //igual es la causa de los tirones (se queda congelado el juego)
		push()
		if(this.step < this.nSteps && activeAnim.length < animationLimit){ 	// && frameCount%1==x para ralentizarlo
			this.createParticles()
		}
		if(this.step >= this.nSteps){
			this.finished = true 
			this.enemy.hit(this.damage)
			if(this.enemy.chainChance > 0){ 
				this.enemy.attackChain()
	        }
		}
		//TODO
		if(!this.inCanvas()){ this.finished = true; console.log("true")}

		//if(this.trans == 255) 
		//this.trans -= 25
		// this.col.setAlpha(this.trans-150)
		// if(this.trans-150 > 0) stroke(this.col)
		// strokeWeight(this.width + 4)
		// line(this.posA.x, this.posA.y, this.posB.x, this.posB.y)
		// this.col.setAlpha(this.trans)
		// if(this.trans > 0) stroke(this.col)
		// strokeWeight(this.width + 2)
		// line(this.posA.x, this.posA.y, this.posB.x, this.posB.y)	
		pop()
	}

}