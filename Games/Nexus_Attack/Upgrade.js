let rarities = [
		        { item: "Common", weight: 0.75 },
		        { item: "Rare", weight: 0.12 },
		        { item: "Discount", weight: 0.07 },
		        { item: "Sacrifice", weight: 0.04 },
		        { item: "Galactic", weight: 0.02}
		      ]


const nexusUpgradesList = ["Damage", "Rays", "Range"]

class NexusUpgrade{
	constructor(){
		this.rarity = this.calcularRarity()
		this.typeOfUpgrade = random(nexusUpgradesList)
		this.price = floor(this.calcularPrice())
		this.upgradeValue = this.calcularUpgradeValue()
		this.col = 'white'
		switch(this.rarity){
			case "Common":
				this.col = 'grey'
				break
			case "Rare":
				this.col = 'green'
				break
			case "Discount":
				this.col = 'orange'
				break
			case "Sacrifice":
				this.col = 'red'
				break
			case "Galactic":
				this.col = 'black'
				break
		}
		
	}

	calcularRarity(){
		let res = getRandomString(rarities)
		return res
	}

	calcularPrice(){
		let mult
		if(this.rarity == "Common" || this.rarity == "Rare") mult = 1
		else if(this.rarity == "Discount") mult = 0.5  
		else if(this.rarity == "Galactic") mult = 2 
		else if(this.rarity == "Sacrifice") return 0

		if(this.typeOfUpgrade == "Damage") return floor(nexus.damageLevel * 10 * mult)
		else if(this.typeOfUpgrade == "Rays") return floor(nexus.nraysLevel * 15 * mult)
		else if(this.typeOfUpgrade == "Range") return floor(nexus.rangeLevel * 7 * mult)
	}

	calcularUpgradeValue(){
		let mult
		if(this.rarity == "Common" || this.rarity == "Discount") mult = 1
		else if(this.rarity == "Rare") mult = 2 
		else if(this.rarity == "Galactic") mult = 3.5
		else if(this.rarity == "Sacrifice"){
			let other = random(nexusUpgradesList)
			while(other == this.typeOfUpgrade) other = random(nexusUpgradesList)
			this.typeOfUpgrade = [this.typeOfUpgrade, other]
			let res = []
			if(this.typeOfUpgrade[0] == "Damage") res[0] = 3
			else if(this.typeOfUpgrade[0] == "Range") res[0] = 40
			else if(this.typeOfUpgrade[0] == "Rays") res[0] = 3

			if(this.typeOfUpgrade[1] == "Damage") res[1] = -3
			else if(this.typeOfUpgrade[1] == "Range") res[1] = -30
			else if(this.typeOfUpgrade[1] == "Rays") res[1] = -2
			return res
		}

		if(this.typeOfUpgrade == "Damage") return 1 * mult
		else if(this.typeOfUpgrade == "Rays") return floor(1 * mult)
		else if(this.typeOfUpgrade == "Range") return 15 * mult

	}

	exec(){
		if(this.rarity != "Sacrifice"){
			if(this.typeOfUpgrade == "Damage"){
				nexus.damage += this.upgradeValue
				nexus.damageLevel++
			}
			else if(this.typeOfUpgrade == "Rays"){
				nexus.nrays += this.upgradeValue
				nexus.nraysLevel++
			}
			else if(this.typeOfUpgrade == "Range"){
				nexus.range += this.upgradeValue
				nexus.rangeLevel++
			}
		}
		else{
			for(let i = 0; i < 2; i++){
				let type = this.typeOfUpgrade[i]
				let val = this.upgradeValue[i]
				if(type == "Damage"){
					nexus.damage += val
					nexus.damage = constrain(nexus.damage, 1, Infinity)
				}
				else if(type == "Rays"){
					nexus.nrays += val
					nexus.nrays = constrain(nexus.nrays, 1, Infinity)
				}
				else if(type == "Range"){
					nexus.range += val
					nexus.range = constrain(nexus.range, 1, Infinity)
				}
			}
		}
	}
}

