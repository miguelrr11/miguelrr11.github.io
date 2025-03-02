class Button{
	constructor(x, y, text, func, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.textSize = text_SizeMIGUI-2
		if((func && func.name != "retractMenu") || func == undefined) 
			this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)
		else this.text = text

		this.beingHovered = false
		this.beingPressed = false

		this.func = func
		if((func && func.name != "retractMenu") || func == undefined){ 
			textSize(this.textSize)
			this.w = textWidth(this.text) + 8
		}
		else this.w = 20
		//this.w = constrain(this.w, 10, width_elementsMIGUI)
		this.h = 20

		this.length = this.w
		this.height = this.h

		this.disabled = false
		this.rad = radMIGUI
	}

	disable(){
		this.disabled = true
	}

	enable(){
		this.disabled = false
	}

	setText(text, resize = false){
		this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)
		// if(resize){
		// 	this.w = getPixelLength(this.text, this.textSize) + 8
		// 	this.w = constrain(this.w, 20, width_elementsMIGUI)
		// }
	}

	setFunc(func){
		this.func = func
	}

	execute(){
		if(this.func != undefined) this.func()
	}

	evaluate(){
		this.beingHovered = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
		if(this.disabled) return false
		let inB = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
		if(inB) this.beingHovered = true
		else this.beingHovered = false
		if(inB && mouseIsPressed && !this.beingPressed){ 
			this.execute()
			this.beingPressed = true
			return true
		}
		if(!mouseIsPressed){ 
			this.beingPressed = false
		}
		return false
	}

	show(){
		push()
		this.beingHovered && !this.disabled ? strokeWeight(bordeMIGUI + 1) : strokeWeight(bordeMIGUI)
		this.disabled ? stroke(200) : stroke(this.lightCol)
		fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h, this.rad)
		this.beingHovered ? fill(this.transCol) : fill(this.darkCol)
		if(this.beingHovered && mouseIsPressed) fill(this.lightCol)
		if(this.disabled) fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h, this.rad)

		noStroke()
		if(this.beingHovered && mouseIsPressed) fill(this.darkCol)
		this.disabled ? fill(200) : fill(this.lightCol)
		textSize(this.textSize)
		textAlign(CENTER)
		text(this.text, this.pos.x + this.w/2, this.pos.y + this.h*0.75)
		//this.w = getSentenceWidth(this.text) + 8
		// fill(255, 0, 0)
		// ellipse(this.pos.x, this.pos.y, 5)
		// ellipse(this.pos.x, this.pos.y + this.height, 5)

		pop()
		return this.beingHovered
	}
}



