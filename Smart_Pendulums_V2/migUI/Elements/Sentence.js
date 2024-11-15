class Sentence{
	constructor(x, y, words, isTitle, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.name = words
		this.words = words
		this.isTitle = isTitle

		let newlines = words.split('\n').length
		if(newlines > 1) this.height = newlines * this.getTotalHeight() 
		else this.height = 7
		if(this.isTitle) this.height *= 2
	}

	getTotalHeight(){
		push()
		if(this.isTitle){
			textSize(title_SizeMIGUI)
			strokeWeight(1)
		}
		else{
			textSize(text_SizeMIGUI-2)
		}
		let res = textAscent() + textDescent()
		pop()
		return res
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
