class Menu{
	constructor(pos, w, h){
		this.pos = pos
		this.w = w  
		this.h = h
		this.botones = []
		this.createShop()

		this.pUpgrade = {color:['white'], 
						angle: [0, 360], 
						size: [30,30], 
						sizePercent: 0.9,
						gravity: false
					   };
	}

	// llamada solo al principio, crea los primeros 3 upgrades
	createShop(){
		let u = new NexusUpgrade()
		let b = new Boton(createVector(WIDTH+10, 200), 280, 45, u)
		this.botones.push(b)
		u = new MoonUpgrade()
		b = new Boton(createVector(WIDTH+10, 280), 280, 45, u, 1)
		this.botones.push(b)
		u = new ChanceUpgrade()
		b = new Boton(createVector(WIDTH+10, 360), 280, 45, u, 4)
		this.botones.push(b)
	}

	// se llama cada vez que se realiza cualquier compra: reinicia la tienda con nuevos upgrades
	newUpgrades(){
		this.botones[0].upgrade = new NexusUpgrade()
		this.botones[1].upgrade = new MoonUpgrade()
		this.botones[2].upgrade = new ChanceUpgrade()
		
		// if(this.botones[0].upgrade instanceof NexusUpgrade) this.botones[0].upgrade = new MoonUpgrade()
		// else if(this.botones[0].upgrade instanceof MoonUpgrade) this.botones[0].upgrade = new ChanceUpgrade()
		// else this.botones[0].upgrade = new NexusUpgrade()
	}


	click(x, y){
		for(let b of this.botones){
			if(b.click(x, y)) break
		}
	}

	showPausa(){
		push()
		fill(255)
		stroke(0)
		strokeWeight(4)
		textFont('Gill Sans')
		textSize(60)
		text('PAUSE', 30, 70)
		pop()
	}

	show(){
		fill(100)
    	rect(WIDTH, 0, 300, HEIGHT)
		this.showUpgrades()
		this.showHealthAndOthers()
		this.showStats()
	}

	showHealthAndOthers(){
		push()
		translate(this.pos.x, this.pos.y)
    	//barra xp
    	fill(0, 255, 0)
    	noStroke()
    	let w = map(nexus.xp, 0, nexus.maxXp, 0, this.w-20)
    	rect(10, 70, w, 20)
    	stroke(0)
    	strokeWeight(3)
    	noFill()
    	rect(10, 70, this.w-20, 20)
    	//barra vida
    	fill(255, 0, 0)
    	noStroke()
    	w = map(nexus.health, 0, nexus.maxHealth, 0, this.w-20)
    	rect(10, 100, w, 20)
    	stroke(0)
    	strokeWeight(3)
    	noFill()
    	rect(10, 100, this.w-20, 20)
    	strokeWeight(1)

    	//texto
    	//xp
    	stroke(0)
    	fill(0)
    	textFont('Gill Sans')
		textSize(15)
		let str = "XP   " + floor(nexus.xp) + " / " + nexus.maxXp
		text(str, 30, 85)

		//vida
		str = "HP   " + floor(nexus.health) + " / " + nexus.maxHealth
		text(str, 30, 115)


		textSize(45)
		stroke(255)
		strokeWeight(4)
		str = 'LEVEL ' + nexus.nivel
		text(str, 10, 50)
		textSize(40)
		str = '$' + getSimpleInt(nexus.money)
		fill(255, 255, 0)
		stroke(0)
		strokeWeight(3)
		text(str, 10, 160)
		textSize(20)
		noStroke()
		if(frameCount%20==0) fps = floor(frameRate())
		text(fps, 270, 20)
    	pop()
	}

	showStats(){
		push()
		fill(255)
		stroke(0)
		strokeWeight(3)
		textFont('Gill Sans')
		textSize(15)
		translate(WIDTH + 25, 430)
		let Yoffset = 0
		let Xoffset = 100
		let YoffsetMult = 15

		push()
		fill(255, 255, 255, 75)
		stroke(0)
		rect(-15, -12 ,this.w-20, 320)
		pop()

		let tamTitle = 22
		let tamSub = 15

		textSize(tamTitle)
		fill(0)
		stroke(255)
		text("NEXUS STATS", 0, Yoffset += YoffsetMult)
		fill(0)
		noStroke()
		textSize(tamSub)
		text("Damage:      ", 0, Yoffset += YoffsetMult+3); text(nexus.damage, Xoffset, Yoffset)
		text("Range:       ", 0, Yoffset += YoffsetMult); text(nexus.range, Xoffset, Yoffset)
		text("Rays:        ", 0, Yoffset += YoffsetMult); text(nexus.nrays, Xoffset, Yoffset)

		if(orbit.bestMoon != undefined){
			fill(0)
			stroke(255)
			textSize(tamTitle)
			text("BEST MOON STATS", 0, Yoffset += YoffsetMult+20)
			fill(0)
			noStroke()
			textSize(tamSub)
			text("Damage:      ", 0, Yoffset += YoffsetMult+3); text(orbit.bestMoon.damage, Xoffset, Yoffset)
			text("Rays:        ", 0, Yoffset += YoffsetMult); text(orbit.bestMoon.nrays, Xoffset, Yoffset)
			text("Fire rate:   ", 0, Yoffset += YoffsetMult); text(orbit.bestMoon.cadencia, Xoffset, Yoffset)
			text("FOV:         ", 0, Yoffset += YoffsetMult); text(orbit.bestMoon.fov, Xoffset, Yoffset)
			text("Range:       ", 0, Yoffset += YoffsetMult); text(orbit.bestMoon.range, Xoffset, Yoffset)
		}
		if(nexus.nivel >= 4) this.showChances(Yoffset, Xoffset, tamTitle, YoffsetMult, tamSub)

		pop()
	}

	showChances(Yoffset, Xoffset, tamTitle, YoffsetMult, tamSub){
		push()

		fill(0)
		stroke(255)
		textSize(tamTitle)
		text("RAYS CHANCES", 0, Yoffset += YoffsetMult+20)
		fill(0)
		noStroke()
		textSize(tamSub)
		text("Chain:       ", 0, Yoffset += YoffsetMult+3);
		text(floor(nexus.chainChance*100) + "%", Xoffset, Yoffset)
		text("Critic:      ", 0, Yoffset += YoffsetMult); stroke(255, 0, 0); 
		text(floor(nexus.criticalChance*100) + "%", Xoffset, Yoffset); noStroke()
		text("Freeze:      ", 0, Yoffset += YoffsetMult); stroke(87, 219, 255); 
		text(floor(nexus.freezeChance*100) + "%", Xoffset, Yoffset); noStroke()
		text("Slow:        ", 0, Yoffset += YoffsetMult); stroke(229, 151, 233); 
		text(floor(nexus.slowedChance*100) + "%", Xoffset, Yoffset)

		pop()
	}

	showUpgrades(){
		push()
		fill(100)
    	rect(WIDTH, 0, 300, HEIGHT)
    	for(let b of this.botones) b.show()
	}
}