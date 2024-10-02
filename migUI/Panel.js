//UI library for p5 projects
//Miguel Rodríguez
//06-09-2024

let bordeMIGUI = 1.5
let text_FontMIGUI = ""
let text_SizeMIGUI = 15
let text_offset_xMIGUI = 1.5
let title_SizeMIGUI = 20
let width_elementsMIGUI = 158
let clipping_length_normalMIGUI = 20
let clipping_length_titleMIGUI = 11

/*
200 - 20
150 - 14
100 - 8
x = width - 200, y = 0, w = 200, h = height, title = "", darkC = [0,0,0], lightC = [255,255,255], retractable = false, theme = undefined
*/

class Panel{
	constructor(properties = {}) {
	    const {
	        x = width - 200,
	        y = 0,
	        title = "",
	        w = 200,
	        h = height,
	        retractable = false,
	        darkCol = [0, 0, 0],
	        lightCol = [255, 255, 255],
	        theme,
	        automaticHeight = true
	    } = properties;

	    this.pos = createVector(x, y);
	    this.title = title;
	    this.w = constrain(w, 100, 1000);
	    this.h = constrain(h, 100, 1000);
	    this.retractable = retractable;
	    
	    width_elementsMIGUI = this.w - 35;
	    clipping_length_normalMIGUI = 0.12 * this.w - 4;

	    this.darkCol = typeof darkCol === "string" ? hexToRgbMIGUI(darkCol) : darkCol;
	    if (!this.darkCol) throw new Error("Invalid HEX string for darkCol");
	    
	    this.lightCol = typeof lightCol === "string" ? hexToRgbMIGUI(lightCol) : lightCol;
	    if (!this.lightCol) throw new Error("Invalid HEX string for lightCol");

	    this.transCol = [...this.lightCol, 100];

	    this.initializeUIElements();

	    this.lastElementPos = createVector(x + 17, y + 25);
	    if (this.retractable) this.lastElementPos.y += 20;

	    this.titlePos = createVector(this.lastElementPos.x - 3, this.lastElementPos.y);
	    this.adjustElementPositionForTitle();

	    if (this.retractable) {
	        this.createRetractButton();
	    }

	    this.isRetracted = false;
	    this.setFontSettings();

	    if (theme) this.setTheme(theme);
	    this.automaticHeight = automaticHeight;
	    if (this.automaticHeight) this.h = this.lastElementPos.y + 10;
	}

	initializeUIElements() {
	    this.checkboxes = [];
	    this.sliders = [];
	    this.sentences = [];
	    this.selects = [];
	    this.inputs = [];
	    this.buttons = [];
	    this.colorPickers = [];
	    this.activeCP = undefined;
	    this.lastElementAdded = "";
	    this.isInteracting = undefined;
	}

	adjustElementPositionForTitle() {
	    if (this.title) {
	        const newlines = this.title.split('\n').length;
	        this.lastElementPos.y += newlines * 20;
	    } else {
	        this.lastElementPos.y -= 15;
	    }
	}

	createRetractButton() {
	    this.retractButton = new Button(
	        this.pos.x,
	        this.pos.y,
	        " Retract Menu",
	        (RetractMenu) => {
	            this.isRetracted = !this.isRetracted;
	            this.retractButton.text = this.isRetracted ? " Expand Menu" : " Retract Menu";
	        },
	        this.lightCol,
	        this.darkCol,
	        this.transCol
	    );
	    
	    this.retractButton.pos = this.pos.copy();
	    this.retractButton.w = this.w - bordeMIGUI;
	    this.retractButton.h = 20;
	    this.retractButton.text = " Retract Menu";
	    this.buttons.push(this.retractButton);
	}

	setFontSettings() {
	    text_FontMIGUI = loadFont("mono.ttf");
	    textFont(text_FontMIGUI);
	    textSize(text_SizeMIGUI);
	    textAlign(LEFT);
	}


