class Input {
    constructor(x, y, placeholder, lightCol, darkCol) {
        this.darkCol = darkCol
        this.lightCol = lightCol
        this.transCol = [...lightCol, 100]
        this.pos = createVector(x, y)
        this.textSize = text_SizeMIGUI - 2

        textSize(this.textSize)
        let margin = bordeMIGUI + text_offset_xMIGUI
        let maxTextWidth = width_elementsMIGUI - 2 * margin
        this.placeholder = getClippedTextByWidth(placeholder, 0, maxTextWidth)

        this.func = undefined
        this.arg = false

        this.beingHovered = false
        this.beingPressed = false
        this.sentence = ""
        this.clippedSentence = ""
        this.active = false

        this.w = width_elementsMIGUI
        this.h = 20
        this.height = this.h
        this.rad = radMIGUI

        this.cursorPos = 0
        this.firstCursor = 0
        this.relCursorPos = 0

        this.frame = 0
        this.coolDownBS = 0
        this.widthLimit = this.w - 8

        document.addEventListener("keyup", this.evaluateKey.bind(this))
        document.addEventListener("paste", this.handlePaste.bind(this));
    }
    
    setFunc(func, arg = false) {
        this.func = func
        this.arg = arg
    }

    reposition(x, y, w = undefined, h = undefined){
		this.pos = createVector(x, y)
		this.w = w || this.w
		this.h = h || this.h
	}

    handlePaste(event){
        let clipboardData = event.clipboardData || window.clipboardData;
        if (clipboardData) {
            let clipboardContent = clipboardData.getData("text")
            this.addText(clipboardContent)
        }
    }

    addText(text){
        for(let i = 0; i < text.length; i++){
            this.write(text[i])
        }
    }

    setText(text) {
        this.sentence = text
        this.cursorPos = this.sentence.length
        this.firstCursor = 0
        textSize(this.textSize)
        let margin = bordeMIGUI + text_offset_xMIGUI
        let maxTextWidth = this.w - 2 * margin
        while(
            this.firstCursor < this.cursorPos &&
            textWidth(this.sentence.substring(this.firstCursor, this.cursorPos)) > maxTextWidth
        ) {
            this.firstCursor++
        }
        this.relCursorPos = this.cursorPos - this.firstCursor
        this.setClippedSentence()
    }

    getText() {
        return this.sentence
    }

    execute() {
        if(this.func) {
            if(this.arg) this.func(this.sentence)
            else this.func()
            this.sentence = ""
            this.clippedSentence = ""
            this.cursorPos = 0
            this.relCursorPos = 0
            this.firstCursor = 0
        }
    }

    evaluateKey(event) {
        let c = event.key
        if(this.active) {
            this.coolDownBS = 0
            this.frame = 0
            if(c === "ArrowLeft") {
                this.arrowLeft()
            }
            else if(c === "ArrowRight") {
                this.arrowRight()
            }
            else if(c === "Backspace") {
                this.backspace()
            }
            else if(c === "Enter") {
                this.execute()
            }
            else if(isPrintableKey(c)) {
                this.write(c)
            }
            this.setClippedSentence()
        }
    }

    setClippedSentence() {
        textSize(this.textSize)
        let margin = bordeMIGUI + text_offset_xMIGUI
        let maxTextWidth = this.w - 2 * margin
        this.clippedSentence = getClippedTextByWidth(this.sentence, this.firstCursor, maxTextWidth)
    }

    write(c) {
        this.sentence = this.insertCharAt(this.sentence, c, this.cursorPos)
        this.cursorPos++

        textSize(this.textSize)
        let margin = bordeMIGUI + text_offset_xMIGUI
        let maxTextWidth = this.w - 2 * margin
        while(
            this.firstCursor < this.cursorPos &&
            textWidth(this.sentence.substring(this.firstCursor, this.cursorPos)) > maxTextWidth
        ) {
            this.firstCursor++
        }
        this.relCursorPos = this.cursorPos - this.firstCursor
        this.setClippedSentence()
    }

