class Room{
	constructor(i, j, doors, type = 'normal'){
		this.i = i
		this.j = j
		this.doors = doors
		this.type = type
	}

	showBackground(){
		let sp = tamRoom / 5

		push()
		translate(this.i * tamRoom, this.j * tamRoom)
		fill(0)
		noStroke()
		rect(-sp*0.66, -sp*0.66, sp*6.5, sp*6.3)
		pop()
	}

	show(){
		let sp = tamRoom / 5
		let c1 = createVector(sp, sp)
		let c2 = createVector(4*sp, sp)
		let c3 = createVector(4*sp, 4*sp)
		let c4 = createVector(sp, 4*sp)


		push()
		translate(this.i * tamRoom, this.j * tamRoom)
		if(this.type == '2x2p' || this.type == 'normal' || this.type == 'initial') image(images.get('1x1'), 0, 0, tamRoom, tamRoom)
		if(this.type == 'boss') image(images.get('boss'), 0, 0, tamRoom, tamRoom)
		if(this.type == 'treasure') image(images.get('treasure'), 0, 0, tamRoom, tamRoom)
		if(this.type == 'shop') image(images.get('shop'), 0, 0, tamRoom, tamRoom)
		if(this.type == 'secret') image(images.get('secret'), 0, 0, tamRoom, tamRoom)
		if(this.type == 'superSecret') image(images.get('superSecret'), 0, 0, tamRoom, tamRoom)
		if(this.type == 'curse') image(images.get('curse'), 0, 0, tamRoom, tamRoom)
		if(this.type == 'sacrifice') image(images.get('sacrifice'), 0, 0, tamRoom, tamRoom)
		if(this.type == 'library') image(images.get('library'), 0, 0, tamRoom, tamRoom)
		if(this.type == 'planetarium') image(images.get('planetarium'), 0, 0, tamRoom, tamRoom)
		if(this.type == 'challenge') image(images.get('challenge'), 0, 0, tamRoom, tamRoom)
		if(this.type == '2x2p') image(images.get('2x2'), 0, 0, tamRoom*2, tamRoom*2)
		pop()
	}

	// show(){

	// 	let sp = tamRoom / 5
	// 	let c1 = createVector(sp, sp)
	// 	let c2 = createVector(4*sp, sp)
	// 	let c3 = createVector(4*sp, 4*sp)
	// 	let c4 = createVector(sp, 4*sp)

	// 	push()
	// 	translate(this.i * tamRoom, this.j * tamRoom)
	// 	fill(100)
	// 	noStroke()
	// 	rect(c1.x, c1.y, sp*3, sp*3)
	// 	pop()

	// 	push()
	// 	translate(this.i * tamRoom, this.j * tamRoom)
	// 	stroke(255)
	// 	strokeWeight(1)
	// 	if(!this.doors.includes('N')) this.drawLine(c1, c2)
	// 	else{
	// 		let c1a = createVector(2*sp, sp)
	// 		let c1b = createVector(2*sp, 0)
	// 		let c2a = createVector(3*sp, sp)
	// 		let c2b = createVector(3*sp, 0)
	// 		this.drawLine(c1, c1a)
	// 		this.drawLine(c1a, c1b)
	// 		this.drawLine(c2b, c2a)
	// 		this.drawLine(c2a, c2)
	// 	}
	// 	if(!this.doors.includes('E')) this.drawLine(c2, c3)
	// 	else{
	// 		let c2a = createVector(4*sp, 2*sp)
	// 		let c2b = createVector(5*sp, 2*sp)
	// 		let c3a = createVector(4*sp, 3*sp)
	// 		let c3b = createVector(5*sp, 3*sp)
	// 		this.drawLine(c2, c2a)
	// 		this.drawLine(c2a, c2b)
	// 		this.drawLine(c3b, c3a)
	// 		this.drawLine(c3a, c3)
	// 	}
	// 	if(!this.doors.includes('S')) this.drawLine(c3, c4)
	// 	else{
	// 		let c3a = createVector(3*sp, 4*sp)
	// 		let c3b = createVector(3*sp, 5*sp)
	// 		let c4a = createVector(2*sp, 4*sp)
	// 		let c4b = createVector(2*sp, 5*sp)
	// 		this.drawLine(c3, c3a)
	// 		this.drawLine(c3a, c3b)
	// 		this.drawLine(c4b, c4a)
	// 		this.drawLine(c4a, c4)
	// 	}
	// 	if(!this.doors.includes('W')) this.drawLine(c4, c1)
	// 	else{
	// 		let c1a = createVector(sp, 2*sp)
	// 		let c1b = createVector(0, 2*sp)
	// 		let c4a = createVector(sp, 3*sp)
	// 		let c4b = createVector(0, 3*sp)
	// 		this.drawLine(c1, c1a)
	// 		this.drawLine(c1a, c1b)
	// 		this.drawLine(c4b, c4a)
	// 		this.drawLine(c4a, c4)
	// 	}
	// 	if(this.type == 'boss'){
	// 		fill(255, 0, 0)
	// 		noStroke()
	// 		ellipse(tamRoom/2, tamRoom/2, sp)
	// 	}
	// 	if(this.type == 'initial'){
	// 		fill(0, 255, 0)
	// 		noStroke()
	// 		ellipse(tamRoom/2, tamRoom/2, sp)
	// 	}
	// 	if(this.type == 'treasure'){
	// 		fill(255, 255, 0)
	// 		noStroke()
	// 		ellipse(tamRoom/2, tamRoom/2, sp)
	// 	}
	// 	if(this.type == 'shop'){
	// 		fill(120, 255, 0)
	// 		noStroke()
	// 		ellipse(tamRoom/2, tamRoom/2, sp)
	// 	}
	// 	pop()
	// }

	drawLine(p1, p2){
		line(p1.x, p1.y, p2.x, p2.y)
	}
}














