class Sentence{
	constructor(x, y, w, words, isTitle, bold, lightCol, darkCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.name = words
		this.words = (words)
		this.isTitle = isTitle
		this.textSize = this.isTitle ? title_SizeMIGUI : text_SizeMIGUI-1
		this.bold = bold	
		this.func = undefined
		this.w = w

		textSize(this.textSize)
		this.height = textFont().textBounds(words, x, y, this.w-20).h
		
	}

	setFunc(func){
		this.func = func
	}

	reposition(x, y, w = undefined, h = undefined){
		this.pos = createVector(x, y)

		textSize(this.textSize)
		this.height = textFont().textBounds(this.words, x, y, this.w-20).h
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
		textAlign(LEFT, TOP)
		if(this.func) this.words = this.func()
		if(this.isTitle){
			push()
			fill(this.lightCol)
			stroke(this.transCol)
			strokeWeight(1)
			textSize(this.textSize)
			text((this.words), this.pos.x - bordeMIGUI, this.pos.y, this.w-20, this.h)
			fill(this.transCol)
			text((this.words), this.pos.x - bordeMIGUI+1, this.pos.y-1, this.w-20, this.h)
			pop()
		}
		else{
			if(this.bold){
				strokeWeight(.85)
				stroke(this.lightCol)
			}
			fill(this.lightCol)
			textSize(this.textSize)
			text((this.words), this.pos.x - bordeMIGUI, this.pos.y, this.w-20, this.h)
			fill(this.transCol)
		}
		pop()
		//debug
		// push()
		// fill(255, 0, 0)
		// noStroke()
		// ellipse(this.pos.x, this.pos.y, 4)
		// ellipse(this.pos.x, this.pos.y + this.height, 4)
		// stroke(255, 0, 0)
		// line(this.pos.x, this.pos.y, this.pos.x, this.pos.y + this.height)
		// pop()
		return false
	}
}
