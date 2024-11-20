class Ball{
	constructor(pos, conn){
		this.pos = pos
		this.conn = conn
		this.vel = createVector(0, 0)
		this.resting = 175
	}

	update(){
		let force = p5.Vector.sub(this.pos, this.conn.pos)
	    let x = force.mag() - this.resting
	    force.normalize()
	    force.mult(-k*x)
	    
	    this.vel.add(force)
	    this.vel.add(g)
	    this.pos.add(this.vel)
	    this.vel.mult(0.99)
	}

	show(){
		fill(0)
		ellipse(this.pos.x, this.pos.y, 50)
	}
}