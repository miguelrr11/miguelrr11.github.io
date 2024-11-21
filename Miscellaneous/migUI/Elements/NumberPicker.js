class NumberPicker{
	constructor(x, y, text, min, max, def, funcMinus, funcPlus, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.textSize = text_SizeMIGUI-2
		this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)

		

		this.beingHoveredPlus = false
		this.beingHoveredMinus = false
		this.beingPressed = false

		this.funcMinus = funcMinus
		this.funcPlus = funcPlus

		this.min = min != undefined ? min : -Infinity
		this.max = max != undefined ? max : Infinity
		this.value = def != undefined ? constrain(def, this.min, this.max) : 0

		this.w = 75
		this.h = 17

		this.sectionW = 20

		this.length = this.w + getPixelLength(this.text, this.textSize) + 8
		this.height = this.h

		this.disabled = false
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

	setFunc(func){
		this.func = func
	}

	evaluate(){
		this.beingHoveredMinus = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.sectionW, this.h)
		this.beingHoveredPlus = inBoundsMIGUI(mouseX, mouseY, this.pos.x+this.w-this.sectionW, this.pos.y, this.sectionW, this.h)

		if(this.disabled) return false

		if((this.beingHoveredMinus || this.beingHoveredPlus) && mouseIsPressed && !this.beingPressed){ 
			//ver donde se ha presionado, si en el + o en el -
			if(this.beingHoveredMinus){
				this.value--
				if(this.funcMinus && this.value >= this.min) this.funcMinus()
				this.value = constrain(this.value, this.min, this.max)
				
			}
			if(this.beingHoveredPlus){
				this.value++
				if(this.funcPlus && this.value <= this.max) this.funcPlus()
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
		rect(this.pos.x, this.pos.y, this.w, this.h)
		this.setSFtext(false)
		text(this.value, this.pos.x + this.w * 0.5, this.pos.y + this.h / 2 - 1)

		//rect con -
		this.setSF(this.beingHoveredMinus)
		rect(this.pos.x, this.pos.y, this.sectionW, this.h)
		this.setSFtext(this.beingHoveredMinus)
		text('-', this.pos.x + this.sectionW / 2, this.pos.y + this.h / 2 - 1)


		//rect con +
		this.setSF(this.beingHoveredPlus)
		rect(this.pos.x+this.w-this.sectionW, this.pos.y, this.sectionW, this.h)
		this.setSFtext(this.beingHoveredPlus)
		text('+', this.pos.x+this.w-this.sectionW/2, this.pos.y + this.h / 2 - 1)

		noStroke()
		this.setSFtext(false)
		textAlign(LEFT, TOP)
		text(this.text, this.pos.x + this.w + 10, this.pos.y + 1)
		
		//text(this.text, this.pos.x + bordeMIGUI+text_offset_xMIGUI, this.pos.y + this.h*0.75)

		// fill(255, 0, 0)
		// ellipse(this.pos.x, this.pos.y, 5)
		// ellipse(this.pos.x, this.pos.y + this.height, 5)

		pop()
		return this.beingHovered
	}
}



