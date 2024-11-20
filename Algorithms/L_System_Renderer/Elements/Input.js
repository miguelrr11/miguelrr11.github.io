class Input{
	constructor(x, y, placeholder, func, arg, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.textSize = text_SizeMIGUI-2
		this.placeholder = getClippedTextMIGUI(placeholder, clipping_length_normalMIGUI)
		this.func = func
		this.arg = arg

		this.beingHovered = false
		this.beingPressed = false
		this.sentence = ""
		this.clippedSentence = ""
		this.active = false

		this.w = width_elementsMIGUI
		this.h = 20

		this.cursorPos = 0
		this.relCursorPos = 0
		this.firstCursor = 0

		this.frame = 0
		this.coolDownBS = 0

		document.addEventListener('keyup', this.evaluateKey.bind(this));
	}

	setText(text){
		this.sentence = text
		this.cursorPos = this.sentence.length
		if(this.sentence.length < clipping_length_normalMIGUI) this.firstCursor = 0
		else this.firstCursor = this.sentence.length - clipping_length_normalMIGUI
		this.setClippedSentence()
		if(this.clippedSentence.length <= this.sentence.length) this.relCursorPos = this.clippedSentence.length
		else this.relCursorPos = clipping_length_normalMIGUI
	}

	getText(){
		return this.sentence
	}

	evaluateKey(event) {
	    let c = event.key;
	    if (this.active) {
	    	this.coolDownBS = 0
	    	this.frame = 0

	    	if(c === "ArrowLeft"){
	    		this.arrowLeft()
	    	}
	    	if(c === "ArrowRight"){
	    		this.arrowRight()
	    	}	    	
	        if (c === "Backspace") {
	            this.backspace()
	        } 

	        else if (c === "Enter") {
	            if(this.func){ 
    	            if(!this.arg) this.func();
    	            else this.func(this.sentence);
    	        }
	        } 

	        else if (isPrintableKey(c)) {
	            this.write(c)
	        }

	        this.setClippedSentence()
	    }
	}

	setClippedSentence(){
		this.clippedSentence = getClippedTextSEMIGUI(this.sentence, this.firstCursor, this.firstCursor + clipping_length_normalMIGUI)
	}

	write(c){
		this.sentence = this.insertCharAt(this.sentence, c, this.cursorPos)
        this.cursorPos++
        if(this.relCursorPos == clipping_length_normalMIGUI){
        	this.firstCursor++
        }
        else this.relCursorPos++
	}

	backspace(){
		this.sentence = this.sentence = this.deleteCharAt(this.sentence, this.cursorPos-1)
        this.cursorPos--
        if(this.cursorPos < 0) this.cursorPos = 0
		if(this.relCursorPos < 0){ 
			this.relCursorPos = 0
			this.firstCursor--
			if(this.firstCursor < 0) this.firstCursor = 0
		}
		else{
			if(this.firstCursor > 0) this.firstCursor--
			else this.relCursorPos--
			if(this.relCursorPos < 0) this.relCursorPos = 0
		}
		this.setClippedSentence()
	}

	arrowLeft(){
		this.cursorPos--
		if(this.cursorPos < 0) this.cursorPos = 0
		if(this.relCursorPos == 0){
			this.firstCursor--
			if(this.firstCursor < 0) this.firstCursor = 0
		}
		else this.relCursorPos--
		this.setClippedSentence()
	}

	arrowRight(){
		this.cursorPos++
		if(this.cursorPos > this.sentence.length) this.cursorPos =  this.sentence.length
		if(this.relCursorPos == clipping_length_normalMIGUI){
			this.firstCursor++
		}
		else if(this.cursorPos <= this.sentence.length){ 
			this.relCursorPos++
			if(this.relCursorPos > this.cursorPos) this.relCursorPos = this.cursorPos
		}
    	this.setClippedSentence()
	}

	deleteCharAt(str, pos) {
		if (pos < 0 || pos >= str.length) return str
		return str.slice(0, pos) + str.slice(pos + 1)
	}

	insertCharAt(str, char, pos) {
	    return str.slice(0, pos) + char + str.slice(pos);
	}

	update(){
		this.frame++
		if(this.relCursorPos > this.clippedSentence.length + 1) this.relCursorPos = this.clippedSentence.length
		if(keyIsPressed && this.active){ 
			this.frame = 0
			this.coolDownBS++
		}

		if(this.active && keyIsPressed && Math.floor(frameCount / 2) % 2 == 0 && this.coolDownBS > 30){
			if(keyCode === 8)  this.backspace()
			if(keyCode === 39) this.arrowRight()
			if(keyCode === 37) this.arrowLeft()
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
		textSize(this.textSize)

		if(this.sentence.length != 0) text(this.clippedSentence, this.pos.x + bordeMIGUI + text_offset_xMIGUI, this.pos.y + this.h*0.77)
		else text(this.placeholder, this.pos.x + bordeMIGUI + text_offset_xMIGUI, this.pos.y + this.h*0.75)

		if(this.active && Math.floor(this.frame / 35) % 2 == 0){
			stroke(this.lightCol)
			strokeWeight(2)
			let relativeCursorPos = this.relCursorPos
			let x = getPixelLengthFromLength(constrain(relativeCursorPos, 0, this.clippedSentence.length), this.textSize) + this.pos.x + 3
			let y = this.pos.y + 3
			line(x, y, x, y + this.h - 6)
		}
		pop()
	}
}





