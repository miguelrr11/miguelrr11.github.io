class Level{
	constructor(levelScheme){
		this.levelScheme = levelScheme
		this.goalPos = createVector(levelScheme[levelScheme.length-2].x, levelScheme[levelScheme.length-2].y)
		ball = createVector(levelScheme[levelScheme.length-3].x, levelScheme[levelScheme.length-3].y)
		this.walls = []
		this.createWalls()
		this.pebbles = []
		this.createPebbles()
		//this.water = [createVector(200, 200, 25)]
	}

	restart(){
		ball = createVector(this.levelScheme[this.levelScheme.length-3].x, this.levelScheme[this.levelScheme.length-3].y)
		inGoal = false
      	ballP = createVector(0,0)
      	speed = createVector(0, 0)
      	speedP = createVector(0, 0)
      	oldPos = undefined
      	moving = false
      	rBall = 5
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

	createWalls(){
		console.log(this.levelScheme)
		let points = this.levelScheme.slice(0, -3)
		for(let i = 0; i < points.length - 2; i += 2){
			let a = points[i]
			let b = points[i+1]
			this.walls.push(new Wall(a.x, a.y, b.x, b.y))
		}
	}

	inGoal(){
		return dist(ball.x, ball.y, this.goalPos.x, this.goalPos.y) < 10
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
		for(let w of this.walls){
			vertex(w.a.x, w.a.y)
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
		// push()
		// noStroke()
		// fill(3, 182, 252)
		// ellipse(this.water[0].x, this.water[0].y, this.water[0].z*2, this.water[0].z*2)
		// pop()
	}
}




