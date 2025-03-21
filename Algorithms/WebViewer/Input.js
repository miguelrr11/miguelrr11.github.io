let bordeMIGUI = 1
let text_FontMIGUI
let text_SizeMIGUI = 15
let title_SizeMIGUI = text_SizeMIGUI * 1.3
let radMIGUI = 3.5
let text_offset_xMIGUI = 2
let width_elementsMIGUI = 158
let clipping_length_normalMIGUI = 20
let clipping_length_titleMIGUI = 11
let picker_width = 100

class Input {
    constructor(x, y, placeholder, func, arg, lightCol, darkCol) {
        this.darkCol = darkCol
        this.lightCol = lightCol
        this.transCol = [...lightCol, 100]
        this.initialPos = createVector(x, y)
        this.pos = createVector(x, y)
        this.textSize = text_SizeMIGUI - 2
        this.arg = arg

        textSize(this.textSize)
        this.placeholder = placeholder

        this.func = func

        this.beingHovered = false
        this.beingPressed = false
        this.sentence = ""
        this.clippedSentence = ""
        this.active = true

        this.w = 10000
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

    setColors(lightCol, darkCol){
        this.lightCol = lightCol
        this.darkCol = darkCol
        this.transCol = [...lightCol, 100]
    }

    handlePaste(event){
        let clipboardData = event.clipboardData || window.clipboardData;
        if (clipboardData) {
            let clipboardContent = clipboardData.getData("text")
            this.addText(clipboardContent)
        }
    }

    removeText(){
        this.setText("")
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

    addText(text){
        for(let i = 0; i < text.length; i++){
            this.write(text[i])
        }
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
        this.frame++
        //rectMode(CENTER)
        (this.beingHovered || this.active) ? strokeWeight(bordeMIGUI + 1): strokeWeight(bordeMIGUI)
        stroke(this.lightCol)
        this.active ? fill(this.transCol) : fill(this.darkCol)
        //rect(this.pos.x, this.pos.y, this.w, this.h, this.rad)

        noStroke()
        textSize(this.textSize)
        textAlign(CENTER)

        if(this.sentence.length !== 0) {
            fill(this.lightCol)
            text(
                this.clippedSentence,
                this.pos.x + bordeMIGUI + text_offset_xMIGUI,
                this.pos.y + this.h * 0.77
            )
        }
        else {
            fill(this.transCol)
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
                ) * 0.5 + this.pos.x + 4
            let midY = this.pos.y + this.h * 0.5;
            let dy = Math.sin(frameCount / 25) * (this.h - 6) * 0.5;
            line(x, midY + dy, x, midY - dy);
        }
        pop()

        return this.beingHovered
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

function wrapText(text, maxWidth = this.w, tSize = text_SizeMIGUI) {
	const words = text.split(' ');
	let currentLine = '';
	let wrappedText = '';
	textSize(tSize)
	words.forEach((word) => {
		const lineWithWord = currentLine + (currentLine ? ' ' : '') + word;

		// Check the length of the line with the new word
		if (textWidth(lineWithWord) <= maxWidth) {
			currentLine = lineWithWord;
		} 
		else {
			// Add the current line to the wrapped text and start a new one
			wrappedText += currentLine + '\n';
			currentLine = word; // Start new line with the current word
		}
	});

	// Append any remaining text
	wrappedText += currentLine;

	return wrappedText;
}

function textHeight() {
    return textAscent() + textDescent();
}
