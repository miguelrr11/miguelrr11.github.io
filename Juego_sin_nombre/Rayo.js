class Rayo{
	constructor(A, B, nivel, isCritic, enemy, damage){
		this.posA = A 
		this.posB = B
		if(nivel) this.width = nivel*2
		else this.width = 3
		this.col = color(255, 255, 255)
		this.finished = false

		let tam = nivel*3
		tam = constrain(tam, 0, 20)

		this.p = {color:['white'], 
					angle: [0, 360], 
					size: [tam,tam+5], 
					sizePercent: 0.80,
					gravity: false
				};
		this.curx = this.posA.x
		this.cury = this.posA.y
		this.step = 0
		let maxSteps = 30	//impacta en rendimiento
		this.nSteps = map(dist(this.posA.x, this.posA.y, this.posB.x, this.posB.y), 0, 500, 1, maxSteps)
		this.xStep = (this.posB.x - this.posA.x)/this.nSteps
		this.yStep = (this.posB.y - this.posA.y)/this.nSteps
		
		this.enemy = enemy
		this.damage = damage

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
		activeAnim.push(new Animation(this.p, createVector(this.curx, this.cury), 2, this.col))
		this.xStep = (this.posB.x - this.curx)/(this.nSteps-this.step)
		this.yStep = (this.posB.y - this.cury)/(this.nSteps-this.step)
		this.curx += this.xStep
		this.cury += this.yStep
		this.step++
	}

	show(){
		push()
		let i = 0
		while(this.step < this.nSteps && activeAnim.length < animationLimit){
			if(i > 1) break
			this.createParticles()
			i++
		}
		if(i == 0){
			this.finished = true 
			this.enemy.hit(this.damage)
			if(this.enemy.chainChance > 0){ 
				this.enemy.attackChain()
	        }
		}
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