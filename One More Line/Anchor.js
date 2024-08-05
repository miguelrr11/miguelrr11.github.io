class Anchor{
	constructor(pos, rad, tam){
		this.pos = pos
		this.rad = rad
		this.tam = tam
		this.col = random(0, 360)
	}

	getNewSpeed(){
		get_angle(player.x, player.y, this.pos.x, this.pos.y)
		let distance = dist(player.x, player.y, this.pos.x, this.pos.y)
		  
		let vel = 8
		speed.x = -distance * sin(angle)
		speed.y = distance * cos(angle) 
		speed.normalize()
		speed.mult(vel)
		if(c>0) speed.mult(-1)
	}

	checkCollision(){
		let d = dist(player.x, player.y, this.pos.x, this.pos.y)
	    if(d < this.tam - 10) noLoop()
	}

}