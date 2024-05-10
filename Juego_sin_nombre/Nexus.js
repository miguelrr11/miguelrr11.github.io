class Nexus{
	constructor(pos){
		this.pos = pos
		this.nivel = 0
		this.tam = 100

		this.maxHealth = 20
		this.health = this.maxHealth

		this.criticalChance = 0
		this.chainChance = 0
		this.freezeChance = 0
		this.slowedChance = 0

		this.criticalChanceLevel = 1
		this.chainChanceLevel = 1
		this.freezeChanceLevel = 1
		this.slowedChanceLevel = 1

		this.damage = 1
		this.range = 250
		this.nrays = 1

		this.damageLevel = 1
		this.rangeLevel = 1
		this.nraysLevel = 1

		// this.rate = 60/this.cadencia
		// this.count = 60/this.cadencia

		// carga del ataque activo (0->200) (repulsion)
		this.carga = 0
		this.coolDownTot = 5*60
		this.coolDown = 0
		this.deltaCarga = 0.2 	// determina como de rapido carga
		this.isAttacking = false
		this.countCargaTot = 60*3
		this.countCarga = this.countCargaTot

		this.money = 0
		this.earnChance = 0.25

		this.xp = 0
		this.maxXp = 10

		let p = {color:[color(255, 255, 255, 200)], 
				 angle: [0, 360], 
				 size: [70,90], 
				 sizePercent: 0.7,
				 gravity: false,
				 speed: 8
				};
		this.emitter = new Fountain(null, p, WIDTH/2, HEIGHT/2)

		// show radius
		this.t = 0

		//cooldown ataque principal (heat) //si heat < heatLimit se puede atacar (heated = false)
		this.heatLimit = 20
		this.heated = false 
		this.heat = 0
		this.heatUp = 1 		//cada vez que se hace click, el heat aumenta en 1
		this.heatDown = 5/60 	//mientras no se esté atacando, el heat disminuye
		this.heatDownCD = 2/60  //si se llega al limit, no se puede atacar y el heat disminuye mas lentamente

	}

	click(x, y){
		if(this.heat < this.heatLimit && !this.heated){
			if(dist(x, y, this.pos.x, this.pos.y) < this.tam/2){
				this.heat += this.heatUp
				this.attack(this.nrays)
			}
		}
	}

	levelUp(){
		nexus.range += 15
		this.xp = 0
		this.nivel++
		orbit.addMoon()
		if(orbit.moons.length == 1){ 
			//menu.createMoonButtons()
		}
		this.maxXp = Math.ceil(Math.exp(this.nivel) * this.nivel + 10)
		aumentarDificultadLevel()
		this.money += Math.ceil(Math.exp(this.nivel)/this.nivel)
		spawner.counterSpawnAtCorner = 20
	}

	update(){
		if(this.health <= 0) {console.log("GAME OVER"); noLoop()}
		if(this.coolDown <= 0){
			this.carga += this.deltaCarga
			this.carga = constrain(this.carga++, 1, 200)
		}
		this.coolDown--
		this.coolDown = constrain(this.coolDown, 0, Infinity)
		if(this.isAttacking){
			this.countCarga--
		}
		if(this.countCarga <= 0){
			this.isAttacking = false
			this.countCarga = this.countCargaTot
		}
		// SUBIR DE NIVEL
		if(this.xp >= this.maxXp){
			this.levelUp()
		}
		if(!mouseIsPressed && !this.heated && this.heat >= 0) this.heat -= this.heatDown
		if(this.heat > this.heatLimit && !this.heated) this.heated = true
		if(this.heated){ 
			this.heat -= this.heatDownCD
			if(this.heat <= 0) this.heated = false
		}
		this.show()
	}

	squaredDistance(x1, y1, x2, y2) {
	  	return (x2 - x1) ** 2 + (y2 - y1) ** 2
	}

	getClosestEnemy(avoid, dis = this.range){
		let dstn = dis ** 2
		let closest = undefined
		let closest_dist = Infinity
		for(let i = 0; i < fleet.enemies.length; i++){
			let e = fleet.enemies[i]
			if(!e.inCanvas()) continue
			if(!e.alive) continue
			if(avoid.includes(e)) continue
			if(e === this) continue

			let distEn = this.squaredDistance(this.pos.x, this.pos.y, e.pos.x, e.pos.y)
			if(distEn > dstn) continue
			if(distEn < closest_dist){ 
				closest = e
				closest_dist = distEn
			}
		}
		return closest
	}

	//TODO: refactorizar este desastre
	attack(nrays, avoid, range = this.range, chain, critic, maxSteps, tamRayo){
		let totalEnemiesAttack = []
		if(avoid) totalEnemiesAttack = avoid
		let closest = undefined
		let attacked = false
		for(let i = 0; i < nrays; i++){
			closest = this.getClosestEnemy(totalEnemiesAttack, range)
			if(closest != undefined){
				let rayo = new Rayo(this.pos, closest.pos, this.damage)
				if(maxSteps){ 
					rayo.maxSteps = maxSteps
					rayo.calculateSteps()
				}
				if(tamRayo){
					rayo.tam = tamRayo
					rayo.reDoP()
				}
				let damage = this.damage

				// CRITICO
				if(random() < this.criticalChance || critic){ 
					rayo.setCritic()
					damage *= 2.5
				}

				//CHAIN
				if(random() < this.chainChance || chain){
					totalEnemiesAttack.push(this)
					// if(totalEnemiesAttack.length > 1)
					// 	rayo.setTrans(map(totalEnemiesAttack.length, 2, 15, 200, 50))
					closest.damage = this.damage/1.5
					if(chain) closest.chainChance = chain
					else closest.chainChance = this.chainChance - this.chainChance*0.8
					closest.range = this.range - 50
					closest.avoidEnemies = totalEnemiesAttack
					//closest.attack(floor(random(1,4)), totalEnemiesAttack)
				}

				//FREEZE
				if(random() < this.freezeChance && !closest.isFreeze){
					rayo.setFreeze()
					closest.isFreezed = true
					closest.isSlowed = false
				}

				//SLOW
				if(random() < this.slowedChance && !closest.isFreeze){
					rayo.setSlowed()
					closest.isSlowed = true
				}

				//BASE
				//closest.hit(damage)
				rayo.enemy = closest
				rayo.damage = damage
				attacked = true

				
				rayos.push(rayo)
				totalEnemiesAttack.push(closest)
			}
			
		}
		//se ha atacado
		if(attacked){ 
			this.count = this.rate;  //actualizar contador ataque moons
			return true
		}
	}

	cargaAttack(){
		if(this.coolDown > 0 || this.heated) return
		
		// REPULSION
		// this.isAttacking = true
		// fleet.update()

		// TORMENTA DE RAYOS
		let nrays = map(this.carga, 1, 200, 5, 20)
		let range = map(this.carga, 1, 200, 75, 600)
		this.attack(nrays, undefined, range, 0.5)
		this.showEmitter(true, map(this.carga, 1, 200, 5, 50))

		const n = this.carga
		this.carga = 0
		this.coolDown = this.coolDownTot
		
	}

	discLinesEllipse(col, pos, rad, dis, offset = 0, isDotted = false, strokeW = 3) {
	    push()
	    stroke(col)
	    strokeWeight(strokeW)
	    noFill()
	    translate(pos)

	    let angleStep = TWO_PI / dis
	    let angleStep2 = TWO_PI / dis
	    let curAngleStep = offset % TWO_PI
	    let limit = TWO_PI + offset % TWO_PI
	    if(isDotted) angleStep2 = 0.000001

	    for (let i = 0; curAngleStep < limit; i++) {
	        let x1 = rad * cos(curAngleStep)
	        let y1 = rad * sin(curAngleStep)
	        curAngleStep += angleStep2
	        let x2 = rad * cos(curAngleStep)
	        let y2 = rad * sin(curAngleStep)
	        curAngleStep += angleStep
	        line(x1, y1, x2, y2)
	    }
	    pop();
	}

	squaredDistance(x1, y1, x2, y2) {
	  	return (x2 - x1) ** 2 + (y2 - y1) ** 2
	}

	getAB(){
		let heat = this.heat
		if(heat < 0) heat = 0
	  	let a = map(heat, 0, 21, 90, 270)
	  	let b
	  	if(heat/2 >= 10) b = map(heat, 10, 21, 360, 270)
	  	else b = map(heat, 0, 10.5, 90, 0)
	  	return [b,a]
	}

	showEmitter(bool, n = this.nivel+1){
		push()
		if(bool){
			for(let i = 0; i < n; i++) this.emitter.CreateN()
		}
	    this.emitter.Draw()
	    this.emitter.Step()
		pop()
	}

	show(){
		let dis = this.squaredDistance(mouseX, mouseY, this.pos.x, this.pos.y)
		let tam = (this.tam/2)**2
		if(!this.heated)this.showEmitter(mouseIsPressed && dis < tam)
	    // nexo
		push()
		fill(255) 	
		noStroke()	//TODO: meter aqui el color de la habilidad activa (la de tiempo limitado, no la activada por SPACE)
		if(mouseIsPressed && dis < tam) ellipse(this.pos.x, this.pos.y, this.tam + 5)
		else ellipse(this.pos.x, this.pos.y, this.tam)

		// carga nexo
		//fill(map(this.carga, 0, 200, 0, 255))
		//ellipse(this.pos.x, this.pos.y, this.tam-20)

		// range nexo y carga ataque activo nexo
		noFill()
		this.discLinesEllipse(color(255,255,255,150), this.pos, this.range, 50, this.t)
		this.discLinesEllipse(color(255,255,255,150), this.pos, map(this.carga, 1, 200, this.tam/2, 600), 50, this.t*2, true)
		this.t += 0.003

		// heat nexo
		fill(0)
		angleMode(DEGREES)
		let rad = this.tam-20
	    let res = this.getAB()
    	arc(this.pos.x, this.pos.y, rad, rad, res[0], res[1], OPEN);
    	angleMode(RADIANS)


		if(this.heated){
			let offset = 15
			image(heatSprite, this.pos.x-offset, this.pos.y-offset, 35, 35)
		}
		
		pop()
	}
}
