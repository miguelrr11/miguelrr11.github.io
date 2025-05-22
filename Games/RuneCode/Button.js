class Button{
    constructor(x, y, width, height, text, col){
        this.x = x
        this.y = y
        this.w = width
        this.h = height
        this.text = text
        this.color = col
        this.textSize = mapp(this.h, BUT_H, 0, 18, 10)
        this.data = 0
    }

    setFunc(func){
        this.func = func
    }

    execute(){
        if(this.func == undefined) return
        this.func()
    }

    setProperties(runebook, runeIndex, side){
        this.runebook = runebook
        this.runeIndex = runeIndex
        this.side = side
    }

    isMouseOver(){
        return mouseX > this.x && mouseX < this.x + this.w && 
        mouseY > this.y && mouseY < this.y + this.h;
    }

    show(){
        push()
        this.execute()
        noStroke()
        let hover = this.isMouseOver() || selectedButton == this
        if(hover){
            stroke(255)
            strokeWeight(mouseIsPressed ? 3.5 : 2)
            if(mouseIsPressed) {
                this.execute()
            }
        }
        fill(this.color)
        rect(this.x, this.y, this.w, this.h, 10)
        fill(255)
        noStroke()
        textAlign(CENTER, CENTER)
        textSize((hover && mouseIsPressed) ? 22 : this.textSize)
        text(this.text, this.x + this.w / 2, this.y + this.h / 2 + 1.5)
        pop()
    }
}

class FunctionalButton extends Button{
    constructor(x, y, width, height, text, col, textColor){
        super(x, y, width, height, text, col, textColor)
        this.func = undefined
        this.isActive = false
    }

    setFunc(func){
        this.func = func
    }

    show(){
        push()
        if(this.isMouseOver() && mouseIsPressed && !this.isActive){ 
            this.isActive = true
            this.execute()
        }
        if(!mouseIsPressed){
            this.isActive = false
        }
        noStroke()
        fill(this.color)
        if(this.isMouseOver()){
            stroke(255)
            strokeWeight(mouseIsPressed ? 3.5 : 2)
        }
        rect(this.x, this.y, this.w, this.h, 10)
        fill(255)
        noStroke()
        textFont(fonts.get('Italic'))
        textAlign(CENTER, CENTER)
        textSize(this.textSize)
        if(this.text.includes('RPOS')){
            this.text = 'RPOS ' + rPosGlobal.from + ' to ' + rPosGlobal.to
            if(rPosGlobal.from > 9 || rPosGlobal.to > 9 || rPosGlobal.from < -9 || rPosGlobal.to < -9){
                this.textSize = 16.5
            }
        }
        text(this.text, this.x + this.w / 2, this.y + this.h / 2 + 1.5)
        pop()
    }
}

class NewRuneButton extends Button{
    constructor(x, y, width, height, text, col, textColor){
        super(x, y, width, height, text, col, textColor)
        this.func = undefined
        this.isActive = false
    }

    setFunc(func){
        this.func = func
    }

    show(){
        push()
        if(this.isMouseOver() && mouseIsPressed && !newRuneButtonActive){ 
            newRuneButtonActive = true
            this.execute()
        }
        if(!mouseIsPressed){
            newRuneButtonActive = false
        }
        noStroke()
        fill(this.color)
        rect(this.x, this.y, this.w, this.h, 10)
        fill(255)
        noStroke()
        textAlign(CENTER, CENTER)
        textSize(this.textSize)
        if(this.text.includes('RPOS')){
            this.text = 'RPOS ' + rPosGlobal.from + ' to ' + rPosGlobal.to
            if(rPosGlobal.from > 9 || rPosGlobal.to > 9 || rPosGlobal.from < -9 || rPosGlobal.to < -9){
                this.textSize = 16.5
            }
        }
        text(this.text, this.x + this.w / 2, this.y + this.h / 2 + 1.5)
        pop()
    }
}