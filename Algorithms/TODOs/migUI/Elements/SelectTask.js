class SelectTask{
	constructor(x, y, options, selected, func, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 50]
		this.pos = createVector(x, y)
		this.w = width_elementsMIGUI
		this.options = []
		for(let i = 0; i < options.length; i++){
			this.options[i] = options[i]
		}
		this.optionsText = []
		for(let i = 0; i < options.length; i++){
			this.optionsText[i] = getClippedTextByWidth(options[i], 0, this.w+8)
		}
		this.selected = selected
		this.func = func

		this.beingPressed = false

		
		this.singleH = 30
		this.h = this.singleH * options.length
		this.height = this.h

		this.rad = radMIGUI

		this.crossed = []	//indices of crossed options
	}

	uncross(index){
		//uncross the option and move it to the first position
		let uncrossedOption = this.options[index]
		let uncrossedOptionText = this.optionsText[index]
		this.options.splice(index, 1)
		this.optionsText.splice(index, 1)
		this.options.unshift(uncrossedOption)
		this.optionsText.unshift(uncrossedOptionText)
		//uncross the option
		let indexCrossed = this.crossed.indexOf(uncrossedOption)
		if(indexCrossed != -1) this.crossed.splice(indexCrossed, 1)
	}

	cross(index){
		//move the crossed option to the end of the list
		let crossedOption = this.options[index]
		let crossedOptionText = this.optionsText[index]
		this.options.splice(index, 1)
		this.optionsText.splice(index, 1)
		this.options.push(crossedOption)
		this.optionsText.push(crossedOptionText)
		//cross the option

		if(!this.crossed.includes(crossedOption)) this.crossed.push(crossedOption)
	}

	isItCrossed(option){
		return this.crossed.includes(option)
	}

	removeOption(option){
		let index = this.options.indexOf(option)
		if(index == -1) return
		this.options.splice(index, 1)
		this.optionsText.splice(index, 1)
		//this.h -= this.singleH
	}

	addOption(option){
		this.options.push(option)
		this.optionsText.push(getClippedTextByWidth(option, 0, this.w-8))
		//this.h += this.singleH
	}

	execute(){
		if(this.func) this.func(this)
	}

	deselect(){
		this.select = undefined
	}

	getSelected(){
		if(this.selected == undefined) return undefined
		return this.options[this.selected]
	}

	getSelectedIndex(){
		return this.selected
	}

	evaluate(){
		this.selected = undefined
		let inB = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
		this.beingHovered = inB

		if(inB && mouseIsPressed && !this.beingPressed){ 
			for(let i = 0; i < this.options.length; i++){
				if(this.isHovering(i)){
					this.selected = i
					this.beingPressed = true
					this.execute()
					return true
				}
			}
			
		}
		if(!mouseIsPressed){ 
			this.beingPressed = false
		}
		return false
	}

	isHovering(index){
		let x = this.pos.x
		let y = this.pos.y + (index * this.singleH)
		return inBoundsMIGUI(mouseX, mouseY, x, y, this.w, this.singleH)
	}

	show(){		
		push()
		this.beingHovered ? strokeWeight(bordeMIGUI + 1) : strokeWeight(bordeMIGUI)
		stroke(this.lightCol)
		noFill()
		rect(this.pos.x, this.pos.y, this.w, this.h, this.rad)
		fill(this.darkCol)
		textSize(text_SizeMIGUI-2)
		textAlign(LEFT, CENTER)
		for(let i = 0; i < this.optionsText.length; i++){
			let o = this.optionsText[i]
			this.isHovering(i) ? fill(this.lightCol) : fill(this.transCol)
			if(i == this.selected){ 
				fill(this.lightCol)
			}
			noStroke()
			let off = 3
			rect(this.pos.x+off, this.pos.y+off, this.w-off*2, this.singleH-off*2, this.rad)

			noStroke()
			fill(this.lightCol)
			if(this.isHovering(i)){ 
				fill(this.darkCol)
			}
			text(o, this.pos.x + bordeMIGUI + text_offset_xMIGUI+off, this.pos.y + this.singleH*0.5)

			push()
			stroke(this.lightCol)
			strokeWeight(2.5)
			//if this option is crossed, draw a line
			if(this.crossed.includes(this.options[i])){
				line(this.pos.x+5, this.pos.y+this.singleH/2, this.pos.x + this.w-5, this.pos.y + this.singleH/2)
			}
			pop()

			translate(0, this.singleH)

			
		}

		pop()
		return this.beingHovered

		// push()
		// noStroke()
		// fill(255, 0, 0)
		// ellipse(this.pos.x, this.pos.y, 5)
		// ellipse(this.pos.x, this.pos.y + this.height, 5)

		// pop()
	}
}