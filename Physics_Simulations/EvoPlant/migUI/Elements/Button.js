class Button{
	constructor(x, y, text, lightCol, darkCol,){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.textSize = text_SizeMIGUI-2
		// if((func && func.name != "retractMenu") || func == undefined) 
		// 	this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)
		// else this.text = text

		this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)

		this.beingHovered = false
		this.beingPressed = false

		textSize(this.textSize)
		this.w = textWidth(this.text) + 8

		this.h = 20

		this.length = this.w
		this.height = this.h

		this.disabled = false
		this.active = false
		this.rad = radMIGUI

		this.func = undefined
		//this.arg in button is not used
		this.arg = false

		this.corners = [this.rad, this.rad, this.rad, this.rad]
	}

	setFunc(func, arg = false){
		this.func = func
		this.arg = arg
	}

	reposition(x, y, w = undefined, h = undefined){
		this.pos = createVector(x, y)
		this.w = w || this.w
		this.h = h || this.h

		this.length = this.w
		this.height = this.h
	}

	disable(){
		this.disabled = true
	}

	enable(){
		this.disabled = false
	}

	setText(text, resize = false){
		this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)
		if(resize){
			textSize(this.textSize)
			this.w = textWidth(this.text) + 8
		}
	}


	execute(){
		if(this.func != undefined){ 
			this.func()
		}
	}

	evaluate(){
		this.beingHovered = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
		if(this.disabled) return false
		let inB = this.beingHovered
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
	
	setRoundedCorners(c1, c2, c3, c4){
		this.corners[0] = c1 ? this.rad : 0
		this.corners[1] = c2 ? this.rad : 0
		this.corners[2] = c3 ? this.rad : 0
		this.corners[3] = c4 ? this.rad : 0
	}

	show(){
		push();
		((this.beingHovered && !this.disabled) || this.active) ? strokeWeight(bordeMIGUI + 1) : strokeWeight(bordeMIGUI)
		this.disabled ? stroke(this.transCol) : stroke(this.lightCol)
		fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h, this.corners[0], this.corners[1], this.corners[2], this.corners[3])
		this.beingHovered ? fill(this.transCol) : fill(this.darkCol)
		if((this.beingHovered && mouseIsPressed) || this.active) fill(this.lightCol)
		if(this.disabled) fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h, this.corners[0], this.corners[1], this.corners[2], this.corners[3])

		noStroke()
		this.disabled ? fill(this.transCol) : fill(this.lightCol)
		if((this.beingHovered && mouseIsPressed) || this.active) fill(this.darkCol)
		textSize(this.textSize)
		textAlign(CENTER)
		text(this.text, this.pos.x + this.w/2, this.pos.y + this.h*0.75)
		//this.w = getSentenceWidth(this.text) + 8
		// fill(255, 0, 0)
		// ellipse(this.pos.x, this.pos.y, 5)
		// ellipse(this.pos.x, this.pos.y + this.height, 5)

		let hoveringBounds = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.height)
		this.readyToShow = false
		if(this.hoverText && hoveringBounds && !mouseIsPressed){
			this.hoveringCounter++
			if(this.hoveringCounter > HOVER_TIME_MIGUI){
				this.readyToShow = true
			}
		}
		else if(this.hoverText && (!hoveringBounds || mouseIsPressed)){
			this.hoveringCounter = 0
		}

		pop()
		return this.beingHovered ? this : false
	}

	setHoverText(text){
		this.hoverText = text
		this.hoveringCounter = 0
		this.readyToShow = false
	}

	showHoveredText(){
		if(!this.readyToShow) return
		showHoveredTextMIGUI(this.hoverText, this.panel)
	}
}



