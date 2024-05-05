let rarities = [
		        { item: "Common", weight: 0.75 },
		        { item: "Rare", weight: 0.12 },
		        { item: "Discount", weight: 0.07 },
		        { item: "Sacrifice", weight: 0.04 },
		        { item: "Galactic", weight: 0.02}
		      ]



class NexusUpgrade{
	constructor(){
		this.rarity = this.calcularRarity()
		this.typeOfUpgrade = random(["Damage", "Rays", "Range"])
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
		if(this.rarity == "Common" || this.rarity == "Rare"){
			if(this.typeOfUpgrade == "Damage") return nexus.damageLevel * 10
			else if(this.typeOfUpgrade == "Rays") return nexus.nraysLevel * 15
			else if(this.typeOfUpgrade == "Range") return nexus.rangeLevel * 7
		}
		else if(this.rarity == "Discount"){
			if(this.typeOfUpgrade == "Damage") return nexus.damageLevel * 5
			else if(this.typeOfUpgrade == "Rays") return nexus.nraysLevel * 7.5
			else if(this.typeOfUpgrade == "Range") return nexus.rangeLevel * 4
		}
		else if(this.rarity == "Galactic"){
			if(this.typeOfUpgrade == "Damage") return nexus.damageLevel * 20
			else if(this.typeOfUpgrade == "Rays") return nexus.nraysLevel * 30
			else if(this.typeOfUpgrade == "Range") return nexus.rangeLevel * 14
		}
		else if(this.rarity == "Sacrifice") return 0
	}

	calcularUpgradeValue(){
		if(this.rarity == "Common" || this.rarity == "Discount"){
			if(this.typeOfUpgrade == "Damage") return 1
			else if(this.typeOfUpgrade == "Rays") return 1
			else if(this.typeOfUpgrade == "Range") return 15
		}
		else if(this.rarity == "Rare"){
			if(this.typeOfUpgrade == "Damage") return 2
			else if(this.typeOfUpgrade == "Rays") return 2
			else if(this.typeOfUpgrade == "Range") return 25
		}
		else if(this.rarity == "Galactic"){
			if(this.typeOfUpgrade == "Damage") return 4
			else if(this.typeOfUpgrade == "Rays") return 3
			else if(this.typeOfUpgrade == "Range") return 50
		}
		else if(this.rarity == "Sacrifice"){
			let other = random(["Damage", "Rays", "Range"])
			while(other == this.typeOfUpgrade) other = random(["Damage", "Rays", "Range"])
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

class MoonUpgrade{
	constructor(){
		this.rarity = this.calcularRarity()
		this.typeOfUpgrade = random(["Damage", "Rays", "Range", "Fire Rate"])
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
		if(this.rarity == "Common" || this.rarity == "Discount"){
			if(this.typeOfUpgrade == "Damage") return 1
			else if(this.typeOfUpgrade == "Rays") return 1
			else if(this.typeOfUpgrade == "Range") return 15
			else if(this.typeOfUpgrade == "Fire Rate") return 1
		}
		else if(this.rarity == "Rare"){
			if(this.typeOfUpgrade == "Damage") return 2
			else if(this.typeOfUpgrade == "Rays") return 2
			else if(this.typeOfUpgrade == "Range") return 25
			else if(this.typeOfUpgrade == "Fire Rate") return 2
		}
		else if(this.rarity == "Galactic"){
			if(this.typeOfUpgrade == "Damage") return 4
			else if(this.typeOfUpgrade == "Rays") return 3
			else if(this.typeOfUpgrade == "Range") return 50
			else if(this.typeOfUpgrade == "Fire Rate") return 4
		}
		else if(this.rarity == "Sacrifice"){
			let other = random(["Damage", "Rays", "Range", "Fire Rate"])
			while(other == this.typeOfUpgrade) other = random(["Damage", "Rays", "Range", "Fire Rate"])
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

class ChanceUpgrade{
	constructor(){
		this.rarity = this.calcularRarity()
		this.typeOfUpgrade = random(["Critic", "Chain", "Freeze", "Slowed"])
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
		if(this.rarity == "Common" || this.rarity == "Rare"){
			if(this.typeOfUpgrade == "Critic") return nexus.criticalChanceLevel * 10
			else if(this.typeOfUpgrade == "Chain") return nexus.chainChanceLevel * 15
			else if(this.typeOfUpgrade == "Freeze") return nexus.freezeChanceLevel * 7
			else if(this.typeOfUpgrade == "Slowed") return nexus.slowedChanceLevel * 10
		}
		else if(this.rarity == "Discount"){
			if(this.typeOfUpgrade == "Critic") return nexus.criticalChanceLevel * 5
			else if(this.typeOfUpgrade == "Chain") return nexus.chainChanceLevel * 7.5
			else if(this.typeOfUpgrade == "Freeze") return nexus.freezeChanceLevel * 4
			else if(this.typeOfUpgrade == "Slowed") return nexus.slowedChanceLevel * 5
		}
		else if(this.rarity == "Galactic"){
			if(this.typeOfUpgrade == "Critic") return nexus.criticalChanceLevel * 20
			else if(this.typeOfUpgrade == "Chain") return nexus.chainChanceLevel * 30
			else if(this.typeOfUpgrade == "Freeze") return nexus.freezeChanceLevel * 14
			else if(this.typeOfUpgrade == "Slowed") return nexus.slowedChanceLevel * 20
		}
		else if(this.rarity == "Sacrifice") return 0
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
			let other = random(["Critic", "Chain", "Freeze", "Slowed"])
			while(other == this.typeOfUpgrade) other = random(["Critic", "Chain", "Freeze", "Slowed"])
			this.typeOfUpgrade = [this.typeOfUpgrade, other]
			return [0.02, -0.02]
		}
	}

	exec(){
		if(this.rarity != "Sacrifice"){
			let val = this.upgradeValue
			if(this.typeOfUpgrade == "Critic"){
				nexus.criticalChance += val
				nexus.criticalChanceLevel++
			}
			else if(this.typeOfUpgrade == "Chain"){
				nexus.chainChance += val
				nexus.chainChanceLevel++
			}
			else if(this.typeOfUpgrade == "Freeze"){
				nexus.freezeChance += val
				nexus.freezeChanceLevel++
			}
			else if(this.typeOfUpgrade == "Slowed"){
				nexus.slowedChance += val
				nexus.slowedChanceLevel++
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