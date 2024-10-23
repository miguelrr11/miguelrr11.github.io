class Constraint{
	constructor(p1, p2){
		this.p1 = p1
		this.p2 = p2
		this.initialLength = hypot(p2.pos.x - p1.pos.x, p2.pos.y - p1.pos.y)
		this.active = true
		this.currentLength = undefined
	}

	satisfy(){
		if(!this.active) return

	    let delta = p5.Vector.sub(this.p2.pos, this.p1.pos)
	    this.currentLength = delta.mag()
	    let difference = (this.currentLength - this.initialLength) / this.currentLength
	    let correction = delta.copy().mult(0.5 * difference)

	    if (!this.p1.isPinned) {
	        this.p1.pos.add(correction);
	    }

	    if (!this.p2.isPinned) {
	        this.p2.pos.sub(correction);
	    }
	}

	deactivate(){
		this.active = false
	}

	show(){
		if(!this.active) return
		if(panel_color_cb.isChecked()){
			stroke(360, mapp(this.currentLength, REST_DISTANCE, REST_DISTANCE * 2, 0, 100), 100)
			let weight = mapp(this.currentLength, REST_DISTANCE, REST_DISTANCE * 2, .8, 3)
			if(weight > 3) weight = 3
			strokeWeight(weight)
		}
		line(this.p1.pos.x, this.p1.pos.y, this.p2.pos.x, this.p2.pos.y)
	}
}