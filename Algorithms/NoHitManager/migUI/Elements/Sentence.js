class Sentence{
	constructor(x, y, words, isTitle, func,  lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.name = words
		this.words = words
		this.isTitle = isTitle
		this.textSize = this.isTitle ? title_SizeMIGUI : text_SizeMIGUI-2
		this.func = func

		let newlinesN = words.split('\n').length
		let newlines = words.split('\n')
		textSize(this.textSize)
		this.height = 0
		for(let i = 0; i < newlinesN; i++){
			this.height += textHeight(newlines[i])
		}
		this.height *= 1.2
		this.align = LEFT
	}

	position(x, y){
		this.pos = createVector(x, y)
	}

	getText(){
		return this.words
	}

	setText(words){
		this.words = words
		//this.words = wrapText(words, undefined, this.isTitle ? text_SizeMIGUI : title_SizeMIGUI)
	}

	show(){
		push()
		textAlign(this.align)
		if(this.func) this.words = this.func()
		if(this.isTitle){
			push()
			fill(this.lightCol)
			stroke(this.lightCol)
			strokeWeight(1.5)
			textSize(this.textSize)
			text(this.words, this.pos.x + bordeMIGUI, this.pos.y + 15)
			fill(this.transCol)
			stroke(this.transCol)
			text(this.words, this.pos.x + bordeMIGUI + 2, this.pos.y + 14.5)
			pop()
		}
		else{
			noStroke()
			fill(this.lightCol)
			textSize(this.textSize)
			text(this.words, this.pos.x + bordeMIGUI, this.pos.y + 10)
		}
		// fill(255, 0, 0)
		// noStroke()
		// ellipse(this.pos.x, this.pos.y, 4)
		// ellipse(this.pos.x, this.pos.y + this.height, 4)
		pop()
	}
}
