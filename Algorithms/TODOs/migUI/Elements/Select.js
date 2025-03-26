class Select{
	constructor(x, y, options, selected, func, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
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

		
		this.singleH = 20
		this.h = this.singleH * options.length
		this.height = this.h

		this.rad = radMIGUI
	}

	removeOption(option){
		let index = this.options.indexOf(option)
		if(index == -1) return
		this.options.splice(index, 1)
		this.optionsText.splice(index, 1)
		this.h -= this.singleH
	}

	addOption(option){
		this.options.push(option)
		this.optionsText.push(getClippedTextByWidth(option, 0, this.w-8))
		this.h += this.singleH
	}

	execute(){
		if(this.func) this.func()
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
		for(let i = 0; i < this.optionsText.length; i++){
			let o = this.optionsText[i]
			this.isHovering(i) ? fill(this.transCol) : noFill()
			if(i == this.selected){ 
				fill(this.lightCol)
			}
			noStroke()
			if(i == 0){
				if(this.options.length <= 1) rect(this.pos.x, this.pos.y, this.w, this.singleH, this.rad)
				else rect(this.pos.x, this.pos.y + this.singleH * i, this.w, this.singleH, this.rad, this.rad, 0, 0)
			}
			else if(i == this.options.length - 1){
				rect(this.pos.x, this.pos.y, this.w, this.singleH, 0, 0, this.rad, this.rad)
			}
			else{
				rect(this.pos.x, this.pos.y, this.w, this.singleH)
			}

			noStroke()
			fill(this.lightCol)
			if(i == this.selected){ 
				fill(this.darkCol)
			}
			text(o, this.pos.x + bordeMIGUI + text_offset_xMIGUI, this.pos.y + this.singleH*0.8-1)
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