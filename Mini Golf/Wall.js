class Wall{
	constructor(ax, ay, bx, by){
		this.a = createVector(ax, ay)
		this.b = createVector(bx, by)
	}

	show(){
		push()
		stroke(col_wall)
		strokeWeight(5)
		line(this.a.x, this.a.y, this.b.x, this.b.y)
		pop()
	}
}