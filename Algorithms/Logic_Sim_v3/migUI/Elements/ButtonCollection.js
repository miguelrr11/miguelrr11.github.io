class ButtonCollection{
    constructor(x, y, nRows, panel, lightCol, darkCol){
        this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
        this.pos = createVector(x, y)
        this.panel = panel
        this.w = panel.w - 30
        this.h = nRows * 20 + (nRows + 1) * 10

        this.posXscroll = this.pos.x + this.w - 10

        this.length = this.w
		this.height = this.h

        this.buttons = [[]]
        this.lastBU = undefined
        this.lastElementPos = createVector(x, y + 10)

        this.maxRows = nRows
        this.currentRow = 0
        this.rowOffset = 0

        this.scrollCoolDown = 0
        window.addEventListener("wheel", (event) => {
            event.preventDefault()
            if(this.scrollCoolDown <= 0 && 
                inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)){
                this.move(event.deltaY > 0 ? 1 : -1)
                this.scrollCoolDown = 3
            }
        }, { passive: false })

    }

    addButton(sentence = "", func = undefined){
        let newX, newY;
	    let needsNewLine = false;

	    if (this.lastBU) {
	        const lastCBLength = this.lastBU.length + 10 
	        newX = this.lastBU.pos.x + lastCBLength
	        
	        let l = getPixelLength(sentence, text_SizeMIGUI)

	        if (this.lastBU.pos.x + this.lastBU.length + l + 30 > this.pos.x + this.w) {
	            needsNewLine = true;
	        }
	        else {
	            newY = this.lastBU.pos.y;
	        }
	    } 
	    else {
	        needsNewLine = true;
	    }
	    if(needsNewLine){
            if(this.buttons[0].length > 1){     
                this.buttons.push([])
                this.currentRow++
            }
	        newX = this.lastElementPos.x;
	        newY = this.lastElementPos.y;
	    }
		let button = new Button(newX, newY, sentence, func, this.lightCol, this.darkCol, this.transCol)
		button.panel = this.panel
		
		this.buttons[this.currentRow].push(button)

        if(needsNewLine){ 
            this.lastElementPos.y += button.height + 10
        }

		this.lastBU = button

        for(let i = 0; i < this.buttons.length; i++) this.move(1)

        //if(old != this.buttons.length) this.move(1)
    }

    move(delta){
        if(delta == 1 && this.buttons.length <= this.maxRows + this.rowOffset) return
        if(this.rowOffset + delta < 0 || this.rowOffset + delta >= this.buttons.length) return
        let movDelta = 30 * (-delta)
        for(let row of this.buttons){
            if(!row || row.length == 0) continue
            for(let button of row){
                button.pos.y += movDelta
            }
        }
        this.lastElementPos.y += movDelta
        this.rowOffset += delta
    }

    evaluate(){
        this.scrollCoolDown--
        if(this.scrollCoolDown == 0) this.scrollCoolDown = 0
        let bool = false
        for(let i = this.rowOffset; i < this.maxRows + this.rowOffset; i++){
            let row = this.buttons[i]
            if(!row || row.length == 0) continue
            for(let button of row) bool = button.evaluate() || bool
        }
        return bool
    }

    show(){
        let bool = false
        for(let i = this.rowOffset; i < this.maxRows + this.rowOffset; i++){
            let row = this.buttons[i]
            if(!row || row.length == 0) continue
            for(let button of row){
                bool = button.show() || bool
            }
        }

        push()
        let lengthBar = (this.h / this.buttons.length) * .5
        let padd = 10
        let y 
        if(this.buttons.length <= this.maxRows) y = this.pos.y
        else y = mappMIGUI(this.rowOffset, 0, Math.max(this.buttons.length-this.maxRows, this.rowOffset), this.pos.y + padd, this.pos.y + this.h - 2 * padd)
        stroke(this.transCol)
        strokeWeight(3)
        line(this.posXscroll, Math.max(y - lengthBar, this.pos.y), this.posXscroll, Math.min(y + lengthBar, this.pos.y + this.h))
        pop()

        return bool
    }
}