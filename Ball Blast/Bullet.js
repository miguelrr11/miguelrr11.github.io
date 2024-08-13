class Bullet{
	constructor(x, y, speed, damage){
		this.x = x
		this.y = y
		this.speed = speed
		this.damage = damage
	}

	updatePos(){
		this.x += this.speed.x
		this.y += this.speed.y
	}

	show(){
		push()
		let tam = map(this.damage, 1, 10, 10, 25)
		fill(255)
		ellipse(this.x, this.y, tam, tam)
		pop()
	}
}