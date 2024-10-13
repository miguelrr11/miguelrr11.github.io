class Button{
	constructor(x, y, text, func, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.textSize = text_SizeMIGUI-2
		if(func && func.name != "retractMenu") this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)
		else this.text = text

		this.beingHovered = false
		this.beingPressed = false

		this.func = func
		this.w = getPixelLength(this.text, this.textSize) + 24
		this.w = constrain(this.w, 10, width_elementsMIGUI)
		this.h = 20

		this.length = this.w
		this.height = this.h
	}

	setText(text){
		this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)
		this.w = getPixelLength(this.text, this.textSize) + 8
		this.w = constrain(this.w, 20, width_elementsMIGUI)
	}

	setFunc(func){
		this.func = func
	}

	execute(){
		if(this.func != undefined) this.func()
	}

	evaluate(){
		this.beingHovered = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
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
		this.beingHovered ? strokeWeight(bordeMIGUI + 1) : strokeWeight(bordeMIGUI)
		stroke(this.lightCol)
		fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h)
		this.beingHovered ? fill(this.transCol) : fill(this.darkCol)
		if(this.beingHovered && mouseIsPressed) fill(this.lightCol)
		rect(this.pos.x, this.pos.y, this.w, this.h)

		noStroke()
		fill(this.lightCol)
		if(this.beingHovered && mouseIsPressed) fill(this.darkCol)
		textSize(this.textSize)
		text(this.text, this.pos.x + bordeMIGUI+text_offset_xMIGUI, this.pos.y + this.h*0.75)

		// fill(255, 0, 0)
		// ellipse(this.pos.x, this.pos.y, 5)
		// ellipse(this.pos.x, this.pos.y + this.height, 5)

		pop()
	}
}



