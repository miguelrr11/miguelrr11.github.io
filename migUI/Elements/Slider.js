class Slider{
	constructor(x, y, sx, sy, min, max, origin, title, showValue = false, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.sliderPos = createVector(sx, sy)
		this.showValue = showValue
		//if(title != "" || showValue) this.sliderPos.y += 17
		this.min = min
		this.max = max
		this.origin = origin
		if(origin > max || origin < min) this.origin = ((this.max - this.min) / 2) + this.min
		this.name = title
		this.title = getClippedTextMIGUI(title, clipping_length_titleMIGUI)

		this.w = width_elementsMIGUI
		this.h = 16

		this.value = origin
		this.setValue(origin)

		this.beingHovered = false

		this.beingPressed = false

		
	}

	setValue(value){
		this.value = value
		this.value = constrain(this.value, this.min, this.max)
		this.valuePosX = mappMIGUI(this.value, this.min, this.max, this.pos.x, this.pos.x + this.w)
	}

	getValue(){
		return this.value
	}

	getBound(){
		let value, valuePosX
		if(mouseX > this.pos.x + this.w){
			value = this.max
			valuePosX = this.pos.x + this.w
		}
		else if(mouseX < this.pos.x){
			value = this.min
			valuePosX = this.pos.x
		}
		else{
			valuePosX = mouseX
			value = mappMIGUI(this.valuePosX, this.pos.x, this.pos.x+this.w, this.min, this.max)
		}
		return [value, valuePosX]
	}

	evaluate(){
		this.beingHovered = inBoundsMIGUI(mouseX, mouseY, this.sliderPos.x, this.sliderPos.y, this.w+bordeMIGUI, this.h+bordeMIGUI)
		if(!mouseIsPressed){
			this.beingPressed = false
			return false
		}
		if(!this.beingPressed && this.beingHovered && mouseIsPressed){
			this.beingPressed = true
		}
		if(this.beingPressed && mouseIsPressed) {
			[this.value, this.valuePosX] = this.getBound()
			return true
		}
		return false
	}

	show(){
		push()
		//bordeMIGUIs
		fill(this.darkCol)
		stroke(this.lightCol)
		strokeWeight(bordeMIGUI)
		rect(this.sliderPos.x, this.sliderPos.y, this.w, this.h)

		//relleno hovering
		if(this.beingHovered){
			push()
			fill(this.transCol)
			noStroke()
			let x = this.getBound()[1]
			rect(this.sliderPos.x, this.sliderPos.y, x-this.sliderPos.x, this.h)
			pop()
		}

		//relleno slider
		fill(this.lightCol)
		rect(this.sliderPos.x, this.sliderPos.y, this.valuePosX-this.sliderPos.x, this.h)


		//texto
		noStroke()
		fill(this.lightCol)
		let textToShow = this.title
		let aux
		if(this.title == "") aux = "("
		else aux = " ("
		if(this.showValue) textToShow += aux + getRoundedValueMIGUI(this.value) + ")"
		textSize(text_SizeMIGUI)
		text(textToShow, this.pos.x - bordeMIGUI, this.pos.y + this.h*0.5)

		pop()
	}
}