const RADIUS_PARTICLE = 5
const MAX_RADIUS_PARTICLE = 10
const minDistanceGrowSq = 50 * 50

class Particle{
	constructor(x, y, pinned, id, str = '', parent){
		this.pos = createVector(x, y)
		this.prevPos = createVector(x, y)
		this.acc = createVector(0, 0)
		this.isPinned = pinned
		this.id = id
		this.radius = RADIUS_PARTICLE
		this.link = str
		this.str = removeBarrabaja(getLastPartOfLink(decodeURIComponent(str)))
		this.parent = parent
		this.angle = 0
		this.isParent = false
		this.color = color(255)
		this.siblings = []
		this.sqRadius = this.radius * this.radius
		this.constraint = undefined
		this.relations = []
		this.children = []
	}

	removeInertia(){
		this.prevPos = this.pos.copy()
		this.acc = createVector(0, 0)
	}

	applyForce(force){
		if(!this.isPinned) this.acc.add(force)
	}

	getRelativePos(x, y){
		let worldX = (x - xOff) / zoom;
		let worldY = (y - yOff) / zoom;
		return createVector(worldX, worldY);
	}

	getEdges(){
		let minX = (0 - xOff) / zoom
		let maxX = (WIDTH - xOff) / zoom
		let minY = (0 - yOff) / zoom
		let maxY = (HEIGHT - yOff) / zoom
		return [
			minX,
			maxX,
			minY,
			maxY
		]
	}


	update(timeStep){
		// verlet intergration
        if (!this.isPinned) {
        	let vel = p5.Vector.sub(this.pos, this.prevPos).mult(0.97)
			this.prevPos = this.pos.copy()
			this.pos.add(p5.Vector.add(vel, this.acc.copy().mult(timeStep * timeStep)))
			this.acc = createVector(0, 0)
        }
		let mousePos = this.getRelativePos(mouseX, mouseY)
		//ellipse(mousePos.x, mousePos.y, 10)   //for debugging
		//let mouseInside = dist(mousePos.x, mousePos.y, this.pos.x, this.pos.y) < this.radius
		let sqDist = squaredDistance(mousePos.x, mousePos.y, this.pos.x, this.pos.y)
		let sqDistParent = 0
		if(this.parent) sqDistParent = squaredDistance(mousePos.x, mousePos.y, this.parent.pos.x, this.parent.pos.y)
		let mouseInside = sqDist < this.sqRadius
        if(((mouseInside && mouseIsPressed) || (draggedParticle == this && mouseIsPressed)) && (draggedParticle == null || draggedParticle == this)){
        	this.pos.x = mousePos.x
        	this.pos.y = mousePos.y
			draggedParticle = this
        }
		this.hovered = mouseInside
		if(this.hovered) hoveredParticle = this
		else if(hoveredParticle == this) hoveredParticle = null

		if(this.parent) this.angle = atan2(this.pos.y - this.parent.pos.y, this.pos.x - this.parent.pos.x)
		else return

		let constrain = this.constraint
		if(sqDist < minDistanceGrowSq && sqDistParent > constrain.baseLengthSq - this.radius / 2){
			this.radius = mapp(sqDist, 0, minDistanceGrowSq, MAX_RADIUS_PARTICLE, RADIUS_PARTICLE)
			this.sqRadius = this.radius * this.radius
			//find the constrain of this particle
			constrain.initialLength = mapp(sqDist, 0, minDistanceGrowSq, constrain.baseLength + 10, constrain.baseLength)
		}
		else{ 
			this.radius = RADIUS_PARTICLE
			this.sqRadius = this.radius * this.radius
			constrain.initialLength = constrain.baseLength
		}
	}

	repel(particles, separationDistance = this.radius*2 + 50) {
		if(this.isPinned) return
		particles.forEach(other => {
			if (other !== this) {
				let diff = p5.Vector.sub(this.pos, other.pos);
				let distance = diff.mag();

				if (distance < separationDistance) {
					if(distance == 0) distance = 0.1
					// Normalize and scale the force so that closer particles are pushed away stronger
					let strength = (separationDistance - distance) / separationDistance; // 0-1 strength
					diff.normalize();
					diff.mult(strength*5);
					this.applyForce(diff);
				}
			}
		});
	}

	show(bool = false){
		// //if its out of the screen, dont show it, doesnt work
		// let actualPos = this.getRelativePos(this.pos.x, this.pos.y)
		// // let minX = this.getRelativePos(0, 0).x - this.radius - xOff / zoom
		// // let maxX = this.getRelativePos(WIDTH, 0).x + this.radius - xOff / zoom
		// // let minY = this.getRelativePos(0, 0).y - this.radius - yOff / zoom
		// // let maxY = this.getRelativePos(0, HEIGHT).y + this.radius - yOff / zoom
		// let [minX, maxX, minY, maxY] = this.getEdges()
		// let out = actualPos.x < minX || actualPos.x > maxX || actualPos.y < minY || actualPos.y > maxY
		// if(out){
		// 	return 
		// }
		push()
		fill(this.color)
		stroke(50)
		strokeWeight(2)
		let rad = bool ? this.radius * 2.5 : this.radius * 2
		ellipse(this.pos.x, this.pos.y, rad)
		if(this.isParent || bool){
			strokeWeight(1.5)
			textSize(17)
			textAlign(CENTER, CENTER)
			let w = textWidth(this.str)
			let h = textHeight()
			rectMode(CENTER)
			fill(50, 50, 50, 150)
			noStroke()
			rect(this.pos.x, this.pos.y + 20, w + 10, h + 10, 7)
			fill(this.color)
			stroke(50, 125)
			text(this.str, this.pos.x, this.pos.y + 20)
			gradientCircle(this.pos.x, this.pos.y, this.radius, [this.color, color(255, 255, 255, 150)])
		}
		pop()
		return 
	}

	showCircleHovered(){
		gradientCircle(this.pos.x, this.pos.y, this.radius, [this.color, color(255, 255, 255, 150)])
	}

	//shows lines between particles with the same link as this one
	showRelations(){
		push()
		let trans = color(0, 0, 0, 100)
		if(!this.isParent){
			strokeWeight(1.5)
			this.relations = findAllParticlesByLink(this.link)
			for(let rel of this.relations){
				if(rel == this) continue
				let relPos = rel.pos
				let thisPos = this.pos
				gradientLine(thisPos.x, thisPos.y, relPos.x, relPos.y, [this.color, trans, trans, rel.color])
			}
		}
		else{
			//calls recursively to show all relations of the siblings
			for(let child of this.children){
				child.showRelations()
			}
		}
		pop()
	}

	showRelationsCircles(){
		push()
		for(let rel of this.relations){
			rel.showCircleHovered()
		}
		if(this.isParent){
			for(let child of this.children){
				child.showRelationsCircles()
			}
		}
		pop()
	}
}

function textHeight() {
    return textAscent() + textDescent();
}

function gradientCircle(x, y, r, colors) {
    let ctx = this.drawingContext;
    let grad = ctx.createRadialGradient(x, y, 0, x, y, r);

    for (let i = 0; i < colors.length; i++) {
        grad.addColorStop(i / (colors.length - 1), colors[i]);
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TWO_PI);
    ctx.fill();
}


