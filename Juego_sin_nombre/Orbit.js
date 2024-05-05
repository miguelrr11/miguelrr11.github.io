class Orbit{
	constructor(){
		this.moons = []
		this.bestMoon = undefined

		this.damageLevel = 1
		this.fireRateLevel = 1
		this.rangeLevel = 1
		this.nraysLevel = 1
	}

	createAndAddMoon(){
		let m = new Moon()
    	this.addMoon(m)
	}

	upgradeNrays(n = 1){
		for(let m of this.moons){ 
			m.nrays += n
			m.nrays = constrain(m.nrays, 1, Infinity)
		}
	}

	upgradeDam(n = 1){
		for(let m of this.moons){ 
			m.damage += n
			m.damage = constrain(m.damage, 1, Infinity)
		}
	}

	upgradeRangeFov(n = 10, nn = 5){
		for(let m of this.moons){ 
			m.range += n
			m.fov += nn
			m.range = constrain(m.range, 1, Infinity)
			m.fov = constrain(m.fov, 1, 360)
		}
	}

	upgradeCadencia(n = 1){
		for(let m of this.moons){
			let aux = m.cadencia += n
			m.setRate(aux)
		}
	}


	addMoon(){
		//limiteInferior + (bestMoon-limiteInferior)/2
		let moon = new Moon()
		let n_total = this.moons.length + 1
		let angle = TWO_PI/min(n_total, 8)
		if(this.moons.length == 0) this.bestMoon = moon
		else{
			moon.range = 100 + (this.bestMoon.range-100)/2
			moon.fov = 70 + (this.bestMoon.fov-70)/2
			moon.damage = 1 + (this.bestMoon.damage-1)/2
			moon.nrays =  2 + floor((this.bestMoon.nrays-2)/2)
			let cad =  2 + (this.bestMoon.cadencia-2)/2
			moon.setRate(cad)
		}
		this.moons.push(moon)

		//reorganizamos posicion de lunas
		if(this.moons.length < 8){
			let a = 0
			for(let i = 0; i < min(this.moons.length, 8); i++){
				let m = this.moons[i]
				m.pos = m.createFirstPos(a)
				a += angle
			}
		}
		//segunda orbita
		else{
			angle = TWO_PI/(n_total-7)
			let a = 0
			for(let i = 7; i < this.moons.length; i++){
				let m = this.moons[i]
				m.pos = m.createFirstPos(a, true)
				a += angle
			}
			
		}
	}



	//no se usa
	attack(){
		for(let m of this.moons){
	        m.attack(m.nrays)
		}
	}

	update(){
		for(let m of this.moons){
	        m.update()
	        m.show()
		}
	}

}

