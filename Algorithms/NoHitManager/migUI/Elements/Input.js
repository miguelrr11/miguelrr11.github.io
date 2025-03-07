class Input {
    constructor(x, y, placeholder, func, arg, lightCol, darkCol, transCol) {
        this.darkCol = darkCol
        this.lightCol = lightCol
        this.transCol = [...lightCol, 65]
        this.textCol = lightCol
        this.pos = createVector(x, y)
        this.textSize = text_SizeMIGUI - 3
        this.arg = arg

        textSize(this.textSize)
        let margin = bordeMIGUI + text_offset_xMIGUI
        let maxTextWidth = width_elementsMIGUI - 2 * margin
        this.placeholder = getClippedTextByWidth(placeholder, 0, maxTextWidth)

        this.func = func


        this.cursorPos = 0
        this.firstCursor = 0
        this.relCursorPos = 0

        this.beingHovered = false
        this.beingPressed = false
        /*
        this.sentence = ''
        this.clippedSentence = ''
        */
        //-------------
        this.sentence = this.placeholder
        this.clippedSentence = this.placeholder
        this.setText(this.sentence)
        //-------------

        this.active = false

        this.w = width_elementsMIGUI
        this.h = 20
        this.height = this.h
        this.rad = radMIGUI

        

        this.frame = 0
        this.coolDownBS = 0
        this.widthLimit = this.w - 8

        this.selected = false
        this.modifiable = true

        this.disabled = false

        document.addEventListener("keyup", this.evaluateKey.bind(this))
    }

    disable(){
		this.disabled = true
	}

	enable(){
		this.disabled = false
	}

    select(){
        this.selected = true
    }

    deselect(){
        this.selected = false
    }

    reposition(x, y, w = undefined, h = undefined){
		this.pos = createVector(x, y)
		this.w = w || this.w
		this.h = h || this.h
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

        this.id = 0
    }

    getText() {
        return this.sentence
    }

    execute() {
        if(this.func) {
            if(this.arg) this.func(this.sentence, this)
            else this.func()
            this.active = false
            // this.sentence = ""
            // this.clippedSentence = ""
            // this.cursorPos = 0
            // this.relCursorPos = 0
            // this.firstCursor = 0
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
        if(!this.modifiable) return
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
        stroke(this.lightCol);
        ((this.active && this.modifiable) || this.selected) ? fill(this.transCol) : fill(this.darkCol)
        if(this.disabled){
            noFill()
            stroke(this.transCol)
        }
        rect(this.pos.x, this.pos.y, this.w, this.h, this.rad)

        noStroke()
        fill(this.textCol)
        textSize(this.textSize)
        if(true){ 
            strokeWeight(0.5)
            stroke(this.textCol)
        }
        if(this.disabled){
            fill(this.transCol)
            stroke(this.transCol)
        }

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

        if(this.active && Math.floor(this.frame / 35) % 2 === 0 && this.modifiable) {
            stroke(this.lightCol)
            strokeWeight(2)
            let x =
                textWidth(
                    this.sentence.substring(this.firstCursor, this.firstCursor + this.relCursorPos)
                ) + this.pos.x + 3
            let y = this.pos.y + 3
            line(x, y, x, y + this.h - 6)
        }
        pop()

        return this.beingHovered
    }
}

