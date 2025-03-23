class Slider{
	constructor(x, y, sx, sy, min, max, origin, title, showValue, lightCol, darkCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.sliderPos = createVector(sx, sy)
		this.showValue = showValue
		this.min = min
		this.max = max
		this.origin = origin
		if(origin > max || origin < min) this.origin = ((this.max - this.min) / 2) + this.min
		this.name = title
		this.title = getClippedTextMIGUI(title, 50)
		this.func = undefined
		this.arg = false

		this.w = width_elementsMIGUI
		this.h = 12

		this.rad = radMIGUI

		this.height = this.h + 1
		this.height += (this.showValue || this.title) != "" ? 17 : 0

		this.value = origin
		this.setValue(origin)

		this.beingHovered = false
		this.beingPressed = false		
	}

	setFunc(func, arg = false){
		this.func = func
		this.arg = arg
	}

	execute(){
		if(this.func) this.arg ? this.func(this.value) : this.func()
	}

	reposition(x, y, w = undefined, h = undefined){
		this.pos = createVector(x, y)
		this.sliderPos = createVector(x, y)
		this.w = w || this.w
		this.h = h || this.h
		this.setValue(this.value)
		this.height = this.h + 1
		this.height += (this.showValue || this.title) != "" ? 17 : 0
	}

	setValue(value){
		if(isNaN(value)) value = 0
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
			this.execute()
			return true
		}
		return false
	}

	show(){
		push()
		//bordeMIGUIs
		fill(this.darkCol)
		stroke(this.lightCol)
		this.beingHovered ? strokeWeight(bordeMIGUI + 1) : strokeWeight(bordeMIGUI)
		rect(this.sliderPos.x, this.sliderPos.y, this.w, this.h, this.rad)

		//relleno hovering
		if(this.beingHovered){
			push()
			fill(this.transCol)
			noStroke()
			let x = this.getBound()[1]
			rect(this.sliderPos.x, this.sliderPos.y, x-this.sliderPos.x, this.h, this.rad)
			pop()
		}

		//relleno slider
		if(this.valuePosX-this.sliderPos.x >= 1.5){
			fill(this.lightCol)
			rect(this.sliderPos.x, this.sliderPos.y, this.valuePosX-this.sliderPos.x, this.h, this.rad)
		}
		


		//texto
		noStroke()
		fill(this.lightCol)
		let textToShow = this.title
		let aux
		if(this.title == "") aux = "("
		else aux = " ("
		if(this.showValue) textToShow += aux + getRoundedValueMIGUI(this.value) + ")"
		textSize(text_SizeMIGUI-2)
		text(textToShow, this.pos.x - bordeMIGUI, this.pos.y + this.h*0.75)

		// fill(255, 0, 0)
		// noStroke()
		// ellipse(this.pos.x, this.pos.y, 4)
		// ellipse(this.pos.x, this.pos.y + this.height, 4)

		pop()
		return this.beingHovered
	}
}