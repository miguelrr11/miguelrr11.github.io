let enemiesChances = [
		        { item: "Common", weight: 0.95 },
		        { item: "Rich", weight: 0.02 },
		        { item: "Explosive", weight: 0.01 },
		        { item: "Boss", weight: 0.001 }
		      ]

class Spawner{
	// Un spawner añade enemigos a un fleet
	constructor(fleet, spawn_per_second, maxSpeed, maxHealth){
		this.fleet = fleet
		this.spawn_per_second = spawn_per_second
		this.maxSpeed = maxSpeed
		this.maxHealth = maxHealth
		this.rate = 60/spawn_per_second
		this.count = 60/spawn_per_second
		this.hayBoss = false

		this.counterSpawnAtCorner = 0
	} 

	toggleBossChance(bool){
		if(bool) enemiesChances[3].weight = 1
		else enemiesChances[3].weight = 0
	}

	setSpawnPerSecond(n){
		this.spawn_per_second = n
		this.rate = 60/this.spawn_per_second
		this.count = 60/this.spawn_per_second
	}

	getSpawnLocation(){
		let offset = 20
		let x = random(-WIDTH, WIDTH)
		let y = random(-HEIGHT, HEIGHT)
		if(random() < 0.5){
			if(random() < 0.5) y = 0 - offset
			else y = HEIGHT + offset
		}
		else{
			if(random() < 0.5) x = 0 - offset
			else x = WIDTH + offset
		}
		return createVector(x,y)

		// let r = random()
		// let offset = random(0, 100)
		// if(r < 0.25) return createVector(WIDTH/2+offset, 0)
		// else if(r < 0.5) return createVector(WIDTH, HEIGHT/2+offset)
		// else if(r < 0.75) return createVector(WIDTH/2+offset, HEIGHT)
		// else return createVector(0, HEIGHT/2+offset)

	}

	spawn(location = this.getSpawnLocation(), wasBoss = false, forceAdd = false){
		let x = location.x
		let y = location.y

		let plus = 0  
		if(random() < 0.05) plus = 10
		let total = constrain(plus*random(-1,1), 1, Infinity)

		if(wasBoss){ 
			let e = new Enemy(createVector(x, y), this.maxHealth + total, this.maxSpeed)
			e.fromBoss = true
			this.fleet.add(e)
			return 
		}

		let type = getRandomString(enemiesChances)
		switch(type){
			case "Common": 
				this.fleet.add(new Enemy(createVector(x, y), this.maxHealth + total, this.maxSpeed), forceAdd)
				break
			case "Rich":
				this.fleet.add(new EnemyRich(createVector(x, y), this.maxHealth + total, this.maxSpeed), forceAdd)
				break
			case "Explosive":
				this.fleet.add(new EnemyExplosive(createVector(x, y), this.maxHealth + total, this.maxSpeed), forceAdd)
				break
			case "Boss":
				if(this.fleet.add(new EnemyBoss(createVector(x, y), this.maxHealth+100, this.maxSpeed), forceAdd)) this.toggleBossChance(false)
				break
			default: break
		}
		this.count = this.rate
	}

	// update(){
	// 	if(keyIsPressed) this.spawn(createVector(mouseX, mouseY))
	// }

	update(){
		if(this.count <= 0){
			if(this.counterSpawnAtCorner >= 0){
				this.counterSpawnAtCorner--
				if(this.counterSpawnAtCorner%2==0) this.spawn(createVector(200,0), false, true)
				else this.spawn(createVector(WIDTH-200,HEIGHT), false, true)
				this.count -= 5
			}
			else{ 
				this.spawn()
			}
		}
		this.count--
		if(random() < 0.0001) this.counterSpawnAtCorner = 20
	}
}