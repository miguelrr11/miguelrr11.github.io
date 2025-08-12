class NumberPicker{
	constructor(x, y, text, min, max, delta, def, lightCol, darkCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.textSize = text_SizeMIGUI-2
		this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)

		this.beingHoveredPlus = false
		this.beingHoveredMinus = false
		this.beingPressed = false

		this.func = undefined
		this.arg = false

		this.min = min != undefined ? min : -Infinity
		this.max = max != undefined ? max : Infinity
		this.value = def != undefined ? constrain(def, this.min, this.max) : 0
		this.delta = delta ? delta : 1

		this.w = WIDTH_NUMBERPICKER
		this.h = 17

		this.rad = radMIGUI

		this.sectionW = 20

		textSize(this.textSize)
		this.length = this.w + textWidth(this.text) + 8
		this.height = this.h

		this.disabled = false
	}

	setFunc(func, arg = true){
		this.func = func
		this.arg = arg
	}

	execute(){
		if(this.func) this.arg ? this.func(this.value) : this.func()
	}

	reposition(x, y, w = undefined, h = undefined){
		this.pos = createVector(x, y)
		this.w = w || this.w
		this.h = h || this.h

		this.length = this.w + textWidth(this.text) + 8
		this.height = this.h
	}

	setValue(value){
		this.value = value
	}

	getValue(){
		return this.value
	}

	disable(){
		this.disabled = true
	}

	enable(){
		this.disabled = false
	}

	// setText(text){
	// 	this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)
	// 	this.w = getPixelLength(this.text, this.textSize) + 8
	// 	this.w = constrain(this.w, 20, width_elementsMIGUI)
	// }


	evaluate(){
		this.beingHoveredMinus = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.sectionW, this.h)
		this.beingHoveredPlus = inBoundsMIGUI(mouseX, mouseY, this.pos.x+this.w-this.sectionW, this.pos.y, this.sectionW, this.h)

		if(this.disabled) return false

		if((this.beingHoveredMinus || this.beingHoveredPlus) && mouseIsPressed && !this.beingPressed){ 
			//ver donde se ha presionado, si en el + o en el -
			if(this.beingHoveredMinus){
				this.value -= this.delta
				this.value = round(this.value, 3)
				if(this.value >= this.min) this.execute()
				this.value = constrain(this.value, this.min, this.max)
				
			}
			if(this.beingHoveredPlus){
				this.value += this.delta
				this.value = round(this.value, 3)
				if(this.value <= this.max) this.execute()
				this.value = constrain(this.value, this.min, this.max)
			}
			this.beingPressed = true
			return true
		}
		if(!mouseIsPressed){ 
			this.beingPressed = false
		}
		return false
	}

	setSF(bool){
		bool && !this.disabled ? strokeWeight(bordeMIGUI + 1) : strokeWeight(bordeMIGUI)
		this.disabled ? stroke(this.transCol) : stroke(this.lightCol)
		bool ? fill(this.transCol) : fill(this.darkCol)
		if(bool && mouseIsPressed) fill(this.lightCol)
		if(this.disabled) fill(this.darkCol)
	}

	setSFtext(bool){
		noStroke()
		textAlign(CENTER, CENTER)
		textSize(this.textSize+1)
		if(bool && mouseIsPressed) fill(this.darkCol)
		this.disabled ? fill(this.transCol) : fill(this.lightCol)
		
	}


	show(){
		push()

		//rect con el numero
		strokeWeight(bordeMIGUI)
		this.disabled ? stroke(this.transCol) : stroke(this.lightCol)
		fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h, this.rad)
		this.setSFtext(false)
		text(this.value, this.pos.x + this.w * 0.5, this.pos.y + this.h / 2)

		//rect con -
		this.setSF(this.beingHoveredMinus)
		rect(this.pos.x, this.pos.y, this.sectionW, this.h, this.rad, 0, 0, this.rad)
		this.setSFtext(this.beingHoveredMinus)
		text('-', this.pos.x + this.sectionW / 2, this.pos.y + this.h / 2)


		//rect con +
		this.setSF(this.beingHoveredPlus)
		rect(this.pos.x+this.w-this.sectionW, this.pos.y, this.sectionW, this.h, 0, this.rad, this.rad, 0)
		this.setSFtext(this.beingHoveredPlus)
		text('+', this.pos.x+this.w-this.sectionW/2, this.pos.y + this.h / 2)

		noStroke()
		this.setSFtext(false)
		textAlign(LEFT, CENTER)
		text(this.text, this.pos.x + this.w + 10, this.pos.y + this.h/2)
		
		let hoveringBounds = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.length, this.height)
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
		return hoveringBounds ? this : false
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



