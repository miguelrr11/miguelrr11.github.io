class Wall{
	constructor(ax, ay, bx, by, isLast){
		this.a = createVector(ax, ay)
		this.b = createVector(bx, by)
		this.isLast = isLast 
	}

	show(){
		push()
		stroke(col_wall)
		strokeWeight(8)
		line(this.a.x, this.a.y, this.b.x, this.b.y)
		pop()
	}
}