const moonUpgradesList = ["Damage", "Rays", "Range", "Fire Rate"]

class MoonUpgrade{
	constructor(){
		this.rarity = this.calcularRarity()
		this.typeOfUpgrade = random(moonUpgradesList)
		this.price = floor(this.calcularPrice())
		this.upgradeValue = this.calcularUpgradeValue()
		this.col = 'white'
		switch(this.rarity){
			case "Common":
				this.col = 'grey'
				break
			case "Rare":
				this.col = 'green'
				break
			case "Discount":
				this.col = 'orange'
				break
			case "Sacrifice":
				this.col = 'red'
				break
			case "Galactic":
				this.col = 'black'
				break
		}
		
	}


	calcularRarity(){
		return getRandomString(rarities)
	}

	calcularPrice(){
		let mult
		if(this.rarity == "Common" || this.rarity == "Rare") mult = 1
		else if(this.rarity == "Discount") mult = 0.5  
		else if(this.rarity == "Galactic") mult = 2 
		else if(this.rarity == "Sacrifice") return 0

		if(this.typeOfUpgrade == "Damage") return floor(orbit.damageLevel * 10 * mult)
		else if(this.typeOfUpgrade == "Rays") return floor(orbit.nraysLevel * 15 * mult)
		else if(this.typeOfUpgrade == "Range") return floor(orbit.rangeLevel * 7 * mult)
		else if(this.typeOfUpgrade == "Fire Rate") return floor(orbit.fireRateLevel * 10 * mult)
		
	}

	calcularUpgradeValue(){
		let mult
		if(this.rarity == "Common" || this.rarity == "Discount") mult = 1
		else if(this.rarity == "Rare") mult = 2 
		else if(this.rarity == "Galactic") mult = 3.5
		else if(this.rarity == "Sacrifice"){
			let other = random(moonUpgradesList)
			while(other == this.typeOfUpgrade) other = random(moonUpgradesList)
			this.typeOfUpgrade = [this.typeOfUpgrade, other]
			let res = []
			if(this.typeOfUpgrade[0] == "Damage") res[0] = 3
			else if(this.typeOfUpgrade[0] == "Range") res[0] = 40
			else if(this.typeOfUpgrade[0] == "Rays") res[0] = 3
			else if(this.typeOfUpgrade[0] == "Fire Rate") res[0] = 2

			if(this.typeOfUpgrade[1] == "Damage") res[1] = -3
			else if(this.typeOfUpgrade[1] == "Range") res[1] = -30
			else if(this.typeOfUpgrade[1] == "Rays") res[1] = -2
			else if(this.typeOfUpgrade[1] == "Fire Rate") res[1] = -1
			return res
		}

		if(this.typeOfUpgrade == "Damage") return 1 * mult
		else if(this.typeOfUpgrade == "Rays") return floor(1 * mult)
		else if(this.typeOfUpgrade == "Range") return 15 * mult
		else if(this.typeOfUpgrade == "Fire Rate") return 1 * mult
	}

	exec(){
		if(this.rarity != "Sacrifice"){
			let val = this.upgradeValue
			if(this.typeOfUpgrade == "Damage"){
				orbit.upgradeDam(val)
				orbit.damageLevel++
			}
			else if(this.typeOfUpgrade == "Rays"){
				orbit.upgradeNrays(val)
				orbit.nraysLevel++
			}
			else if(this.typeOfUpgrade == "Range"){
				orbit.upgradeRangeFov(val)
				orbit.rangeLevel++
			}
			else if(this.typeOfUpgrade == "Fire Rate"){
				orbit.upgradeCadencia(val)
				orbit.fireRateLevel++
			}
		}
		else{
			for(let i = 0; i < 2; i++){
				let type = this.typeOfUpgrade[i]
				let val = this.upgradeValue[i]
				if(type == "Damage"){
					orbit.upgradeDam(val)
				}
				else if(type == "Rays"){
					orbit.upgradeNrays(val)
				}
				else if(type == "Range"){
					orbit.upgradeRangeFov(val)
				}
				else if(type == "Fire Rate"){
					orbit.upgradeCadencia(val)
				}
			}
		}
	}
}

