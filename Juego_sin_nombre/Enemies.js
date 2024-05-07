class EnemyRich extends Enemy{
	constructor(pos, health, maxSpeed){
		super(pos, health, maxSpeed)
		this.reward = floor(health*3)
		this.pActive = {color:[color(255, 198, 0)], 
						angle: [0, 360], 
						size: [8,10], 
						sizePercent: 0.88,
						gravity: false
					   };

		this.pActiveMuerte = {color:[color(255, 198, 0)], 
						angle: [0, 360], 
						size: [25,35], 
						sizePercent: 0.92,
						speed: 4,
						gravity: false
					   };
	}

	getStroke(){
		strokeWeight(4)
		stroke(255, 198, 0)
	}

}

class EnemyExplosive extends Enemy{
	constructor(pos, health, maxSpeed){
		super(pos, health, maxSpeed)
		this.pActiveHit = {color:[color(255, 0, 97)],
						angle: [0, 360],
						size: [8,10],
						sizePercent: 0.88,
						gravity: false
					   };

		this.pActiveMuerte = {color:[color(255, 0, 97)], 
						angle: [0, 360], 
						size: [25,35], 
						sizePercent: 0.92,
						speed: 4,
						gravity: false
					   };			   
	}



	hit(n){
		this.health -= n
		//animacion recibe daño
		activeAnim.push(new Animation(this.pActiveHit, this.pos, 0.005))  	//0.005 es muy importante para q no laguee
		if(this.health <= 0){
			if(this.alive){
				if(random() < nexus.earnChance) nexus.money += this.reward
				nexus.xp += this.xpReward
				// bomba que daña a enemigos cercanos
				this.bomba()
			}
			this.alive = false
		}
	}

	// bomba que daña a enemigos cercanos
	bomba(){
		let avoid = []
		for(let i = 0; i < 10; i++){
			let closest = this.getClosestEnemy(avoid, 200)
			if(!closest) continue
			if(closest instanceof EnemyExplosive){ 
				avoid.push(closest)
				continue
			}
			closest.hit(this.maxHealth*10)
			avoid.push(closest)
		}
	}

	getStroke(){
		strokeWeight(4)
		stroke(255, 0, 97)
	}

}

class EnemyBoss extends Enemy{
	constructor(pos, health, maxSpeed){
		super(pos, health, maxSpeed)
		this.tam = map(this.health, 1, health, 15, 50)
		this.xpReward = 20
		this.pActiveHit = {color:[this.col],
						angle: [0, 360],
						size: [25,35], 
						sizePercent: 0.88,
						gravity: false
					   };

		this.pActiveMuerte = {color:[this.col], 
						angle: [0, 360], 
						size: [25,35], 
						sizePercent: 0.88,
						speed: 3,
						gravity: false
					   };

		let p = {color:[this.col], 
				 angle: [0,360], 
				 size: [45, 45], 
				 sizePercent: 0.95
				};
		this.emitter = new Fountain(null, p, 100, 100)

		this.isSlowed = true	   
	}
	
	// cuando muere spawnea varios enemigos
	die(){
		let n = floor(random(8, 12))
		for(let i = 0; i < n; i++){
			let location = p5.Vector.add(this.pos, createVector(random(-25,25), random(-25,25)))
			spawner.spawn(location, true)
		}
		if(random() < nexus.earnChance) nexus.money += this.reward
		nexus.xp += this.xpReward
		activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 0.2))
		spawner.toggleBossChance(true)
		this.alive = false
	}

	getStroke(){
		if(this.isFreezed){
			stroke(87, 219, 255)
		}
		else{
			stroke(255)
		}
		strokeWeight(7)
	}

	show(){
		this.emitter.f.angle = [random(0,360), random(0,360)]
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