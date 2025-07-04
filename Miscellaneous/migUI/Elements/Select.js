class Select{
	constructor(x, y, options, selected, lightCol, darkCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)

		this.options = []
		for(let i = 0; i < options.length; i++){
			this.options[i] = options[i]
		}
		this.optionsText = []
		for(let i = 0; i < options.length; i++){
			this.optionsText[i] = getClippedTextMIGUI(options[i], clipping_length_normalMIGUI)
		}
		this.selected = selected
		this.func = undefined
		this.arg = false

		this.beingPressed = false

		this.w = width_elementsMIGUI
		this.singleH = 20
		this.h = this.singleH * options.length
		this.height = this.h

		this.rad = radMIGUI
	}

	setFunc(func, arg = false){
		this.func = func
		this.arg = arg
	}

	reposition(x, y, w = undefined, h = undefined){
		this.pos = createVector(x, y)
		this.w = w || this.w
	}

	execute(){
		if(this.func){
			if(this.arg && this.getSelected() != undefined) this.func(this.getSelected())
			else this.func()
		}
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