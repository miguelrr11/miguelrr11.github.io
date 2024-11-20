class Nodo{
	constructor(){
		this.location = undefined
		this.left = undefined
		this.right = undefined
		this.axis = undefined
	}

	isLeaf(){
		return (!this.left && !this.right)
	}

	show(bool){
		fill(255, 5)
		noStroke()
		ellipse(this.location.x, this.location.y, 4)
		extraCanvas.stroke(255, 35)
		extraCanvas.stroke(255, 0, 0, 20)
		if(bool && this.axis == 0) extraCanvas.line(this.location.x, 0, this.location.x, HEIGHT)
		else if(bool && this.axis == 1) extraCanvas.line(0, this.location.y, WIDTH, this.location.y)
	}
}