class Level{
	constructor(levelWalls, levelAux){
		this.levelWalls = levelWalls
		this.levelAux = levelAux
		this.walls = []
		this.water = []
		this.portals = []
		this.winds = []
		this.charges = []
		this.sand = []
		this.goalPos = createVector(0, 0)
		this.createWalls()
		this.createAux()
		this.pebbles = []
		this.createPebbles()
		//this.water = [createVector(200, 200, 25)]
	}

	restart(){
		this.createAux()
		inGoal = false
      	ballP = createVector(0,0)
      	speed = createVector(0, 0)
      	speedP = createVector(0, 0)
      	speedWind = createVector(0,0)
      	oldPos = undefined
      	moving = false
      	rBall = 6
      	powerLeft = 100
      	powerAnim = 100
      	friction = 0.98
	}

	createPebbles(){
		let def = 40
		let tamDef = WIDTH/def
		for(let i = 0; i < def; i++){
			for(let j = 0; j < def; j++){
				this.pebbles.push(createVector(i*tamDef+random(-8, 8), j*tamDef+random(-8, 8), random(0, 255)))
			}
		}
	}

	createAux(){
		let portalAux
		let windAux
		for(let p of this.levelAux){
			if(p.type == 'water'){
				this.water.push(createVector(p.x, p.y, p.z))
		  	}
		  	if(p.type == 'sand'){
				this.sand.push(createVector(p.x, p.y, p.z))
		  	}
		  	if(p.type == 'start'){
		    	ball = createVector(p.x, p.y)
		  	}
		  	if(p.type == 'end'){
		    	this.goalPos = createVector(p.x, p.y)
		  	}
		  	if(p.type == 'charge'){
		    	this.charges.push(createVector(p.x, p.y))
		  	}
		  	if(p.type == 'wind'){
		  		if(windAux == undefined) windAux = createVector(p.x, p.y)
		  		else{
		  			this.winds.push(new Wind(windAux.copy(), createVector(p.x, p.y), p.z))
		  			windAux = undefined
		  		}
		  	}
		  	if(p.type == 'portal'){
		  		if(portalAux == undefined) portalAux = createVector(p.x, p.y)
		  		else{
		  			this.portals.push(new Portal(portalAux.copy(), createVector(p.x, p.y)))
		  			portalAux = undefined
		  		}
		  	}
		}
	}

	createWalls(){
		console.log(this.levelWalls)
		for(let i = 0; i < this.levelWalls.length-2; i += 2){
			let a = this.levelWalls[i]
			let b = this.levelWalls[i+1]
			this.walls.push(new Wall(a.x, a.y, b.x, b.y, b.z))
		}
	}

	inGoal(){
		return dist(ball.x, ball.y, this.goalPos.x, this.goalPos.y) < 10
	}

	collideCharges(){
		for(let i = 0; i < this.charges.length; i++){
			let p = this.charges[i]
			if(!p) continue
			if(dist(ball.x, ball.y, p.x, p.y) < 20){
				powerLeft += 25
				powerAnim += 25
				powerLeft = constrain(powerLeft, 0, 100)
				powerAnim = constrain(powerAnim, 0, 100)
				delete this.charges[i]
			}
		}
	}

	collideWinds(){
		for(let w of this.winds){
			let res = w.collide()
			if(res) return res
		}
	}

	collidePortals(){
		for(let p of this.portals){
			let res = p.collide()
			if(res) return res
		}
	}

	collideSand(){
		for(let w of this.sand){
			if(dist(ball.x, ball.y, w.x, w.y) < (w.z/2)) return true
		}
		return false
	}


	collideWater(){
		for(let w of this.water){
			if(dist(ball.x, ball.y, w.x, w.y) < (w.z/2)) return true
		}
		return false
	}

	collide(b, sp){
		let colliding
		for(let w of this.walls){
		    colliding = isCircleIntersectingLine(b, rBall, w.a, w.b);
		    if(colliding){
		    	let wallVector = p5.Vector.sub(w.b, w.a)
			    let nor = createVector(-wallVector.y, wallVector.x).normalize()
			    let reflection = p5.Vector.sub(sp, p5.Vector.mult(nor, 2 * sp.dot(nor)))
		    	return reflection
		    }
  		}
  		return undefined
	}

	show(){
		push()
		//grass
		beginShape()
		fill(col_grass)
		noStroke()
		for(let w of this.levelWalls){
			//if(w.z == 2) continue
			if(w.z == 1) {
				endShape()
				beginShape()
			}
			else{
				vertex(w.x, w.y)
			}
		}
		endShape()
		fill(col_back)
		beginShape()
		for(let w of this.levelWalls){
			if(w.z == -1) continue
			if(w.z == 1) {
				endShape()
				beginShape()
			}
			else{
				vertex(w.x, w.y)
			}
		}
		endShape()
		pop()
		push()
		noStroke()
		fill(150)
		ellipse(this.goalPos.x, this.goalPos.y, 14, 14)
		fill(80)
		ellipse(this.goalPos.x, this.goalPos.y, 8, 8)
		noStroke()
		fill(255, 0, 0)
		beginShape()
		vertex(this.goalPos.x, this.goalPos.y-15)
		vertex(this.goalPos.x, this.goalPos.y-25)
		vertex(this.goalPos.x+15, this.goalPos.y-20)
		endShape()
		stroke(80)
		strokeWeight(3)
		line(this.goalPos.x, this.goalPos.y, this.goalPos.x, this.goalPos.y-25)
		pop()
		//pebbles
		// push()
		// noStroke()
		// for(let p of this.pebbles){ 
		// 	fill(200, p.z/2)
		// 	ellipse(p.x, p.y, 3, 3)
		// }
		// pop()
		//walls
		for(let w of this.walls){
			w.show()
		}
		push()
	    stroke(255)
	    strokeWeight(7)
	    line(0, HEIGHT, WIDTH, HEIGHT)
	    stroke(dark_orange)
	    fill(light_orange)
	    textFont(font)
	    textAlign(RIGHT)
	    textSize(55)
	    text(round(powerAnim) + "%", 160, HEIGHT+70)
	    fill(col_back)
	    strokeWeight(5)
	    rect(185, HEIGHT+20, 400, 60)
	    fill(light_orange)
	    noStroke()
	    if(powerAnim >= 1) rect(190, HEIGHT+25, map(powerAnim, 0, 100, 0, 390), 50)
	    pop()

		push()
		fill(light_blue)
		stroke(dark_blue)
		strokeWeight(7)
		for(let w of this.water){
			ellipse(w.x, w.y, w.z, w.z)
		}
		for(let w of this.sand){
			fill(light_yellow)
			stroke(dark_yellow)
			ellipse(w.x, w.y, w.z, w.z)
		}
		for(let p of this.portals){
			p.show()
		}
		for(let p of this.charges){
			if(!p) continue
			fill(dark_purple)
			stroke(light_purple)
			ellipse(p.x, p.y, 15, 15)
			strokeWeight(3)
			noFill()
			stroke(dark_purple)
			ellipse(p.x, p.y, 20, 20)
		}
		for(let w of this.winds){
			w.show()
		}
		pop()
	}
}




