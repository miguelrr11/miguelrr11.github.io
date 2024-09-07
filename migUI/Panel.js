let borde = 3.5
let text_Font = ""
let text_Size = 15
let title_Size = 19

class Panel{
	constructor(x, y, w, h, title = "", darkC = [0,0,0], lightC = [255,255,255]){
		this.pos = createVector(x, y)
		this.title = title
		this.w = constrain(w, 200, 1000)
		this.h = constrain(h, 200, 1000)
		this.darkCol = darkC
		this.lightCol = lightC
		this.transCol = [...lightC, 100]

		this.checkboxes = []
		this.sliders = []
		this.sentences = []
		this.selects = []
		this.inputs = []
		this.buttons = []

		this.isInteracting = undefined

		this.lastElementPos = createVector(x + 30, y + 30)
		if(this.title != "") this.lastElementPos.y += 40

		text_Font = loadFont("dogicapixel.ttf")
		textFont(text_Font)
		textSize(text_Size)
		textAlign(LEFT)
	}

	addCheckbox(state = false, title = ""){
		let checkbox = new Checkbox(this.lastElementPos.x, 
								this.lastElementPos.y,
								title, state, this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += 30
		this.checkboxes.push(checkbox)
	}

	addSlider(min, max, origin, title = "", showValue = false){
		let posSlider = this.lastElementPos.copy()
		if(title != "" || showValue) posSlider.y += 20
		let slider = new Slider(this.lastElementPos.x,
								this.lastElementPos.y,
								posSlider.x, posSlider.y,
								min, max, origin, title, showValue,
								this.lightCol, this.darkCol, this.transCol)
		if(title == "" && !showValue) this.lastElementPos.y += 30
		else this.lastElementPos.y += 50
		this.sliders.push(slider)
	}

	addText(words = "", isTitle = false){
		let sentence = new Sentence(this.lastElementPos.x,
									this.lastElementPos.y,
									words, isTitle,
									this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += 25
		this.sentences.push(sentence)
	}

	addSelect(options = [""], selected = undefined){
		let selectedFinal = selected
		if(selected != undefined) selectedFinal = findIndex(selected, options)
		let select = new Select(this.lastElementPos.x,
								this.lastElementPos.y,
								options, selectedFinal,
								this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += (select.options.length*30)
		this.selects.push(select)
	}

	addInput(placeholder = "", func = undefined){
		let input = new Input(this.lastElementPos.x,
							  this.lastElementPos.y, placeholder, func,
							  this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += 35
		this.inputs.push(input)
	}

	addButton(words = "", func = undefined){
		let button = new Button(this.lastElementPos.x,
							  this.lastElementPos.y, words, func,
							  this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += 35
		this.buttons.push(button)
	}

	setText(pos, sentence = ""){
	    if (typeof pos == "number" && pos >= this.sentences.length) {
	        throw new Error("Text " + pos + " doesn't exist")
	    }
	    this.sentences[pos].setText(sentence)
	}

	//get selected of selected[pos]
	getSelected(pos){
		let index = typeof pos == "string" ? findIndex(pos, this.selects) : pos
    
	    if (index == -1 || (typeof index == "number" && index >= this.selects.length)) {
	        throw new Error("Select " + pos + " doesn't exist")
	    }

	    return this.selects[index].getSelected()
	}

	//get value of sliders[pos]
	value(pos) {
    	let index = typeof pos == "string" ? findIndex(pos, this.sliders) : pos
    
	    if (index == -1 || (typeof index == "number" && index >= this.sliders.length)) {
	        throw new Error("Slider " + pos + " doesn't exist")
	    }

	    return this.sliders[index].getValue()
	}

	//getChecked of checkboxes[pos]
	isChecked(pos){
		let index = typeof pos == "string" ? findIndex(pos, this.checkboxes) : pos

		if (index == -1 || (typeof index == "number" && index >= this.checkboxes.length)) {
	        throw new Error("Checkbox " + pos + " doesn't exist")
	        return false
	    }

	    return this.checkboxes[index].checked()
	}

	//getText of inputs[pos]
	getInput(pos){	
		if(pos >= this.inputs.length || pos < 0){
			throw new Error("Input " + pos + " doesn't exist")
	        return false
		}
		return this.inputs[pos].getText()
	}

	//change text of buttons[pos]
	changeText(pos, text = ""){
		if(pos >= this.buttons.length || pos < 0){
			throw new Error("Button " + pos + " doesn't exist")
	        return false
		}
		this.buttons[pos].setText(text)
	}

	//change function of buttons[pos]
	changeFunc(pos, func = undefined){
		if(pos >= this.buttons.length || pos < 0){
			throw new Error("Button " + pos + " doesn't exist")
	        return false
		}
		this.buttons[pos].setFunc(func)
	}

	update(){
		if(this.isInteracting != undefined){
			let bool = this.isInteracting.evaluate()
			if(!bool){
				this.isInteracting = undefined
				return
			}
		}
		for(let b of this.checkboxes) if(b.evaluate()) {
			this.isInteracting = b
			return
		}
		for(let s of this.sliders) if(s.evaluate()) {
			this.isInteracting = s
			return
		}
		for(let c of this.selects) if(c.evaluate()) {
			this.isInteracting = c
			return
		}
		for(let i of this.inputs) {
			if(mouseIsPressed) i.setState()
			if(i.evaluate()) {
				this.isInteracting = i
				return
			}
		}
		for(let b of this.buttons) if(b.evaluate()) {
			this.isInteracting = b
			return
		}
		if(!mouseIsPressed) this.isInteracting = undefined
	}

	show(){
		push()
		translate(borde*0.5, borde*0.5)

		//fondo
		fill(this.darkCol)
		stroke(this.lightCol)
		strokeWeight(borde)
		rect(this.pos.x, this.pos.y, this.w-borde, this.h-borde)

		push()
		fill(this.lightCol)
		stroke(this.transCol)
		strokeWeight(1)
		textSize(title_Size)
		text(this.title, this.pos.x + 20, this.pos.y + 30)
		fill(this.transCol)
		text(this.title, this.pos.x + 23, this.pos.y + 33)
		pop()

		for(let b of this.checkboxes) b.show()
		for(let s of this.sliders) s.show()
		for(let w of this.sentences) w.show()
		for(let c of this.selects) c.show()
		for(let i of this.inputs) i.show()
		for(let t of this.buttons) t.show()

		pop()
	}
}

class Checkbox{
	constructor(x, y, title, state, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.state = state
		this.title = title

		this.beingPressed = false

		this.beingHovered = false

		this.w = 16
		this.h = 16
	}

	checked(){
		return this.state
	}

	toggle(){
		this.state = !this.state
	}

	evaluate(){
		let inB = inBounds(mouseX, mouseY, this.pos.x, this.pos.y, this.w+borde, this.h+borde)
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
		strokeWeight(borde)
		rect(this.pos.x, this.pos.y, this.w, this.h)

		noStroke()
		fill(this.lightCol)
		text(this.title, this.pos.x + this.w + 10, this.pos.y + this.h*0.9)

		pop()
	}
}

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
		this.title = title

		this.value = origin
		this.valuePosX = this.pos.x

		this.beingPressed = false

		this.w = 138
		this.h = 16
	}

	getValue(){
		return this.value
	}

	evaluate(){
		if(!mouseIsPressed){
			this.beingPressed = false
			return false
		}
		let inB = inBounds(mouseX, mouseY, this.sliderPos.x, this.sliderPos.y, this.w+borde, this.h+borde)
		if(!this.beingPressed && inB && mouseIsPressed){
			this.beingPressed = true
		}
		if(this.beingPressed && mouseIsPressed) {
			let val = mouseX
			if(mouseX > this.pos.x + this.w){
				this.value = this.max
				this.valuePosX = this.pos.x + this.w
			}
			else if(mouseX < this.pos.x){
				this.value = this.min
				this.valuePosX = this.pos.x
			}
			else{
				this.valuePosX = mouseX
				this.value = mapp(this.valuePosX, this.pos.x, this.pos.x+this.w, this.min, this.max)
			}
			return true
		}
		return false
	}

	show(){
		push()
		//bordes
		fill(this.darkCol)
		stroke(this.lightCol)
		strokeWeight(borde)
		rect(this.sliderPos.x, this.sliderPos.y, this.w, this.h)

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
		if(this.showValue) textToShow += aux + getRoundedValue(this.value) + ")"
		text(textToShow, this.pos.x - borde, this.pos.y + this.h*0.5)

		pop()
	}
}

class Sentence{
	constructor(x, y, words, isTitle, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.words = words
		this.isTitle = isTitle
	}

	setText(words){
		this.words = words
	}

	show(){
		push()
		if(this.isTitle){
			push()
			fill(this.lightCol)
			stroke(this.transCol)
			strokeWeight(1)
			textSize(title_Size)
			text(this.words, this.pos.x - borde, this.pos.y + 10)
			fill(this.transCol)
			text(this.words, this.pos.x - borde + 3, this.pos.y + 13)
			pop()
		}
		else{
			noStroke()
			fill(this.lightCol)
			text(this.words, this.pos.x - borde, this.pos.y + 10)
		}
		pop()
	}
}

class Select{
	constructor(x, y, options, selected, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)

		this.options = options
		this.selected = selected

		this.beingPressed = false

		this.w = 138
		this.singleH = 25
		this.h = this.singleH * options.length
	}

	getSelected(){
		if(this.selected == undefined) return undefined
		return this.options[this.selected]
	}

	evaluate(){
		let inB = inBounds(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)

		if(inB && mouseIsPressed && !this.beingPressed){ 
			for(let i = 0; i < this.options.length; i++){
				if(this.isHovering(i)){
					if(this.selected == undefined) this.selected = i
					else if(i == this.selected) this.selected = undefined
					else{
						this.selected =  i
					}
					this.beingPressed = true
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
		return inBounds(mouseX, mouseY, x, y, this.w, this.singleH)
	}

	show(){
		push()
		strokeWeight(borde)
		stroke(this.lightCol)
		fill(this.darkCol)
		textSize(text_Size-2)
		for(let i = 0; i < this.options.length; i++){
			let o = this.options[i]
			this.isHovering(i) ? fill(this.transCol) : noFill()
			if(i == this.selected){ 
				fill(this.lightCol)
			}
			stroke(this.lightCol)
			rect(this.pos.x, this.pos.y, this.w, this.singleH)

			noStroke()
			fill(this.lightCol)
			if(i == this.selected){ 
				fill(this.darkCol)
			}
			text(o, this.pos.x + borde, this.pos.y + this.singleH*0.7)
			translate(0, this.singleH)
		}
		pop()
	}
}

class Input{
	constructor(x, y, placeholder, func, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.placeholder = placeholder
		this.func = func

		this.beingHovered = false
		this.beingPressed = false
		this.sentence = ""
		this.active = false

		this.w = 138
		this.h = 25
	}

	setState(){
		this.active = inBounds(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
	}

	getText(){
		return this.sentence
	}

	evaluate(){
		this.isHovering = inBounds(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)

		if(keyIsPressed && this.active){ 
	        if(!this.beingPressed && keyCode == 8){ //Backspace
	            this.sentence = this.sentence.slice(0, -1)
	        }
	        else if(!this.beingPressed && keyCode == 13){ //Intro
	        	this.func(this.sentence)
	           	this.sentence = ""
	        }
	        else if(keyCode != 8 && keyCode != 13){
	            let c = keyCodeToChar()
	            if(c != this.sentence[this.sentence.length-1]) this.sentence += c
	            else if(!this.beingPressed) this.sentence += c
	        }
	    
	        this.beingPressed = true
	    }
	    if(!keyIsPressed) this.beingPressed = false
	}

	show(){
		push()
		strokeWeight(borde)
		stroke(this.lightCol)
		this.active ? fill(this.transCol) : fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h)

		noStroke()
		fill(this.lightCol)
		textSize(text_Size-2)
		if(this.sentence.length != 0) text(this.sentence, this.pos.x + borde, this.pos.y + this.h*0.7)
		else text(this.placeholder, this.pos.x + borde, this.pos.y + this.h*0.7)
		pop()
	}
}

class Button{
	constructor(x, y, text, func, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.text = text

		this.beingHovered = false
		this.beingPressed = false

		this.func = func
		this.w = text.length * 12.5
		this.w = constrain(this.w, 20, 138)
		this.h = 25
	}

	setText(text){
		this.text = text
	}

	setFunc(func){
		this.func = func
	}

	execute(){
		if(this.func != undefined) this.func()
	}

	evaluate(){
		this.beingHovered = inBounds(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
		let inB = inBounds(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
		if(inB) this.beingHovered = true
		else this.beingHovered = false
		if(inB && mouseIsPressed && !this.beingPressed){ 
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
		strokeWeight(borde)
		stroke(this.lightCol)
		this.beingHovered ? fill(this.transCol) : fill(this.darkCol)
		if(this.beingHovered && mouseIsPressed) fill(this.lightCol)
		rect(this.pos.x, this.pos.y, this.w, this.h)

		noStroke()
		fill(this.lightCol)
		if(this.beingHovered && mouseIsPressed) fill(this.darkCol)
		textSize(text_Size-2)
		text(this.text, this.pos.x + borde, this.pos.y + this.h*0.7)
		pop()
	}
}



function inBounds(x, y, a, b, w, h){
	return x < a+w && x > a && y < b+h && y > b
}

function mapp(value, start1, stop1, start2, stop2){
    return start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2); 
}

function getRoundedValue(value){
	if(value < 1) return round(value, 2)
	if(value < 10) return round(value, 1)
	return round(value)
}

function findIndex(name, arr){
	for(let i = 0; i < arr.length; i++){
		if(arr[i].title == name || arr[i] == name) return i
	}
	return -1
}

function keyCodeToChar(){
    return String.fromCharCode(keyCode);
}