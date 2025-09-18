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
		this.w = getPixelLength(this.text, this.textSize) + 8
		this.w = constrain(this.w, 10, width_elementsMIGUI)
		this.h = 20

		this.length = this.w
		this.height = this.h

		this.disabled = false
	}

	disable(){
		this.disabled = true
	}

	enable(){
		this.disabled = false
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
		this.disabled ? stroke(this.transCol) : stroke(this.lightCol)
		fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h, radMIGUI)
		this.beingHovered ? fill(this.transCol) : fill(this.darkCol)
		if(this.beingHovered && mouseIsPressed) fill(this.lightCol)
		if(this.disabled) fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h, radMIGUI)

		noStroke()
		this.disabled ? fill(this.transCol) : fill(this.lightCol)
		if(this.beingHovered && mouseIsPressed) fill(this.darkCol)
		textSize(this.textSize)
		text(this.text, this.pos.x + bordeMIGUI+text_offset_xMIGUI, this.pos.y + this.h*0.75)

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



