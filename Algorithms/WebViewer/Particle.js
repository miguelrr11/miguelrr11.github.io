const RADIUS_PARTICLE = 5
const MAX_RADIUS_PARTICLE = 10
const minDistanceGrowSq = 50 * 50

class Particle{
	constructor(x, y, pinned, id, str = '', parent, ctx = undefined){
		this.pos = createVector(x, y)
		this.prevPos = createVector(x, y)
		this.acc = createVector(0, 0)
		this.isPinned = pinned
		this.id = id
		this.radius = RADIUS_PARTICLE
		this.link = str
		this.ctx = ctx
		this.str = removeBarrabaja(getLastPartOfLink(decodeURIComponent(str)))
		this.plainStr = undefined
		this.parent = parent
		this.angle = 0
		this.isParent = false
		this.isImage = false
		this.color = color(255)
		this.siblings = []
		this.sqRadius = this.radius * this.radius
		this.constraint = undefined
		this.relations = []
		this.children = []
		this.out = false
		this.image = undefined
	}

	setImage(){
		this.isImage = true
		if(this.link) this.image = loadImage(this.link)
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

	setOut(){
		let [minX, maxX, minY, maxY] = currentEdges
		let r = this.radius + 50
		this.out = this.pos.x < minX - r ||
		this.pos.x > maxX + r || 
		this.pos.y < minY - r || 
		this.pos.y > maxY + r
	}

	update(sqTimeStep){
		// verlet intergration
		if(this.out){
			this.removeInertia()
			return
		}
        if (!this.isPinned) {
        	let vel = p5.Vector.sub(this.pos, this.prevPos).mult(0.97)
			this.prevPos = this.pos.copy()
			this.pos.add(p5.Vector.add(vel, this.acc.copy().mult(sqTimeStep)))
			this.acc = createVector(0, 0)
        }
	}

	updateHovering(){
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

		if(mouseIsPressed) return
		let constrain = this.constraint
		if(!constrain) return
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
		if(this.out){
			this.removeInertia()
			return
		}
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

	show(bool = false, trans = false){
		if(this.out){
			return 
		}
		push()
		let fillCol = dupeColorArr(this.color);
		let strokeCol = [...curCol.partStroke]
		if (trans) {
			fillCol[3] = 0.15
			strokeCol[3] = 0.15
		}
		else{ 
			fillCol[3] = 1;
		}
		let rad = bool ? this.radius * 2.5 : this.radius * 2;
		customCircle(this.pos.x, this.pos.y, rad / 2, strokeCol, fillCol, 2)
		
		if((this.isParent || bool)){
			this.showCircleHovered()
			this.showText(bool)
		}
		pop()
		return 
	}

	showText(doNotShorten, defSize = false){
		if((hoveredParticle && hoveredParticle != this && !mouseIsPressed) ) return
		let yOff = 10
		strokeWeight(1.5)
		let m = worldToCanvas(mouseX, mouseY)
		let d = squaredDistance(m.x, m.y, this.pos.x, this.pos.y)
		let transRect = 200
		let transText = 255
		textSize(mapp(d, 0, 40000, 12 / zoom, 10 / zoom))
		if(d > 40000){
			transRect = mapp(d, 40000, 90000, 200, 0)
			transText = mapp(d, 40000, 90000, 255, 0)
		}
		if(defSize){ 
			textSize(9 / zoom)
			transRect = 200
			transText = 255
		}
		if(transRect > 5){
			textAlign(CENTER, CENTER)
			let str = doNotShorten ? this.str : shortenStr(this.str)
			let w = textWidth(str)
			let h = textHeight(str) * .8
			rectMode(CENTER)
			fill(curCol.partFillRectText, transRect)
			noStroke()
			rect(this.pos.x, this.pos.y + yOff, w + offsetsText[0], h + offsetsText[0], offsetsText[1])
			let col = dupeColor(curCol.partTextStroke)
			col.setAlpha(transText)
			fill(col)
			text(str, this.pos.x, this.pos.y + yOff)
		}
	}

	showCircleHovered(){
		// fill(this.color)
		// noStroke()
		// circle(this.pos.x, this.pos.y, this.radius * 2)
		gradientCircle(this.pos.x, this.pos.y, this.radius, [this.color, this.color, this.color, color(255, 150)])
	}

	//shows lines between particles with the same link as this one
	showRelations(){
		push()
		if(!this.isParent){
			strokeWeight(1.5)
			this.relations = findAllParticlesByLink(this.link)
			let col1 = dupeColor(this.color)
			col1.setAlpha(155)
			let col1trans = dupeColor(this.color)
			col1trans.setAlpha(30)
			for(let rel of this.relations){
				if(rel == this) continue
				let col2 = dupeColor(rel.color)
				col2.setAlpha(155)
				let col2trans = dupeColor(rel.color)
				col2trans.setAlpha(30)
				gradientLine(this.pos.x, this.pos.y, rel.pos.x, rel.pos.y, [col1, col1trans, col2trans, col2])
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
			if(rel != this && rel != hoveredParticle && mouseIsPressed) rel.showText(false, true)
		}
		if(this.isParent){
			for(let child of this.children){
				if(child.relations.length > 1 || child.isParent){
					child.showRelationsCircles()
				}
			}
		}
		pop()
	}

	showWin(){
		push()
		this.radius += Math.sin(frameCount / 5) * 2
		this.radius = constrain(this.radius, RADIUS_PARTICLE/2, MAX_RADIUS_PARTICLE)
		this.show()
		gradientCircle(this.pos.x, this.pos.y, this.radius, [this.color, color(255, Math.abs(Math.sin(frameCount / 5) * 150))])
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

function dupeColor(col){
	return color(col.levels[0], col.levels[1], col.levels[2], col.levels[3])
}

function dupeColorArr(col){
	return [col.levels[0], col.levels[1], col.levels[2], col.levels[3]]
}

function customCircle(x, y, r, strokeCol, fillCol, strokeW = 1){
	ctx.fillStyle = `rgba(${fillCol.join(",")})`;
	ctx.strokeStyle = `rgba(${strokeCol.join(",")})`;
	ctx.lineWidth = strokeW;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, TWO_PI);
	ctx.fill();
	ctx.stroke();
}

function customLine(x1, y1, x2, y2, strokeCol, strokeW = 1){
	ctx.strokeStyle = `rgba(${strokeCol.join(",")})`;
	ctx.lineWidth = strokeW;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
	ctx.closePath();
}

function getRelativePos(x, y){
	let worldX = (x - xOff) / zoom;
	let worldY = (y - yOff) / zoom;
	return createVector(worldX, worldY);
}