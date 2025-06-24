class Checkbox{
	constructor(x, y, title, state,  lightCol, darkCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.state = state
		this.name = title
		//this.title = getClippedTextMIGUI(title, clipping_length_normalMIGUI)
		this.title = title
		this.func = undefined
		this.arg = false
		this.textSize = text_SizeMIGUI-1

		this.beingPressed = false
		this.beingHovered = false

		this.w = 16
		this.h = 16

		textSize(this.textSize)
		this.length = textWidth(this.title)
		this.height = this.h

		this.rad = radMIGUI
	}

	setFunc(func, arg = true){
		this.func = func
		this.arg = arg
	}

	reposition(x, y, w = undefined, h = undefined){
		this.pos = createVector(x, y)
		this.w = w || this.w
		this.h = h || this.h
		
		this.height = this.h
	}

	execute(){
		if(this.func) this.arg ? this.func(this.state) : this.func()
	}

	isChecked(){
		return this.state
	}

	setChecked(bool){
		this.state = bool
	}

	toggle(){
		this.state = !this.state
	}

	evaluate(){
		let inB = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w+bordeMIGUI, this.h+bordeMIGUI)
		if(inB) this.beingHovered = true
		else this.beingHovered = false
		if(inB && mouseIsPressed && !this.beingPressed){ 
			this.toggle()
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
		!this.state ? fill(this.darkCol) : fill(this.lightCol)
		if(!this.state && this.beingHovered) fill(this.transCol)
		stroke(this.lightCol)
		this.beingHovered ? strokeWeight(bordeMIGUI + 1) : strokeWeight(bordeMIGUI)
		rect(this.pos.x, this.pos.y, this.w, this.h, this.rad)

		noStroke()
		fill(this.lightCol)
		textSize(this.textSize)
		text(this.title, this.pos.x + this.w + 10, this.pos.y + this.h*0.8)
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