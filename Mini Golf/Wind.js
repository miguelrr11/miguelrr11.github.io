/*
north - 1
east - 2
south - 3
west - 4
*/

class Wind{
	constructor(a, b, dir){
		this.a = a  
		this.b = b  
		this.w = b.x - a.x
  	this.h = b.y - a.y
		this.dir = dir
		this.particles = []
		this.n = floor(map(this.w*this.h, 0, 360000, 0, 300))
		for(let i = 0; i < this.n; i++){
		  this.spawnParticle(true)
		}
	}

	collide(){
		if(ball.x <= this.b.x && ball.x >= this.a.x && ball.y <= this.b.y && ball.y >= this.a.y)
		return this.dir
	}

	spawnParticle(bool){
	  if(this.dir == 4 || this.dir == 2){
	    let yAux = random(this.a.y, this.b.y)
	    let xAux
	    if(bool) xAux = random(this.a.x, this.b.x)
	    else if(this.dir == 2) xAux = this.a.x
	    else if(this.dir == 4) xAux = this.b.x
	    let speed
	    if(this.dir == 2) speed = createVector(random(1.6, 3.5), 0)
	    else if(this.dir == 4) speed = createVector(-random(1.6, 3.5), 0)
	    let life = map(this.w, 0, 600, 0, 200)
	    if(bool){
	      let res = map(xAux, this.a.x, this.b.x, 0, life)
	      life -= res
	    }
	    this.particles.push({'a': createVector(xAux, yAux), 
	    										 'b': createVector(xAux - random(10, 50), yAux), 
	    										 'speed': speed, 
	    										 'life': life})
	  }
	  else{
	    let xAux = random(this.a.x, this.b.x)
	    let yAux
	    if(bool) yAux = random(this.a.y, this.b.y)
	    else if(this.dir == 1) yAux = this.b.y
	    else if(this.dir == 3) yAux = this.a.y 
	    let speed 
	    if(this.dir == 1) speed = createVector(0, -random(1.6, 3.5))
	    else if(this.dir == 3) speed = createVector(0, random(1.6, 3.5))
	    let life = map(this.h, 0, 600, 0, 200)
	    if(bool){
	      let res = map(yAux, this.a.y, this.b.y, 0, life)
	      life = res
	    }
	    this.particles.push({'a': createVector(xAux, yAux), 
	    										 'b': createVector(xAux, yAux - random(10, 50)), 
	    										 'speed': speed, 
	    										 'life': life})
	  }
	}

	show(){
		push()
		rectMode(CORNERS)
	  noFill()
	  stroke(255, 150)
	  strokeWeight(4)
	  for(let i = 0; i < this.particles.length; i++){
	    let p = this.particles[i]
	    let col
	    if(p.life > 60) col = map(p.life, 80, 60, 0, 150)
	    else if(p.life < 15) col = map(p.life, 15, 0, 150, 0)
	    else col = 150
	  	stroke(255, col)
	    line(p.a.x, p.a.y, p.b.x, p.b.y)
	    p.a.add(p.speed)
	    p.b.add(p.speed)
	    p.life--
	    if(p.life <= 0){
	      this.particles.splice(i, 1)
	      this.spawnParticle()
	    }
	  }
		pop()
	}

}











