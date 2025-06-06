//UI library for p5 projects
//Miguel Rodríguez
//06-09-2024

let bordeMIGUI = 1.5
let text_FontMIGUI = ""
let text_SizeMIGUI = 15
let text_offset_xMIGUI = 2
let title_SizeMIGUI = 20
let width_elementsMIGUI = 158
let clipping_length_normalMIGUI = 20
let clipping_length_titleMIGUI = 11
let picker_width = 100

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
	    // this.w = constrain(w, 100, 1000);
	    // this.h = constrain(h, 100, 1000);
		this.w = w
	    this.h = h
	    this.retractable = retractable;
	    
	    //width_elementsMIGUI = this.w - 35;
	    clipping_length_normalMIGUI = Math.ceil(0.125 * this.w - 4);

	    this.darkCol = typeof darkCol === "string" ? hexToRgbMIGUI(darkCol) : darkCol;
	    if (!this.darkCol) throw new Error("Invalid HEX string for darkCol");
	    
	    this.lightCol = typeof lightCol === "string" ? hexToRgbMIGUI(lightCol) : lightCol;
	    if (!this.lightCol) throw new Error("Invalid HEX string for lightCol");

	    this.transCol = [...this.lightCol, 90];

	    this.initializeUIElements();

	    this.lastElementPos = createVector(x + 17, y + 30);
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

	    this.padding = 10
	    this.paddingSeparator = 15

	    this.lastCB = undefined
	    this.lastBU = undefined
	}

	initializeUIElements() {
	    this.checkboxes = []
	    this.sliders = []
	    this.sentences = []
	    this.selects = []
	    this.inputs = []
	    this.buttons = []
	    this.colorPickers = []
	    this.separators = []
	    this.numberPickers = []
		this.optionPickers = []
	    this.activeCP = undefined
	    this.lastElementAdded = ""
	    this.isInteracting = undefined
	}

	adjustElementPositionForTitle() {
	    if (this.title) {
	        const newlines = this.title.split('\n').length;
	        this.lastElementPos.y += newlines * 20 - 10;
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
	    text_FontMIGUI = loadFont("migUI/main/mono.ttf");
	    textFont(text_FontMIGUI);
	    textSize(text_SizeMIGUI);
	    textAlign(LEFT);
	}

	updateLastPos(){

	}

	createCheckbox(title = "", state = false, func = undefined) {
	    let newX, newY;
	    let needsNewLine = false;

	    if (this.lastCB) {
	        const lastCBLength = this.lastCB.length + 20 
	        newX = this.lastCB.pos.x + lastCBLength

	        let l = getPixelLength(title, text_SizeMIGUI) + 60

	        if (this.lastCB.pos.x + this.lastCB.length + l > this.pos.x + this.w) {
	            needsNewLine = true;
	        }
	        else {
	            newY = this.lastCB.pos.y;
	        }
	    } 
	    else {
	        needsNewLine = true;
	    }

	    if (needsNewLine) {
	        if (this.lastElementAdded.constructor.name !== "Checkbox") {
	            //this.lastElementPos.y += 5;
	        }
	        newX = this.lastElementPos.x;
	        newY = this.lastElementPos.y;
	       
	    }

	    const checkbox = new Checkbox(newX, newY, title, state, func, this.lightCol, this.darkCol, this.transCol);
	    this.checkboxes.push(checkbox);
	    this.lastElementAdded = checkbox;
	    if(needsNewLine) this.lastElementPos.y += checkbox.height + this.padding

	    this.lastCB = checkbox;
	    this.lastBU = undefined

	    return checkbox
	}

	createSlider(min, max, origin, title = "", showValue = false, func = undefined){
		let posSlider = this.lastElementPos.copy()
		if(title != "" || showValue) posSlider.y += 15
		if(this.lastElementAdded.constructor.name != "Slider"){
			// posSlider.y += 5
			// this.lastElementPos.y += 5
		}
		let slider = new Slider(this.lastElementPos.x,
								this.lastElementPos.y,
								posSlider.x, posSlider.y,
								min, max, origin, title, showValue, func,
								this.lightCol, this.darkCol, this.transCol) //<= === 
		// if(title == "" && !showValue) this.lastElementPos.y += 22
		// else this.lastElementPos.y += 37
		this.lastElementPos.y += slider.height + this.padding
		this.sliders.push(slider)
		this.lastElementAdded = slider

		this.lastBU = undefined
		this.lastCB = undefined

		return slider
	}

	createText(words = "", isTitle = false, func = undefined){
		//if(this.lastElementAdded.constructor.name != "Sentence") this.lastElementPos.y += 5
		//if(isTitle) this.lastElementPos.y += 5
		let spacedWords = wrapText(words, this.w, isTitle ? title_SizeMIGUI : text_SizeMIGUI)
		let sentence = new Sentence(this.lastElementPos.x,
									this.lastElementPos.y,
									spacedWords, isTitle, func,
									this.lightCol, this.darkCol, this.transCol)
		
		let newlines = spacedWords.split('\n').length;
		//this.lastElementPos.y += newlines*15
		this.lastElementPos.y += sentence.height + this.padding
		
		this.sentences.push(sentence)
		this.lastElementAdded = sentence

		this.lastBU = undefined
		this.lastCB = undefined

		return sentence
	}

	createSelect(options = [""], selected = undefined, func = undefined){
		if(options.length == 0) return
		//if(this.lastElementAdded.constructor.name != "Select") this.lastElementPos.y += 5
		let selectedFinal = selected
		if(selected != undefined) selectedFinal = findIndexMIGUI(selected, options)
		let select = new Select(this.lastElementPos.x,
								this.lastElementPos.y,
								options, selectedFinal, func,
								this.lightCol, this.darkCol, this.transCol)
		//this.lastElementPos.y += (select.options.length*20) + 10
		this.lastElementPos.y += select.height + this.padding

		this.selects.push(select)
		this.lastElementAdded = select

		this.lastBU = undefined
		this.lastCB = undefined

		return select
	}

	createInput(placeholder = "", func = undefined){
		//if(this.lastElementAdded.constructor.name != "Input") this.lastElementPos.y += 5
		let input = new Input(this.lastElementPos.x,
							  this.lastElementPos.y, placeholder, func, 
							  this.lightCol, this.darkCol, this.transCol)
		//this.lastElementPos.y += 30
		this.lastElementPos.y += input.height + this.padding

		this.inputs.push(input)
		this.lastElementAdded = input

		this.lastBU = undefined
		this.lastCB = undefined

		return input
	}

	createButton(sentence = "", func = undefined){
		let newX, newY;
	    let needsNewLine = false;

	    if (this.lastBU) {
	        const lastCBLength = this.lastBU.length + 10 
	        newX = this.lastBU.pos.x + lastCBLength
	        
	        let l = getPixelLength(sentence, text_SizeMIGUI)

	        if (this.lastBU.pos.x + this.lastBU.length + l + 30 > this.pos.x + this.w) {
	            needsNewLine = true;
	        }
	        else {
	            newY = this.lastBU.pos.y;
	        }
	    } 
	    else {
	        needsNewLine = true;
	    }
	    if(needsNewLine){
	    	if (this.lastElementAdded.constructor.name !== "Button") {
	            //this.lastElementPos.y += 5;
	        }
	        newX = this.lastElementPos.x;
	        newY = this.lastElementPos.y;
	        
	    }
		let button = new Button(newX, newY, sentence, func, this.lightCol, this.darkCol, this.transCol)
		if(needsNewLine) this.lastElementPos.y += button.height + this.padding
		this.buttons.push(button)
		this.lastElementAdded = button

		this.lastBU = button
		this.lastCB = undefined

		return button
	}

	createColorPicker(sentence = [], func = undefined, def = undefined){
		let colorPicker = new ColorPicker(this.lastElementPos.x, 
										  this.lastElementPos.y,
										  sentence, func, def, 
										  this.lightCol, this.darkCol, this.transCol)
		this.lastElementPos.y += colorPicker.height + this.padding
		this.colorPickers.push(colorPicker)
		this.lastElementAdded = colorPicker

		this.lastBU = undefined
		this.lastCB = undefined

		return colorPicker
	}

	createNumberPicker(sentence = "", min = undefined, max = undefined, delta = 1,
					   def = undefined, func = undefined){
		let numberPicker = new NumberPicker(this.lastElementPos.x, 
										  this.lastElementPos.y,
										  sentence, min, max, delta, def, func, 
										  this.lightCol, this.darkCol, this.transCol)
		//this.lastElementPos.y += 25
		this.lastElementPos.y += numberPicker.height + this.padding
		this.numberPickers.push(numberPicker)
		this.lastElementAdded = numberPicker

		this.lastBU = undefined
		this.lastCB = undefined

		return numberPicker
	}

	createOptionPicker(sentence = "", options = [], func = undefined){
		let optionPicker = new OptionPicker(this.lastElementPos.x, 
								this.lastElementPos.y,
								sentence, options, func,
								this.lightCol, this.darkCol, this.transCol)
		//this.lastElementPos.y += 25
		this.lastElementPos.y += optionPicker.height + this.padding
		this.optionPickers.push(optionPicker)
		this.lastElementAdded = optionPicker

		this.lastBU = undefined
		this.lastCB = undefined

		return optionPicker
	}

	createSeparator(){
		this.separators.push(this.lastElementPos.y + this.paddingSeparator - this.padding)
		this.lastElementPos.y = this.lastElementPos.y + this.paddingSeparator*2 - this.padding
		this.lastCB = undefined
	    this.lastBU = undefined
	    this.lastElementAdded = 'separator'
	}

	separate(){
		this.lastCB = undefined
	    this.lastBU = undefined
		this.lastElementPos.y = this.lastElementPos.y + this.padding
	    this.lastElementAdded = 'separator'
	}

	//not in use anymore
	duplicateFunctionsNumberPicker(){
		for(let np of this.numberPickers){
			np.funcPlus = np.funcMinus
		}
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
		for(let b of this.numberPickers)  {b.lightCol = light; b.darkCol = dark; b.transCol = this.transCol}
		for(let b of this.optionPickers)  {b.lightCol = light; b.darkCol = dark; b.transCol = this.transCol}
	}

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
		else if(theme == "random"){
			this.changeColors([floor(random(256)), floor(random(256)), floor(random(256))], 
							  [floor(random(256)), floor(random(256)), floor(random(256))])
		}
		else console.log(`Theme \"${theme}\" doesn't exist`)

	}

	areInputsActive(){
		for(let i of this.inputs) if(i.active) return true
		return false
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
		for(let i of this.inputs){
			if(mouseIsPressed && i.evaluate()) this.isInteracting = i
			i.update()
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
		for(let c of this.numberPickers) if(c.evaluate()) {
			this.isInteracting = c
			return
		}
		for(let c of this.optionPickers) if(c.evaluate()) {
			this.isInteracting = c
			return
		}

		
		// for(let i of this.inputs) {
		// 	if(mouseIsPressed && i.evaluate()) {
		// 		this.isInteracting = i
		// 		return
		// 	}
		// }

		for(let b of this.buttons) if(b.evaluate()) {
			this.isInteracting = b
			return
		}
		
		if(!mouseIsPressed) this.isInteracting = undefined
	}

	show(){
		push()

		this.beingHoveredHand = false
		this.beingHoveredText = false

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
			cursor(ARROW)
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

		for(let b of this.checkboxes) this.beingHoveredHand = b.show() || this.beingHoveredHand
		for(let b of this.sliders) this.beingHoveredHand = b.show() || this.beingHoveredHand 
		for(let b of this.sentences) b.show()
		for(let b of this.selects) this.beingHoveredHand = b.show() || this.beingHoveredHand
		for(let b of this.inputs) this.beingHoveredText = b.show() || this.beingHoveredText
		for(let b of this.buttons) this.beingHoveredHand = b.show() || this.beingHoveredHand
		for(let b of this.numberPickers) this.beingHoveredHand = b.show() || this.beingHoveredHand
		for(let b of this.optionPickers) this.beingHoveredHand = b.show() || this.beingHoveredHand
		for(let b of this.colorPickers){ 
			this.beingHoveredHand = b.show() || this.beingHoveredHand
			if(b.isChoosing) this.activeCP = b
		}
		push()
		stroke(this.transCol)
		strokeWeight(1)
		for(let b of this.separators){
			line(this.pos.x, b, this.pos.x + this.w, b)
		}
		pop()
		if(this.activeCP) this.activeCP.show()
		pop()

		if(this.beingHoveredHand) cursor(HAND)
		else if(this.beingHoveredText) cursor(TEXT)
		//else cursor(ARROW)

		pop()
	}
}

