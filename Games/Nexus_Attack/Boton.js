class Boton{
	constructor(a, w, h, upgrade, locked){
		this.a = a 		   											//esquina xy 1
		this.b = createVector(this.a.x + w, this.a.y + h) 			//esquina xy 2
		this.w = w 
		this.h = h
		this.upgrade = upgrade
		if(locked) this.locked = locked
	}

	isHovering(){
		return (mouseX <= this.b.x && mouseX >= this.a.x && mouseY <= this.b.y && mouseY >= this.a.y)
	}

	isAffordable(){
		return nexus.money >= this.upgrade.price
	}

	isLocked(){
		return this.locked != undefined && this.locked > nexus.nivel
	}

	click(){
		if(this.isHovering() && nexus.money >= this.upgrade.price){
			if(this.isLocked()) return
			if(this.upgrade instanceof MoonUpgrade && orbit.moons.length == 0) return

			nexus.money -= this.upgrade.price
			if(this.upgrade.price > 0){
				let x = random(40+menu.pos.x-10, 40+menu.pos.x+10)
				let y = random(160+menu.pos.y-5, 160+menu.pos.y+5)
				activeAnimMenu.push(new TextAnimation("-" + round(this.upgrade.price,2), createVector(x,y), 40, color(255, 255, 0)))
			}
			
			
			this.upgrade.exec()
			menu.newUpgrades()

			this.showSale()
		}
	}

	// animacion particulas cuando se compra
	showSale(){
		let col = getFill(this.upgrade.rarity)
		for(let i = this.a.x+20; i < this.a.x+this.w-20; i += 3){
			let y = this.a.y+random(0,this.h)
			activeAnimMenu.push(new Animation(menu.pUpgrade, createVector(i, y), 0.01, col))
		}
		
	}

	//upgrade está bloqueado
	showLocked(){
		let strokeCol = getStroke("Common")
		let fillCol = getFill("Common")
		let fillColTrans = getFillTrans("Common")
		push()
		textFont('Gill Sans')
		textSize(17)

		stroke(strokeCol)
		strokeWeight(3)
		fill(fillCol)
		translate(this.a.x, this.a.y)
		rect(0,0,this.w,this.h)

		stroke(strokeCol)
		strokeWeight(3)
		fill(fillColTrans)
		if(this.upgrade instanceof NexusUpgrade) text("NEXUS Upgrade ", 0, -10)
		else if(this.upgrade instanceof MoonUpgrade) text("MOONS Upgrade ", 0, -10)
		else if(this.upgrade instanceof ChanceUpgrade) text("RAYS Upgrade ", 0, -10)

		fill(fillColTrans)
		strokeWeight(4)
		textSize(30)

		push()
			//stroke(fillColTrans)
			noStroke()
			fill(fillColTrans)	
			text("UNLOCK IN LV:  " + this.locked, 12, this.h/2 + 12)
		pop()
		//text("UNLOCK IN LV:  " + this.locked, 10, this.h/2 + 10)
		pop()
	}

	show(){
		if(this.isLocked()){ 
			this.showLocked()
			return
		}
		let strokeCol = getStroke(this.upgrade.rarity)
		let fillCol = getFill(this.upgrade.rarity)
		let fillColTrans = getFillTrans(this.upgrade.rarity)
		push()
		textFont('Gill Sans')
		textSize(17)

		stroke(strokeCol)
		strokeWeight(3)
		if(!this.isHovering()) fill(fillCol)
		else fill(fillColTrans)
		translate(this.a.x, this.a.y)
		rect(0,0,this.w,this.h)

		stroke(strokeCol)
		strokeWeight(3)
		fill(fillColTrans)
		if(this.upgrade instanceof NexusUpgrade) text("NEXUS Upgrade: " + this.upgrade.rarity, 0, -10)
		else if(this.upgrade instanceof MoonUpgrade) text("MOONS Upgrade: " + this.upgrade.rarity, 0, -10)
		else if(this.upgrade instanceof ChanceUpgrade) text("RAYS Upgrade: " + this.upgrade.rarity, 0, -10)

		fill(fillColTrans)
		strokeWeight(4)
		textSize(30)
		let val = 0  
		if(this.upgrade instanceof ChanceUpgrade) val = this.upgrade.upgradeValue * 100
			else val = this.upgrade.upgradeValue
		if(this.upgrade.rarity != "Sacrifice"){
			push()
				stroke(fillColTrans)
				fill(fillColTrans)	
				text(this.upgrade.typeOfUpgrade.toUpperCase(), 12, this.h/2 + 12)
			pop()
			text(this.upgrade.typeOfUpgrade.toUpperCase(), 10, this.h/2 + 10)
			if(this.upgrade instanceof ChanceUpgrade){ 
				push()
					fill(fillColTrans)	
					stroke(fillColTrans)
					text("+" + val + "%", 152, this.h/2 + 12)
				pop()
				text("+" + val + "%", 150, this.h/2 + 10)

			}
				else{ 
					push()
						fill(fillColTrans)	
						stroke(fillColTrans)
						text("+" + val, 152, this.h/2 + 12)
					pop()
					text("+" + val, 150, this.h/2 + 10)
				}

			translate(220, 0)
			if(this.isAffordable()) fill(255, 255, 0)
				else fill(fillColTrans)
			if(this.upgrade.rarity == "Galactic" && this.isAffordable()) stroke(0)
			push()
				fill(fillColTrans)	
				stroke(fillColTrans)
				if(this.isAffordable()){
					fill(255, 255, 0, 150)	
					stroke(255, 255, 0, 150)
				}
				text("$" + this.upgrade.price, 2, this.h/2 + 12)
			pop()
			text("$" + this.upgrade.price, 0, this.h/2 + 10)
		}
		//sacrificio
		else{
			let val1, val2
			if(this.upgrade instanceof ChanceUpgrade) {val1 = this.upgrade.upgradeValue[0] * 100; val2 = this.upgrade.upgradeValue[1] * 100; }
			else {val1 = this.upgrade.upgradeValue[0]; val2 = this.upgrade.upgradeValue[1] }
			fill(fillColTrans)
			textSize(22)
			if(!(this.upgrade instanceof ChanceUpgrade)){
				push()
					fill(fillColTrans)	
					stroke(fillColTrans)
					text(this.upgrade.typeOfUpgrade[0].toUpperCase() + "  +" + val1 + "  " +
					this.upgrade.typeOfUpgrade[1].toUpperCase() + "   " + val2, 12, this.h/2 + 10)
				pop()
				text(this.upgrade.typeOfUpgrade[0].toUpperCase() + "  +" + val1 + "  " +
				this.upgrade.typeOfUpgrade[1].toUpperCase() + "   " + val2, 10, this.h/2 + 8)
			}
			else {
				push()
					fill(fillColTrans)	
					stroke(fillColTrans)
					text(this.upgrade.typeOfUpgrade[0].toUpperCase() + "  +" + val1 + "% " +
							this.upgrade.typeOfUpgrade[1].toUpperCase() + "   " + val2 + "%", 12, this.h/2 + 10)
				pop()
				text(this.upgrade.typeOfUpgrade[0].toUpperCase() + "  +" + val1 + "% " +
							this.upgrade.typeOfUpgrade[1].toUpperCase() + "   " + val2 + "%", 10, this.h/2 + 8)
			}
		}
		

		pop()
	}


	// show(){
	// 	textFont('Gill Sans')
	// 	textSize(14)
	// 	let w = this.b.x-this.a.x  
	// 	let h = this.b.y-this.a.y
	// 	push()
	// 	rectMode(CORNERS)
	// 	strokeWeight(2)
	// 	stroke(255)
	// 	fill(50)
	// 	if(this.isHovering()) rect(this.a.x-5, this.a.y-5, this.b.x+5, this.b.y+5)
	// 	else rect(this.a.x, this.a.y, this.b.x, this.b.y)
	// 	fill(255)
	// 	noStroke()
	// 	let str = this.text + "" + this.getVal()
	// 	text(str, this.a.x + 8, this.a.y + h/3)

	// 	textSize(23)
	// 	str = 'UPGRADE: $' + getSimpleInt(this.price)
	// 	if(nexus.money >= this.price) fill(255, 255, 0)
	// 	else fill(255, 255, 255, 150)
	// 	stroke(0)
	// 	strokeWeight(3)
	// 	text(str, this.a.x + 8, this.a.y + h/1.2)

	// 	pop()
	// }

}