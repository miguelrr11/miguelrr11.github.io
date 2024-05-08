/*
Se controla con el raton
Atrae a los enemigos y los mata instantaneamente
Con cada kill, su tamaño aumenta
Cuando llega a un determinado tamaño, explota, spawneando varios 
rayos criticos con rango infinito
*/

class BlackHole extends Nexus{
	constructor(pos){
		super()
		this.pos = pos 
		this.tam = 70
		this.range = 250

		this.pActiveMuerte = {color:['white'], 
						angle: [0, 360], 
						size: [35,40], 
						sizePercent: 0.95,
						speed: 6,
						gravity: false
					   };
	}

	update(){
		if(mouseIsPressed && dist(mouseX, mouseY, this.pos.x, this.pos.y) < this.tam){
			this.pos.x = mouseX
			this.pos.y = mouseY
		}
		

		if(this.tam >= 180) this.imploding = true

		if(this.imploding && this.tam >= 7) this.tam -= 7
		if(this.imploding && this.tam < 70) this.tam = 0
	}

	explode(){
		//this.attack(20, undefined, Infinity)
		activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 10, "#F7DDC5"))
		activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 10, "#E43F0B"))
		activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 10, "#FF8F0B"))
		activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 10, "#870200"))
	}

	discLinesEllipse(col, pos, rad, dis, offset = 0, isDotted = false, strokeW = 3) {
	    push()
	    stroke(col)
	    strokeWeight(strokeW)
	    noFill()
	    translate(pos)

	    let angleStep = TWO_PI / dis
	    let angleStep2 = TWO_PI / dis
	    let curAngleStep = offset % TWO_PI
	    let limit = TWO_PI + offset % TWO_PI
	    if(isDotted) angleStep2 = 0.000001

	    for (let i = 0; curAngleStep < limit; i++) {
	        let x1 = rad * cos(curAngleStep)
	        let y1 = rad * sin(curAngleStep)
	        curAngleStep += angleStep2
	        let x2 = rad * cos(curAngleStep)
	        let y2 = rad * sin(curAngleStep)
	        curAngleStep += angleStep
	        line(x1, y1, x2, y2)
	    }
	    pop();
	}

	show(){
		push()
		fill(0)
		noStroke()
		ellipse(this.pos.x, this.pos.y, this.tam)
		noFill()
		stroke("#F7DDC5")
		strokeWeight(2)
		ellipse(this.pos.x, this.pos.y, this.tam)

		stroke("#E43F0B")
		ellipse(this.pos.x, this.pos.y, this.tam+3)

		stroke("#FF8F0B")
		strokeWeight(3)
		ellipse(this.pos.x, this.pos.y, this.tam+5)

		stroke("#870200")
		strokeWeight(2)
		ellipse(this.pos.x, this.pos.y, this.tam+7)

		stroke("#FFCA88")
		ellipse(this.pos.x, this.pos.y, this.tam+8)

		stroke("#340002")
		strokeWeight(3)
		ellipse(this.pos.x, this.pos.y, this.tam+12)

		stroke("#FFCA88")
		strokeWeight(1)
		ellipse(this.pos.x, this.pos.y, this.tam-10)

		this.discLinesEllipse("#FF8F0B", this.pos, this.range, 100, nexus.t*6)

		pop()
	}
}