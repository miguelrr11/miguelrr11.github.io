class Sentence{
	constructor(x, y, words, isTitle, w, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.name = words
		this.words = words
		this.isTitle = isTitle
		this.w = w

		let newlines = words.split('\n').length
		let lines = newlines
		this.height = newlines * 7 + (newlines-1) * 9.6
		if(this.isTitle) this.height *= 2
	}

	setText(words){
		this.words = wrapText(words, this.w, this.isTitle ? title_SizeMIGUI : text_SizeMIGUI-2)
	}

	show(){
		push()
		if(this.isTitle){
			push()
			fill(this.lightCol)
			stroke(this.transCol)
			strokeWeight(1)
			textSize(title_SizeMIGUI)
			text(this.words, this.pos.x - bordeMIGUI, this.pos.y + 15)
			fill(this.transCol)
			text(this.words, this.pos.x - bordeMIGUI + 3, this.pos.y + 13)
			pop()
		}
		else{
			noStroke()
			fill(this.lightCol)
			textSize(text_SizeMIGUI-2)
			text(this.words, this.pos.x - bordeMIGUI, this.pos.y + 10)
		}
		// fill(255, 0, 0)
		// noStroke()
		// ellipse(this.pos.x, this.pos.y, 4)
		// ellipse(this.pos.x, this.pos.y + this.height, 4)
		pop()
	}
}