    backspace() {
        if(this.cursorPos > 0) {
            this.sentence = this.deleteCharAt(this.sentence, this.cursorPos - 1)
            this.cursorPos--
            textSize(this.textSize)
            let margin = bordeMIGUI + text_offset_xMIGUI
            let maxTextWidth = this.w - 2 * margin
			
            while(
                this.firstCursor > 0 &&
                textWidth(this.sentence.substring(this.firstCursor - 1, this.cursorPos)) <= maxTextWidth
            ) {
                this.firstCursor--
            }
            this.relCursorPos = this.cursorPos - this.firstCursor
            this.setClippedSentence()
        }
    }

    arrowLeft() {
        if(this.cursorPos > 0) {
            this.cursorPos--
            if(this.cursorPos < this.firstCursor) {
                this.firstCursor = this.cursorPos
            }
            else if(this.cursorPos === this.firstCursor && this.firstCursor > 0) {
                this.firstCursor--
            }
            this.relCursorPos = this.cursorPos - this.firstCursor
            this.setClippedSentence()
        }
    }

    arrowRight() {
        if(this.cursorPos < this.sentence.length) {
            this.cursorPos++
            textSize(this.textSize)
            let margin = bordeMIGUI + text_offset_xMIGUI
            let maxTextWidth = this.w - 2 * margin
            while(
                this.firstCursor < this.cursorPos &&
                textWidth(this.sentence.substring(this.firstCursor, this.cursorPos)) > maxTextWidth
            ) {
                this.firstCursor++
            }
            this.relCursorPos = this.cursorPos - this.firstCursor
            this.setClippedSentence()
        }
    }

    deleteCharAt(str, pos) {
        if(pos < 0 || pos >= str.length) return str
        return str.slice(0, pos) + str.slice(pos + 1)
    }

    insertCharAt(str, char, pos) {
        return str.slice(0, pos) + char + str.slice(pos)
    }

    update() {
        this.frame++
        if(this.relCursorPos > this.clippedSentence.length + 1)
            this.relCursorPos = this.clippedSentence.length
        if(keyIsPressed && this.active) {
            this.frame = 0
            this.coolDownBS++
        }
        if(
            this.active &&
            keyIsPressed &&
            Math.floor(frameCount / 2) % 2 === 0 &&
            this.coolDownBS > 30
        ) {
            if(keyCode === 8) this.backspace()
            if(keyCode === 39) this.arrowRight()
            if(keyCode === 37) this.arrowLeft()
        }
        if(inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h))
            this.beingHovered = true
        else
            this.beingHovered = false
    }

    evaluate() {
        this.active = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
        return this.active
    }

    show() {
        push();
        (this.beingHovered || this.active) ? strokeWeight(bordeMIGUI + 1): strokeWeight(bordeMIGUI)
        stroke(this.lightCol)
        this.active ? fill(this.transCol) : fill(this.darkCol)
        rect(this.pos.x, this.pos.y, this.w, this.h, this.rad)

        noStroke()
        fill(this.lightCol)
        textSize(this.textSize)

        if(this.sentence.length !== 0) {
            text(
                this.clippedSentence,
                this.pos.x + bordeMIGUI + text_offset_xMIGUI,
                this.pos.y + this.h * 0.77
            )
        }
        else {
            text(
                this.placeholder,
                this.pos.x + bordeMIGUI + text_offset_xMIGUI,
                this.pos.y + this.h * 0.75
            )
        }

        if(this.active) {
            stroke(this.lightCol)
            strokeWeight(2)
            let x =
                textWidth(
                    this.sentence.substring(this.firstCursor, this.firstCursor + this.relCursorPos)
                ) + this.pos.x + 4
            let midY = this.pos.y + this.h * 0.5;
            let dy = Math.sin(frameCount / 25) * (this.h - 6) * 0.5;
            line(x, midY + dy, x, midY - dy);
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

function getClippedTextByWidth(str, startIndex, maxWidth) {
    let accumWidth = 0
    let i = startIndex
    while(i < str.length) {
        let charW = textWidth(str.charAt(i))
        if(accumWidth + charW > maxWidth) break
        accumWidth += charW
        i++
    }
    return str.substring(startIndex, i)
}