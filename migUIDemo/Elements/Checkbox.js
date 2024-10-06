class Checkbox{
	constructor(x, y, title, state, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.state = state
		this.name = title
		this.title = getClippedTextMIGUI(title, clipping_length_normalMIGUI)

		this.beingPressed = false

		this.beingHovered = false

		this.w = 16
		this.h = 16

		this.length = getPixelLength(this.title, text_SizeMIGUI) + this.w + 10
	}

	isChecked(){
		return this.state
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
		strokeWeight(bordeMIGUI)
		rect(this.pos.x, this.pos.y, this.w, this.h)

		noStroke()
		fill(this.lightCol)
		textSize(text_SizeMIGUI)
		text(this.title, this.pos.x + this.w + 10, this.pos.y + this.h*0.85)

		pop()
	}
}