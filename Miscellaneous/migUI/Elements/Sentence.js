class Sentence{
	constructor(x, y, words, isTitle, lightCol, darkCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.name = words
		this.words = words
		this.isTitle = isTitle
		this.textSize = this.isTitle ? title_SizeMIGUI : text_SizeMIGUI-2
		this.func = undefined

		let newlinesN = words.split('\n').length
		let newlines = words.split('\n')
		textSize(this.textSize)
		this.height = 0
		for(let i = 0; i < newlinesN; i++){
			this.height += textHeight(newlines[i])
		}
		this.height *= 1.2
	}

	setFunc(func){
		this.func = func
	}

	reposition(x, y, w = undefined, h = undefined){
		this.pos = createVector(x, y)

		this.height = 0
		for(let i = 0; i < newlinesN; i++){
			this.height += textHeight(newlines[i])
		}
		this.height *= 1.2
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
		if(this.func) this.words = this.func()
		if(this.isTitle){
			push()
			fill(this.lightCol)
			stroke(this.transCol)
			strokeWeight(1)
			textSize(this.textSize)
			text(this.words, this.pos.x - bordeMIGUI, this.pos.y + 15)
			fill(this.transCol)
			text(this.words, this.pos.x - bordeMIGUI + 3, this.pos.y + 13)
			pop()
		}
		else{
			noStroke()
			fill(this.lightCol)
			textSize(this.textSize)
			text(this.words, this.pos.x - bordeMIGUI, this.pos.y + 10)
		}
		// fill(255, 0, 0)
		// noStroke()
		// ellipse(this.pos.x, this.pos.y, 4)
		// ellipse(this.pos.x, this.pos.y + this.height, 4)
		pop()
	}
}