	addCheckbox(title = "", state = false){
		if(this.lastElementAdded.constructor.name != "Checkbox") this.lastElementPos.y += 5
		let checkbox = new Checkbox(this.lastElementPos.x, 
								this.lastElementPos.y,
								title, state, this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += 25
		this.checkboxes.push(checkbox)
		this.lastElementAdded = checkbox
	}

	addSlider(min, max, origin, title = "", showValue = false){
		let posSlider = this.lastElementPos.copy()
		if(title != "" || showValue) posSlider.y += 15
		if(this.lastElementAdded.constructor.name != "Slider"){
			posSlider.y += 5
			this.lastElementPos.y += 5
		}
		let slider = new Slider(this.lastElementPos.x,
								this.lastElementPos.y,
								posSlider.x, posSlider.y,
								min, max, origin, title, showValue,
								this.lightCol, this.darkCol, this.transCol)
		if(title == "" && !showValue) this.lastElementPos.y += 30
		else this.lastElementPos.y += 45
		this.sliders.push(slider)
		this.lastElementAdded = slider
	}

	addText(words = "", isTitle = false){
		if(this.lastElementAdded.constructor.name != "Sentence") this.lastElementPos.y += 5
		if(isTitle) this.lastElementPos.y += 5
		let sentence = new Sentence(this.lastElementPos.x,
									this.lastElementPos.y,
									words, isTitle,
									this.lightCol, this.darkCol, this.transCol)
		
		let newlines = words.split('\n').length;
		this.lastElementPos.y += newlines*20
		
		this.sentences.push(sentence)
		this.lastElementAdded = sentence
	}

	addSelect(options = [""], selected = undefined){
		if(options.length == 0) return
		if(this.lastElementAdded.constructor.name != "Select") this.lastElementPos.y += 5
		let selectedFinal = selected
		if(selected != undefined) selectedFinal = findIndexMIGUI(selected, options)
		let select = new Select(this.lastElementPos.x,
								this.lastElementPos.y,
								options, selectedFinal,
								this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += (select.options.length*20) + 10
		this.selects.push(select)
		this.lastElementAdded = select
	}

	addInput(placeholder = "", func = undefined){
		if(this.lastElementAdded.constructor.name != "Input") this.lastElementPos.y += 5
		let input = new Input(this.lastElementPos.x,
							  this.lastElementPos.y, placeholder, func,
							  this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += 30
		this.inputs.push(input)
		this.lastElementAdded = input
	}

	addButton(sentence = "", func = undefined){
		if(this.lastElementAdded.constructor.name != "Button") this.lastElementPos.y += 5
		let button = new Button(this.lastElementPos.x,
							  this.lastElementPos.y, sentence, func,
							  this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += 30
		this.buttons.push(button)
		this.lastElementAdded = button
	}

	addColorPicker(sentence = []){
		if(this.lastElementAdded.constructor.name != "ColorPicker") this.lastElementPos.y += 5
		let colorPicker = new ColorPicker(this.lastElementPos.x, 
										  this.lastElementPos.y,
										  sentence, this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += 25
		this.colorPickers.push(colorPicker)
		this.lastElementAdded = colorPicker
	}

	setText(pos, sentence = ""){
	    if (typeof pos == "number" && pos >= this.sentences.length) {
	        throw new Error("Text " + pos + " doesn't exist")
	    }
	    this.sentences[pos].setText(sentence)
	}

	//get selected of selected[pos]
	getSelected(pos){
		let index = typeof pos == "string" ? findIndexMIGUI(pos, this.selects) : pos
    
	    if (index == -1 || (typeof index == "number" && index >= this.selects.length)) {
	        throw new Error("Select " + pos + " doesn't exist")
	    }

	    return this.selects[index].getSelected()
	}

	//get value of sliders[pos]
	getValue(pos) {
    	let index = typeof pos == "string" ? findIndexMIGUI(pos, this.sliders) : pos
    
	    if (index == -1 || (typeof index == "number" && index >= this.sliders.length)) {
	        throw new Error("Slider " + pos + " doesn't exist")
	    }

	    return this.sliders[index].getValue()
	}

	//set value of sliders[pos]
	setValue(pos, value){
		let index = typeof pos == "string" ? findIndexMIGUI(pos, this.sliders) : pos
    
	    if (index == -1 || (typeof index == "number" && index >= this.sliders.length)) {
	        throw new Error("Slider " + pos + " doesn't exist")
	    }

	    this.sliders[index].setValue(value)
	}

	//getChecked of checkboxes[pos]
	isChecked(pos){
		let index = typeof pos == "string" ? findIndexMIGUI(pos, this.checkboxes) : pos

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

	getColor(pos){
		let index = typeof pos == "string" ? findIndexMIGUI(pos, this.colorPickers) : pos
    
	    if (index == -1 || (typeof index == "number" && index >= this.colorPickers.length)) {
	        throw new Error("Color picker " + pos + " doesn't exist")
	    }

	    return this.colorPickers[pos].getColor()
	}

	//change text of buttons[pos]
	changeText(pos, text = ""){
		let offset = this.retractable ? 1 : 0
		if(pos >= this.buttons.length + offset || pos < 0){
			throw new Error("Button " + pos + " doesn't exist")
	        return false
		}
		this.buttons[pos + offset].setText(text)
	}

	//change function of buttons[pos]
	changeFunc(pos, func = undefined){
		if(pos >= this.buttons.length + 1 || pos < 0){
			throw new Error("Button " + pos + " doesn't exist")
	        return false
		}
		this.buttons[pos + 1].setFunc(func)
	}

	changeColors(dark, light){
		if(typeof dark === "string"){
			this.darkCol = hexToRgbMIGUI(dark)
			if(this.darkCol === null) throw new Error("Invalid HEX string")
		}
		if(typeof light === "string"){
			this.lightCol = hexToRgbMIGUI(light)
			if(this.lightCol === null) throw new Error("Invalid HEX string")
		}
		if(typeof dark === "object"){
			this.darkCol = dark
		}	
		if(typeof light === "object"){
			this.lightCol = light
		}
		this.transCol = [...this.lightCol, 100]
		for(let b of this.checkboxes) {b.lightCol = light; b.darkCol = dark; b.transCol = this.transCol}
		for(let b of this.sliders)  {b.lightCol = light; b.darkCol = dark; b.transCol = this.transCol}
		for(let b of this.sentences)  {b.lightCol = light; b.darkCol = dark; b.transCol = this.transCol}
		for(let b of this.selects)  {b.lightCol = light; b.darkCol = dark; b.transCol = this.transCol}
		for(let b of this.inputs)  {b.lightCol = light; b.darkCol = dark; b.transCol = this.transCol}
		for(let b of this.buttons)  {b.lightCol = light; b.darkCol = dark; b.transCol = this.transCol}
		for(let b of this.colorPickers)  {b.lightCol = light; b.darkCol = dark; b.transCol = this.transCol; b.saturation = this.transCol}
	}

// let c1 = [hexToRgb("#1d3557"), hexToRgb("#457b9d"), hexToRgb("#e63946")]
// let c2 = [hexToRgb("#393e41"), hexToRgb("#fff8f0"), hexToRgb("#f4d35e")]
// let c3 = [hexToRgb("#fbf5f3"), hexToRgb("#e28413"), hexToRgb("#000022")]
// let c4 = [hexToRgb("#092327"), hexToRgb("#0b5351"), hexToRgb("#17B1AD")]

	setTheme(theme){
		if(theme == "mono"){
			this.changeColors("#000000", "#ffffff")
		}
		else if(theme == "light"){
			this.changeColors("#ebf4f5", "#9bafd9")
		}
		else if(theme == "dark"){
			this.changeColors("#27293C", "#757E93")
		}
		else if(theme == "red"){
			this.changeColors("#FF4A40", "#660000")
		}
		else if(theme == "blue"){
			this.changeColors("#5E66FC", "#000552")
		}
		else if(theme == "green"){
			this.changeColors("#21EB32", "#074B0D")
		}
		else if(theme == "yellow"){
			this.changeColors("#FCE25D", "#564C17")
		}
		else if(theme == "spiderman"){
			this.changeColors("#1d3557", "#e63946")
		}
		else if(theme == "slime"){
			this.changeColors("#393e41", "#f4d35e")
		}
		else if(theme == "clean"){
			this.changeColors("#fbf5f3", "#000022")
		}
		else if(theme == "techno"){
			this.changeColors("#092327", "#17B1AD")
		}
		else if(theme == "sublime"){
			this.changeColors("#780116", "#f7b538")
		}
		else if(theme == "sunset"){
			this.changeColors("#003049", "#f77f00")
		}
		else if(theme == "blossom"){
			this.changeColors("#c78283", "#f3d9dc")
		}
		else console.log(`Theme \"${theme}\" doesn't exist`)

	}

	update(){
		push()
		if(this.activeCP && !this.isRetracted){ 
			this.activeCP.show()
			let bool = this.activeCP.evaluate()
			if(!bool) this.activeCP = undefined
			else return
		}
		else if(!this.isRetracted){
			for(let b of this.colorPickers){ 
				b.show()
				if(b.evaluate()) {
					this.isInteracting = b
					this.activeCP = b
					return
				}
			}
		}
		pop()
		if(this.isRetracted){
			this.retractButton.evaluate()
			return
		}
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
		if(this.automaticHeight) this.h = this.lastElementPos.y + 10
		translate(bordeMIGUI*0.5, bordeMIGUI*0.5)

		//fondo
		fill(this.darkCol)
		stroke(this.lightCol)
		strokeWeight(bordeMIGUI)
		if(this.isRetracted && this.retractable){
			this.retractButton.show()
			pop()
			return
		}
		rect(this.pos.x, this.pos.y, this.w-bordeMIGUI, this.h-bordeMIGUI)
		//Titulo
		noStroke()
		textSize(title_SizeMIGUI)
		fill([...this.lightCol, 170])
		text(this.title, this.titlePos.x + 3, this.titlePos.y + 3)
		fill(this.lightCol)
		stroke(this.darkCol)
		text(this.title, this.titlePos.x, this.titlePos.y)

		for(let b of this.checkboxes) b.show()
		for(let s of this.sliders) s.show()
		for(let w of this.sentences) w.show()
		for(let c of this.selects) c.show()
		for(let i of this.inputs) i.show()
		for(let t of this.buttons) t.show()
		for(let p of this.colorPickers){ 
			p.show()
			if(p.isChoosing) this.activeCP = p
		}
		if(this.activeCP) this.activeCP.show()
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
		this.name = title
		this.title = getClippedTextMIGUI(title, clipping_length_normalMIGUI)

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

class Sentence{
	constructor(x, y, words, isTitle, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.name = words
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
			textSize(title_SizeMIGUI)
			text(this.words, this.pos.x - bordeMIGUI, this.pos.y + 10)
			fill(this.transCol)
			text(this.words, this.pos.x - bordeMIGUI + 3, this.pos.y + 13)
			pop()
		}
		else{
			noStroke()
			fill(this.lightCol)
			textSize(text_SizeMIGUI)
			text(this.words, this.pos.x - bordeMIGUI, this.pos.y + 10)
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

		this.options = []
		for(let i = 0; i < options.length; i++){
			this.options[i] = options[i]
		}
		this.optionsText = []
		for(let i = 0; i < options.length; i++){
			this.optionsText[i] = getClippedTextMIGUI(options[i], clipping_length_normalMIGUI)
		}
		this.selected = selected

		this.beingPressed = false

		this.w = width_elementsMIGUI
		this.singleH = 20
		this.h = this.singleH * options.length
	}

	getSelected(){
		if(this.selected == undefined) return undefined
		return this.options[this.selected]
	}

	evaluate(){
		let inB = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)

		if(inB && mouseIsPressed && !this.beingPressed){ 
			for(let i = 0; i < this.options.length; i++){
				if(this.isHovering(i)){
					if(this.selected == undefined) this.selected = i
					else if(i == this.selected) return
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
		return inBoundsMIGUI(mouseX, mouseY, x, y, this.w, this.singleH)
	}

	show(){
		push()
		strokeWeight(bordeMIGUI)
		stroke(this.lightCol)
		noFill()
		rect(this.pos.x, this.pos.y, this.w, this.h)
		fill(this.darkCol)
		textSize(text_SizeMIGUI-2)
		for(let i = 0; i < this.optionsText.length; i++){
			let o = this.optionsText[i]
			this.isHovering(i) ? fill(this.transCol) : noFill()
			if(i == this.selected){ 
				fill(this.lightCol)
			}
			noStroke()
			rect(this.pos.x, this.pos.y, this.w, this.singleH)

			noStroke()
			fill(this.lightCol)
			if(i == this.selected){ 
				fill(this.darkCol)
			}
			text(o, this.pos.x + bordeMIGUI + text_offset_xMIGUI, this.pos.y + this.singleH*0.8)
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
		this.placeholder = getClippedTextMIGUI(placeholder, clipping_length_normalMIGUI)
		this.func = func

		this.beingHovered = false
		this.beingPressed = false
		this.sentence = ""
		this.active = false

		this.w = width_elementsMIGUI
		this.h = 20
	}

	setText(text){
		this.sentence = text
	}

	setState(){
		this.active = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
	}

	getText(){
		return this.sentence
	}


	evaluate(){
		this.isHovering = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)

		if(keyIsPressed && this.active){ 
	        if(!this.beingPressed && keyCode == 8){ //Backspace
	            this.sentence = this.sentence.slice(0, -1)
	        }
	        else if(!this.beingPressed && keyCode == 13){ //Intro
	        	this.func(this.sentence)
	           	this.sentence = ""
	        }
	        else if(keyCode != 8 && keyCode != 13){
	            let c = keyCodeToCharMIGUI()
	            if(c != this.sentence[this.sentence.length-1]) this.sentence += c
	            else if(!this.beingPressed) this.sentence += c
	        }
	    
	        this.beingPressed = true
	    }
	    //this.sentence = getClippedTextMIGUI(this.sentence, clipping_length_normalMIGUI)
	    if(!keyIsPressed) this.beingPressed = false
	}

	show(){
		push()
		strokeWeight(bordeMIGUI)
		stroke(this.lightCol)
		this.active ? fill(this.transCol) : fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h)

		noStroke()
		fill(this.lightCol)
		textSize(text_SizeMIGUI-2)
		let clippedSentence = getClippedTextMIGUI(this.sentence, clipping_length_normalMIGUI)
		if(this.sentence.length != 0) text(clippedSentence, this.pos.x + bordeMIGUI + text_offset_xMIGUI, this.pos.y + this.h*0.7)
		else text(this.placeholder, this.pos.x + bordeMIGUI + text_offset_xMIGUI, this.pos.y + this.h*0.75)
		pop()
	}
}

class Button{
	constructor(x, y, text, func, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		if(func.name != "retractMenu") this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)
		else this.text = text

		this.beingHovered = false
		this.beingPressed = false

		this.func = func
		this.w = this.text.length * 8.4
		this.w = constrain(this.w, 20, width_elementsMIGUI)
		this.h = 20
	}

	setText(text){
		this.text = getClippedTextMIGUI(text, clipping_length_normalMIGUI)
		this.w = this.text.length * 11.5
		this.w = constrain(this.w, 20, 160)
	}

	setFunc(func){
		this.func = func
	}

	execute(){
		if(this.func != undefined) this.func()
	}

	evaluate(){
		this.beingHovered = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
		let inB = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
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
		strokeWeight(bordeMIGUI)
		stroke(this.lightCol)
		fill(this.darkCol)
		rect(this.pos.x, this.pos.y, this.w, this.h)
		this.beingHovered ? fill(this.transCol) : fill(this.darkCol)
		if(this.beingHovered && mouseIsPressed) fill(this.lightCol)
		rect(this.pos.x, this.pos.y, this.w, this.h)

		noStroke()
		fill(this.lightCol)
		if(this.beingHovered && mouseIsPressed) fill(this.darkCol)
		textSize(text_SizeMIGUI-2)
		text(this.text, this.pos.x + bordeMIGUI+text_offset_xMIGUI, this.pos.y + this.h*0.75)
		pop()
	}
}

class ColorPicker{
	constructor(x, y, title, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.name = title
		this.title = getClippedTextMIGUI(title, clipping_length_normalMIGUI)
		this.isChoosing = false 

		this.isChoosingHue = false
		this.isChoosingSaturation = false

		this.beingPressed = false

		this.beingHovered = false

		this.w = 16
		this.h = 16

		this.cpw = 185
		this.cph = 30
		this.poscp = createVector(constrain(this.pos.x - 10, 0, width - this.cpw - 10), constrain(this.pos.y + this.h * 2, 0, height - this.cph - 10))
		
		this.hue = [0, 0, 0]
		this.saturation = this.transCol

		this.huePos = createVector(this.poscp.x + this.cpw / 2, this.poscp.y + this.cph * 0.25)
		this.saturationPos = createVector(this.poscp.x + this.cpw / 2, this.poscp.y + this.cph * 0.75)
	}

	getColor(){
		return this.saturation
	}

	toggle(){
		this.isChoosing = !this.isChoosing
	}

	evaluate(){
		if(!mouseIsPressed){
			this.isChoosingHue = false
			this.isChoosingSaturation = false
		}
		let inB_cb = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w+bordeMIGUI, this.h+bordeMIGUI)
		if(inB_cb) this.beingHovered = true
		else{ 
			this.beingHovered = false
		}
		let inB_cp = inBoundsMIGUI(mouseX, mouseY, this.poscp.x, this.poscp.y, this.cpw, this.cph)
		
		if(inB_cb && mouseIsPressed && !this.beingPressed){
			this.toggle()
			this.beingPressed = true
			return true
		}
		if(this.isChoosing && mouseIsPressed){
			drawGradientRainbow(this.poscp.x + 5, this.poscp.y + 5, this.cpw - 10, this.cph * 0.5 - 7.5)
			drawGradient2col(this.poscp.x + 5, this.poscp.y + this.cph * 0.5 + 2.5, this.cpw - 10, this.cph * 0.5 - 7.5, this.hue)

			//hue
			if(inBoundsMIGUI(mouseX, mouseY, this.poscp.x + 5, this.poscp.y + 5, this.cpw - 10, this.cph * 0.5 - 7.5) || this.isChoosingHue){
				this.isChoosingHue = true
				this.huePos.x = mouseX
				this.huePos.x = constrain(this.huePos.x, this.poscp.x + 5, this.poscp.x + 5 + this.cpw - 10)
				this.hue = get(this.huePos.x, this.huePos.y)
				this.saturation = get(this.saturationPos.x, this.saturationPos.y)
				
			}
			//saturation
			else if(inBoundsMIGUI(mouseX, mouseY, this.poscp.x + 5, this.poscp.y + this.cph * 0.5 + 2.5, this.cpw - 10, this.cph * 0.5 - 7.5) || this.isChoosingSaturation){
				this.isChoosingSaturation = true
				this.saturationPos.x = mouseX
				this.saturationPos.x = constrain(this.saturationPos.x, this.poscp.x + 5, this.poscp.x + 5 + this.cpw - 10)
				this.saturation = get(this.saturationPos.x, this.saturationPos.y)
				
			}
		}
		if(!mouseIsPressed){ 
			this.beingPressed = false
		}
		if(!inB_cp && !inB_cb && this.isChoosing && mouseIsPressed && !this.isChoosingSaturation && !this.isChoosingHue){
			this.beingPressed = false
			this.beingHovered = false
			this.isChoosing = false
			return false
		}
		return this.isChoosing
	}

	show(){
		push()
		fill(this.saturation)
		stroke(this.lightCol)
		this.isChoosing ? strokeWeight(bordeMIGUI + 1.5) : strokeWeight(bordeMIGUI)
		rect(this.pos.x, this.pos.y, this.w, this.h)

		noStroke()
		fill(this.lightCol)
		text(this.title, this.pos.x + this.w + 10, this.pos.y + this.h*0.85)

		//show picker
		if(this.isChoosing){
			fill(this.darkCol)
			stroke(this.lightCol)
			strokeWeight(bordeMIGUI)
			rect(this.poscp.x, this.poscp.y, this.cpw, this.cph)

			drawGradientRainbow(this.poscp.x + 5, this.poscp.y + 5, this.cpw - 10, this.cph * 0.5 - 7.5)
			drawGradient2col(this.poscp.x + 5, this.poscp.y + this.cph * 0.5 + 2.5, this.cpw - 10, this.cph * 0.5 - 7.5, this.hue)


			fill(this.hue)
			ellipse(this.huePos.x, this.huePos.y, 10)
			fill(this.saturation)
			ellipse(this.saturationPos.x, this.saturationPos.y, 10)
		}
		

		pop()
	}
}

function drawGradient2col(x, y, w, h, col){
	let ctx = drawingContext;

	let gradient = ctx.createLinearGradient(x, y, x + w, y);

	gradient.addColorStop(0, 'white');
	gradient.addColorStop(0.5, `rgb(${col[0]}, ${col[1]}, ${col[2]})`);
	gradient.addColorStop(1, 'black');
	ctx.fillStyle = gradient;
	ctx.fillRect(x, y, w, h);
}

function drawGradientRainbow(x, y, w, h){
	let ctx = drawingContext;

	let gradient = ctx.createLinearGradient(x, y, x + w, y);

	let numStops = 360; // Adjust this value for smoother gradients
	for (let i = 0; i <= numStops; i++) {
		let hue = map(i, 0, numStops, 0, 255);
		let color = `hsl(${hue}, 100%, 50%)`;

		gradient.addColorStop(i / numStops, color);
	}
	ctx.fillStyle = gradient;
	ctx.fillRect(x, y, w, h);
}

function hexToRgbMIGUI(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function getClippedTextMIGUI(text, length){
	return text.slice(0, length)
}

function inBoundsMIGUI(x, y, a, b, w, h){
	return x < a+w && x > a && y < b+h && y > b
}

function mappMIGUI(value, start1, stop1, start2, stop2){
    return start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2); 
}

function getRoundedValueMIGUI(value){
	if(value < 1) return round(value, 2)
	if(value < 10) return round(value, 1)
	return round(value)
}

function findIndexMIGUI(name, arr){
	for(let i = 0; i < arr.length; i++){
		if(arr[i].title == name || arr[i].name == name || arr[i] == name) return i
	}
	return -1
}

function keyCodeToCharMIGUI(){
    return String.fromCharCode(keyCode);
}