function drawGradientAlpha(x, y, w, h, col){
	let ctx = drawingContext;

	let gradient = ctx.createLinearGradient(x, y, x + w, y);

	gradient.addColorStop(0, `rgb(${col[0]}, ${col[1]}, ${col[2]}, 0)`);
	gradient.addColorStop(1, `rgb(${col[0]}, ${col[1]}, ${col[2]}, 255)`);
	ctx.fillStyle = gradient;
	ctx.fillRect(x, y, w, h);
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
		let hue = map(i, 0, numStops, 0, 360);
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

function getPixelLength(word, size){
	return word.length * size * 0.585
}

function getPixelLengthFromLength(length, size){
	return length * size * 0.585
}

function getClippedTextSEMIGUI(text, start, end){
	return text.slice(start, end);
}

function getClippedTextMIGUI(text, length, toEnd = false){
	if(toEnd) return text.slice(-length)
	return text.slice(0, length)
}

function inBoundsMIGUI(x, y, a, b, w, h){
	return x < a+w && x > a && y < b+h && y > b
}

function mappMIGUI(value, start1, stop1, start2, stop2){
    return start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2); 
}

function getRoundedValueMIGUI(value){
	if(Math.abs(value) < 1) return round(value, 2)
	if(Math.abs(value) < 10) return round(value, 1)
	return round(value)
}

function findIndexMIGUI(name, arr){
	for(let i = 0; i < arr.length; i++){
		if(arr[i].title == name || arr[i].name == name || arr[i] == name) return i
	}
	return -1
}

function keyCodeToCharMIGUI(keyc = keyCode){
    return String.fromCharCode(keyc);
}

function isPrintableKey(char) {
    // Check if the length of the key is 1 and the character is within the normal ASCII range
    return char.length === 1 && char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126;
}

function wrapText(text, maxWidth = this.w, textSize = text_SizeMIGUI) {
  const words = text.split(' ');
  let currentLine = '';
  let wrappedText = '';

  words.forEach((word) => {
    const lineWithWord = currentLine + (currentLine ? ' ' : '') + word;
    
    // Check the length of the line with the new word
    if (getPixelLength(lineWithWord, textSize) <= maxWidth) {
      currentLine = lineWithWord;
    } else {
      // Add the current line to the wrapped text and start a new one
      wrappedText += currentLine + '\n';
      currentLine = word; // Start new line with the current word
    }
  });

  // Append any remaining text
  wrappedText += currentLine;

  return wrappedText;
}