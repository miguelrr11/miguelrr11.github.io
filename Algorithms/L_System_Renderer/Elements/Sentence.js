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
			textSize(text_SizeMIGUI-2)
			text(this.words, this.pos.x - bordeMIGUI, this.pos.y + 10)
		}
		pop()
	}
}
