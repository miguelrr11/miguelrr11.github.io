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

		document.addEventListener('keyup', this.evaluateKey.bind(this));
	}

	setText(text){
		this.sentence = text
	}

	getText(){
		return this.sentence
	}

	evaluateKey(event) {
	    let c = event.key;
	    if (this.active) {
	        if (c === "Backspace") {
	            this.sentence = this.sentence.slice(0, -1);
	        } 
	        else if (c === "Enter") {
	            this.func(this.sentence);
	            this.sentence = "";
	        } 
	        else if (isPrintableKey(c)) {
	            this.sentence += c;
	        }
	    }
	}

	evaluate(){
		this.active = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
		return this.active
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