//const chanceUpgradesList = ["Critic", "Chain", "Freeze", "Slowed"]
let chanceUpgradesList = [
				        { item: "Critic", weight: 0.25 },
				        { item: "Chain", weight: 0.25 },
				        { item: "Freeze", weight: 0.25 },
				        { item: "Slowed", weight: 0.25 }
				      ]


class ChanceUpgrade{
	constructor(){
		this.rarity = this.calcularRarity()
		this.typeOfUpgrade = getRandomString(chanceUpgradesList)
		this.price = floor(this.calcularPrice())
		this.upgradeValue = this.calcularUpgradeValue()
		this.col = 'white'
		switch(this.rarity){
			case "Common":
				this.col = 'grey'
				break
			case "Rare":
				this.col = 'green'
				break
			case "Discount":
				this.col = 'orange'
				break
			case "Sacrifice":
				this.col = 'red'
				break
			case "Galactic":
				this.col = 'black'
				break
		}
	}


	calcularRarity(){
		return getRandomString(rarities)
	}

	calcularPrice(){
		let mult
		if(this.rarity == "Common" || this.rarity == "Rare") mult = 1
		else if(this.rarity == "Discount") mult = 0.5  
		else if(this.rarity == "Galactic") mult = 2 
		else if(this.rarity == "Sacrifice") return 0

		if(this.typeOfUpgrade == "Critic") return floor(nexus.criticalChanceLevel * 10 * mult)
		else if(this.typeOfUpgrade == "Chain") return floor(nexus.chainChanceLevel * 15 * mult)
		else if(this.typeOfUpgrade == "Freeze") return floor(nexus.freezeChanceLevel * 7 * mult)
		else if(this.typeOfUpgrade == "Slowed") return floor(nexus.slowedChanceLevel * 10 * mult)
	}

	calcularUpgradeValue(){
		if(this.rarity == "Common" || this.rarity == "Discount"){
			return 0.01
		}
		else if(this.rarity == "Rare"){
			return 0.02
		}
		else if(this.rarity == "Galactic"){
			return 0.04
		}
		else if(this.rarity == "Sacrifice"){
			let other = getRandomString(chanceUpgradesList)
			while(other == this.typeOfUpgrade) other = getRandomString(chanceUpgradesList)
			this.typeOfUpgrade = [this.typeOfUpgrade, other]
			return [0.02, -0.02]
		}
	}

	exec(){
		let add = 0.03  	//el comprar un upgrade aumenta las probabilidades de que aparezca otra vez
		if(this.rarity != "Sacrifice"){
			let val = this.upgradeValue
			if(this.typeOfUpgrade == "Critic"){
				nexus.criticalChance += val
				nexus.criticalChanceLevel++
				chanceUpgradesList[0].weight += add
			}
			else if(this.typeOfUpgrade == "Chain"){
				nexus.chainChance += val
				nexus.chainChanceLevel++
				chanceUpgradesList[1].weight += add
			}
			else if(this.typeOfUpgrade == "Freeze"){
				nexus.freezeChance += val
				nexus.freezeChanceLevel++
				chanceUpgradesList[2].weight += add
			}
			else if(this.typeOfUpgrade == "Slowed"){
				nexus.slowedChance += val
				nexus.slowedChanceLevel++
				chanceUpgradesList[3].weight += add
			}
		}
		else{
			for(let i = 0; i < 2; i++){
				let type = this.typeOfUpgrade[i]
				let val = this.upgradeValue[i]
				if(type == "Critic"){
					nexus.criticalChance += val
				}
				else if(type == "Chain"){
					nexus.chainChance += val
				}
				else if(type == "Freeze"){
					nexus.freezeChance += val
				}
				else if(type == "Slowed"){
					nexus.slowedChance += val
				}
			}
		}
	}
}