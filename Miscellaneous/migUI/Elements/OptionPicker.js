class OptionPicker{
	constructor(x, y, text, options, lightCol, darkCol){
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

		this.w = picker_width
		this.h = 17

		this.rad = radMIGUI

        this.options = options
		if(this.options.length == 0) this.options.push('')
        this.selectedIndex = 0

		this.sectionW = 20

		textSize(this.textSize)
		this.length = this.w + textWidth(this.text) + 8
		this.height = this.h

		this.disabled = false
	}

	setFunc(func, arg = false){
		this.func = func
		this.arg = arg
	}

	execute(){
		if(this.func) this.arg ? this.func(this.getSelected()) : this.func()
	}

	reposition(x, y, w = undefined, h = undefined){
		this.pos = createVector(x, y)
		this.w = w || this.w
		this.h = h || this.h

		this.length = this.w + textWidth(this.text) + 8
		this.height = this.h
	}

	getSelected(){
		return this.options[this.selectedIndex%this.options.length]
	}

	getSelectedIndex(){
		return this.selectedIndex
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
			//ver donde se ha presionado, si en el < o en el >
			if(this.beingHoveredMinus){
				this.selectedIndex--
				if(this.selectedIndex < 0) this.selectedIndex = this.options.length-1
				this.execute()
			}
			if(this.beingHoveredPlus){
				this.selectedIndex++
				if(this.selectedIndex > this.options.length - 1) this.selectedIndex = 0
				this.execute()
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
		noStroke()
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
        let option = getClippedTextMIGUI(this.options[this.selectedIndex%this.options.length], 10)
		text(option, this.pos.x + this.w * 0.5, this.pos.y + this.h / 2)

		//rect con -
		let off = 0
		this.setSF(this.beingHoveredMinus)
		rect(this.pos.x+off, this.pos.y+off, this.sectionW-off*2, this.h-off*2, this.rad, 0, 0, this.rad)
		this.setSFtext(this.beingHoveredMinus)
		text('<', this.pos.x + this.sectionW / 2, this.pos.y + this.h / 2)


		//rect con +
		
		this.setSF(this.beingHoveredPlus)
		rect(this.pos.x+this.w-this.sectionW+off, this.pos.y+off, this.sectionW-off*2, this.h-off*2, 0, this.rad, this.rad, 0)
		this.setSFtext(this.beingHoveredPlus)
		text('>', this.pos.x+this.w-this.sectionW/2, this.pos.y + this.h / 2)

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



