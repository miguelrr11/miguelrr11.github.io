class curve{
	constructor(color){
		this.path = []
		this.cur = createVector(0,0)
		this.color = color
	}

	clear(){
		this.path = []
	}

	setX(x){
		this.cur.x = x
	}

	setY(y){
		this.cur.y = y
	}

	add(){
		this.path.push(this.cur)
		this.cur = createVector(0,0)
	}

	show(){
		push()
		strokeWeight(1)
		colorMode(HSB)
		stroke(this.color, 50, 100)
		beginShape()
		for(let p of this.path){
			vertex(p.x, p.y)
		}
		endShape()
		strokeWeight(7)
		point(this.path[this.path.length-1].x, this.path[this.path.length-1].y)
		pop()
	}
}