class car{
	constructor(x, y){
		this.fit = 0
		this.posRace = 0
		this.pos = createVector(x, y)
		this.speed = createVector(0, -2.5)
		this.speedMult = 1
		this.rays = [new border(), new border(), new border(), new border(), new border()]
		this.crashed = false
		this.body = new border(createVector(0,0), createVector(0,0))
		this.brain = undefined
		this.fin = false
	}

	update(dir, acc){
		if(dir == -1) this.speed.rotate(0.1)
		else if(dir == 1) this.speed.rotate(-0.1)
		if(acc == -1) this.speedMult--
		else if(acc == 1) this.speedMult++
		this.speedMult = constrain(this.speedMult, 0.5, 1.5)
		let newSpeed = this.speed.copy()
  		this.pos.add(newSpeed.mult(this.speedMult))
  		this.body.start = p5.Vector.add(this.pos, p5.Vector.fromAngle(this.speed.heading()).mult(10))
  		this.body.end = p5.Vector.sub(this.pos, p5.Vector.fromAngle(this.speed.heading()).mult(10))
  		this.cast()
  		this.interRays()
	}

  	show(first){
  		push()
	    noStroke()
	    if(first) fill(0, 255, 0, 200)
	    else fill(255, 0, 0, 60)
	    rectMode(CENTER)
	    translate(this.pos.x, this.pos.y)
	    rotate(this.speed.heading())
	    rect(0, 0, 30, 10)
	    pop()

	    // push()
	    // stroke(0, 255, 0)
	    // strokeWeight(5)
	    // line(this.body.start.x, this.body.start.y, this.body.end.x, this.body.end.y)
	    // pop()
  	}

  	cast(){
  		let head = p5.Vector.add(this.pos, p5.Vector.fromAngle(this.speed.heading()).mult(10))
  		let ray = p5.Vector.add(head, p5.Vector.fromAngle(this.speed.heading() + radians(-40)).mult(60))
  		this.rays[1] = (new border(head.x, head.y, ray.x, ray.y))
  		ray = p5.Vector.add(head, p5.Vector.fromAngle(this.speed.heading()).mult(60))
  		this.rays[2] = (new border(head.x, head.y, ray.x, ray.y))
  		ray = p5.Vector.add(head, p5.Vector.fromAngle(this.speed.heading() + radians(40)).mult(60))
  		this.rays[3] = (new border(head.x, head.y, ray.x, ray.y))
  		ray = p5.Vector.add(head, p5.Vector.fromAngle(this.speed.heading() + radians(85)).mult(60))
  		this.rays[4] = (new border(head.x, head.y, ray.x, ray.y))
  		ray = p5.Vector.add(head, p5.Vector.fromAngle(this.speed.heading() + radians(-85)).mult(60))
  		this.rays[0] = (new border(head.x, head.y, ray.x, ray.y))
  	}

  	showRays(){
  		for(let r of this.rays){
  			r.show()
  		}
  	}

  	interRays(){
  		if(this.crashed) return
  		push()
  		noStroke()
  		fill(0, 255, 0)
  		for(let r of this.rays){
  			let colls = []
  			for(let b of circuit){
	  			let p = b.inter(r.start, r.end)
	  			if(p){
	  				//ellipse(p.x, p.y, 15)
	  				//r.dist = dist(this.pos.x, this.pos.y, p.x, p.y)
	  				colls.push(p)
	  			}
	  			else r.dist = -60
	  			if(b.inter(this.body.start, this.body.end)) this.crashed = true
	  		}
	  		if(colls.length > 0){
	  			let col = this.getMin(colls)
	  		ellipse(col.x, col.y, 5)
	  		r.dist = dist(this.pos.x, this.pos.y, col.x, col.y)
	  		}
	  		
  		}
  		let last_check = checkpoints[checkpoints.length-1].id
  		for(let c of checkpoints){
  			if(c.inter(this.body.start, this.body.end)){
  				let index = c.id 
  				if(this.posRace == index - 1) this.posRace = index
  					if(this.posRace == last_check){ 
  						if(!this.fin){ 
  							popul.podium.push(this)
  							console.log(popul.podium)
  						}
  						this.fin = true
  						if(popul.fastestCar == undefined){ 
  							popul.fastestCar = this
  						}
  					}
  				break
  			}
  		}
  		pop()
  	}

  	getMin(arr){
  		let min = Infinity
  		let res = 0
  		for(let i = 0; i < arr.length; i++){
  			let a = arr[i]
  			if(dist(this.pos.x, this.pos.y, a.x, a.y) < min) {
  				min = dist(this.pos.x, this.pos.y, a.x, a.y)
  				res = i
  			}
  		}
  		return arr[res]
  	}

}






